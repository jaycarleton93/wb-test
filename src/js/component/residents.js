import { Table, ErrorTable } from "../component/table"
import { formatDataField } from "../../data/format"
import { WelbiAPI } from "../api/welbi/api"
import React from "react"
import { Form, ValidateText, ValidateNumeric, ValidateISODate } from "./form";


/**
 * A table that lists residents
 * @param {Array<string>} [props.headers] : Fields to populate table with. If excluded, will assume all
 * @param {function} [props.rowFunction] : Function to execute when a row is clicked on
 */
export class ResidentListing extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            residents: [],
            headers: props.headers,
            rowFunction: props.rowFunction,
            error: false,
        }
    }

    componentDidMount() {
        WelbiAPI.getResidents().then(residents => {
            this.setState({
                residents: residents || [],
                error: residents ? false : true
            });
        })
    }

    render() {
        if (this.state.error) return ErrorTable();
        if (this.state.residents.length === 0) return Table([], [])

        let headers = this.state.headers;
        if (!headers) {
            headers = [];
            Object.keys(this.state.residents[0]).forEach((key) => {
                // Attendance is reflected in a seperate table
                if (key === "attendance") return;
                headers.push(key)
            });
        }

        const rows = [];
        this.state.residents.forEach((resident) => {
            const rowValues = [];
            for (let key of headers) {
                rowValues.push(formatDataField(resident[key]));
            };
            rows.push({
                values: rowValues,
                onClick: () => this.state.rowFunction(resident.id),
                key: `resident${resident.id}`
            });
        });
        return Table(headers, rows);
    }
}

/**
 * A table representing a single residents program attendance
 * @param {string} props.id : Resident ID
 */
export class ResidentAttendanceRecord extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            programs: [],
            error: false,
        }
    }

    componentDidMount() {
        WelbiAPI.getPrograms().then(programs => {
            this.setState({
                programs: programs || [],
                error: programs ? false : true
            });
        });
    }

    render() {
        if (this.state.programs.length === 0) return Table([], []);
        if (this.state.error) return ErrorTable();

        const headers = ["name", "location", "start", "end", "facilitators"];
        const rows = [];

        this.state.programs.forEach((program) => {
            program.attendance.forEach((attendee) => {
                if (attendee.residentId === this.state.id) {
                    const rowValues = [];
                    headers.forEach((header) => {
                        rowValues.push(formatDataField(program[header]));
                    });
                    rows.push({
                        values: rowValues,
                        key: `resident${this.state.id}AttendanceProgram${program.id}`
                    });
                }
            });
        });

        if (rows.length === 0) {
            rows.push({ values: ["No attendance recorded"] });
        }

        return Table(headers, rows);
    }
}

/**
 * Table displaying unattended programs for a resident, that they can enrol in
 * @param {function} props.enrollmentFunction : Function that enrolls resident in a program
 */
export class ResidentEnrollmentTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            programs: [],
            id: props.id,
            enrollmentFunction: props.enrollmentFunction,
            error: false,
        }
    }

    async componentDidMount() {
        WelbiAPI.getPrograms().then(programs => {
            this.setState({
                programs: programs || [],
                error: programs ? false : true
            })
        });
    }

    render() {
        if (this.state.error) return ErrorTable();
        if (this.state.programs.length === 0) return Table([], []);

        const headers = ["id", "name", "location"];
        const rows = [];

        this.state.programs.forEach((program) => {
            let attending = false;
            for (let attendee of program.attendance) {
                if (attendee.residentId === this.state.id) {
                    attending = true;
                    break;
                }
            }
            if (!attending) {
                const rowValues = [];
                headers.forEach((header) => {
                    rowValues.push(formatDataField(program[header]));
                });
                rows.push({
                    values: rowValues,
                    onClick: () => this.state.enrollmentFunction(this.state.id, program.id),
                    key: `enrolmentResident${this.state.id}Program${program.id}`
                });
            }
        });

        if (rows.length === 0) {
            rows.push({ values: ["No attendance recorded"] });
        }

        return Table(headers, rows);
    }
}

/**
 * Form that allows creation of a new resident
 */
export class NewResidentForm extends React.Component {
    constructor(props) {
        super(props);
        const defaultDate = "1900-01-01T00:00:00Z";

        this.state = {
            firstName: "",
            lastName: "",
            preferredName: "",
            status: "HERE",
            room: "",
            levelOfCare: "INDEPENDENT",
            ambulation: "CANE",
            birthDate: defaultDate,
            moveInDate: defaultDate,

            error: null,
        };

        this.updateState = this.updateState.bind(this);
        this.createResident = this.createResident.bind(this);
    }

    /**
     * Validates all form sections, and sets the error state appropriately
     */
    validationSectionInputs() {
        const errors = [];
        Object.keys(this.state).forEach(
            (sectionName) => {
                if (sectionName === "error") return;

                const sectionValue = this.state[sectionName];
                let validationFunction;

                if (["firstName", "lastName", "preferredName", "status", "levelOfCare", "ambulation"].includes(sectionName)) {
                    validationFunction = ValidateText;
                } else if (sectionName === "room") {
                    validationFunction = ValidateNumeric;
                } else if (["birthDate", "moveInDate"].includes(sectionName)) {
                    validationFunction = ValidateISODate
                }

                if (validationFunction) {
                    const error = validationFunction(sectionName, sectionValue);
                    if (error) {
                        errors.push(error);
                    }
                } else {
                    console.error(`Missing validation function for ${sectionName}`);
                }
            }
        );

        if (errors.length > 0) {
            this.setState({ error: errors.join(". ") });
        } else {
            this.setState({ error: null });
        }
    }

    /**
     * Updates state to reflect new form values
     * @param {React.ChangeEvent} event : Event representing an updated form value
     */
    updateState(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    /**
     * Creates a new Resident, using the form data
     * Will throw an error and abort on invalid form data
     */
    createResident = async () => {
        await this.validationSectionInputs();
        if (this.state.error !== null) {
            alert(this.state.error);
            return;
        }

        if (window.confirm("Are you sure you wish to create this new resident?")) {
            WelbiAPI.createResident(this.formatInputs());
            alert("New resident created. Refresh page to see new entry.")
        }
    }

    /**
     * Formats the current state as inputs to the API
     */
    formatInputs = () => {
        return {
            name: `${this.state.firstName} ${this.state.lastName}`,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            preferredName: this.state.preferredName,
            status: this.state.status,
            room: this.state.room,
            levelOfCare: this.state.levelOfCare,
            ambulation: this.state.ambulation,
            birthDate: this.state.birthDate,
            moveInDate: this.state.moveInDate,
            attendance: []
        }
    }



    render() {
        const sections = [
            {
                component: "input",
                name: "firstName",
                label: "First Name",
                type: "text",
            },
            {
                component: "input",
                name: "lastName",
                label: "Last Name",
                type: "text",
            },
            {
                component: "input",
                name: "preferredName",
                label: "Preferred Name",
                type: "text",
            },
            {
                component: "select",
                name: "status",
                label: "Status",
                options: ["HERE", "LOA", "HOSPITAL", "ISOLATION"],
            },
            {
                component: "input",
                name: "room",
                label: "Room",
                type: "text"
            },
            {
                component: "select",
                name: "levelOfCare",
                label: "Level of Care",
                options: ["MEMORY", "INDEPENDENT", "ASSISTED", "LONGTERM"],
            },
            {
                component: "select",
                name: "ambulation",
                label: "Ambulation",
                options: ["CANE", "NOLIMITATIONS", "WALKER", "WHEELCHAIR"],
            },
            {
                component: "input",
                name: "birthDate",
                label: "Birth Date",
                type: "text"
            },
            {
                component: "input",
                name: "moveInDate",
                label: "Move-in Date",
                type: "text"
            }
        ];

        return Form(sections, this.updateState, this.createResident, "NewResidentsForm");
    }
}



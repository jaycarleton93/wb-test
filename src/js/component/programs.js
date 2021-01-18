import { Table, ErrorTable } from "./table"
import { formatDataField } from "../../data/format"
import { WelbiAPI } from "../api/welbi/api"
import React from "react"
import { Form, ValidateText, ValidateBool, ValidateISODateWithMS } from "./form";

// Facilitators and care levels are multi-entry, but are limited to certain values
const facilitatorOptions = ["Rec Aide", "Resident", "Director of Rec"];
const careOptions = ["INDEPENDENT", "ASSISTED", "MEMORY", "LONGTERM"];

/**
 * A table that lists resident programs
 * @param {Array<string>} [props.fields] : Fields to populate table with. If excluded, will assume all
 * @param {function} [props.rowFunction] : Function to execute when a row is clicked on
 */
export class ProgramListing extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            programs: [],
            headers: props.headers,
            rowFunction: props.rowFunction,
            error: false,
        }
    }

    componentDidMount() {
        WelbiAPI.getPrograms().then(programs => {
            this.setState({
                programs: programs || [],
                fields: this.state.fields,
                rowFunction: this.state.rowFunction,
                error: programs ? false : true
            });
        });
    }

    render() {
        if (this.state.error) return ErrorTable();
        if (this.state.programs.length === 0) return Table([], []);

        let headers = this.state.headers;
        if (!headers) {
            headers = [];
            Object.keys(this.state.programs[0]).forEach((key) => {
                // Attendance is reflected in a seperate table
                if (key === "attendance") return;
                headers.push(key)
            });
        }

        const rows = [];
        this.state.programs.forEach((program) => {
            const rowValues = [];
            headers.forEach((key) => {
                rowValues.push(formatDataField(program[key]));
            });
            rows.push({
                values: rowValues,
                onClick: () => this.state.rowFunction(program.id),
                key: `program${program.id}`
            });
        });
        return Table(headers, rows);
    }
}

/**
 * A table representing the programs attendance by residents
 * @param {string} props.id : Program ID
 */
export class ProgramAttendanceRecord extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            programs: [],
            residents: [],
            error: false,
        }
    }

    componentDidMount() {
        WelbiAPI.getPrograms().then(programs => {
            this.setState({
                programs: programs || [],
                id: this.state.id,
                residents: this.state.residents,
                error: programs ? false : true,
            });
        });
        WelbiAPI.getResidents().then(residents => {
            this.setState({
                programs: this.state.programs,
                id: this.state.id,
                residents: residents || [],
                error: residents ? false : true
            });
        });
    }

    render() {
        if (this.state.error) return ErrorTable();
        if (this.state.programs.length === 0) return Table([], []);

        const headers = ["id", "name", "preferredName", "status", "room", "birthDate"];
        const rows = [];

        // Find the program information first
        let selectedProgram;
        this.state.programs.forEach((program) => {
            if (program.id === this.state.id) {
                selectedProgram = program;
                return;
            }
        })
        if (!selectedProgram) {
            return Table([], { values: ["No program found"] });
        }

        // Find all program attendees
        selectedProgram.attendance.forEach((attendee) => {
            for (let resident of this.state.residents) {
                if (resident.id === attendee.residentId) {
                    const rowValues = [];
                    headers.forEach((header) => {
                        rowValues.push(formatDataField(resident[header]));
                    });
                    rows.push({ values: rowValues, key: `program${this.state.id}AttendanceResident${resident.id}` });
                    break;
                }
            }
        });

        if (rows.length === 0) {
            rows.push({ values: ["No attendees recorded"] });
        }

        return Table(headers, rows);
    }
}

/**
 * Form that allows creation of a new program
 */
export class NewProgramForm extends React.Component {
    constructor(props) {
        super(props);
        const defaultDate = "1900-01-01T00:00:00Z";

        this.state = {
            name: "",
            location: "",
            allDay: false,
            start: defaultDate,
            end: defaultDate,
            tags: "",
            dimension: "",
            facilitators: "",
            levelOfCare: "",
            hobbies: "",
            isRepeated: false,

            error: null,
        };

        this.updateState = this.updateState.bind(this);
        this.validateCareLevels = this.validateCareLevels.bind(this);
        this.validateFacilitators = this.validateFacilitators.bind(this);
        this.formatInputs = this.formatInputs.bind(this);
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

                if (["name", "location", "tags", "dimension"].includes(sectionName)) {
                    validationFunction = ValidateText;
                } else if (["start", "end"].includes(sectionName)) {
                    validationFunction = ValidateISODateWithMS;
                } else if (["allDay", "isRepeated"].includes(sectionName)) {
                    validationFunction = ValidateBool;
                } else if (sectionName === "facilitators") {
                    validationFunction = this.validateFacilitators
                } else if (sectionName === "levelOfCare") {
                    validationFunction = this.validateCareLevels;
                } else if (sectionName === "hobbies") {
                    // hobbies are optional
                    validationFunction = () => { };
                }

                if (validationFunction) {
                    console.log("validating", sectionName, sectionValue)
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
     * Validates user-entered facilitator values
     * @param {string} facilitators : User-entered facilitators, as a comma-seperated string
     */
    validateFacilitators = (section, facilitators) => {
        if (!facilitators) return `Must set facilitators, options are ${facilitatorOptions}`;

        facilitators = facilitators.split(",");
        for (let facilitator of facilitators) {
            if (!facilitatorOptions.includes(facilitator)) {
                return `Invalid facilitator ${facilitator}, valid options are ${facilitatorOptions}`
            }
        }
    }

    /**
     * Validates user-entered levelOfCare values
     * @param {string} careLevels : User-entered care levels, as a comma-seperated string
     */
    validateCareLevels = (section, careLevels) => {
        console.log("Care", careLevels, careOptions)
        if (!careLevels) return `Must set care level, options are ${careOptions}`;

        careLevels = careLevels.split(",");
        for (let careLevel of careLevels) {
            if (!careOptions.includes(careLevel)) {
                return `Invalid care level ${careLevel}, valid options are ${careOptions}`
            }
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
     * Creates a new program, using the form data
     * Will throw an error and abort on invalid form data
     */
    createProgram = async () => {
        await this.validationSectionInputs();
        if (this.state.error !== null) {
            alert(this.state.error);
            return;
        }

        if (window.confirm("Are you sure you wish to create this new program?")) {
            WelbiAPI.createProgram(this.formatInputs());
            alert("New program created. Refresh page to see new entry.")
        }
    }

    /**
     * Formats the current state as inputs to the API
     */
    formatInputs = () => {
        return {
            name: this.state.name,
            location: this.state.location,
            allDay: (this.state.allDay === "true"),
            start: this.state.start,
            end: this.state.end,
            tags: this.state.tags.split(","),
            attendance: [],
            dimension: this.state.dimension,
            facilitators: this.state.facilitators.split(","),
            levelOfCare: this.state.levelOfCare.split(","),
            hobbies: this.state.hobbies.split(","),
            isRepeated: (this.state.isRepeated === "true")
        }
    }


    render() {
        const sections = [
            {
                component: "input",
                name: "name",
                label: "Name",
                type: "text",
            },
            {
                component: "input",
                name: "location",
                label: "Location",
                type: "text",
            },
            {
                component: "select",
                name: "allDay",
                label: "All Day?",
                options: ["true", "false"],
            },
            {
                component: "input",
                name: "start",
                label: "Start",
                type: "text",
            },
            {
                component: "input",
                name: "end",
                label: "End",
                type: "text",
            },
            {
                component: "input",
                name: "tags",
                label: "Tags",
                type: "text",
            },
            {
                component: "input",
                name: "dimension",
                label: "Dimension",
                type: "text",
            },
            {
                component: "input",
                name: "facilitators",
                label: "Facilitators",
                type: "text",
            },
            {
                component: "input",
                name: "levelOfCare",
                label: "Level of Care",
                type: "text",
            },
            {
                component: "input",
                name: "hobbies",
                label: "Hobbies",
                type: "text",
            },
            {
                component: "select",
                name: "isRepeated",
                label: "Repeats?",
                options: ["true", "false"],
            }
        ];

        return Form(sections, this.updateState, this.createProgram, "NewResidentsForm");
    }
}

import { Table, ErrorTable } from "../component/table"
import { formatDataField } from "../../data/format"
import { WelbiAPI } from "../api/welbi/api"
import React from "react"


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
                headers: this.state.headers,
                rowFunction: this.state.rowFunction || null,
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
                id: this.state.id,
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
 * @param props-
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
                id: this.state.id,
                enrollmentFunction: this.state.enrollmentFunction,
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


import { Table, ErrorTable } from "./table"
import { formatDataField } from "../../data/format"
import { WelbiAPI } from "../api/welbi/api"
import React from "react"

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


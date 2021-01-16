import { Table } from "./table"
import { Residents } from "../data/residents"
import { Programs } from "../data/programs"
import { formatDataField } from "../data/format"

/**
 * A table that lists resident programs
 * @param {Array<string>} [fields] : Fields to populate table with. If excluded, will assume all
 * @param {function} [rowFunction] : Function to execute when a row is clicked on
 */
export const ProgramListing = (fields, rowFunction) => {
    let headers = fields;
    if (headers === null || (typeof headers === "object" && Object.keys(headers).length === 0)) {
        headers = [];
        Object.keys(Programs[0]).forEach((key) => {
            // Attendance is reflected in a seperate table
            if (key === "attendance") return;
            headers.push(key)
        });
    }

    const rows = [];
    Programs.forEach((program) => {
        const rowValues = [];
        headers.forEach((key) => {
            rowValues.push(formatDataField(program[key]));
        });
        console.log(rowFunction)
        rows.push({ values: rowValues, onClick: () => rowFunction(program.id) });
    });
    return Table(headers, rows);
}

/**
 * A table representing the programs attendance by residents
 * @param {string} id : Program ID
 */
export const ProgramAttendanceRecord = (id) => {
    const headers = ["id", "name", "preferredName", "status", "room", "birthDate"];
    const rows = [];

    // Find the program information first
    let selectedProgram;
    for (let program of Programs) {
        if (program.id === id) {
            selectedProgram = program;
            break;
        }
    }
    if (!selectedProgram) {
        return Table([], "No program found");
    }

    // Find all program attendees
    selectedProgram.attendance.forEach((attendee) => {
        let attendeeFound = false;
        for (let resident of Residents) {
            if (resident.id === attendee.residentId) {
                const rowValues = [];
                headers.forEach((header) => {
                    rowValues.push(formatDataField(resident[header]));
                });
                rows.push({ values: rowValues });
                attendeeFound = true;
                break;
            }
        }
        if (!attendeeFound) console.error(`Unable to find attendee ${attendee.residentId} for program ${id}`);
    });

    if (rows.length === 0) {
        rows.push(["No attendees recorded"]);
    }

    return Table(headers, rows);
}


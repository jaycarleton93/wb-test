import { Table } from "./table"
import { formatDataField } from "../data/format"


/**
 * A table that lists residents
 * @param {Array<Resident>} residents : Home residents 
 * @param {Array<string>} [fields] : Fields to populate table with. If excluded, will assume all
 * @param {function} [rowFunction] : Function to execute when a row is clicked on
 */
export const ResidentListing = (residents, fields, rowFunction) => {
    let headers = fields;
    if (headers === null || (typeof headers === "object" && Object.keys(headers).length === 0)) {
        headers = [];
        Object.keys(residents[0]).forEach((key) => {
            // Attendance is reflected in a seperate table
            if (key === "attendance") return;
            headers.push(key)
        });
    }

    const rows = [];
    residents.forEach((resident) => {
        const rowValues = [];
        headers.forEach((key) => {
            rowValues.push(formatDataField(resident[key]));
        });
        rows.push({ values: rowValues, onClick: () => rowFunction(resident.id) });
    });
    return Table(headers, rows);
}

/**
 * A table representing the residents program attendance
 * @param {Array<Program>} programs : Home programs 
 * @param {string} id : Resident ID
 */
export const ResidentAttendanceRecord = (programs, id) => {
    const headers = ["name", "location", "start", "end", "facilitators"];
    const rows = [];

    programs.forEach((program) => {
        program.attendance.forEach((attendee) => {
            if (attendee.residentId === id) {
                const rowValues = [];
                headers.forEach((header) => {
                    rowValues.push(formatDataField(program[header]));
                });
                rows.push({ values: rowValues });
            }
        });
    });

    if (rows.length === 0) {
        rows.push({ values: ["No attendance recorded"] });
    }

    return Table(headers, rows);
}

/**
 * Table displaying unattended programs for a resident
 * @param {Array<Program>} programs : Home programs 
 * @param {string} id : Resident ID
 * @param {*} enrollmentFunction : Function that enrolls resident in a program
 */
export const ResidentEnrollmentTable = (programs, id, enrollmentFunction) => {
    const headers = ["id", "name", "location"];
    const rows = [];

    programs.forEach((program) => {
        let attending = false;
        for (let attendee of program.attendance) {
            if (attendee.residentId === id) {
                attending = true;
                break;
            }
        }
        if (!attending) {
            const rowValues = [];
            headers.forEach((header) => {
                rowValues.push(formatDataField(program[header]));
            });
            rows.push({ values: rowValues, onClick: () => enrollmentFunction(id, program.id) });
        }
    });

    if (rows.length === 0) {
        rows.push({ values: ["No attendance recorded"] });
    }

    return Table(headers, rows);
}


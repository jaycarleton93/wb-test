import React from "react";
import ReactDOM from 'react-dom';

import { ResidentListing, ResidentAttendanceRecord, ResidentEnrollmentTable } from "./residents"
import { ProgramListing, ProgramAttendanceRecord } from "./programs"
import { WelbiAPI } from "./api/welbi/api"

import "../css/admin.css"

const Admin = () => {
    return (
        <div>
            <button className="btn" onClick={() => renderTable("residents")}>Residents</button>
            <button className="btn" onClick={() => renderTable("programs")}>Programs</button>
        </div>
    );
}

const residents = WelbiAPI.getResidents();
console.log(residents);
const programs = WelbiAPI.getPrograms();

const processResidentAttendance = (id) => {
    ReactDOM.render(ResidentAttendanceRecord(programs, id), document.getElementById("attendanceTable"));
    processResidentEnrollmentOptions(id)
}

const processResidentEnrollmentOptions = (id) => {
    ReactDOM.render(ResidentEnrollmentTable(programs, id, enrollResidentInProgram), document.getElementById("enrollmentTable"));
}

const processProgramAttendance = (id) => {
    ReactDOM.render(ProgramAttendanceRecord(id), document.getElementById("attendanceTable"));
}

const enrollResidentInProgram = (residentID, programID) => {
    if (window.confirm(`Are you sure you want to enrol resident ${residentID} in program ${programID}?`)) {
        alert("Enrolled. Reload page to see changes");
    } else {
        alert("Aborted");
    }
}

const residentsListing = ResidentListing(residents, null, processResidentAttendance)
const programsListing = ProgramListing(null, processProgramAttendance)

const renderTable = (name) => {
    switch (name) {
        case "residents":
            ReactDOM.render(residentsListing, document.getElementById("listingTable"));
            setEmptyMessages();
            break;
        case "programs":
            ReactDOM.render(programsListing, document.getElementById("listingTable"));
            setEmptyMessages();
            break;

        default:
            console.error(`Unrecognized listing type ${name}`);
    }
}

const setEmptyMessages = () => {
    ReactDOM.render(<p>Click on a record above for attendance info</p>, document.getElementById("attendanceTable"))
    ReactDOM.render(<p>Only available for Residents tab</p>, document.getElementById("enrollmentTable"))
}

export default Admin;

console.log(WelbiAPI.getResidents())


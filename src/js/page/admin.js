import React from "react";
import ReactDOM from 'react-dom';

import { ResidentListing, ResidentAttendanceRecord, ResidentEnrollmentTable } from "../component/residents"
import { ProgramListing, ProgramAttendanceRecord } from "../component/programs"
// import { WelbiAPI } from "./api/welbi/api"

import "../../css/admin.css"

// This section is where any recreation administration will happen
const Admin = () => {
    return (
        <div>
            <button className="btn" onClick={() => showListing("residents")}>Residents</button>
            <button className="btn" onClick={() => showListing("programs")}>Programs</button>
        </div>
    );
}

/**
 * Display an individual residents attendance record
 * @param {string} id : A resident ID
 */
const processResidentAttendance = (id) => {
    ReactDOM.render(
        <ResidentAttendanceRecord id={id} key={"residentAttendance" + id} />,
        document.getElementById("attendanceTable")
    );
    // As soon as we have processed which programs the resident currently attends, we can also display the ones they do not
    processResidentEnrollmentOptions(id)
}

/**
 * Display a list of programs for an individual resident to enrol in
 * @param {string} id : A resident ID
 */
const processResidentEnrollmentOptions = (id) => {
    ReactDOM.render(
        <ResidentEnrollmentTable id={id} enrollmentFunction={enrollResidentInProgram} key={"residentEnrollment" + id} />,
        document.getElementById("enrollmentTable")
    );
}

/**
 * Display the residents that attended a specific program
 * @param {string} id : A program ID
 */
const processProgramAttendance = (id) => {
    ReactDOM.render(
        <ProgramAttendanceRecord id={id} key={"programAttendance" + id} />,
        document.getElementById("attendanceTable")
    );
}

/**
 * Enroll a specific resident, in a specific program
 * @param {string} residentID : A resident ID
 * @param {string} programID : A program ID
 */
const enrollResidentInProgram = (residentID, programID) => {
    if (window.confirm(`Are you sure you want to enrol resident ${residentID} in program ${programID}?`)) {
        alert("Enrolled.");
        processResidentAttendance(residentID);
    } else {
        alert("Aborted");
    }
}

/**
 * Show a specific listing table
 * @param {string} name : Type of listing you wish to display
 */
const showListing = (name) => {
    switch (name) {
        case "residents":
            ReactDOM.render(
                <ResidentListing fields={null} rowFunction={processResidentAttendance} key="residentsListing" />,
                document.getElementById("listingTable")
            );
            setEmptyMessages();
            break;
        case "programs":
            ReactDOM.render(
                <ProgramListing fields={null} rowFunction={processProgramAttendance} key="programsListing" />,
                document.getElementById("listingTable")
            );
            setEmptyMessages();
            break;

        default:
            console.error(`Unrecognized listing type ${name}`);
    }
}

/**
 * Renders messages for empty content
 */
const setEmptyMessages = () => {
    ReactDOM.render(<p>Click on a record above for attendance info</p>, document.getElementById("attendanceTable"))
    ReactDOM.render(<p>Only available for Residents tab</p>, document.getElementById("enrollmentTable"))
}

export default Admin;


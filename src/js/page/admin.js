import React from "react";
import ReactDOM from 'react-dom';

import { ResidentListing, ResidentAttendanceRecord, ResidentEnrollmentTable, NewResidentForm } from "../component/residents"
import { ProgramListing, ProgramAttendanceRecord, NewProgramForm } from "../component/programs"
import { WelbiAPI } from "../api/welbi/api"

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
        <ResidentAttendanceRecord id={id} key={`residentAttendance${id}/${currentTS()}`} />,
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
        <ResidentEnrollmentTable id={id} enrollmentFunction={enrollResidentInProgram} key={`residentEnrollment${id}/${currentTS()}`} />,
        document.getElementById("enrollmentTable")
    );
}

/**
 * Display the residents that attended a specific program
 * @param {string} id : A program ID
 */
const processProgramAttendance = (id) => {
    ReactDOM.render(
        <ProgramAttendanceRecord id={id} key={`programAttendance${id}/${currentTS()}`} />,
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
        WelbiAPI.enrollResidentInProgram(programID, residentID).then(
            (enrollment) => {
                if (!enrollment) {
                    alert("Unable to enrol resident in program, please try again later");
                } else {
                    // Refresh the dependant tables
                    processResidentAttendance(residentID);
                }
            }
        )
    } else {
        alert("Aborted enrollment");
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
                <ResidentListing fields={null} rowFunction={processResidentAttendance} key={`residentsListing/${currentTS()}`} />,
                document.getElementById("listingTable")
            );
            setEmptyMessages();
            break;
        case "programs":
            ReactDOM.render(
                <ProgramListing fields={null} rowFunction={processProgramAttendance} key={`programsListing/${currentTS()}`} />,
                document.getElementById("listingTable")
            );
            setEmptyMessages();
            break;

        default:
            console.error(`Unrecognized listing type ${name}`);
    }

    showNewForm(name)
}

/**
 * Display a form for creating a new entry
 * @param {string} name : Type of entry to show creation form
 */
const showNewForm = (name) => {
    switch (name) {
        case "residents":
            ReactDOM.render(
                <NewResidentForm />,
                document.getElementById("newEntry")
            );
            break;
        case "programs":
            ReactDOM.render(
                <NewProgramForm />,
                document.getElementById("newEntry")
            );
            setEmptyMessages();
            break;

        default:
            console.error(`Unrecognized new record form type ${name}`);
    }
}

/**
 * Retrieves the current unix timestamp
 */
const currentTS = () => { return + new Date() }

/**
 * Renders messages for empty content
 */
const setEmptyMessages = () => {
    ReactDOM.render(<p>Click on a record above for attendance info</p>, document.getElementById("attendanceTable"))
    ReactDOM.render(<p>Only available for Residents tab</p>, document.getElementById("enrollmentTable"))
}

export default Admin;


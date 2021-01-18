import Config from "./config"
import SamplePrograms from "../../../data/programs"
import SampleResidents from "../../../data/residents"

export const WelbiAPI = {
    // Config information can be included here, but for security reasons should not be, and should not be made a class

    /**
     * Retrieves home residents
     * @return {Array<Object>} : Home residents 
     */
    getResidents: async () => {
        //return SampleResidents;
        return fetch(`${Config.proxy}/${Config.baseURL}/residents?token=${Config.token}`,)
            .then(
                response => {
                    return response.json();
                }
            ).catch((error) => {
                console.error(`Error retrieving residents via Welbi API : ${error}`)
                return;
            });
    },

    /**
     * Retrieves home resident recreation programs
     * @return {Array<Object>} : Recreation programs 
     */
    getPrograms: async () => {
        //return SamplePrograms;
        return fetch(`${Config.proxy}/${Config.baseURL}/programs?token=${Config.token}`,)
            .then(
                response => {
                    return response.json();
                }
            ).catch((error) => {
                console.error(`Error retrieving programs via Welbi API : ${error}`);
                return;
            });
    },

    /**
     * Enrolls/attends a resident in a program
     * @param {string} programID : Program to enroll in
     * @param {string} residentID : Resident to enroll
     */
    enrollResidentInProgram: async (programID, residentID) => {
        return fetch(
            `${Config.proxy}/${Config.baseURL}/programs/${programID}/attend?token=${Config.token}`,
            {
                method: "post",
                body: JSON.stringify({ residentId: residentID, status: "Active" }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        ).then(
            response => {
                return response.json();
            }
        ).catch((error) => {
            console.error(`Error enrolling resident ${residentID} in program ${programID} Welbi API : ${error}`);
            return;
        });
    }
}

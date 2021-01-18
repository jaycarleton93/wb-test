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

        try {
            throw "ERROR";

        } catch (err) {
            return ["Bad"];
        }


        return fetch(`${Config.proxy}/${Config.baseURL}/residents?token=${Config.token}`,)
            .then(
                response => {
                    return response.json();
                }
            ).catch((error) => {
                console.error(`Error retrieving residents via Welbi API : ${error}`)
            });
    },

    /**
     * Retrieves home resident recreation programs
     * @return {Array<Object>} : Recreation programs 
     */
    getPrograms: async () => {
        throw "ERROR";

        //return SamplePrograms;
        return fetch(`${Config.proxy}/${Config.baseURL}/programs?token=${Config.token}`,)
            .then(
                response => {
                    return response.json();
                }
            ).catch((error) => {
                console.error(`Error retrieving programs via Welbi API : ${error}`)
            });
    },

    /**
     * Enrolls/attends a resident in a program
     * @param {string} programID : Program to enroll in
     * @param {string} residentID : Resident to enroll
     */
    enrollResidentInProgram: async (programID, residentID) => {
        throw "ERROR";

        return fetch(
            `${Config.proxy}/${Config.baseURL}/programs/${programID}/attend?token=${Config.token}`,
            {
                method: "post",
                body: JSON.stringify({ residentID: residentID, status: "Active" })
            }
        ).then(
            response => {
                return response.json();
            }
        ).catch((error) => {
            console.error(`Error enrolling resident ${residentID} in program ${programID} Welbi API : ${error}`)
        });
    }
}

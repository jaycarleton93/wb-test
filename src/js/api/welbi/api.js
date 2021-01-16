import Config from "./config"

export const WelbiAPI = {
    // Config information can be included here, but for security reasons should not be
    getResidents: () => {
        return (fetch(`${Config.proxy}/${Config.baseURL}/residents?token=${Config.token}`,)
            .then((response) => response.json()))
            .then((responseJSON) => { return responseJSON })
    },

    getPrograms: () => {
        return fetch(`${Config.proxy}/${Config.baseURL}/programs?token=${Config.token}`,)
            .then(
                response => {
                    return response.json();
                }
            )
    }

}
import React from "react";

/**
 * Generic, customizable form component
 * @param {Array<Object>} props.sections : Form sections to fill out
 * @param {function} [props.changeFunction] : Function to run when a section value changes
 * @param {function} [props.submitFunction] : Function to run when submit button is clicked
 * @param {string} [props.key] : React unique key
 */
export const Form = (sections, changeFunction, submitFunction, key) => {
    return (
        <div >
            <form key={key}>
                {
                    sections.map((section) => {
                        return (
                            <span key={`${key}${section.name}`}>
                                <label
                                    key={`${key}${section.name}Label`}
                                >
                                    {section.label}
                                </label>
                                {
                                    section.component === "input" ?
                                        <input
                                            key={`${key}${section.name}Input`}
                                            onChange={changeFunction}
                                            name={section.name}
                                            type={section.type}
                                        /> :
                                        <select
                                            key={`${key}${section.name}Select`}
                                            onChange={changeFunction}
                                            name={section.name}
                                        >
                                            {
                                                section.options.map(
                                                    (option) => {
                                                        return (
                                                            <option
                                                                value={option}
                                                                key={`${key}${section.name}Select${option}`}
                                                            >
                                                                {option}
                                                            </option>)
                                                    }
                                                )
                                            }
                                        </select>
                                }
                                <br />
                            </span>
                        )
                    })
                }
                <button
                    type="button"
                    onClick={submitFunction}
                >
                    Submit
                </button>
            </form>
        </div >
    )
}

/**
 * Generic validator for form data
 * @param {boolean} condition : Condition to validate
 * @param {string} errorMessage : Message on validation failure
 */
export const validateInput = (condition, errorMessage) => {
    if (!condition) {
        return errorMessage;
    }
};

/**
 * Checks if a string matches the ISO8601 datetime pattern
 * @param {string} inputDate : Date to check
 */
const isISODateTime = (inputDate) => {
    const isoRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})Z/;
    return inputDate.match(isoRegex);
};

/**
 * Checks if a string matches the ISO8601 datetime pattern, including ms
 * @param {string} inputDate : Date to check
 */
const isISODateTimeWithMS = (inputDate) => {
    const isoRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2}).(\d{3})Z/;
    return inputDate.match(isoRegex);
};


/**
 * Checks if input is a non-empty string
 * @param {string} name : Name of field
 * @param {string} value : Value of field
 */
export const ValidateText = (name, value) => {
    return validateInput(value && value !== "", `Must enter value for ${name}`);
};

/**
 * Checks if input is a valid number
 * @param {string} name : Name of field
 * @param {string} value : Value of field
 */
export const ValidateNumeric = (name, value) => {
    return validateInput(Number(value), `${name} must be a valid number`);
};

/**
 * Checks if string is a valid datetime
 * @param {string} name : Name of field
 * @param {string} value : Value of field
 */
export const ValidateISODate = (name, value) => {
    return validateInput(isISODateTime(value), `Invalid value for date field ${name}, must be of format YYYY-MM-DDThh:mm:ssZ`);
};

/**
 * Checks if string is a valid datetime with ms
 * @param {string} name : Name of field
 * @param {string} value : Value of field
 */
export const ValidateISODateWithMS = (name, value) => {
    return validateInput(isISODateTimeWithMS(value), `Invalid value for date field ${name}, must be of format YYYY-MM-DDThh:mm:ss.SSSZ`);
};

/**
 * Checks if string is a valid boolean
 * @param {string} name : Name of field
 * @param {string} value : Value of field
 */
export const ValidateBool = (name, value) => {
    return validateInput(
        typeof value === "boolean"
        || (
            typeof value === "string" &&
            ["true", "false"].includes(value.toLowerCase())
        ),
        `Invalid value for ${name}, must be true/false`
    )
}
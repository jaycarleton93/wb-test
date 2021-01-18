
/**
 * Formats a field, table-style
 * @param {*} field : Field to format
 * @return {*} : Formatted field
 */
export const formatDataField = (field) => {
    if (typeof field !== "object") {
        return field;
    } else if (Array.isArray(field)) {
        return field.join(",");
    } else if (isTs(field)) {
        return field["@ts"];
    }

    // Should not get here
    return field;
}

/**
 * Determines if a field is a timestamp
 * @param {*} field : Field to examine
 * @return {bool} : If the field is a timestamp
 */
const isTs = (field) => {
    return "@ts" in field;
}
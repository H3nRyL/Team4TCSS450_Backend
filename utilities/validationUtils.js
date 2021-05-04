/**
 * @file String length checking functions
 */
// eslint-disable-next-line valid-jsdoc
/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 *
 * @param {string} param the value to check
 * @return true if the parameter is a String with a length greater than 0, false otherwise
 */
const isStringProvided = (param) =>
    param !== undefined && param.length > 0


// Feel free to add your own validations functions!
// for example: isNumericProvided, isValidPassword, isValidEmail, etc
// don't forget to export any
module.exports = {
    isStringProvided,
}

/**
 * @file String length checking functions
 */

const {generateHash} = require('./credentialingUtils')

// eslint-disable-next-line valid-jsdoc
/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 *
 * @param {string} param the value to check
 * @return true if the parameter is a String with a length greater than 0, false otherwise
 */
const isStringProvided = (param) =>
    param !== undefined && param.length > 0

/**
 * Checks if a password is valid
 *
 * Valid Password:
 * * > 8 characters
 * * at least one special char
 * * at least one number
 * * at least one lower case letter
 * * at least one upper case letter
 *
 * @param {string} potentialPassword password to check against
 *
 * @return {boolean} true if password is valid password
 */
function validatePassword(potentialPassword) {
    const passwordValidator = new RegExp('^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[#?!@$%^&*\-_]).{8,}$')
    return passwordValidator.test(potentialPassword)
}

/**
 * Check if password is the same as the one salted hashed password
 *
 * @param {string} salt the salt to salt the password
 * @param {string} saltedHashedPassword password that was already salted and hashed
 * @param {string} password password to check
 * @return {boolean} true if the password is correct
 */
 function checkPasswordSalt(salt, saltedHashedPassword, password) {
    // Generate a hash based on the stored salt and the provided password
    const providedSaltedHash = generateHash(password, salt)
    // Did our salted hash match their salted hash?
    return saltedHashedPassword === providedSaltedHash
}

// Feel free to add your own validations functions!
// for example: isNumericProvided, isValidPassword, isValidEmail, etc
// don't forget to export any
module.exports = {
    isStringProvided, validatePassword, checkPasswordSalt,
}

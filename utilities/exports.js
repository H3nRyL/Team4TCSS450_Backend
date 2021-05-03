/**
 * @file exports handling functions
 */
// Get the connection to Heroku Database
const pool = require('./sql_conn.js')

// Get the crypto utility functions
const credUtils = require('./credentialingUtils')
const generateHash = credUtils.generateHash
const generateSalt = credUtils.generateSalt

const validation = require('./validationUtils.js')

const sendVerificationEmail = require('./email.js').sendVerificationEmail

module.exports = {
    pool, generateHash, generateSalt, validation, sendVerificationEmail,
}

/**
 * @file exports handling functions
 */
// Get the connection to Heroku Database
const pool = require('./sql_conn.js')

// Get the crypto utility functions
const credUtils = require('./credentialingUtils')
const generateHash = credUtils.generateHash
const generateSalt = credUtils.generateSalt

const messaging = require('./pushy_utilities')

const validation = require('./validationUtils.js')

const {sendVerificationEmail, sendResetEmail} = require('./email.js')

const messaging = require('./pushy_utilities')

module.exports = {
    pool, generateHash, generateSalt, validation, sendVerificationEmail, sendResetEmail, messaging,
}

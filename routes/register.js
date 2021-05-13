/**
 * @file Registation component of auth endpoint
 */
// express is the framework we're going to use to handle requests
const express = require('express')

// to be used to create the verification token
const jwt = require('jsonwebtoken')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
const isStringProvided = validation.isStringProvided
const validatePassword = validation.validatePassword

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const {sendVerificationEmail} = require('../utilities').sendVerificationEmail

const config = {
    secret: process.env.JSON_WEB_TOKEN,
}

const router = express.Router()

/**
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 *
 * @apiParam {string} first a users first name
 * @apiParam {string} last a users last name
 * @apiParam {string} email a users email *unique
 * @apiParam {string} password a users password
 * @apiParam {string} [username] a username *unique, if none provided, email will be used
 *
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Username exists) {String} message "Username exists"
 * @apiError (400: Email exists) {String} message "Email exists"
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
 */
router.post('/', (request, response) => {
    const first = request.body.first
    const last = request.body.last
    const username =
        isStringProvided(request.body.username) ? request.body.username : request.body.email
    const email = request.body.email
    const password = request.body.password

    if (isStringProvided(first) &&
        isStringProvided(last) &&
        isStringProvided(username) &&
        isStringProvided(email) &&
        isStringProvided(password)) {
        // Check if password is valid
        if (!validatePassword(password)) {
            response.status(400).send({
                message: 'Invalid Password. Must be > 8 char, at least one special char,' +
                'one number, one lower case letter, one uppercase letter'})
            return
        }
        const salt = generateSalt(32)
        const saltedHash = generateHash(password, salt)

        const theQuery = 'INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password,' +
                            ' Salt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING Email'
        const values = [first, last, username, email, saltedHash, salt]
        pool.query(theQuery, values)
            .then((result) => {
                // Create a JWT instead of passing in salt to avoid security issues
                // includes the expiration date as well
                const token = jwt.sign({salt: salt}, config.secret, {expiresIn: '1d'})

                sendVerificationEmail(email, token)
                response.status(201).send({
                    success: true,
                    email: result.rows[0].email,
                })
            })
            .catch((error) => {
                console.log(error)
                if (error.constraint == 'members_username_key') {
                    response.status(400).send({
                        message: 'Username exists',
                    })
                } else if (error.constraint == 'members_email_key') {
                    response.status(400).send({
                        message: 'Email exists',
                    })
                } else {
                    response.status(400).send({
                        message: 'other error, see detail',
                        detail: error.detail,
                    })
                }
            })
    } else {
        response.status(400).send({
            message: 'Missing required information',
        })
    }
})

module.exports = router

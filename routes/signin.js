/**
 * @file Sign In component of auth endpoint
 */

// express is the framework we're going to use to handle requests
const express = require('express')
const jwt = require('jsonwebtoken')

// Routing
const router = express.Router()

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const {validation, generateHash} = require('../utilities')
const isStringProvided = validation.isStringProvided

const config = {
    secret: process.env.JSON_WEB_TOKEN,
}

/**
 * @api {get} /auth Request to sign a user in the system
 * @apiName GetAuth
 * @apiGroup Auth
 *
 * @apiHeader {string} authorization "username:password" uses Basic Auth
 *
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {string} message "Authentication successful!""
 * @apiSuccess {string} token JSON Web Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "success": true,
 *       "message": "Authentication successful!",
 *       "token": "eyJhbGciO...abc123"
 *     }
 *
 * @apiError (400: Missing Authorization Header) {String} message "Missing Authorization Header"
 *
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header"
 *
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 *
 */
router.get('/',
    // Check if auth header exists
    (request, response, next) => {
        if (isStringProvided(request.headers.authorization) &&
    request.headers.authorization.startsWith('Basic ')) {
            next()
        } else {
            response.status(400).json({message: 'Missing Authorization Header'})
        }
    },
    // Check if email and password are passed
    // pass it to next function
    (request, response, next) => {
    // obtain auth credentials from HTTP Header
        const base64Credentials = request.headers.authorization.split(' ')[1]

        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')

        const [email, password] = credentials.split(':')

        if (isStringProvided(email) && isStringProvided(password)) {
            request.auth = {
                'email': email,
                'password': password,
            }
            next()
        } else {
            response.status(400).send({
                message: 'Malformed Authorization Header',
            })
        }
    },
    // Queries DB and checks if account exists then serves user
    (request, response) => {
        const theQuery = 'SELECT Password, Salt, MemberId FROM Members ' +
                         'WHERE Email=$1 AND verification=1'
        const values = [request.auth.email]
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found (possibly not verified yet)',
                    })
                    return
                }

                // Retrieve the salt used to create the salted-hash provided from the DB
                const salt = result.rows[0].salt

                // Retrieve the salted-hash password provided from the DB
                const storedSaltedHash = result.rows[0].password

                // Generate a hash based on the stored salt and the provided password
                const providedSaltedHash = generateHash(request.auth.password, salt)

                // Did our salted hash match their salted hash?
                if (storedSaltedHash === providedSaltedHash ) {
                // credentials match. get a new JWT
                    const token = jwt.sign(
                        {
                            'email': request.auth.email,
                            'memberid': result.rows[0].memberid,
                        },
                        config.secret,
                        {
                            expiresIn: '60 days', // expires in 14 days
                        },
                    )
                    // package and send the results
                    response.json({
                        success: true,
                        message: 'Authentication successful!',
                        token: token,
                    })
                } else {
                // credentials dod not match
                    response.status(400).send({
                        message: 'Credentials did not match',
                    })
                }
            })
            .catch((err) => {
            // log the error
                console.log(err.stack)
                response.status(400).send({
                    message: err.detail,
                })
            })
    })

module.exports = router

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

const {validation, generateHash, sendVerificationEmail} = require('../utilities')
const isStringProvided = validation.isStringProvided

const config = {
    secret: process.env.JSON_WEB_TOKEN,
}


/**
 * Checks to make sure the authorization header was passed correctly and contains an email
 * and password upon decode
 *
 * @param {string} auth the authorization from the header that has not been decoded
 * @throws {Error} Missing authorization header (i.e. no auth was provided)
 * @throws {Error} Malformed authorization header (i.e. auth was not correctly provided)
 * @return {json} email and password as json object
 */
async function checkSignInFormat(auth) {
    if (!(isStringProvided(auth) && auth.startsWith('Basic '))) {
        throw new Error('Missing Authorization Header')
    }

    const base64Credentials = auth.split(' ')[1]

    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')

    const [email, password] = credentials.split(':')

    if (!(isStringProvided(email) && isStringProvided(password))) {
        throw new Error('Malformed Authorization Header (i.e. username and password)')
    }

    return {email: email, password: password}
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
 * @apiError (400: Missing Authorization Header) {String} message "Missing Authorization Header"
 *
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header
 *                                                                  (i.e. username and password)"
 *
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 * @apiError (401: Not verified) {String} message "User has not been verified"
 *
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 *
 */
router.get('/',
    // Queries DB and checks if account exists then serves user
    (request, response) => {
        checkSignInFormat(request.headers.authorization)
            .then((result) => {
                // Format is valid so we progress with checking for valid email and pw
                request.auth = result
                const theQuery = 'SELECT Password, Salt, MemberId, Verification FROM Members ' +
                         'WHERE Email=$1'
                const values = [request.auth.email]
                pool.query(theQuery, values)
                    .then((result) => {
                        if (result.rowCount == 0) {
                            response.status(404).send({message: 'User not found'})
                            return
                        } else if (!result.rows[0].verification) {
                            response.status(401).send({message: 'User has not been verified yet'})
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
                                    // TODO consider a possibility of signing out or server crash
                                    expiresIn: '365 days', // expires in 1 year
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
            .catch((error) => response.status(400).json({message: error}))
    })

/**
 * @api {get} /auth/verification send the verification email again
 *
 * @apiError (400: Missing Authorization Header) {String} message "Missing Authorization Header"
 *
 * @apiError (400: Missing Authorization Header) {String} message "Missing Authorization Header"
 *
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header
 *                                                                  (i.e. username and password)"
 *
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 */
router.get('/verification', (request, response) => {
    checkSignInFormat(request.headers.authorization)
        .then((userInfo) => {
            const query = 'SELECT Salt, Verification FROM Members WHERE email=$1'
            pool.query(query, [userInfo.email]).then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({message: 'User not found. Please contact the admin'})
                    return
                }
                // User is already verified
                if (result.rows[0].verification) {
                    response.status(200)
                        .send({message: 'User has already been verified.'})
                    return
                }
                sendVerificationEmail(userInfo.email, result.rows[0].salt)
                response.status(200).send({message: 'Verification email has been sent!'})
            })
        })
        .catch((error) => response.status(400).send({message: error}))
})

module.exports = router

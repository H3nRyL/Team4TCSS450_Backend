const express = require('express')

const {checkToken} = require('../middleware')

const router = express.Router()

const {validatePassword, checkPasswordSalt, isStringProvided} = require('../utilities/').validation

const {generateSalt, generateHash} = require('../utilities')

const sendResetEmail = require('../utilities').sendResetEmail

// Access the connection to Heroku Database
const pool = require('../utilities').pool

/**
 * @api {put} /auth/changePassword Request to change password
 *
 * @apiName changePass
 * @apiGroup Auth
 *
 * @apiParam {string} oldpassword previous password in body
 * @apiParam {string} newpassword new password in body
 *
 * @apiSuccess (Success 201) {string} message success message when password has been changed
 * @apiError (404: User not found) {string} message "User does not exist"
 * @apiError (401: Invalid Password) {string} message "oldpassword is invalid"
 * @apiError (400: SQL Error) {string} message "SQL error when attempting to update"
 */
router.put('/changePassword', checkToken,
// Checks if the body has the right fields and newpassword is valid
    (request, response, next) => {
        if (!request.body.oldpassword || !request.body.newpassword ||
        !validatePassword(request.body.newpassword)) {
            response.status(400).send({message: 'Missing body parameter or password is invalid'})
        } else {
            next()
        }
    },
    // Check if user has jwt and has the right old password
    (request, response, next) => {
        const theQuery = 'SELECT Password, Salt FROM Members ' +
                         'WHERE Email=$1'
        const values = [request.decoded.email]
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({message: 'User not found'})
                    return
                } else {
                // has the right old password, so we save the salt for next call
                    if (checkPasswordSalt(result.rows[0].salt, result.rows[0].password,
                        request.body.oldpassword)) {
                        request.acc = {}
                        request.acc.salt = result.rows[0].salt
                        next()
                    } else {
                        response.status(401).send({message: 'Failure to validate user'})
                    }
                }
            })
    },
    // Change the password here!
    (request, response, next) => {
        const salt = generateSalt(32)
        const saltedHash = generateHash(request.body.newpassword, salt)
        const theQuery = 'UPDATE Members SET Salt = $1, Password = $2 WHERE Salt = $3'
        console.log(saltedHash)
        console.log(request.acc.salt)
        pool.query(theQuery, [salt, saltedHash, request.acc.salt])
            .then((result) => {
                if (result.rowCount) {
                    response.status(201).send({message: 'Successful Password Change'})
                }
            })
            .catch((error) => {
                response.status(400).send({messaging: 'Failed to Change Password', error: error})
            })
    })

/**
 * @api {get} /auth/resetPassword Change the password if forgotten, sends email with code
 *
 * @apiName resetPass Pt. 1
 * @apiGroup Auth
 *
 * @apiParam {string} email email of the user to reset
 *
 * @apiSuccess (Success 201) {string} message success message that email was sent
 *
 */
router.get('/resetPassword',
    // Checks if email is passed to reference
    (request, response, next) => {
        console.log(request.body)
        if (!isStringProvided(request.body.email)) {
            response.status(400).send({message: 'Missing body parameter'})
        } else {
            next()
        }
    },
    // Check if user has already been verified
    (request, response, next) => {
        const theQuery = 'SELECT memberid FROM MEMBERS WHERE email=$1 AND verification = 1'

        pool.query(theQuery, [request.body.email])
            .then((result) => {
                if (result.rowCount) {
                    // Removes any existing with the corresponding memberid
                    deleteCode(result.rows[0].memberid)
                    next()
                } else {
                    response.status(404).send({message: 'User not found. Maybe they\'' +
                        't not verified yet.'})
                }
            })
            .catch((error) => {
                response.status(400).send({message: 'SQL Error', error: error})
            })
    },
    // Generate random 5 digits and inserts into temporary codes
    (request, response) => {
        // Generate random int
        const randomInt = Math.floor(Math.random() * 90000) + 10000
        const theQuery = 'INSERT INTO temporarycodes(memberid, code) SELECT ' +
                         'memberid, $1 FROM Members WHERE email=$2 RETURNING code'
        pool.query(theQuery, [randomInt, request.body.email])
            .then((result) => {
                sendResetEmail(request.body.email, result.rows[0].code)
                response.status(200).send('Code has been sent to the specified email.')
            })
            .catch((error) => {
                console.log(error)
                response.status(400).send({message: 'Error creating code', error})
            })
    })

/**
 * @api {put} /auth/resetPassword Checks the code and password to update if valid code and password
 *
 * @apiName resetPass Pt. 2
 * @apiGroup Auth
 *
 * @apiParam {string} email email associated with account to reset
 * @apiParam {string} password new password to reset
 * @apiParam {number} code to validate the correct user
 *
 * @apiSuccess (Success 201) {string} message success message when password has been updated
 * @apiError (400: SQL Error) {string} message "SQL error when attempting to update"
 * @apiError (400: Body Parameter) {string} message "Missing body parameter"
 * @apiError (404: User not found) {string} message "User has not been found"
 * @apiError (400: Code Errors) {string} message Multiple errors regarding code (e.g. invalid)
 */
router.put('/resetPassword', (request, response, next) => {
    if (isStringProvided(request.body.email) && !isNaN(request.body.code) &&
        isStringProvided(request.body.password)) {
        next()
    } else {
        response.status(400).send({message: 'Missing body parameter'})
    }
},
// Check if user is verified
(request, response, next) => {
    const theQuery = 'SELECT email FROM MEMBERS WHERE email=$1 AND verification=1'

    pool.query(theQuery, [request.body.email])
        .then((result) => {
            if (result.rowCount) {
                next()
            } else {
                response.status(404).send({message: 'User not found. Maybe they\'' +
                    't not verified yet.'})
            }
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error: error})
        })
},
(request, response, next) => {
    const theQuery = 'SELECT members.memberid, timestamp, code FROM temporarycodes INNER JOIN Members ON ' +
    'Members.memberid = temporarycodes.memberid AND Members.email=$1'
    pool.query(theQuery, [request.body.email])
        .then((result) => {
            // Nothing was found with the requested email
            if (!result.rowCount) {
                response.status(400).send({message: 'Code does not exist'})
                return
            }

            // Check if 20 minutes have already passed
            if (new Date(Date.now() -
                Date.parse(String(result.rows[0].timestamp))).getMinutes() < 20) {
                if (result.rows[0].code === request.body.code) {
                    request.memberid = result.rows[0].memberid
                    next()
                } else {
                    response.status(400).send({message: 'Code is not valid'})
                }
            } else {
                response.status(400).send({message: 'Code has expired'})
            }
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error})
        })
},
// Tries to delete the temporary code and update password
(request, response) => {
    if (validatePassword(request.body.password)) {
        deleteCode(request.memberid)
        const salt = generateSalt(32)
        const saltedHash = generateHash(request.body.password, salt)
        const theQuery = 'UPDATE Members SET Salt = $1, Password = $2 WHERE email=$3'
        pool.query(theQuery, [salt, saltedHash, request.body.email])
            .then((result) => {
                response.status(200).send({message: 'Password has been updated.'})
                deleteCode(request.memberid)
            })
            .catch((error) => response.status(400).send({message: 'SQL Error', error}))
    } else {
        response.status(400).send({message: 'Invalid Password'})
    }
})

/**
 * Deletes code(s) in the temporary codes table that match the member id
 *
 * @param {number} memberid a member id in the table
 */
function deleteCode(memberid) {
    const removeQuery = 'DELETE FROM temporarycodes WHERE memberid=$1'
    pool.query(removeQuery, [memberid])
        .then(console.log)
        .catch(console.log)
}

module.exports = router

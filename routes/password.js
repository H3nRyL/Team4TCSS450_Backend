const express = require('express')

const {checkToken} = require('../middleware')

const router = express.Router()

const {validatePassword, checkPasswordSalt} = require('../utilities/').validation

const {generateSalt, generateHash} = require('../utilities')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

/**
 * @api {put} /auth/changePassword Request to change password
 *
 * @apiName resetPass
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
                response.status(400).send({messagine: 'Failed to Change Password'})
            })
    })

module.exports = router

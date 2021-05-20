/**
 * @file Returning contacts list
 */
// express is the framework we're going to use to handle requests
const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool
const {validation} = require('../utilities')


const router = express.Router();

/**
 * @api {post} /request handles accepting connection requests
 * @apiName FriendRequest
 * @apiGroup Contacts
 *
 * @apiParam {int} the contact id that invited you
 *
 * @apiSuccess (Success 201) {boolean} success true when you accepted their invite
 * @apiSuccess (Success 201) {String} email the email of the user inserted
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
 */
router.post('/', 
    (request, response, next) => {
        const id = request.decoded.memberid
        const requesterid = request.body.requesterid
        const values = [id, requesterid]
        //TODO This assumes that the request is already in contacts and does not contain a check. It updates the
        //invitees contacts, but not the users
        const theQuery = "UPDATE Contacts SET Verified = $1 WHERE MemberID_A = $1 AND MemberID_B = $2 RETURNING Verified AS Entered"
        pool.query(theQuery, values)
            .then((result) => {
                    if(result.rows[0].entered) {
                        response.status(201).json({
                            message:"You've accepted their invite!"
                        })
                        next()
                    } else {
                        response.status(404).send({message: 'This invitation does not exist'})
                    }
            })
            .catch((error) => {
                    response.status(400).send({
                        error:error
                    })
            })
    },
    (request, response, next) => {
        const id = request.decoded.memberid
        const requesterid = request.body.requesterid
        const values = [id, requesterid]
        //*This query is responsible for updating the contact for the user. If a verified contact already exists, it will 
        //*do nothing
        const theQuery = "INSERT INTO Contacts (MemberID_A, MemberID_B, Verified) VALUES ($1, $2, 1) ON CONFLICT (Verified) DO NOTHING"
        pool.query(theQuery, values)
            .then((result) => {
                    if(result.rows[0].entered) {
                        response.status(201).json({
                            message:"You've been added to users contacts!"
                        })
                        return
                    } else {
                        response.status(404).send({message: 'This invitation does not exist'})
                    }
            })
            .catch((error) => {
                    response.status(400).send({
                        error:error
                    })
            })
    }
)
module.export.router
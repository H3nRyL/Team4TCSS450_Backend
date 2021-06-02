/**
 * @file Returning contacts list
 */
// express is the framework we're going to use to handle requests
const express = require('express')

// Access the connection to Heroku Database
const pool = require('../../utilities/exports').pool
const {validation} = require('../../utilities/exports')
const isStringProvided = validation.isStringProvided

const router = express.Router();

/**
 * @api {get} /contacts
 * @apiName DeleteContacts
 * @apiGroup Contacts
 * @apiParam {String} the memberid to delete
 * @apiSuccess (Success 200) {boolean} success true when contacts are removed from deleter
 * @apiSuccess (Success 200) {boolean} success true when user removed from deletee
 * @apiError (400: Missing Parameters) {String} message "Malformed SQL Query"
 * @apiError (404: No contacts found) {String} message "You have no contacts"
 **/

router.post('/', 
    (request, response, next) => {
        const id = request.decoded.memberid
        const other_id = request.body.deleteid
        const values = [id, other_id]
        const theQuery = "DELETE FROM Contacts WHERE (MemberID_A = $1 AND MemberID_B = $2 AND Verified = 1)"
        pool.query(theQuery, values)
        .then((result) => {
            if(result.rowCount > 0) {
                response.status(200).send({
                    success: true,
                    message:"Contact removed!",
                })
                next()
            } else {
                response.status(200).send({
                    success:false,
                    message: "You were not friends with this user"
                })
            }
        }) 
        .catch((error) => {
            response.status(400).send({
                message: "Malformed SQL query", error
            })
        })
    },
    (request, response) => {
        const id = request.decoded.memberid
        const other_id = request.body.deleteid
        const values = [id, other_id]
        const theQuery = "DELETE FROM Contacts WHERE (MemberID_A = $2 AND MemberID_B = $1 AND Verified = 1)"
        pool.query(theQuery, values)
        .then((result) => {
            if(result.rowCount > 0) {
                response.status(200).send({
                    message:"Removed from their contacts!",
                })
            } else {
                response.status(200).send({
                    message: "You were not friends with this user"
                })
            }
        }) 
        .catch((error) => console.log(error))
    },
)


/**
 * @api {get} /contacts
 * @apiName GetContacts
 * @apiGroup Contacts
 * @apiParam {String} the user's memberID
 * @apiSuccess (Success 201) {boolean} success true when contacts are returned
 * @apiSuccess (Success 201) {JSONArray} JSON object with all of the contact information
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (401: No contacts found) {String} message "You have no contacts"
 **/
router.get('/', (request, response) => {
    
    var id = request.decoded.memberid.toString()
    if(isStringProvided(id)) {
        const values = [id]
        const theQuery = "SELECT DISTINCT Members.MemberID, Members.FirstName, Members.LastName, Members.Email, Members.UserName FROM Members RIGHT JOIN Contacts ON Members.MemberID = Contacts.MemberID_A WHERE (Contacts.MemberID_A = $1 OR Contacts.MemberID_B = $1) AND Contacts.Verified = 1 AND Members.MemberID <> $1;"
        pool.query(theQuery, values)
            .then((result) => {
                    if(result.rowCount > 0) {
                        response.status(201).json({
                            success : true,
                            'data':result.rows,
                        })
                    } else {
                        response.status(201).send({
                            success:false,
                            message: 'There are no contacts'})
                    }
            })
            .catch((error) => {
                    response.status(401).send({
                        message:"Malformed SQL Query" + error
                    })
            })
    } else {
        response.status(400).send({
            message: 'Missing required information',
        })
    }
}),

module.exports = router
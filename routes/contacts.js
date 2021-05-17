/**
 * @file Returning contacts list
 */
// express is the framework we're going to use to handle requests
const express = require('express')


// Access the connection to Heroku Database
const pool = require('../utilities').pool
const {validation} = require('../utilities')

const isStringProvided = validation.isStringProvided

const router = express.Router();
/*
router.post('/', (request, response) => {
        const first = request.body.first
        const last = request.body.last
        console.log(first,last)
    if(isStringProvided(first) 
            && isStringProvided(last)) {
        const values = [first, last]
        console.log(request.query.firstname, request.query.lastname)
        const theQuery = 'SELECT MemberID, FirstName, LastName FROM Members;' 
        + 'WHERE FirstName=$1 AND LastName=$2'
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.json({
                        'first':result.rows[0].firstname,
                        'email':result.rows[0].lastname,
                    })
                } else {
                    response.status(404).send({message: 'No such user found'})
                    return
                }
            })
            .catch((error) => {
                response.status(404).send({message: 'No such user found'})
                return
            })
        }
    })
*/
/**
 * @api {get} /contacts
 * @apiName GetContacts
 * @apiGroup Contacts
 * @apiParam {String} the user's memberID
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (404: No contacts found) {String} message "You have no contacts"
 **/
router.get('/', (request, response) => {
    
    const id = checkToken.decoded.memberid
    if(isStringProvided(id)) {
        const values = [id]
        const theQuery = "SELECT MemberID, FirstName, LastName, UserName, Email FROM Members WHERE Members.MemberID IN"
            + " (SELECT MemberID_B FROM Contacts WHERE $1 = Contacts.MemberID_A AND Verified = 1)"
        pool.query(theQuery, values)
            .then((result) => {
                    if(result.rowCount > 0){
                        response.status(201).json({
                            success : true,
                            'data':result.rows,
                        })
                    } else {
                        response.status(404).send({message: 'There are no contacts'})
                    }
            })
            .catch((error) => {
                    response.status(400).send({
                        error:error
                    })
            })
    } else {
        response.status(400).send({
            message: 'Missing required information',
        })
    }
})

module.exports = router

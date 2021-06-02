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
 * @api {get} /contactSearch
 * @apiName SearchContacts
 * @apiGroup Contacts
 * @apiParam {String} the param to search by (memberID, first/last, email)
 * @apiSuccess (Success 200) {boolean} success true when contact is found
 * @apiError (400: Missing Parameters) {String} message "Malformed SQL Query"
 * @apiError (400: No user found) {String} message "You have no contacts"
 **/
router.post('/', 
    (request, response, next) => {
        const first = request.body.first
        const last = request.body.last
        const id = request.decoded.memberid

        if(isStringProvided(first) 
                && isStringProvided(last)) {
            const values = [first, last, id]
            const theQuery = 'SELECT MemberID, FirstName, LastName, Email FROM Members WHERE FirstName=$1 AND LastName=$2 AND MemberID <> $3'
            pool.query(theQuery, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.json({
                            success: true,
                            data: result.rows
                        })
                    } else {
                        response.status(404).send({message: 'No such user found'})
                        return
                    }
                })
                .catch((error) => {
                    response.status(404).send({message: "SQL Query error1", error})
                    return
                })
            } else {
                next()
            }
    },
    (request, response, next) => {
        const searchid = request.body.searchid
        const email = request.body.email
        const id = request.decoded.memberid

        if(!isStringProvided(email)) {
            const values = [searchid, id]
            const theQuery = 'SELECT FirstName, LastName, Email FROM Members WHERE MemberID = $1 AND MemberID <> $2'
            pool.query(theQuery, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.json({
                            success:true,
                            data: result.rows
                        })
                    } else {
                        response.status(404).send({message: 'No such user found'})
                        return
                    }
                })
                .catch((error) => {
                    response.status(404).send({message: "SQL Query error", error})
                    return
                })
            } else {
                next()
            }
    },
    (request, response) => {
        const email = request.body.email
        const id = request.decoded.memberid
        if(isStringProvided(email)) {
            const values = [email, id]
            const theQuery = 'SELECT FirstName, LastName, Email FROM Members WHERE Email = $1 AND MemberID <> $2'
            pool.query(theQuery, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.json({
                            success:true,
                            response: result.rows
                        })
                    } else {
                        response.status(404).send({message: 'No such user found'})
                        return
                    }
                })
                .catch((error) => {
                    response.status(404).send({message: "SQL Query error", error})
                    return
                })
            }
    },
)

module.exports = router

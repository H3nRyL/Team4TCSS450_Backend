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
        const searchid = request.body.searchid.toString()
        const email = request.body.email
        if(isStringProvided(searchid) || isStringProvided(email)) {
            next()
        }
        if(isStringProvided(first) 
                && isStringProvided(last)) {
            const values = [first, last]
            console.log(request.query.firstname, request.query.lastname)
            const theQuery = 'SELECT MemberID, FirstName, LastName, Email FROM Members WHERE FirstName=$1 AND LastName=$2'
            pool.query(theQuery, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.json({
                            'first':result.rows[0].firstname,
                            'email':result.rows[0].email,
                            'memberid': result.rows[0].memberid
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
    (request, response) => {
        const searchid = request.body.searchid.toString()
        const email = request.body.email
        if(isStringProvided(email)) {
            next()
        }
        if(isStringProvided(searchid)) {
            const values = [searchid]
            console.log(request.query.firstname, request.query.lastname)
            const theQuery = 'SELECT FirstName, LastName, Email FROM Members;' 
            + 'WHERE MemberID = $1'
            pool.query(theQuery, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.json({
                            'first':result.rows[0].firstname,
                            'last':result.rows[0].lastname,
                            'email': result.rows[0].email
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
    (request, response) => {
        const email = request.body.email
        if(isStringProvided(email)) {
            const values = [email]
            console.log(request.body.email)
            const theQuery = 'SELECT FirstName, LastName, Email FROM Members;' 
            + 'WHERE Email = $1'
            pool.query(theQuery, values)
                .then((result) => {
                    if (result.rowCount > 0) {
                        response.json({
                            'first':result.rows[0].firstname,
                            'last':result.rows[0].lastname,
                            'memberid': result.rows[0].memberid
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

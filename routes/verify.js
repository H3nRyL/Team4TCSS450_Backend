/**
 * @file Verification endpoint
 */
// express is the framework we're going to use to handle requests
const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

// Create a new instance of express router
const router = express.Router()

/**
 * @api {get} /verification Request to verify a user
 * @apiName GetVerification
 * @apiGroup Verification
 *
 *
 * @apiQuery {string} the salt that is linked to the user
 *
 * @apiSuccess (Success 201) {String} message to indicate user x has been verified
 * @apiError (400: Salt Error) Salt is incorrect or does not exist
 * @apiError (400: Name Missing Error) Name is missing from the query
 */
router.get('/', (request, response) => {
    const theQuery = 'UPDATE Members SET verification = 1 WHERE Salt=$1'
    const values = [request.query.name]
    if (!request.query.name) response.status(400).send({message: 'name query param does not exist'})
    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount == 0) {
                response.status(400).send({message: 'the salt is invalid'})
            } else {
                response.status(201).send({
                    message: 'Hello, Welcome to our App! Thanks for signing up with our application!' +
                    ' Your email has been verified. --TCSS 450 Group 4',
                })
            }
        })
        .catch((error) => {
            response.status(400).send({
                message: 'other error, see detail (most likely invalid name)',
                detail: error.detail,
            })
        })
})

module.exports = router

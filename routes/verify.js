/**
 * @file Verification endpoint
 */

// express is the framework we're going to use to handle requests
const express = require('express')

// used to compile html
const handlebars = require('handlebars')

// file reading html
const fs = require('fs')

const jwt = require('jsonwebtoken')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const config = {
    secret: process.env.JSON_WEB_TOKEN,
}

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
    // TODO what happens if salt is the same?
    const theQuery = 'UPDATE Members SET verification = 1 WHERE Salt = $1'

    if (!request.query.name) {
        console.log('Missing name query parameter')
        response.status(400).sendFile('verification_failure.html', {root: './data/'})
    }

    // Decode the jwt to get the salt
    jwt.verify(request.query.name, config.secret, (err, decoded) => {
        // jwt is invalid by being incorrect or no longer valid
        if (err) {
            // TODO thinking ahead, may be blocking with sync
            const html = fs.readFileSync('./data/verification_failure.html', {encoding: 'utf-8'})
            return response.status(403)
                .send(handlebars.compile(html)({reason: 'Token is not/no longer valid'}))
        }

        // decoded contains salt, iat, and exp
        const {salt} = decoded

        const values = [salt]

        // query the DB to see if salt exists
        pool.query(theQuery, values)
            .then((result) => {
                if (!result.rowCount) {
                    console.log(result.rowCount)
                    // Update failure html with reason
                    const html =
                        fs.readFileSync('./data/verification_failure.html', {encoding: 'utf-8'})
                    // No user found with the matching salt
                    response.status(400)
                        .send(handlebars.compile(html)({reason: 'jwt is invalid (pool)'}))
                } else if (result.rowCount) {
                    // Successful verification
                    response.status(201).sendFile('verification_success.html', {root: './data/'})
                }
            })
            .catch((error) => {
                console.log(error)
                response.status(400).send({
                    message: 'other error, see detail (most likely invalid name)',
                    detail: error || 'No error message provided',
                })
            })
    })
})

module.exports = router

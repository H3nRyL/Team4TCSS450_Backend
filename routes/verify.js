/**
 * @file Verification endpoint
 */
// express is the framework we're going to use to handle requests
const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

// Create a new instance of express router
const router = express.Router()

router.get('/', (request, response) => {
    const theQuery = 'UPDATE Members SET verification = 1 WHERE Salt=$1'
    const values = [request.query.name]
    pool.query(theQuery, values)
        .then((result) => {
            response.status(201).send({
                message: 'Hello, Welcome to our App! Thanks for signing up with our application!' +
                'Your email has been verified. --TCSS 450 Group 4',
            })
        })
        .catch((error) => {
            response.status(400).send({
                message: 'other error, see detail',
                detail: error.detail,
            })
        })
})

module.exports = router

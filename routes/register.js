//express is the framework we're going to use to handle requests
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
let isStringProvided = validation.isStringProvided

const generateHash = require('../utilities').generateHash
const generateSalt = require('../utilities').generateSalt

const sendEmail = require('../utilities').sendEmail

const router = express.Router()

/**
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 * 
 * @apiParam {String} first a users first name
 * @apiParam {String} last a users last name
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 * @apiParam {String} [username] a username *unique, if none provided, email will be used
 * 
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "first":"Charles",
 *      "last":"Bryan",
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 * 
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted 
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * 
 * @apiError (400: Username exists) {String} message "Username exists"
 * 
 * @apiError (400: Email exists) {String} message "Email exists"
 *  
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about th error
 * 
 */ 
router.post('/', (request, response) => {

    const first = request.body.first
    const last = request.body.last
    const username = isStringProvided(request.body.username) ?  request.body.username : request.body.email
    const email = request.body.email
    const password = request.body.password
    
    if(isStringProvided(first) 
        && isStringProvided(last) 
        && isStringProvided(username) 
        && isStringProvided(email) 
        && isStringProvided(password)) {

        let salt = generateSalt(32)
        let salted_hash = generateHash(password, salt)
        
        let theQuery = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING Email"
        let values = [first, last, username, email, salted_hash, salt]
        pool.query(theQuery, values)
            .then(result => {
                response.status(201).send({
                    success: true,
                    email: result.rows[0].email
                })
                sendEmail("donotreplytcss450@gmail.com", email, "Account Registration", "Hello,\n\nWelcome to our App! Thanks for signing up with our application!\n\nHave fun, and don't hesitate to contact us with your feedback.\n\n--TCSS 450 Group 4")
            })
            .catch((error) => {
                if (error.constraint == "members_username_key") {
                    response.status(400).send({
                        message: "Username exists"
                    })
                } else if (error.constraint == "members_email_key") {
                    response.status(400).send({
                        message: "Email exists"
                    })
                } else {
                    response.status(400).send({
                        message: "other error, see detail",
                        detail: error.detail
                    })
                }
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

router.get('/hash_demo', (request, response) => {
    let password = 'hello12345'

    let salt = generateSalt(32)
    let salted_hash = generateHash(password, salt)
    let unsalted_hash = generateHash(password)

    response.status(200).send({
        'salt': salt,
        'salted_hash': salted_hash,
        'unsalted_hash': unsalted_hash
    })
})

module.exports = router
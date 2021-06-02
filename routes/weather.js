const API_KEY = process.env.OPEN_WEATHER_API

// express is the framework we're going to use to handle requests
const express = require('express')

const validation = require('../utilities').validation

const pool = require('../utilities').pool

const isStringProvided = validation.isStringProvided

// request module is needed to make a request to a web service
const request = require('request')

const router = express.Router()

/**
 * @api {get} /weather Request a list of Phish.net Blogs
 * @apiName GetOpenWeatherMapGet
 * @apiGroup OpenWeatherMap
 *
 * @apiHeader {string} authorization JWT provided from Auth get
 *
 * @apiParam {string} lat location's latitude
 * @apiParam {string} lon location's longitude
 *
 * @apiDescription This end point is a pass through to the Phish.net API.
 * All parameters will pass on to https://api.openweathermap.org/data/2.5/onecall.
 * See the <a href="https://openweathermap.org/api/one-call-api">
 * openweathermap.org documentation</a>
 * for a list of optional paramerters and expected results. You do not need a
 * openweathermap.org api key with this endpoint. Enjoy!
 */
router.get('/', (req, res) => {
    if (isStringProvided(req.query.lat) && isStringProvided(req.query.lon)) {
        // for info on use of tilde (`) making a String literal, see below.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
        const url = 'https://api.openweathermap.org/data/2.5/onecall?' +
            `lat=${req.query.lat}&lon=${req.query.lon}`+
            `&exclude=minutely&units=imperial&appid=${API_KEY}`

        // When this web service gets a request, make a request to the Phish Web service
        request(url, function(error, response, body) {
            if (error) {
                res.send(error)
            } else {
                // pass on everything (try out each of these in Postman to see the difference)
                // res.send(response);

                // or just pass on the body

                const n = body.indexOf('{')
                const nakidBody = body.substring(n - 1)

                res.send(JSON.parse(nakidBody)).status(200)
            }
        })
    } else {
        res.send({message: 'Missing required information'}).status(400)
    }
})

/**
 * @api {post} /messages Request to add a message to a specific chat
 * @apiName PostMessages
 * @apiGroup Messages
 *
 * @apiDescription Adds the message from the user associated with the required JWT.
 *
 * @apiHeader {string} authorization Valid JSON Web Token JWT
 *
 * @apiParam {number} chatid the id of th chat to insert this message into NOTE: in body, not param
 * @apiParam {string} message a message to store NOTE: in body, not param
 *
 * @apiSuccess {[]} message an array of messages in json format (need to update with pushy)
 * @apiSuccess {number} message.messageid the id of the message
 * @apiSuccess {number} message.chatid the chat id the message bleongs to
 * @apiSuccess {string} message.message contents of the message
 * @apiSuccess {number} message.memberid who made the message
 * @apiSuccess {string} message.timestamp the time the message was sent
 *
 * @apiError (400: Unknown user) {String} message "unknown email address"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: SQL Error) {String} message the reported SQL error details
 *
 * @apiError (400: Unknown Chat ID) {String} message "invalid chat id"
 *
 */
// @apiSuccess (Success 201) {boolean} success true when the name is inserted
router.post('/', (request, response, next) => {
    // validate on empty parameters
    if (!isStringProvided(request.body.lat) || !isStringProvided(request.body.lon) ||
            !isStringProvided(request.body.nickname)) {
        response.status(400).send({
            message: 'Missing required information',
        })
    } else {
        next()
    }
}, (request, response, next) => {
    // adds the location to the database
    const insert = `INSERT INTO Locations(MemberId, Nickname, Lat, Long)
                  VALUES($1, $2, $3, $4)`
    const values = [request.decoded.memberid, request.body.nickname,
        request.body.lat, request.body.lon]
    pool.query(insert, values)
        .then((result) => {
            if (result.rowCount == 1) {
                // insertion success. Attach the message to the Response obj
                response.status(200).send({success: true})
                next()
            } else {
                response.status(400).send({
                    'message': 'unknown error',
                })
            }
        }).catch((err) => {
            response.status(400).send({
                message: 'SQL Error on insert',
                error: err,
            })
        })
})


/**
 * @api {get} /chats/ Gets a list chats with timestamp and last message that the user belongs to
 *
 * @apiDescription Gets a list of chats that the user belongs to
 *                  by their id as well as the last message sent and the timestamp it was sent
 *
 * @apiName getChats
 * @apiGroup Chats
 *
 * @apiheader {string} Bearer Token a valid authorization JWT
 * @apiError (400: SQL Error) {string} message Something broke during querying DB
 * @apiSuccess {[]} chats an array of chats in json format
 * @apiSuccess {string} chats.chatid The id of the chat
 * @apiSuccess {string} chats.groupname The groupname of the chat
 * @apiSuccess {string} chats.lastmessage The message text last sent
 * @apiSuccess {string} chats.lasttimestamp The timestamp of the last message
 */
router.get('/get', (request, response, next) => {
    const values = [request.decoded.memberid]
    const theQuery = 'SELECT MemberID, Nickname, Lat, Long, ZIP  FROM ' +
        'Locations WHERE MemberID = $1';
    console.log(values)
    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount > 0) {
                response.status(201).json({
                    'success': true,
                    'data': result.rows,
                })
            } else {
                response.status(201).send({
                    success: false,
                    message: 'There are no locations'})
            }
        })
        .catch((error) => {
            response.status(400).send({
                error: error,
            })
        })
}),


module.exports = router

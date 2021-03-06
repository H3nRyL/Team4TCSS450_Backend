const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const notifyOthers = require('../utilities/exports').messaging

const {validation} = require('../utilities')
const isStringProvided = validation.isStringProvided
const msg_functions = require('../utilities/exports').messaging

const router = express.Router()

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
    if (request.body.chatid === undefined || !isStringProvided(request.body.message)) {
        response.status(400).send({
            message: 'Missing required information',
        })
    } else if (isNaN(request.body.chatid)) {
        response.status(400).send({
            message: 'Malformed parameter. chatid must be a number',
        })
    } else {
        next()
    }
}, (request, response, next) => {
    // validate chat id exists
    const query = 'SELECT * FROM CHATS WHERE ChatId=$1'
    console.log(request.body.chatid)
    pool.query(query, [request.body.chatid])
        .then((result) => {
            if (result.rowCount === 0) {
                response.status(404).send({
                    message: 'Chat ID not found',
                })
            } else {
                next()
            }
        }).catch((error) => {
            response.status(400).send({
                message: 'SQL Error on chatid check',
                error: error,
            })
        })
}, (request, response, next) => {
    // validate memberid exists in the chat
    const query = 'SELECT * FROM ChatMembers WHERE ChatId=$1 AND MemberId=$2'
    console.log(request.body.chatid)
    console.log(request.decoded.memberid)
    const values = [request.body.chatid, request.decoded.memberid]
    pool.query(query, values)
        .then((result) => {
            if (result.rowCount > 0) {
                next()
            } else {
                response.status(400).send({
                    message: 'user not in chat',
                })
            }
        }).catch((error) => {
            response.status(400).send({
                message: 'SQL Error on member in chat check',
                error: error,
            })
        })
}, (request, response, next) => {
    // add the message to the database
    const insert = `INSERT INTO Messages(ChatId, Message, MemberId)
                  VALUES($1, $2, $3) 
                  RETURNING PrimaryKey AS MessageId, ChatId, Message, MemberId, to_char(Messages.Timestamp AT TIME ZONE 'PDT', 
                  'YYYY-MM-DD HH24:MI:SS.US') AS TimeStamp`
    const values = [request.body.chatid, request.body.message, request.decoded.memberid]
    pool.query(insert, values)
        .then((result) => {
            if (result.rowCount == 1) {
                // insertion success. Attach the message to the Response obj
                response.message = result.rows[0]
                response.message.email = request.decoded.email
                // Pass on to next to push
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
}, (request, response) => {
    // send a notification of this message to ALL members with registered tokens
    const query = `SELECT token FROM Push_Token
                        INNER JOIN ChatMembers ON
                        Push_Token.memberid=ChatMembers.memberid
                        WHERE ChatMembers.chatid=$1`
    const values = [request.body.chatid]
    pool.query(query, values)
        .then((result) => {
            console.log(request.decoded.email)
            console.log(request.body.message)
            result.rows.forEach((entry) =>
                notifyOthers.sendMessageToIndividual(
                    entry.token,
                    response.message))
            response.send({
                success: true,
            })
        }).catch((err) => {
            response.status(400).send({
                message: 'SQL Error on select from push token',
                error: err,
            })
        })
})

/**
 * @api {get} /messages/:chatid?/:messageId? Request to get chat messages
 * @apiName GetMessages
 * @apiGroup Messages
 *
 * @apiDescription Request to get the 10 most recent chat messages
 * from the server in a given chat - chatid. If an optional messageId is provided,
 * return the 10 messages in the chat prior to (and not including) the message containing
 * MessageID.
 *
 * @apiParam {number} chatid the chat to look up.
 * @apiParam {number} messageId (Optional) return the 15 messages prior to this message
 *
 * @apiSuccess {number} rowCount the number of messages returned
 * @apiSuccess {object[]} messages List of massages in the message table
 * @apiSuccess {string} messages.messageId The id for this message
 * @apiSuccess {string} messages.email The email of the user who posted this message
 * @apiSuccess {string} messages.message The message text
 * @apiSuccess {string} messages.timestamp The timestamp of when this message was posted
 *
 * @apiError (404: ChatId Not Found) {string} message "Chat ID Not Found"
 * @apiError (400: Invalid Parameter) {string} message "Malformed parameter.
 *                                                      chatid must be a number"
 * @apiError (400: Missing Parameters) {string} message "Missing required information"
 *
 * @apiError (400: SQL Error) {string} message the reported SQL error details
 *
 */
router.get('/:chatid?/:messageId?', (request, response, next) => {
    // validate chatid is not empty or non-number
    if (request.params.chatid === undefined) {
        response.status(400).send({
            message: 'Missing required information',
        })
    } else if (isNaN(request.params.chatid)) {
        response.status(400).send({
            message: 'Malformed parameter. chatid must be a number',
        })
    } else {
        next()
    }
}, (request, response, next) => {
    console.log(request.params.chatid)
    // validate that the ChatId exists
    const query = 'SELECT * FROM CHATS WHERE ChatId=$1'
    const values = [request.params.chatid]

    pool.query(query, values)
        .then((result) => {
            if (result.rowCount == 0) {
                response.status(404).send({
                    message: 'Chat ID not found',
                })
            } else {
                next()
            }
        }).catch((error) => {
            response.status(400).send({
                message: 'SQL Error',
                error: error,
            })
        })
}, (request, response) => {
    // perform the Select

    if (!request.params.messageId) {
        // no messageId provided. Use the largest possible integer value
        // allowed for the messageId in the db table.
        request.params.messageId = 2**31 - 1
    }

    const query = `SELECT Messages.PrimaryKey AS messageId, Members.Email, Messages.Message, 
                to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD HH24:MI:SS.US' ) 
                AS Timestamp
                FROM Messages
                INNER JOIN Members ON Messages.MemberId=Members.MemberId
                WHERE ChatId=$1 AND Messages.PrimaryKey < $2
                ORDER BY Timestamp DESC
                LIMIT 15`
    const values = [request.params.chatid, request.params.messageId]
    pool.query(query, values)
        .then((result) => {
            response.send({
                chatid: request.params.chatid,
                rowCount: result.rowCount,
                rows: result.rows,
            })
        }).catch((err) => {
            response.status(400).send({
                message: 'SQL Error',
                error: err,
            })
        })
})

module.exports = router

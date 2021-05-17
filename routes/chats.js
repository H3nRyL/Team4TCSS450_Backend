const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const {validation} = require('../utilities')
const isStringProvided = validation.isStringProvided

const router = express.Router()

// The difference between a chat and a message is chat generally grabs meta information
// or does meta updates like add a user to a chat.

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
router.get('/', (request, response) => {
    // Get a list of chats with chatid, timestamp, and last message
    const query = `SELECT DISTINCT ON (m.chatid) m.chatid as chatid, c.groupname as groupname, 
                                                 m.message AS message, m.timestamp AS timestamp
                    FROM ChatMembers AS cm INNER JOIN Messages AS m 
                        ON m.chatid = cm.chatid
                        AND cm.memberid = $1
                    INNER JOIN Chats as c
                        ON m.chatid = c.chatid
                    ORDER BY m.chatid, m.timestamp DESC`

    pool.query(query, [request.decoded.memberid])
        .then((result) => {
            response.status(200).send({
                chats: result.rows
            })
            // const chats = []
            // result.rows.forEach((row) => {
            //     // Get the group name, timestamp of last message, and last message of the chats
            //     chats.push({chatId: row.chatid, groupname: row.groupname,
            //         lastmessage: row.message, lasttimestamp: row.timestamp})
            // })
            // response.status(200).send(chats)
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error: error})
        })
})

/**
 * @api {post} /chats/ Creates a chat with the given list of users, group name, and owner
 *
 * @apiDescription Creates a new chat provided the group name and list of
 *                  user's memberid in an array
 *
 * @apiheader {string} Bearer Token a valid authorization JWT
 *
 * @apiParam {[]} users an array of numbers representing the ids of members to be added
 *              (does not include self) NOTE: this is part of body, not param
 *
 * @apiParam {string} groupname the name of the group, NOTE: this is part of body, not param
 *
 * @apiName createChats
 * @apiGroup Chats
 *
 * @apiHeader {string} a valid auth jwt
 *
 * @apiError (400: Missing Body Parameter) {string} message
 *                                   Either groupname or [...users...] is missing
 * @apiError (400: SQL Error) {string} message Something broke during querying DB
 *
 * @apiSuccess {chatid} the chatid corresponding to the created chat
 */
router.post('/', (request, response, next) => {
    if (!isStringProvided(request.body.groupname) &&
     Array.isArray(request.body.users) &&
     request.body.users.length) {
        response.status(400).send({
            message: 'Missing groupname and/or list of users to add',
        })
    } else {
        next()
    }
},
// Create a new chat with the owner and group name
// TODO transactions
//  I just remembered transactions from the DB course to just do this all at once and remove if fail
// TODO At the moment, this assumes the memberid and chatid are valid
// - Steven
(request, response, next) => {
    const query = 'INSERT INTO Chats(ownerid, groupname) VALUES($1, $2) RETURNING chatid'
    const values = [request.decoded.memberid, request.body.groupname]

    pool.query(query, values)
        .then((result) => {
            // TODO async and multiple run at the same time?
            request.metaInfo = {chatid: result.rows[0].chatid}
            next()
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error})
        })
},

// Add the users as chatmembers to the corresponding chat based on their memberid
(request, response) => {
    // TODO need to convert the user first and last to their id
    const chatMembers = request.body.users
    // Query to be concatenated
    let query = 'INSERT INTO ChatMembers(chatid, memberid) VALUES '

    for (let i = 0; i < chatMembers.length; i++) {
        query += `(${request.metaInfo.chatid}, ${chatMembers[i]}), `
    }

    query += `(${request.metaInfo.chatid}, ${request.decoded.memberid})`
    pool.query(query, (err, res) => {
        if (err) {
            response.status(400).send({message: 'SQL Error. Created chat but did not add users',
                err})
        } else {
            response.status(200).send({chatid: request.metaInfo.chatid})
        }
    })
})

module.exports = router

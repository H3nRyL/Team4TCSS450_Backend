const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const notifyOthers = require('../utilities/exports').messaging

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
    const query = `SELECT DISTINCT ON (c.chatid) c.chatid AS chatid, c.groupname AS groupname,
                    COALESCE(
                        (SELECT message 
                        FROM Messages 
                        WHERE chatid = c.chatid 
                        ORDER BY timestamp DESC 
                        LIMIT 1), 
                        '') 
                        AS message, 
                    COALESCE(
                        (SELECT to_char(Messages.Timestamp AT TIME ZONE 'PDT', 
                        'YYYY-MM-DD HH24:MI:SS.US' )
                        FROM Messages 
                        WHERE chatid = c.chatid 
                        ORDER BY timestamp DESC 
                        LIMIT 1), 
                        null) 
                        AS timestamp
                    FROM ChatMembers AS cm INNER JOIN Chats AS c
                    ON cm.chatid = c.chatid
                    AND cm.memberid = $1`

    pool.query(query, [request.decoded.memberid])
        .then((result) => {
            response.status(200).send({
                chats: result.rows,
            })
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
(request, response, next) => {
    const query = 'INSERT INTO Chats(ownerid, groupname) VALUES($1, $2) RETURNING chatid'
    const values = [request.decoded.memberid, request.body.groupname]

    pool.query(query, values)
        .then((result) => {
            request.metaInfo = {chatid: result.rows[0].chatid}
            next()
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error})
        })
},

// Add the users as chatmembers to the corresponding chat based on their memberid
(request, response, next) => {
    const chatMembers = request.body.users
    // Query to be concatenated
    let query = 'INSERT INTO ChatMembers(chatid, memberid) VALUES '

    for (let i = 0; i < chatMembers.length; i++) {
        query += `(${request.metaInfo.chatid}, ${chatMembers[i]}), `
    }

    query += `(${request.metaInfo.chatid}, ${request.decoded.memberid}) `

    pool.query(query, (err, res) => {
        if (err) {
            response.status(400).send({message: 'SQL Error. Created chat but did not add users',
                err})
        } else {
            next()
        }
    })
},
// pushy to all individuals
(request, response) => {
    const query = `SELECT token FROM Push_Token
                        INNER JOIN ChatMembers ON
                        Push_Token.memberid=ChatMembers.memberid
                        WHERE ChatMembers.chatid=$1`
    pool.query(query, [request.metaInfo.chatid])
        .then((result) => {
            result.rows.forEach((entry) => {
                notifyOthers.sendChatCreationToIndividual(entry.token, request.body.groupname)
            })
            response.status(200).send({chatid: request.metaInfo.chatid})
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error. push token',
                error})
        })
})

// This does not check if you are a member of the chat
/**
 * @api {get} /chats/:chatid Selects a list of emails and memberids
 */
router.get('/:chatid/', (request, response) => {
    const theQuery = 'SELECT DISTINCT Members.memberid, email FROM ChatMembers' +
    ' INNER JOIN Members ON chatid=$1 AND Members.memberid=ChatMembers.memberid ORDER BY email ASC'
    pool.query(theQuery, [request.params.chatid])
        .then((result) => {
            if (result.rowCount) response.status(200).send(result.rows)
        })
        .catch((error) => response.status(400).send({error}))
})

/**
 * @api {delete} /chats/chatid/members Deletes a user belonging to chatid
 */
router.delete('/:chatid/members/', (request, response, next) => {
    if (request.query.p && !isNaN(request.query.p)) {
        next()
    } else {
        // Missing or invalid p
        response.status(400).send({message: 'p query is invalid or missing'})
    }
},
// Checks if user sending request and one to be deleted is part of chat
(request, response, next) => {
    const theQuery = 'SELECT * FROM ChatMembers WHERE chatid=$1 AND (memberid=$2 OR memberid=$3)'
    pool.query(theQuery, [request.params.chatid, request.decoded.memberid, request.query.p])
        .then((result) => {
            if (result.rowCount) {
                next()
            } else {
                response.status(400).send({
                    message: 'User or chat does not exist' +
                     '(either you or the chatmember to be deleted)'})
            }
        })
        .catch((error) => response.status(400).send({message: 'SQL Error', error}))
},
// Deletes the user requested from the chat
(request, response) => {
    const theQuery = 'DELETE FROM ChatMembers WHERE chatid=$1 AND memberid=$2'
    pool.query(theQuery, [request.params.chatid, request.query.p])
        .then((result) => response.status(200).send({message: 'User was successfully ' +
         'deleted from chat'}))
        .catch((error) => response.status(400).send({message: 'SQL Error', error}))
})

/**
 * @api {put} /chats/chatid/members Adds a user to a chat
 */
router.put('/:chatid/members/', (request, response, next) => {
    if (request.query.p && validateEmail(request.query.p)) {
        next()
    } else {
        // Missing or invalid p
        response.status(400).send({message: 'p query is invalid or missing'})
    }
},
// Checks if chat exists
(request, response, next) => {
    const theQuery = 'SELECT * FROM ChatMembers WHERE chatid=$1'
    pool.query(theQuery, [request.params.chatid])
        .then((result) => {
            if (result.rowCount) {
                next()
            } else {
                response.status(400).send({message: 'Chat does not exist'})
            }
        })
        .catch((error) => response.status(400).send({message: 'SQL Error', error}))
},
// Get email of user
(request, response, next) => {
    let theQuery = 'SELECT memberid FROM Members WHERE email=\''
    theQuery += request.query.p + '\''
    pool.query(theQuery, [])
        .then((result) => {
            if (result.rowCount) {
                request.id = result.rows[0].memberid
                next()
            } else {
                response.status(400).send({message: 'User does not exist'})
            }
        })
        .catch((error) => response.status(400).send({message: 'SQL Error', error}))
},
(request, response) => {
    const theQuery = 'INSERT INTO ChatMembers(chatid, memberid) VALUES($1, $2)'
    pool.query(theQuery, [request.params.chatid, request.id])
        .then((result) => response.status(200).send({message: 'Successfully Added'}))
        .catch((error) => {
            if (error.constraint === 'compositechatmembers') {
                response.status(400).send({message: 'user has already been added'})
            } else {
                response.status(400).send({message: 'SQL Error', error})
            }
        })
})

/**
 * checks if email is valid
 *
 * @param {string} email email of user
 * @return {boolean} true if valid email format; otherwise false
 */
 function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}

module.exports = router

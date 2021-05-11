const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool

const router = express.Router()

// The difference between a chat and a message is chat generally grabs meta information
// or does meta updates like add a user to a chat.

/**
 * @api {get} /chats/ get the chats with timestamp and last message that the user belongs to
 * @apiName getChats
 * @apiGroup Chats
 *
 * @apiheader {string} a valid authorization JWT
 */
router.get('/', (request, response) => {
    // TODO merge the query
    // Get all chats that the user belongs to
    const query = 'SELECT DISTINCT chatid FROM ChatMembers WHERE memberid=$1 '

    pool.query(query, [request.decoded.memberid])
        .then((result) => {
            const chats = []
            result.rows.forEach((row) => {
                // Get the group name, timestamp of last message, and last message of the chats
                const chatQuery = 'SELECT chatid, groupname FROM Chats WHERE chatid=$1'
                
                // TODO figure out the query, brain dead right now :|
                //  How to update the chats without getting it again?
                chats.push({chatId: row.chatid, groupName: undefined})
            })
            response.status(200).send(result)
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error: error})
        })
})

module.exports = router

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
    // Get a list of chats with chatid, timestamp, and last message
    const query = `SELECT DISTINCT ON (m.chatid) m.chatid as chatid, c.groupname as groupname, 
                                                 m.message AS message, m.timestamp AS timestamp
                    FROM ChatMembers AS cm INNER JOIN Messages AS m 
                        ON m.memberid = cm.memberid
                        AND m.memberid = $1
                        AND m.chatid = cm.chatid
                    INNER JOIN Chats as c
                        ON m.chatid = c.chatid
                    ORDER BY m.chatid, m.timestamp DESC`

    pool.query(query, [request.decoded.memberid])
        .then((result) => {
            const chats = []
            console.log(result)
            result.rows.forEach((row) => {
                // Get the group name, timestamp of last message, and last message of the chats
                chats.push({chatId: row.chatid, groupName: row.groupname,
                            lastMessage: row.message, lastTimestamp: row.timestamp})
            })
            response.status(200).send(chats)
        })
        .catch((error) => {
            response.status(400).send({message: 'SQL Error', error: error})
        })
})

module.exports = router

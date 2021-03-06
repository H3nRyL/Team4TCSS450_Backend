/**
 * @file Registation component of auth endpoint
 */
// express is the framework we're going to use to handle requests
const express = require('express')

const notifyOthers = require('../../utilities/exports').messaging

// Access the connection to Heroku Database
const pool = require('../../utilities/exports').pool
const router = express.Router()

/**
 * @api {post} /invites Request to send an invite to another user
 * @apiName PostInvite
 * @apiGroup Invites
 *
 * @apiParam {string} memberid_a the memberID of the requester
 * @apiParam {string} memberid_b the memberID of the user receiving the request
 *
 * @apiSuccess (Success 201) {boolean} success true when the invite was sent
 * @apiSuccess (Success 202) {boolean} success when the other users contact list is updated as well
 */

router.post('/',
    // Checks if invite exists from the other member so we update it.
    (request, response, next) => {
        const theValue = [request.body.inviteeid, request.decoded.memberid]
        const theQuery = 'SELECT verified FROM Contacts WHERE memberid_a=$1 AND memberid_b=$2'
        pool.query(theQuery, theValue)
            .then((result) => {
                if (result.rowCount) {
                    response.status(200).send({
                        message: `Invite from ${request.body.inviteeid} was received earlier` +
                        ' Auto accepting the request if not accepted yet (I hope)',
                    })
                    const addQuery =
                        'UPDATE Contacts SET verified = 1 WHERE memberid_a=$1 AND memberid_b=$2'
                    pool.query(addQuery, theValue).then(console.log).catch(console.error)
                } else {
                    // invite does not exist, create it
                    next()
                }
            })
            .catch((error) => console.log(error))
    },
    // Creates a contact request by making member id a and b a entry
    // but with verified (indicator of they're connected) to 0
    (request, response, next) => {
        const userid = request.decoded.memberid
        const inviteeid = request.body.inviteeid

        const values = [userid, inviteeid]
        const theQuery =
        'INSERT INTO Contacts (MemberID_A, MemberID_B, Verified) VALUES ($1, $2, 0) RETURNING Verified'
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rows[0].verified === 0) {
                    response.status(200).send({
                        message: `Invite has been sent to ${inviteeid}`,
                    })
                    next()
                }
            })
            .catch((error) => {
                response.status(402).send({message:
                    'You have already invited this user or are already contacts', error})
            })
    }, 
    (request, response) => {
        // send a notification of the invite to the member with registered tokens
        const query = `SELECT token FROM Push_Token WHERE memberid=$1`
        const values = [request.body.inviteeid]
        pool.query(query, values)
            .then((result) => {
                notifyOthers.sendInviteToIndividual(result.rows[0].token)
                response.send({
                    success: true,
                })
            }).catch((err) => {
                response.status(400).send({
                    message: 'SQL Error on select from push token',
                    error: err,
                })
            })
    }
)

/**
 * @api {get} /invites Gets all possible users that member is not friends with
 * @apiName GetInvite
 * @apiGroup Invites
 *
 * @apiParam {string} memberid_a the memberID of the requester
 * @apiParam {string} memberid_b the memberID of the user receiving the request
 *
 * @apiSuccess (Success 200) {boolean} success true when the invite was sent
 * @apiSuccess (Success 200) {JSONArray} success when the list of potential invites is returned
 *
 */
router.get('/',
    (request, response) => {
        const userid = request.decoded.memberid
        const values = [userid]
        const theQuery = "SELECT DISTINCT MemberID, FirstName, LastName, Email, Members.UserName FROM Members WHERE MemberID NOT IN (SELECT MemberID_A FROM Contacts WHERE MemberID_A = $1 or MemberID_B = $1) AND MemberID <> $1 AND MemberID NOT IN(SELECT MemberID_B FROM Contacts WHERE MemberID_A = $1 or MemberID_B = $1)"
        pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount > 0) {
                response.status(200).send({
                    success:true,
                    'data': result.rows,
                    message: `Members have been returned`,
                })
            } else {
                response.status(200).send({
                    success:false,
                    message: "No invitees found"
                })
            }
        })
        .catch((error) => {
            response.status(402).send({message:
                'You are already friends with all possible contacts! Congratulations!', error})
            })
    })
module.exports = router

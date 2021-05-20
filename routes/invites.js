/**
 * @file Registation component of auth endpoint
 */
// express is the framework we're going to use to handle requests
const express = require('express')

// Access the connection to Heroku Database
const pool = require('../utilities').pool
const router = express.Router();

/**
 * @api {post} /invites Request to send an invite to another user
 * @apiName PostInvite
 * @apiGroup Invites
 * 
 * @apiParam {String} memberid_a the memberID of the requester
 * @apiParam {String} memberid_b the memberID of the user receiving the request
 * 
 * @apiSuccess (Success 201) {boolean} success true when the invite was sent
 * @apiSuccess (Success 202) {boolean} success when the other users contact list is updated as well
 */

router.post('/', 
    (request, response, next) => {
        const user_id = request.decoded.memberid
        const invitee_id = request.body.inviteeid

        const values = [user_id, invitee_id]
        const theQuery = "INSERT INTO Contacts (MemberID_A, MemberID_B) SELECT $1, $2 WHERE NOT EXISTS (SELECT MemberID_A, MemberID_B FROM Contacts WHERE MemberID_A = $1 AND MemberID_B = $2) RETURNING Verified;"
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rows[0].verified == 0) {
                    next()
                }  else if(result.rows[0].verified == 1) {
                        response.status(200).send({
                            message: "You are already connected!"
                    })
                    return
                }
        
            })
            .catch((error) => {
                response.status(402).send({message: "You have already invited this user or are already contacts (check1)"})
            })
    },
    (request, response, next) => {
        const user_id = request.decoded.memberid
        const invitee_id = request.body.inviteeid

        const values = [user_id, invitee_id]
        const theQuery = "INSERT INTO Contacts (MemberID_A, MemberID_B, Verified) VALUES ($1) WHERE MemberID_A = $2 AND MemberID_B = $1 ON CONFLICT(Verified) DO NOTHING;"
        pool.query(theQuery, values)
            .then((result) => {
                console.log(result.rows)
                if (result.rows[0].verified == 0) {
                    next()
                }  else if(result.rows[0].verified == 1) {
                        response.status(201).send({
                            message: "You are already connected!"
                    })
                    return
                }
        
            })
            .catch((error) => {
                response.status(404).send({message: "You have already invited this user or are already contacts (check2)"})
            })
    },
    /*
    (request, response, next) => {
        const user_id = request.decoded.memberid
        const invitee_id = request.body.inviteeid

        const values = [user_id, invitee_id]
        const theQuery = "SELECT EXISTS (SELECT * FROM Contacts WHERE MemberID_A = $2 AND MemberID_B = $1)"
        pool.query(theQuery, values)
            .then((result) => {
                console.log(result)
                if (result == false) {
                    return
                }  else {
                    next()
                }
                
            })
            .catch((error) => {
                response.status(404).send({message: "You have already invited this user or are already contacts"})
            })
    },
    (request, response, next) => {
        const user_id = request.decoded.memberid
        const inviteeid = request.body.inviteeid
        const values = [user_id, inviteeid]
        const theQuery = "SELECT * FROM Contacts WHERE MemberID_A = $2 AND MemberID_B = $1 RETURNING Verified"
        pool.query(theQuery, values)
            .then((result) => {
                if(result.rows[0].verified == 1) {
                    response.status(201).send({
                        success:true,
                        message: "You have been added to users contacts!"
                    })
                    next()
                } else if(result.rowCount > 0) {
                    next()
                } else {
                    return
                }
            })
            .catch((error) => {
                next()
            })    
    },
    (request, response, next) => {
        const user_id = request.decoded.memberid
        const inviteeid = request.body.inviteeid
        const values = [user_id, inviteeid]
        const theQuery = "UPDATE Contacts SET Verified = 1 WHERE MemberID_A = $2 AND MemberID_B = $1"
        pool.query(theQuery, values)
            .then((result) => {
                if(result.rows[0].verified == 1) {
                    response.status(201).send({
                        success:true,
                        message: "You have been added to users contacts!"
                    })
                    return
                } else {
                    next()
                }
            })
            .catch((error) => {
                next()
            })    
    },*/
)
module.exports = router
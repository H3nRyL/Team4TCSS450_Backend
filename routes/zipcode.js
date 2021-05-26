const API_KEY = process.env

// express is the framework we're going to use to handle requests
const express = require('express')

const validation = require('../utilities').validation

const isStringProvided = validation.isStringProvided

// request module is needed to make a request to a web service
const request = require('request')

const router = express.Router()

/**
 * @api {get} /zipcode Request a location based on a zipcode
 * @apiName Zipcode to location
 * @apiGroup Zipcodeapi
 *
 * @apiHeader {string} authorization JWT provided from Auth get
 *
 * @apiParam {string} zipcode zipcode of a given location
 *
 * @apiDescription This end point is a pass through to the Phish.net API.
 * All parameters will pass on to https://www.zipcodeapi.com/rest/.
 * See the <a href="https://www.zipcodeapi.com/API#zipToLoc">
 * zipcodeapi.com documentation</a>
 * for a list of optional paramerters and expected results. You do not need a
 * zipcodeapi.com api key with this endpoint. Enjoy!
 */
router.get('/', (req, res) => {
    if (isStringProvided(req.query.zipcode)) {
        // for info on use of tilde (`) making a String literal, see below.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
        const url = `https://www.zipcodeapi.com/rest/${API_KEY}/info.json/`+
            `${req.query.zipcode}/degrees`

        // When this web service gets a request, make a request to the Zipcode api service
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

module.exports = router

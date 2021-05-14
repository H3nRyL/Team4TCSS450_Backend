const API_KEY = process.env.OPEN_WEATHER_API

// express is the framework we're going to use to handle requests
const express = require('express')

const validation = require('../utilities').validation

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
 * See the <a href="https://openweathermap.org/api/one-call-api">openweathermap.org documentation</a>
 * for a list of optional paramerters and expected results. You do not need a
 * openweathermap.org api key with this endpoint. Enjoy!
 */
router.get('/', (req, res) => {
    // for info on use of tilde (`) making a String literal, see below.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
    let url = 'https://api.openweathermap.org/data/2.5/onecall?'

    // find the query string (parameters) sent to this end point and pass them on to
    // phish.net api call

    url += 'lat='+ req.query.lat + '&'+ 'lon=' + req.query.lon +
        '&exclude=minutely' + '&units=imperial' + '&appid=' + API_KEY
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

            res.send(JSON.parse(nakidBody))
        }
    })
})

module.exports = router

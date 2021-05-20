/**
 * @file main node.js file
 */
// express is the framework we're going to use to handle requests
const express = require('express')
// Create a new instance of express
const app = express()

const middleware = require('./middleware')

/*
 * This middleware function parses JASOn in the body of POST requests
 */
app.use(express.json())

/*
 * This middleware function will respond to improperly formed JSON in
 * request parameters.
 */
app.use(middleware.jsonErrorInBody)

app.use('/auth', require('./routes/register'))
app.use('/auth', require('./routes/signin'))
app.use('/verification', require('./routes/verify'))
app.use('/chats', middleware.checkToken, require('./routes/chats'))

app.use('/contacts', middleware.checkToken, require('./routes/contacts'))
app.use('/invites', middleware.checkToken, require('./routes/invites'))
app.use('/requests', middleware.checkToken, require('./routes/requests'))

app.use('/messages', middleware.checkToken, require('./routes/messages'))
app.use('/weather', middleware.checkToken, require('./routes/weather'))

app.use('/doc', express.static('apidoc'))

/*
 * Return HTML for the / end point.
 * This is a nice location to document your web service API
 * Create a web page in HTML/CSS and have this end point return it.
 * Look up the node module 'fs' ex: require('fs');
 */
app.get('/', (request, response) => {
    // this is a Web page so set the content-type to HTML
    response.send('TCSS 450 Team 4 Spring 2021 Backend ' +
    'Hey! You shouldn\'t be here!').status(200)
})

/*
* Heroku will assign a port you can use via the 'PORT' environment variable
* To access an environment variable, use process.env.<ENV>
* If there isn't an environment variable, process.env.PORT will be null (or undefined)
* If a value is 'falsy', i.e. null or undefined, javascript will evaluate the rest of the 'or'
* In this case, we assign the port to be 5000 if the PORT variable isn't set
* You can consider 'let port = process.env.PORT || 5000' to be equivalent to:
* let port; = process.env.PORT;
* if(port == null) {port = 5000}
*/
app.listen(process.env.PORT || 5000, () => {
    console.log('Server up and running on port: ' + (process.env.PORT || 5000))
})

/**
 * @file starting point of Express server, makes the routes and controllers
 */

const express = require('express')
const routes = require('./routes')

const server = express()

// Port number to listen on
const PORT = process.env.PORT || 5000

// authentication handling (3rd party)
server.use('/auth', routes.authRouter)

// default message
server.get('/', (req, res) => {
    res.send('TCSS 450 Team 4 Spring 2021 Backend ' +
    'Hey! You shouldn\'t be here!')
})


// Start server
server.listen(PORT, console.log(`Server is online at PORT ${PORT}`))

/**
 * @file verification email handling functions
 */


const nodemailer = require('nodemailer')

const fs = require('fs')

const handlebars = require('handlebars')

// base url to access endpoints
const url = process.env.DEV_SERVICE_URL || process.env.SERVICE_URL

const appName = 'Team 4 :)'

/**
 * Sends a verification email to the specified receiver
 *
 * @param {string} receiver email of the receiver
 * @param {string} jwt unique verification jwt to be decoded
 */
function sendVerificationEmail(receiver, jwt) {
    const html = fs.readFileSync('./data/verification_email.html', {encoding: 'utf-8'})

    const template = handlebars.compile(html)


    const verificationUrl = `${url}/verification?name=${jwt}`

    const htmlToSend = template({action_url: verificationUrl})

    const subject = `${appName} Account Registration`
    const message = `Hello,\n\nWelcome to our App! Thanks for signing up with our application! 
                     Here is the verification link ${verificationUrl}`

    sendEmail(process.env.SENDER_EMAIL, process.env.SENDER_PW, receiver, subject,
        message, htmlToSend)
}

/**
 * Sends a reset email where a user can get a code to reset their password
 *
 * @param {string} receiver the email to send to
 * @param {number} code the code to use to reset
 *
 */
function sendResetEmail(receiver, code) {
    sendEmail(process.env.SENDER_EMAIL, process.env.SENDER_PW, receiver, 'Reset Code', code + '', code + '')
}

/**
 * Sends an email to the receiver
 *
 * @param {string} sender email of sender
 * @param {string} pw password of the sender
 * @param {string} receiver receiver email
 * @param {string} subject subject line of email
 * @param {string} message message of email
 * @param {string} html html to be sent with email
 */
function sendEmail(sender, pw, receiver, subject, message, html) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: pw,
        },
    })

    const mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        text: message,
        html: html,
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })

    // Post a message to logs.
    console.log('*********************************************************')
    console.log('To: ' + receiver)
    console.log('From: ' + sender)
    console.log('Subject: ' + subject)
    console.log('_________________________________________________________')
    console.log(message)
    console.log('*********************************************************')
}

module.exports = {
    sendVerificationEmail, sendResetEmail,
}

/**
 * @file verification email handling functions
 */
const nodemailer = require('nodemailer')

// base url to access endpoints
const url = process.env.DEV_SERVICE_URL || process.env.SERVICE_URL

/**
 * Sends a verification email to the specified receiver
 *
 * @param {string} receiver email of the receiver
 * @param {string} salt unique verification
 */
function sendVerificationEmail(receiver, salt) {
    const html = `Hello,<br> Please Click on the link to verify your email.
     <br><a href=${url}/verification?name=${salt}>Click here to verify</a>`

    const subject = 'Account Registration'
    const message = 'Hello,\n\nWelcome to our App! Thanks for signing up with our application!'

    sendEmail(process.env.SENDER_EMAIL, process.env.SENDER_PW, receiver, subject, message, html)
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
    sendVerificationEmail,
}

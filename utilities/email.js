/**
 * @file verification email handling functions
 */
const nodemailer = require('nodemailer')

/**
 * 
 * 
 * @param {string} sender email of the sender 
 * @param {string} receiver email of the receiver
 * @param {string} subject subject text line
 * @param {string} message the contents of the message
 * @param {string} salt unique verification
 */
function sendVerificationEmail(sender, receiver, subject, message, salt) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: sender,
            pass: 'tcss450project',
        },
    })

    const mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        text: message,
        html: 'Hello,<br> Please Click on the link to verify your email.' +
            '<br><a href=http://group4-tcss450-project.herokuapp.com/verify?name=' + salt +
            '>Click here to verify</a>',
    }

    transporter.sendMail(mailOptions, function (error, info) {
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

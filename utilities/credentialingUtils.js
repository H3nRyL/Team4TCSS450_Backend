/**
 * @file credential handling functions
 */
// We use this create the SHA256 hash
const crypto = require('crypto')

/**
 * Creates a salted and hashed string of hexadecimal characters. Used to encrypt
 * "safely" store user passwords.
 *
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 *
 * @return {string} a hashed password with salt
 */
const generateHash = (pw, salt) =>
    crypto.createHash('sha256').update(pw + salt).digest('hex')

/**
 * Creates a random string of hexadecimal characters with the length of size.
 *
 * @param {string} size the size (in bits) of the salt to create
 *
 * @return {string} random string of hexadecimal characters
 */
const generateSalt = (size) =>
    crypto.randomBytes(size).toString('hex')

module.exports = {
    generateHash, generateSalt,
}

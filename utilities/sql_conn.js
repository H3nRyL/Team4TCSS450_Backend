// Obtain a Pool of DB connections.
const {Pool} = require('pg')

const pool = new Pool({
    connectionString: process.env.DEV_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

module.exports = pool

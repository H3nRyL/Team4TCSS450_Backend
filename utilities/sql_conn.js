// Obtain a Pool of DB connections.
const {Pool} = require('pg')

const DB_URL = process.env.DEV_DATABASE_URL

const pool = new Pool({
    connectionString: DB_URL,
    ssl: {
        rejectUnauthorized: false,
    },
})

module.exports = pool

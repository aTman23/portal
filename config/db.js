const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1722",
    database: "psy",
})

module.exports = mySqlPool;
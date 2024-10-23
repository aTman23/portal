const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1722',
    database: 'psy',
    connectionLimit: 10,
});

module.exports = pool;

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: "localhost",
  user: "mcp",
  password: "123456",
  database: "dadb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
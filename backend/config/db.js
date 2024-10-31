import mysql from "mysql2/promise";

// Replace these values with your actual cPanel MySQL database details
const pool = mysql.createPool({
  host: "87.98.244.114", // e.g., 'example.com' or the IP of your server
  user: "psyshell_anilreddy", // e.g., 'your-cpanel-db-username'
  password: "6302423327@Aa", // e.g., 'your-cpanel-db-password'
  database: "psyshell_test", // e.g., 'your-cpanel-db-name'
  port: 3306, // default MySQL port; change if different
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
});

export default pool;

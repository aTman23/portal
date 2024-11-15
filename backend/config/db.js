import mysql from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

// Replace these values with your actual cPanel MySQL database details
const pool = mysql.createPool({
  host:  process.env.DB_HOST, // e.g., 'example.com' or the IP of your server
  user:  process.env.DB_USER, // e.g., 'your-cpanel-db-username'
  password:  process.env.DB_PASSWORD, // e.g., 'your-cpanel-db-password'
  database: process.env.DB_NAME, // e.g., 'your-cpanel-db-name'
  port: 3306, // default MySQL port; change if different
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
});

export default pool;

const mysql = require("mysql2");

// Railway automatically ye variables provide karta hai
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "mysql123",
  database: process.env.MYSQLDATABASE || "task_manager",
  port: process.env.MYSQLPORT || 3306
});

db.connect((err) => {
  if (err) console.log("DB Connection Error:", err);
  else console.log("MySQL Connected to Railway/Local...");
});

module.exports = db;
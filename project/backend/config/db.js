require('dotenv').config();
const mysql = require('mysql2'); // Sử dụng mysql2

// Tạo kết nối
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Kết nối đến MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Xuất kết nối
module.exports = connection;

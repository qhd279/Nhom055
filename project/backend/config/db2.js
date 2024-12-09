require('dotenv').config();
const mysql = require('mysql2/promise'); // Sử dụng mysql2/promise

// Tạo pool kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Cho phép chờ kết nối
    connectionLimit: 10, // Giới hạn số kết nối
    queueLimit: 0 // Không giới hạn hàng đợi
});

// Xuất pool kết nối
module.exports = pool;

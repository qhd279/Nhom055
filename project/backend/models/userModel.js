const db = require('../config/db');

exports.getAllUsers = (callback) => {
    db.query('SELECT * FROM users', callback);
};

exports.getUserById = (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], callback);
};

exports.createUser = (user, callback) => {
    db.query('INSERT INTO users SET ?', user, callback);
};

exports.updateUser = (id, user, callback) => {
    db.query('UPDATE users SET ? WHERE id = ?', [user, id], callback);
};

exports.deleteUser = (id, callback) => {
    db.query('DELETE FROM users WHERE id = ?', [id], callback);
};

exports.getUserByEmail = (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
};

exports.getSupportUsers = (callback) => {
    const query = 'SELECT * FROM users WHERE role = "support"';
    db.query(query, callback);
};
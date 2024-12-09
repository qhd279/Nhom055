const db = require('../config/db');

exports.getAllDevices = (callback) => {
    db.query('SELECT * FROM devices', callback);
};

exports.getDeviceById = (id, callback) => {
    db.query('SELECT * FROM devices WHERE device_id = ?', [id], callback);
};

exports.createDevice = (device, callback) => {
    db.query('INSERT INTO devices SET ?', device, callback);
};

exports.updateDevice = (id, device, callback) => {
    db.query('UPDATE devices SET ? WHERE device_id = ?', [device, id], callback);
};

exports.deleteDevice = (id, callback) => {
    db.query('DELETE FROM devices WHERE device_id = ?', [id], callback);
};

exports.checkDeviceQuantity = (device_id, callback) => {
    const query = 'SELECT quantity FROM devices WHERE device_id = ?';
    db.query(query, [device_id], callback);
};

exports.addDeviceToComputer = (computer_id, device_id, callback) => {
    const query = 'INSERT INTO computer_devices (computer_id, device_id) VALUES (?, ?)';
    db.query(query, [computer_id, device_id], callback);
};
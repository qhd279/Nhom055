const db = require('../config/db');

exports.getAllSoftware = (callback) => {
    db.query('SELECT * FROM software', callback);
};

exports.getSoftwareById = (id, callback) => {
    db.query('SELECT * FROM software WHERE software_id = ?', [id], callback);
};

exports.createSoftware = (software, callback) => {
    db.query('INSERT INTO software SET ?', software, callback);
};

exports.updateSoftware = (id, software, callback) => {
    db.query('UPDATE software SET ? WHERE software_id = ?', [software, id], callback);
};

exports.deleteSoftware = (id, callback) => {
    db.query('DELETE FROM software WHERE software_id = ?', [id], callback);
};

exports.addSoftwareToComputer = (computer_id, software_id, callback) => {
    const query = 'INSERT INTO computer_software (computer_id, software_id) VALUES (?, ?)';
    db.query(query, [computer_id, software_id], callback);
};
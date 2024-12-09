const db = require('../config/db');

exports.getAllRooms = (callback) => {
    db.query('SELECT * FROM rooms', callback);
};

exports.getRoomById = (id, callback) => {
    db.query('SELECT * FROM rooms WHERE room_id = ?', [id], callback);
};

exports.createRoom = (room, callback) => {
    db.query('INSERT INTO rooms SET ?', room, (err, result) => {
        if (err) return callback(err);
        callback(null, result.insertId);
    });
};

exports.updateRoom = (id, room, callback) => {
    db.query('UPDATE rooms SET ? WHERE room_id = ?', [room, id], callback);
};

exports.deleteRoom = (id, callback) => {
    db.query('SELECT computer_id FROM computers WHERE room_id = ?', [id], (err, computers) => {
        if (err) return callback(err);
        
        const computerIds = computers.map(c => c.computer_id);
        
        if (computerIds.length > 0) {
            db.query('DELETE FROM computer_devices WHERE computer_id IN (?)', [computerIds], (err) => {
                if (err) return callback(err);
                
                db.query('DELETE FROM computer_software WHERE computer_id IN (?)', [computerIds], (err) => {
                    if (err) return callback(err);
                    
                    db.query('DELETE FROM computers WHERE room_id = ?', [id], (err) => {
                        if (err) return callback(err);
                        
                        db.query('DELETE FROM rooms WHERE room_id = ?', [id], callback);
                    });
                });
            });
        } else {
            db.query('DELETE FROM rooms WHERE room_id = ?', [id], callback);
        }
    });
};

exports.getComputerCountByRoomId = (roomId, callback) => {
    db.query('SELECT COUNT(*) AS count FROM computers WHERE room_id = ?', [roomId], callback);
};

exports.getSupportByRoomId = (roomId, callback) => {
    const query = `
        SELECT r.support_id, u.user_id, u.fullname, u.email, u.phone_number
        FROM rooms r
        JOIN users u ON r.support_id = u.user_id
        WHERE r.room_id = ?
    `;
    db.query(query, [roomId], callback);
};

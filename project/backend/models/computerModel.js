const db = require('../config/db2');

exports.addComputer = async (computer_name, room_id) => {
    const [result] = await db.execute(
        'INSERT INTO computers (computer_name, room_id) VALUES (?, ?)',
        [computer_name, room_id]
    );
    return result.insertId;
};

exports.addDeviceToComputer = async (computerId, deviceId) => {
    await db.execute(
        'INSERT INTO computer_devices (computer_id, device_id, status) VALUES (?, ?, ?)',
        [computerId, deviceId, 'active']
    );
};

exports.addSoftwareToComputer = async (computerId, softwareId) => {
    await db.execute(
        'INSERT INTO computer_software (computer_id, software_id, status) VALUES (?, ?, ?)',
        [computerId, softwareId, 'active']
    );
};

exports.reduceDeviceQuantity = async (deviceId, quantity) => {
    await db.execute(
        'UPDATE devices SET quantity = quantity - ? WHERE device_id = ?',
        [quantity, deviceId]
    );
};

exports.getAllComputersByRoomId = async (roomId) => {
    const query = `
        SELECT c.computer_id, c.computer_name, 
               d.device_id, d.device_name, d.device_type, cd.status AS device_status, cd.computer_device_id,
               s.software_id, s.software_name, cs.status AS software_status, cs.computer_software_id
        FROM computers c
        LEFT JOIN computer_devices cd ON c.computer_id = cd.computer_id
        LEFT JOIN devices d ON cd.device_id = d.device_id
        LEFT JOIN computer_software cs ON c.computer_id = cs.computer_id
        LEFT JOIN software s ON cs.software_id = s.software_id
        WHERE c.room_id = ?;
    `;
    const [rows] = await db.execute(query, [roomId]);
    return rows;
};

exports.updateDeviceStatus = async (computer_device_id, status) => {
    await db.execute(
        'UPDATE computer_devices SET status = ? WHERE computer_device_id = ?',
        [status, computer_device_id]
    );
};

exports.updateSoftwareStatus = async (computer_software_id, status) => {
    await db.execute(
        'UPDATE computer_software SET status = ? WHERE computer_software_id = ?',
        [status, computer_software_id]
    );
};

exports.updateDeviceFromComputer = async (computer_device_id, new_device_id) => {
    const query = 'UPDATE computer_devices SET device_id = ? WHERE computer_device_id = ?';
    await db.execute(query, [new_device_id, computer_device_id]);
};

exports.updateComputer = async (computerId, computer_name, room_id) => {
    await db.execute(
        'UPDATE computers SET computer_name = ?, room_id = ? WHERE computer_id = ?',
        [computer_name, room_id, computerId]
    );
};

exports.deleteDeviceFromComputer = async (computer_device_id) => {
    await db.execute(
        'DELETE FROM computer_devices WHERE computer_device_id = ?',
        [computer_device_id]
    );
};

exports.deleteSoftwareFromComputer = async (computer_software_id) => {
    await db.execute(
        'DELETE FROM computer_software WHERE computer_software_id = ?',
        [computer_software_id]
    );
};


exports.deleteAllDeviceFromComputer = async (computerId) => {
    await db.execute(
        'DELETE FROM computer_devices WHERE computer_id = ?',
        [computerId]
    );
};

exports.deleteAllSoftwareFromComputer = async (computerId) => {
    await db.execute(
        'DELETE FROM computer_software WHERE computer_id = ?',
        [computerId]
    );
};

exports.deleteComputer = async (computerId) => {
    await db.execute(
        'DELETE FROM computers WHERE computer_id = ?',
        [computerId]
    );
};

exports.getDeviceByComputerDeviceId = async (computer_device_id) => {
    const query = 'SELECT device_id FROM computer_devices WHERE computer_device_id = ?';
    const [rows] = await db.execute(query, [computer_device_id]);
    return rows; 
};

exports.getDevicesByComputerId = async (computerId) => {
    
    const [rows] = await db.execute('SELECT * FROM computer_devices WHERE computer_id = ?', [computerId]); // Or use the correct column name if it's different
    return rows;
};

exports.getSoftwareByComputerId = async (computerId) => {
    const [rows] = await db.execute('SELECT * FROM computer_software WHERE computer_id = ?', [computerId]); // Or use the correct column name if it's different
    return rows;
};
exports.getComputerByComputerId = async (computerId) => {
    const query = `
        SELECT c.computer_id, c.computer_name, 
               d.device_id, d.device_name, d.device_type, cd.status AS device_status, cd.computer_device_id,
               s.software_id, s.software_name, cs.status AS software_status, cs.computer_software_id
        FROM computers c
        LEFT JOIN computer_devices cd ON c.computer_id = cd.computer_id
        LEFT JOIN devices d ON cd.device_id = d.device_id
        LEFT JOIN computer_software cs ON c.computer_id = cs.computer_id
        LEFT JOIN software s ON cs.software_id = s.software_id
        WHERE c.computer_id = ?;
    `;
    const [rows] = await db.execute(query, [computerId]);
    return rows;
};

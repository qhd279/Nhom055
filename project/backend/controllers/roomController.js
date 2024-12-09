const roomModel = require('../models/roomModel');


exports.getAllRooms = (req, res) => {
    roomModel.getAllRooms((err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        res.json(results);
    });
};


exports.getRoomById = (req, res) => {
    const { id } = req.params;
    roomModel.getRoomById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy phòng máy tính' });
        res.json(results[0]);
    });
};


exports.createRoom = (req, res) => {
    const room = req.body;
    roomModel.createRoom(room, (err, roomId) => {
        if (err) return res.status(500).json({ message: 'Lỗi tạo phòng máy tính' });
        
        console.log('Room created with ID:', roomId);

        res.json({ message: 'Tạo phòng máy tính thành công', roomId });
    });
};

exports.updateRoom = (req, res) => {
    const { id } = req.params;
    const room = req.body;
    roomModel.updateRoom(id, room, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật phòng máy tính' });
        res.json({ message: 'Cập nhật phòng máy tính thành công' });
    });
};


exports.deleteRoom = (req, res) => {
    const { id } = req.params;
    roomModel.deleteRoom(id, (err) => {
        if (err) {
            console.error('Error deleting room:', err); // Ghi lại lỗi vào console
            return res.status(500).json({ message: 'Lỗi xóa phòng máy tính' });
        }
        res.json({ message: 'Xóa phòng máy tính thành công' });
    });
};

exports.getComputerCountByRoomId = (req, res) => {
    const { id } = req.params;
    roomModel.getComputerCountByRoomId(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi khi lấy số lượng máy tính' });
        res.json({ count: results[0].count });
    });
};


exports.getSupportByRoomId = (req, res) => {
    const { id } = req.params; 
    roomModel.getSupportByRoomId(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy thông tin hỗ trợ cho phòng này' });
        res.json(results);
    });
};

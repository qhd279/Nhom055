const userModel = require('../models/userModel');

exports.getAllUsers = (req, res) => {
    userModel.getAllUsers((err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    userModel.getUserById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json(results[0]);
    });
};

exports.createUser = (req, res) => {
    const user = req.body;
    userModel.createUser(user, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi tạo người dùng' });
        res.json({ message: 'Tạo người dùng thành công' });
    });
};
/*
exports.createUser = (req, res) => {
    const { id, password, email, phone_number, fullname, role, status } = req.body;

    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 là số vòng băm

    // Gọi hàm để lưu người dùng vào cơ sở dữ liệu
    userModel.createUser({ id, password: hashedPassword, email, phone_number, fullname, role, status }, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi khi tạo người dùng' });
        }
        res.status(201).json({ message: 'Người dùng đã được tạo', userId: results.insertId });
    });
};
*/
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const user = req.body;
    userModel.updateUser(id, user, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
        res.json({ message: 'Cập nhật người dùng thành công' });
    });
};


exports.deleteUser = (req, res) => {
    const { id } = req.params;
    userModel.deleteUser(id, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa người dùng' });
        res.json({ message: 'Xóa người dùng thành công' });
    });
};

exports.getAllSupportUsers = (req, res) => {
    userModel.getSupportUsers((err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách người dùng support:', err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng nào có vai trò support' });
        }
        res.json(results);
    });
};
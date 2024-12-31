const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const userModel = require('../models/userModel');

const secret = process.env.JWT_SECRET;

// Đăng nhập
exports.login = (req, res) => {
    const { id, password } = req.body;
    userModel.getUserById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        const user = results[0];

        // So sánh mật khẩu trực tiếp (không nên làm điều này trong thực tế)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Sai mật khẩu' });
        }
        if (user.status !== 'active') {
            return res.status(401).json({ message: 'Tài khoản ngưng hoạt động' });
        }

        // Tạo token
        const token = jwt.sign({ id: user.id, role: user.role , fullname: user.fullname}, secret/*, { expiresIn: '7d' }*/);
        res.json({ token });
    });
};
/*exports.login = (req, res) => {
    const { id, password } = req.body;
    userModel.getUserById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Sai mật khẩu' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        res.json({ token });
    });
};*/




// Quên mật khẩu
exports.changePassword = (req, res) => {
    const { id, oldPassword, newPassword } = req.body;
    
    userModel.getUserById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        
        const user = results[0];
        if (oldPassword !== user.password) {
            return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
        }

        userModel.updateUser(id, { password: newPassword }, (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu' });
            res.json({ message: 'Đổi mật khẩu thành công' });
        });
    });
};

/*exports.changePassword = (req, res) => {
    const { id, oldPassword, newPassword } = req.body;
    userModel.getUserById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        const user = results[0];
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
        }
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        userModel.updateUser(id, { password: hashedNewPassword }, (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu' });
            res.json({ message: 'Đổi mật khẩu thành công' });
        });
    });
};*/

// Quên mật khẩu
exports.resetPassword = (req, res) => {
    const { email, newPassword } = req.body;

    // Lấy người dùng từ cơ sở dữ liệu theo email
    userModel.getUserByEmail(email, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Email không tồn tại' });
        }

        // Cập nhật mật khẩu mới mà không mã hóa
        userModel.updateUser(results[0].id, { password: newPassword }, (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu' });
            res.json({ message: 'Đặt lại mật khẩu thành công' });
        });
    });
};

/*exports.resetPassword = (req, res) => {
    const { email, newPassword } = req.body;
    userModel.getUserByEmail(email, (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Email không tồn tại' });
        }
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        userModel.updateUser(results[0].id, { password: hashedNewPassword }, (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu' });
            res.json({ message: 'Đặt lại mật khẩu thành công' });
        });
    });
};*/


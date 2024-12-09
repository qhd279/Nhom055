const deviceModel = require('../models/deviceModel');

exports.getAllDevices = (req, res) => {
    deviceModel.getAllDevices((err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        res.json(results);
    });
};


exports.getDeviceById = (req, res) => {
    const { id } = req.params;
    deviceModel.getDeviceById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
        res.json(results[0]);
    });
};


exports.createDevice = (req, res) => {
    const device = req.body;
    deviceModel.createDevice(device, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi tạo thiết bị' });
        res.json({ message: 'Tạo thiết bị thành công' });
    });
};


exports.updateDevice = (req, res) => {
    const { id } = req.params;
    const device = req.body;
    deviceModel.updateDevice(id, device, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật thiết bị' });
        res.json({ message: 'Cập nhật thiết bị thành công' });
    });
};


exports.deleteDevice = (req, res) => {
    const { id } = req.params;
    deviceModel.deleteDevice(id, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa thiết bị' });
        res.json({ message: 'Xóa thiết bị thành công' });
    });
};

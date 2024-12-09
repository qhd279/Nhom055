const softwareModel = require('../models/softwareModel');


exports.getAllSoftware = (req, res) => {
    softwareModel.getAllSoftware((err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi server' });
        res.json(results);
    });
};


exports.getSoftwareById = (req, res) => {
    const { id } = req.params;
    softwareModel.getSoftwareById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy phần mềm' });
        res.json(results[0]);
    });
};

exports.createSoftware = (req, res) => {
    const software = req.body;
    softwareModel.createSoftware(software, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi tạo phần mềm' });
        res.json({ message: 'Tạo phần mềm thành công' });
    });
};

exports.updateSoftware = (req, res) => {
    const { id } = req.params;
    const software = req.body;
    softwareModel.updateSoftware(id, software, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật phần mềm' });
        res.json({ message: 'Cập nhật phần mềm thành công' });
    });
};


exports.deleteSoftware = (req, res) => {
    const { id } = req.params;
    softwareModel.deleteSoftware(id, (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa phần mềm' });
        res.json({ message: 'Xóa phần mềm thành công' });
    });
};

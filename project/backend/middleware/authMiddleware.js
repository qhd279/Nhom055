const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

/*exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token không tồn tại' });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Token không hợp lệ' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });*/
    exports.verifyToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(403).json({ message: 'Token không tồn tại' });
    
        const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer"
    
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Token không hợp lệ' });
            req.userId = decoded.id;
            req.userRole = decoded.role;
            next();
        });

        
    };


    exports.checkRole = (roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.userRole)) {
                return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            }
            next();
        };
    };
    
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.verifyToken, deviceController.getAllDevices);
router.get('/:id', authMiddleware.verifyToken, deviceController.getDeviceById);
router.post('/', authMiddleware.verifyToken, deviceController.createDevice);
router.put('/:id', authMiddleware.verifyToken, deviceController.updateDevice);
router.delete('/:id', authMiddleware.verifyToken, deviceController.deleteDevice);

module.exports = router;

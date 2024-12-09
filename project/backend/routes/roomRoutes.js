const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Định tuyến
router.get('/', authMiddleware.verifyToken, roomController.getAllRooms);
router.get('/:id', authMiddleware.verifyToken, roomController.getRoomById);
router.post('/', authMiddleware.verifyToken, roomController.createRoom);
router.put('/:id', authMiddleware.verifyToken, roomController.updateRoom);
router.delete('/:id', authMiddleware.verifyToken, roomController.deleteRoom);
router.get('/:id/computer-count', authMiddleware.verifyToken, roomController.getComputerCountByRoomId);
router.get('/:id/support', authMiddleware.verifyToken, roomController.getSupportByRoomId);

module.exports = router;

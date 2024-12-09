const express = require('express');
const router = express.Router();
const computerController = require('../controllers/computerController');

router.post('/add-computer', computerController.addComputer);

router.post('/add-multiple', computerController.addMultipleComputers);

router.get('/room/:roomId/computers', computerController.getAllComputersByRoomId);

router.put('/update-status', computerController.updateDeviceAndSoftwareStatus);

router.put('/update-devices', computerController.updateDevicesInComputer);

router.delete('/:computerId', computerController.deleteComputer);

router.put('/:computerId', computerController.updateComputer);

router.get('/:computerId', computerController.getComputerByComputerId);


module.exports = router;

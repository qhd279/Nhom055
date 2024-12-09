const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/softwareController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.verifyToken, softwareController.getAllSoftware);
router.get('/:id', authMiddleware.verifyToken, softwareController.getSoftwareById);
router.post('/', authMiddleware.verifyToken, softwareController.createSoftware);
router.put('/:id', authMiddleware.verifyToken, softwareController.updateSoftware);
router.delete('/:id', authMiddleware.verifyToken, softwareController.deleteSoftware);

module.exports = router;

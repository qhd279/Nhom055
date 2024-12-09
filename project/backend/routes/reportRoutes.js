const express = require('express');
const { createReport, getAllReports, updateReport, getProcessingReportsBySupportId, getResolveReportsBySupportId } = require('../controllers/reportController');

const router = express.Router();

router.post('/', createReport);

router.get('/', getAllReports);

router.put('/:id', updateReport); 

router.get('/processing/:supportId', getProcessingReportsBySupportId);

router.get('/resolve/:supportId', getResolveReportsBySupportId);

module.exports = router;

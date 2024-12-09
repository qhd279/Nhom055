const ReportModel = require('../models/reportModel');
const computerModel = require('../models/computerModel'); 
const computerController = require('../controllers/computerController');
exports.createReport = async (req, res) => {
    try {
        const { computer_id, devices = [], software = [], expected_completion_date, reporter_id, submission_date } = req.body;

        const reportId = await ReportModel.createReport({
            computer_id,
            expected_completion_date,
            reporter_id,
            submission_date
        });

        if (devices.length === 0 && software.length === 0) {
            const computerDevices = await computerModel.getDevicesByComputerId(computer_id);
            const deviceUpdates = computerDevices.map(device => ({
                computer_device_id: device.computer_device_id,
                status: 'unknown'  
            }));

            for (const device of deviceUpdates) {
                const { computer_device_id, status } = device;
                await computerModel.updateDeviceStatus(computer_device_id, status);
            }

            
            const computerSoftware = await computerModel.getSoftwareByComputerId(computer_id);
           /* const softwareUpdates = computerSoftware.map(soft => ({
                computer_software_id: soft.computer_software_id,
                status: 'unknown'  // Set status to unknown for each software
            }));*/
            
            for (const soft of softwareUpdates) {
                const { computer_software_id, status } = soft;
                await computerModel.updateSoftwareStatus(computer_software_id, status);
            }
    

        }

        await Promise.all(devices.map(device => ReportModel.insertDevice(reportId, device)));

        await Promise.all(software.map(soft => ReportModel.insertSoftware(reportId, soft)));

        res.status(201).json({ success: true, message: 'Report submitted successfully', reportId });
    } catch (error) {
        console.error('Error submitting report:', error.message || error);
        res.status(500).json({ success: false, message: 'Error submitting report', error: error.message || 'Internal Server Error' });
    }
};



exports.getAllReports = async (req, res) => {
    try {
        const reports = await ReportModel.getAllReports();
        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error('Error fetching reports:', error.message || error);
        res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message || 'Internal Server Error' });
    }
};

exports.updateReport = async (req, res) => {
    const reportId = req.params.id;
    const reportData = req.body;

    console.log(`Updating report ID: ${reportId} with data:`, reportData); // Add this line

    try {
        const updated = await ReportModel.updateReport(reportId, reportData);
        if (updated) {
            res.status(200).json({ success: true, message: 'Report updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Report not found' });
        }
    } catch (error) {
        console.error('Error updating report:', error.message || error);
        res.status(500).json({ success: false, message: 'Error updating report', error: error.message || 'Internal Server Error' });
    }
};

exports.getProcessingReportsBySupportId = async (req, res) => {
    const supportId = req.params.supportId; // Extract support ID from URL parameters

    try {
        const reports = await ReportModel.getProcessingReportsBySupportId(supportId);
        res.status(200).json({ success: true, reports }); // Respond with the reports
    } catch (error) {
        console.error('Error fetching processing reports:', error.message || error);
        res.status(500).json({ success: false, message: 'Error fetching processing reports', error: error.message || 'Internal Server Error' });
    }
};
exports.getResolveReportsBySupportId = async (req, res) => {
    const supportId = req.params.supportId; // Extract support ID from URL parameters

    try {
        const reports = await ReportModel.getResolveReportsBySupportId(supportId);
        res.status(200).json({ success: true, reports }); // Respond with the reports
    } catch (error) {
        console.error('Error fetching processing reports:', error.message || error);
        res.status(500).json({ success: false, message: 'Error fetching processing reports', error: error.message || 'Internal Server Error' });
    }
};
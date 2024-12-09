const db = require('../config/db');


exports.createReport = (reportData) => {
    return new Promise((resolve, reject) => {
        const { computer_id, expected_completion_date, reporter_id, submission_date, assigned_date, report_type = 'report' } = reportData;

        const reportQuery = 'INSERT INTO reports (computer_id, expected_completion_date, reporter_id, submission_date, assigned_date, report_type) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(reportQuery, [computer_id, expected_completion_date, reporter_id, submission_date, assigned_date || null, report_type], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.insertId);
        });
    });
};


exports.insertDevice = (reportId, device) => {
    return new Promise((resolve, reject) => {
        const deviceQuery = 'INSERT INTO report_items_device (report_id, computer_device_id, reason) VALUES (?, ?, ?)';
        db.query(deviceQuery, [reportId, device.computer_device_id, device.reason], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

exports.insertSoftware = (reportId, software) => {
    return new Promise((resolve, reject) => {
        const softwareQuery = 'INSERT INTO report_items_software (report_id, computer_software_id, reason) VALUES (?, ?, ?)';
        db.query(softwareQuery, [reportId, software.computer_software_id, software.reason], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

exports.getAllReports = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                r.report_id, 
                r.computer_id, 
                r.reporter_id, 
                r.expected_completion_date, 
                r.support_id, 
                r.submission_date, 
                r.completion_date, 
                r.status,
                r.late_reason,
                r.assigned_date, 
                r.report_type,  -- Thêm cột report_type vào truy vấn
                c.computer_name, 
                ro.room_name, 
                ro.support_id AS room_support_id,
                d.computer_device_id, 
                d.reason AS device_reason,
                s.computer_software_id, 
                s.reason AS software_reason,
                u.fullname AS support_name  
            FROM 
                reports r
            LEFT JOIN 
                computers c ON r.computer_id = c.computer_id
            LEFT JOIN 
                rooms ro ON c.room_id = ro.room_id
            LEFT JOIN 
                report_items_device d ON r.report_id = d.report_id
            LEFT JOIN 
                report_items_software s ON r.report_id = s.report_id
            LEFT JOIN 
                users u ON r.support_id = u.id  
        `;
        
        db.query(query, async (error, results) => {
            if (error) return reject(error);

            const formattedReports = results.reduce((acc, row) => {
                let report = acc.find(r => r.report_id === row.report_id);
                if (!report) {
                    report = {
                        report_id: row.report_id,
                        computer_id: row.computer_id,
                        reporter_id: row.reporter_id,
                        expected_completion_date: row.expected_completion_date,
                        support_id: row.support_id,
                        submission_date: row.submission_date,
                        completion_date: row.completion_date,
                        status: row.status,
                        late_reason: row.late_reason,
                        assigned_date: row.assigned_date,
                        report_type: row.report_type,  
                        computer_name: row.computer_name,
                        room_name: row.room_name,
                        room_support_id: row.room_support_id,
                        support_name: row.support_name,
                        device_items: [],
                        software_items: []
                    };
                    acc.push(report);
                }

                if (row.computer_device_id) {
                    report.device_items.push({
                        computer_device_id: row.computer_device_id,
                        reason: row.device_reason
                    });
                }

                if (row.computer_software_id) {
                    report.software_items.push({
                        computer_software_id: row.computer_software_id,
                        reason: row.software_reason
                    });
                }

                return acc;
            }, []); 

            formattedReports.forEach(report => {
                const uniqueDevices = [];
                const deviceMap = new Map();
                report.device_items.forEach(item => {
                    if (!deviceMap.has(item.computer_device_id)) {
                        deviceMap.set(item.computer_device_id, item);
                        uniqueDevices.push(item);
                    }
                });
                report.device_items = uniqueDevices;
            });

            formattedReports.forEach(report => {
                const uniqueSoftware = [];
                const softwareMap = new Map();
                report.software_items.forEach(item => {
                    if (!softwareMap.has(item.computer_software_id)) {
                        softwareMap.set(item.computer_software_id, item);
                        uniqueSoftware.push(item);
                    }
                });
                report.software_items = uniqueSoftware;
            });

            await Promise.all(formattedReports.map(async report => {
                await Promise.all(report.software_items.map(async item => {
                    if (item.computer_software_id) {
                        const softwareQuery = `
                            SELECT cs.software_id, s.software_name
                            FROM computer_software cs
                            LEFT JOIN software s ON cs.software_id = s.software_id
                            WHERE cs.computer_software_id = ?
                        `;
                        const [softwareResult] = await db.promise().query(softwareQuery, [item.computer_software_id]);
                        if (softwareResult && softwareResult.length > 0) {
                            item.software_id = softwareResult[0].software_id;
                            item.software_name = softwareResult[0].software_name;
                        }
                    }
                }));

                await Promise.all(report.device_items.map(async item => {
                    if (item.computer_device_id) {
                        const deviceQuery = `
                            SELECT cd.device_id, d.device_name
                            FROM computer_devices cd
                            LEFT JOIN devices d ON cd.device_id = d.device_id
                            WHERE cd.computer_device_id = ?
                        `;
                        const [deviceResult] = await db.promise().query(deviceQuery, [item.computer_device_id]);
                        if (deviceResult && deviceResult.length > 0) {
                            item.device_id = deviceResult[0].device_id;
                            item.device_name = deviceResult[0].device_name;
                        }
                    }
                }));
            }));

            resolve(formattedReports);
        });
    });
};

exports.updateReport = (reportId, reportData) => {
    return new Promise((resolve, reject) => {
        const { expected_completion_date, support_id, status, completion_date, late_reason, assigned_date, report_type } = reportData;

        const updates = [];
        const values = [];

        if (expected_completion_date) {
            updates.push('expected_completion_date = ?');
            values.push(expected_completion_date);
        }
        if (support_id) {
            updates.push('support_id = ?');
            values.push(support_id);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (completion_date) {
            updates.push('completion_date = ?');
            values.push(completion_date);
        }
        if (late_reason) {
            updates.push('late_reason = ?');
            values.push(late_reason);
        }
        if (assigned_date) {
            updates.push('assigned_date = ?');
            values.push(assigned_date);
        }
        if (report_type) {  
            updates.push('report_type = ?');
            values.push(report_type);
        }

        if (updates.length === 0) {
            return resolve(false); 
        }

        const updateQuery = `
            UPDATE reports 
            SET ${updates.join(', ')} 
            WHERE report_id = ?
        `;
        values.push(reportId); 

        db.query(updateQuery, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.affectedRows > 0);  
        });
    });
};


exports.getProcessingReportsBySupportId = async (supportId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT r.report_id, r.computer_id, r.reporter_id, r.expected_completion_date, 
                   r.support_id, r.submission_date, r.completion_date, r.status,
                   r.late_reason, r.assigned_date, r.report_type,  -- Thêm trường report_type
                   c.computer_name, ro.room_name, ro.support_id AS room_support_id,
                   d.computer_device_id, d.reason AS device_reason,
                   s.computer_software_id, s.reason AS software_reason
            FROM reports r
            LEFT JOIN computers c ON r.computer_id = c.computer_id
            LEFT JOIN rooms ro ON c.room_id = ro.room_id
            LEFT JOIN report_items_device d ON r.report_id = d.report_id
            LEFT JOIN report_items_software s ON r.report_id = s.report_id
            WHERE r.status = 'processing' AND r.support_id = ?  -- Filter by support_id
        `;

        db.query(query, [supportId], async (error, results) => {
            if (error) return reject(error);

            const formattedReports = results.reduce((acc, row) => {
                let report = acc.find(r => r.report_id === row.report_id);
                if (!report) {
                    report = {
                        report_id: row.report_id,
                        computer_id: row.computer_id,
                        reporter_id: row.reporter_id,
                        expected_completion_date: row.expected_completion_date,
                        support_id: row.support_id,
                        submission_date: row.submission_date,
                        completion_date: row.completion_date,
                        status: row.status,
                        late_reason: row.late_reason,
                        assigned_date: row.assigned_date,
                        report_type: row.report_type,  
                        computer_name: row.computer_name,
                        room_name: row.room_name,
                        room_support_id: row.room_support_id,
                        device_items: [],
                        software_items: []
                    };
                    acc.push(report);
                }

                if (row.computer_device_id) {
                    report.device_items.push({
                        computer_device_id: row.computer_device_id,
                        reason: row.device_reason
                    });
                }

                if (row.computer_software_id) {
                    report.software_items.push({
                        computer_software_id: row.computer_software_id,
                        reason: row.software_reason
                    });
                }

                return acc;
            }, []);

            await Promise.all(formattedReports.map(async report => {
                await Promise.all(report.software_items.map(async item => {
                    if (item.computer_software_id) {
                        const softwareQuery = `
                            SELECT cs.software_id, s.software_name
                            FROM computer_software cs
                            LEFT JOIN software s ON cs.software_id = s.software_id
                            WHERE cs.computer_software_id = ?
                        `;
                        const [softwareResult] = await db.promise().query(softwareQuery, [item.computer_software_id]);
                        if (softwareResult && softwareResult.length > 0) {
                            item.software_id = softwareResult[0].software_id;
                            item.software_name = softwareResult[0].software_name;
                        }
                    }
                }));

                await Promise.all(report.device_items.map(async item => {
                    if (item.computer_device_id) {
                        const deviceQuery = `
                            SELECT cd.device_id, d.device_name, d.device_type
                            FROM computer_devices cd
                            LEFT JOIN devices d ON cd.device_id = d.device_id
                            WHERE cd.computer_device_id = ?
                        `;
                        const [deviceResult] = await db.promise().query(deviceQuery, [item.computer_device_id]);
                        if (deviceResult && deviceResult.length > 0) {
                            item.device_id = deviceResult[0].device_id;
                            item.device_name = deviceResult[0].device_name;
                            item.device_type = deviceResult[0].device_type;
                        }
                    }
                }));
            }));

            resolve(formattedReports);
        });
    });
};


exports.getResolveReportsBySupportId = (supportId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT r.report_id, r.computer_id, r.reporter_id, r.expected_completion_date, 
                   r.support_id, r.submission_date, r.completion_date, r.status,
                   r.late_reason, r.assigned_date, r.report_type,  -- Thêm trường report_type
                   c.computer_name, ro.room_name, ro.support_id AS room_support_id,
                   d.computer_device_id, d.reason AS device_reason,
                   s.computer_software_id, s.reason AS software_reason
            FROM reports r
            LEFT JOIN computers c ON r.computer_id = c.computer_id
            LEFT JOIN rooms ro ON c.room_id = ro.room_id
            LEFT JOIN report_items_device d ON r.report_id = d.report_id
            LEFT JOIN report_items_software s ON r.report_id = s.report_id
            WHERE r.status IN ('resolved', 'resolved_late') AND r.support_id = ?;  -- Filter by support_id
        `;

        db.query(query, [supportId], async (error, results) => {
            if (error) return reject(error);

            const formattedReports = results.reduce((acc, row) => {
                let report = acc.find(r => r.report_id === row.report_id);
                if (!report) {
                    report = {
                        report_id: row.report_id,
                        computer_id: row.computer_id,
                        reporter_id: row.reporter_id,
                        expected_completion_date: row.expected_completion_date,
                        support_id: row.support_id,
                        submission_date: row.submission_date,
                        completion_date: row.completion_date,
                        status: row.status,
                        late_reason: row.late_reason,
                        assigned_date: row.assigned_date,
                        report_type: row.report_type,  
                        computer_name: row.computer_name,
                        room_name: row.room_name,
                        room_support_id: row.room_support_id,
                        device_items: [],
                        software_items: []
                    };
                    acc.push(report);
                }

                if (row.computer_device_id) {
                    report.device_items.push({
                        computer_device_id: row.computer_device_id,
                        reason: row.device_reason
                    });
                }

                if (row.computer_software_id) {
                    report.software_items.push({
                        computer_software_id: row.computer_software_id,
                        reason: row.software_reason
                    });
                }

                return acc;
            }, []);

           
            await Promise.all(formattedReports.map(async report => {
                await Promise.all(report.software_items.map(async item => {
                    if (item.computer_software_id) {
                        const softwareQuery = `
                            SELECT cs.software_id, s.software_name
                            FROM computer_software cs
                            LEFT JOIN software s ON cs.software_id = s.software_id
                            WHERE cs.computer_software_id = ?
                        `;
                        const [softwareResult] = await db.promise().query(softwareQuery, [item.computer_software_id]);
                        if (softwareResult && softwareResult.length > 0) {
                            item.software_id = softwareResult[0].software_id;
                            item.software_name = softwareResult[0].software_name;
                        }
                    }
                }));

               
                await Promise.all(report.device_items.map(async item => {
                    if (item.computer_device_id) {
                        const deviceQuery = `
                            SELECT cd.device_id, d.device_name, d.device_type
                            FROM computer_devices cd
                            LEFT JOIN devices d ON cd.device_id = d.device_id
                            WHERE cd.computer_device_id = ?
                        `;
                        const [deviceResult] = await db.promise().query(deviceQuery, [item.computer_device_id]);
                        if (deviceResult && deviceResult.length > 0) {
                            item.device_id = deviceResult[0].device_id;
                            item.device_name = deviceResult[0].device_name;
                            item.device_type = deviceResult[0].device_type;
                        }
                    }
                }));
            }));

            resolve(formattedReports);
        });
    });
};

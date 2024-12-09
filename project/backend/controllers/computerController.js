const computerModel = require('../models/computerModel');

// Hàm thêm một máy tính
exports.addComputer = async (req, res) => {
    const { computer_name, room_id, devices, softwares } = req.body;

    try {
        const computerId = await computerModel.addComputer(computer_name, room_id);

        for (const device of devices) {
            const { device_id, quantity } = device;
            await computerModel.reduceDeviceQuantity(device_id, quantity);
            await computerModel.addDeviceToComputer(computerId, device_id);
        }

        for (const software of softwares) {
            const { software_id } = software;
            await computerModel.addSoftwareToComputer(computerId, software_id);
        }

        res.status(201).json({
            message: 'Máy tính đã được thêm thành công!',
            computer_id: computerId
        });
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        res.status(500).json({ message: 'Có lỗi xảy ra!', error: error.message });
    }
};


// Hàm thêm nhiều máy tính

exports.addMultipleComputers = async (req, res) => {
    const { room_id, devices, softwares, quantity } = req.body;

    try {
        const computerIds = [];

        const existingComputers = await computerModel.getAllComputersByRoomId(room_id);

        const existingNames = existingComputers.map(computer => computer.computer_name);


        let i = 1;
        while (computerIds.length < quantity) {
            let formattedName = `M${String(i).padStart(2, '0')}`;

            if (!existingNames.includes(formattedName)) {

                const computerId = await computerModel.addComputer(formattedName, room_id);
                computerIds.push(computerId);
                existingNames.push(formattedName);
            } else {
                console.log(`Tên máy tính ${formattedName} đã tồn tại, bỏ qua`);
            }

            i++;
        }

        console.log('Danh sách ID máy tính đã tạo:', computerIds);


        for (const device of devices) {
            const { device_id, quantity: deviceQuantity } = device;

            for (const computerId of computerIds) {
                for (let j = 0; j < deviceQuantity; j++) {
                    await computerModel.addDeviceToComputer(computerId, device_id);
                    await computerModel.reduceDeviceQuantity(device_id, 1);
                }
            }
        }


        for (const software of softwares) {
            const { software_id } = software;
            for (const computerId of computerIds) {
                await computerModel.addSoftwareToComputer(computerId, software_id);
            }
        }

        res.status(201).json({
            message: 'Nhiều máy tính đã được thêm thành công!',
            computer_ids: computerIds
        });
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        res.status(500).json({ message: 'Có lỗi xảy ra!', error: error.message });
    }
};

exports.getAllComputersByRoomId = async (req, res) => {
    const { roomId } = req.params;
    try {
        const computers = await computerModel.getAllComputersByRoomId(roomId);

        if (computers.length === 0) {
            return res.status(404).json({ message: 'No computers found in this room' });
        }

        const computersWithStatus = computers.reduce((acc, row) => {
            const computerId = row.computer_id;


            if (!acc[computerId]) {
                acc[computerId] = {
                    computer_id: row.computer_id,
                    computer_name: row.computer_name,
                    devices: [],
                    software: [],
                    status: 'active'
                };
            }


            if (row.device_id) {
                if (!acc[computerId].devices.some(device => device.device_id === row.device_id)) {
                    acc[computerId].devices.push({
                        device_id: row.device_id,
                        device_name: row.device_name,
                        device_type: row.device_type,
                        status: row.device_status,
                        computer_device_id: row.computer_device_id
                    });
                }


                if (row.device_status === 'installing') {
                    acc[computerId].status = 'installing';
                } else if (row.device_status !== 'active') {
                    acc[computerId].status = 'issue';
                }
            }

            if (row.software_id) {
                if (!acc[computerId].software.some(software => software.software_id === row.software_id)) {
                    acc[computerId].software.push({
                        software_id: row.software_id,
                        software_name: row.software_name,
                        status: row.software_status,
                        computer_software_id: row.computer_software_id // Include computer_software_id
                    });
                }

                // Update computer status based on software status
                if (row.software_status === 'installing') {
                    acc[computerId].status = 'installing';
                } else if (row.software_status !== 'active') {
                    acc[computerId].status = 'issue';
                }
            }

            return acc;
        }, {});

        const result = Object.values(computersWithStatus);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching computers:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra', details: error.message });
    }
};
exports.updateDeviceAndSoftwareStatus = async (req, res) => {
    const { computer_id, devices, software } = req.body;

    try {

        for (const device of devices) {
            const { computer_device_id, status } = device;
            await computerModel.updateDeviceStatus(computer_device_id, status);
        }


        for (const soft of software) {
            const { computer_software_id, status } = soft;
            await computerModel.updateSoftwareStatus(computer_software_id, status);
        }

        res.status(200).json({
            message: 'Trạng thái thiết bị và phần mềm đã được cập nhật thành công!'
        });
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        res.status(500).json({ message: 'Có lỗi xảy ra!', error: error.message });
    }
};
exports.updateDevicesInComputer = async (req, res) => {
    const { updates } = req.body;

    try {
        for (const update of updates) {
            const { computer_device_id, new_device_id, quantity_change } = update;


            await computerModel.updateDeviceFromComputer(computer_device_id, new_device_id);


            await computerModel.reduceDeviceQuantity(new_device_id, quantity_change);

        }

        res.status(200).json({ message: 'Devices updated successfully' });
    } catch (error) {
        console.error('Error updating devices:', error);
        res.status(500).json({ message: 'An error occurred while updating the devices', error: error.message });
    }
};
exports.deleteComputer = async (req, res) => {
    const { computerId } = req.params;

    try {

        await computerModel.deleteAllDeviceFromComputer(computerId);


        await computerModel.deleteAllSoftwareFromComputer(computerId);


        await computerModel.deleteComputer(computerId);

        res.status(200).json({
            message: 'Máy tính và các thiết bị, phần mềm liên quan đã được xóa thành công!'
        });
    } catch (error) {
        console.error("Lỗi chi tiết:", error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi xóa máy tính!',
            error: error.message
        });
    }
};

exports.updateComputer = async (req, res) => {
    const { computerId } = req.params;
    const { computer_name, room_id, devices, softwares } = req.body;
    try {

        await computerModel.updateComputer(computerId, computer_name, room_id);


        if (devices) {

            if (devices.delete) {
                for (const device of devices.delete) {
                    await computerModel.deleteDeviceFromComputer(device.computer_device_id);
                    console.log(`Đã xóa thiết bị có ID ${device.computer_device_id} khỏi máy tính ${computerId}`);
                }
            }


            if (devices.add) {
                for (const device of devices.add) {
                    const { device_id, quantity } = device;
                    await computerModel.addDeviceToComputer(computerId, device_id);
                    await computerModel.reduceDeviceQuantity(device_id, quantity);
                    console.log(`Đã thêm thiết bị có ID ${device_id} vào máy tính ${computerId}`);
                }
            }

            if (devices.update) {
                for (const device of devices.update) {
                    const { computer_device_id, new_device_id } = device;

                    const [existingDevice] = await computerModel.getDeviceByComputerDeviceId(computer_device_id);

                    if (existingDevice) {
                        if (existingDevice.device_id !== new_device_id) {
                            await computerModel.updateDeviceFromComputer(computer_device_id, new_device_id);
                            await computerModel.reduceDeviceQuantity(new_device_id, 1);

                            console.log(`Đã thay thế thiết bị có ID ${computer_device_id} bằng thiết bị ${new_device_id}`);
                        } else {
                            console.log(`Thiết bị ${computer_device_id} đã có device_id giống với new_device_id, không cần thay đổi.`);
                        }
                    } else {
                        console.log(`Thiết bị với computer_device_id ${computer_device_id} không tồn tại.`);
                    }
                }
            }

        }

        if (softwares) {
            if (softwares.delete) {
                for (const software of softwares.delete) {
                    await computerModel.deleteSoftwareFromComputer(software.computer_software_id);
                    console.log(`Đã xóa phần mềm có ID ${software.computer_software_id} khỏi máy tính ${computerId}`);
                }
            }

            if (softwares.add) {
                for (const software of softwares.add) {
                    const { software_id } = software;
                    await computerModel.addSoftwareToComputer(computerId, software_id);
                    console.log(`Đã thêm phần mềm có ID ${software_id} vào máy tính ${computerId}`);
                }
            }

            /*   
                if (softwares.update) {
                    for (const software of softwares.update) {
                        const { computer_software_id, new_software_id } = software;
                        await computerModel.updateSoftwareFromComputer(computer_software_id, new_software_id);
                        console.log(`Đã thay thế phần mềm có ID ${computer_software_id} bằng phần mềm ${new_software_id}`);
                    }
                }
    
                if (softwares.updateStatus) {
                    for (const software of softwares.updateStatus) {
                        const { computer_software_id, status } = software;
                        await computerModel.updateSoftwareStatus(computer_software_id, status);
                        console.log(`Đã cập nhật trạng thái phần mềm ${computer_software_id} thành ${status}`);
                    }
                }*/
        }

        res.status(200).json({
            message: 'Thông tin máy tính, thiết bị và phần mềm đã được cập nhật thành công!',
        });
    } catch (error) {
        console.error('Lỗi chi tiết:', error);
        res.status(500).json({
            message: 'Có lỗi xảy ra khi cập nhật máy tính!',
            error: error.message
        });
    }
};
exports.getComputerByComputerId = async (req, res) => {
    const { computerId } = req.params;
    try {
        const computers = await computerModel.getComputerByComputerId(computerId);

        if (computers.length === 0) {
            return res.status(404).json({ message: 'No computer found with this ID' });
        }

        const computerWithStatus = computers.reduce((acc, row) => {
            const computerId = row.computer_id;

           
            if (!acc[computerId]) {
                acc[computerId] = {
                    computer_id: row.computer_id,
                    computer_name: row.computer_name,
                    devices: [],
                    software: [],
                    status: 'active' 
                };
            }

            
            if (row.device_id) {
                if (!acc[computerId].devices.some(device => device.device_id === row.device_id)) {
                    acc[computerId].devices.push({
                        device_id: row.device_id,
                        device_name: row.device_name,
                        device_type: row.device_type,
                        status: row.device_status,
                        computer_device_id: row.computer_device_id 
                    });
                }

                
                if (row.device_status === 'installing') {
                    acc[computerId].status = 'installing';
                } else if (row.device_status !== 'active') {
                    acc[computerId].status = 'issue';
                }
            }

            if (row.software_id) {
                if (!acc[computerId].software.some(software => software.software_id === row.software_id)) {
                    acc[computerId].software.push({
                        software_id: row.software_id,
                        software_name: row.software_name,
                        status: row.software_status,
                        computer_software_id: row.computer_software_id
                    });
                }

                if (row.software_status === 'installing') {
                    acc[computerId].status = 'installing';
                } else if (row.software_status !== 'active') {
                    acc[computerId].status = 'issue';
                }
            }

            return acc;
        }, {});

        const result = Object.values(computerWithStatus);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching computer:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra', details: error.message });
    }
};

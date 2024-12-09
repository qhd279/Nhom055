import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Typography, Form, Input as AntInput, Select, Button, InputNumber, message, Spin, Checkbox } from 'antd';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;

const AddRoomComputer = forwardRef((props, ref) => {
    const [form] = Form.useForm();
    const [roomName, setRoomName] = useState('');
    const [devices, setDevices] = useState([]);
    const [software, setSoftware] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState({});
    const [selectedSoftware, setSelectedSoftware] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [loadingSoftware, setLoadingSoftware] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const [deviceQuantities, setDeviceQuantities] = useState({});
    const [supportPersons, setSupportPersons] = useState([]);
    const [errorMessages, setErrorMessages] = useState({});

    const { onCloseModal } = props;

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            form.submit();
        },
        resetForm: async () => {
            form.resetFields();
            setRoomName('');
            setSelectedDevices({});
            setSelectedSoftware([]);
            setQuantity(0);
            setErrorMessages({});
            await fetchDevices(); 
        }
    }));

    const fetchDevices = async () => {
        setLoadingDevices(true);
        try {
            const response = await axios.get('http://localhost:5000/api/devices', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setDevices(response.data);
            const quantities = {};
            response.data.forEach(device => {
                quantities[device.device_id] = device.quantity;
            });
            setDeviceQuantities(quantities);
        } catch (error) {
            toast.error('Lỗi khi lấy danh sách thiết bị');
        } finally {
            setLoadingDevices(false);
        }
    };

    const fetchSoftware = async () => {
        setLoadingSoftware(true);
        try {
            const response = await axios.get('http://localhost:5000/api/software', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSoftware(response.data);
        } catch (error) {
            toast.error('Lỗi khi lấy danh sách phần mềm');
        } finally {
            setLoadingSoftware(false);
        }
    };

    useEffect(() => {
        fetchDevices();
        fetchSoftware();
    }, []);

    useEffect(() => {
        const fetchSupportPersons = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/users/support', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch support persons');
                const data = await response.json();
                setSupportPersons(data);
            } catch (error) {
                console.error('Error fetching support persons:', error);
            }
        };

        fetchSupportPersons();
    }, []);

    const handleDeviceChange = (deviceId, value) => {
        const updatedSelectedDevices = { ...selectedDevices };
        const updatedErrorMessages = { ...errorMessages };
        const maxQuantity = deviceQuantities[deviceId] || 0;

        
        if (value > 0) {
            const totalRequiredQuantity = value * quantity;

            
            if (totalRequiredQuantity > maxQuantity) {
                updatedErrorMessages[deviceId] = `Tổng số lượng thiết bị cho ${quantity} máy tính không được vượt quá ${maxQuantity}.`;
                updatedSelectedDevices[deviceId] = value; 
            } else {
                updatedErrorMessages[deviceId] = null;
                updatedSelectedDevices[deviceId] = value; 
            }
        } else {
            
            delete updatedSelectedDevices[deviceId];
        }

        setSelectedDevices(updatedSelectedDevices);
        setErrorMessages(updatedErrorMessages);
    };


    const handleSoftwareChange = (checkedValues) => {
        setSelectedSoftware(checkedValues);
    };

    const handleQuantityChange = (e) => {
        const newQuantity = Number(e.target.value);
        setQuantity(newQuantity);
        setSelectedDevices({});
        setSelectedSoftware([]);
        setErrorMessages({}); 
    };

    const handleSubmit = async (values) => {
        const { user_id } = values;

        
        if (!roomName || quantity <= 0) {
            toast.error('Vui lòng nhập tên phòng và số lượng máy tính lớn hơn 0');
            return;
        }

        if (Object.keys(selectedDevices).length === 0) {
            toast.error('Vui lòng chọn ít nhất một thiết bị.');
            return;
        }

        
        const insufficientDevices = Object.keys(selectedDevices).some(deviceId => {
            return deviceQuantities[deviceId] < selectedDevices[deviceId] * quantity;
        });

        if (insufficientDevices) {
            toast.error('Không đủ thiết bị để tạo máy tính. Vui lòng kiểm tra lại.');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            
            const roomResponse = await fetch('http://localhost:5000/api/rooms/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room_name: roomName, support_id: user_id }),
            });

            if (!roomResponse.ok) throw new Error('Failed to add room');
            const data = await roomResponse.json();
            const roomId = data.roomId;

           
            const devicesData = Object.entries(selectedDevices).map(([id, qty]) => ({
                device_id: id,
                quantity: qty, 
            }));

            const softwaresData = selectedSoftware.map(id => ({ software_id: id }));

           
            const computerResponse = await axios.post('http://localhost:5000/api/computers/add-multiple', {
                room_id: roomId,
                devices: devicesData,
                softwares: softwaresData,
                quantity: quantity,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Thêm thành công");

            // Cập nhật số lượng thiết bị trong kho
            /*     const updateDevicePromises = Object.entries(selectedDevices).map(async ([deviceId, qty]) => {
                     const updatedQuantity = deviceQuantities[deviceId] - (qty * quantity);
                     await axios.patch(`http://localhost:5000/api/devices/${deviceId}`, {
                         quantity: updatedQuantity,
                     }, {
                         headers: {
                             Authorization: `Bearer ${token}`,
                         },
                     });
                 });
         
                 await Promise.all(updateDevicePromises);*/

            
            form.resetFields();
            setRoomName('');
            setSelectedDevices({});
            setSelectedSoftware([]);
            setQuantity(0);

           
            if (onCloseModal) onCloseModal();
        } catch (error) {
            toast.error('Lỗi');
            console.error('Error:', error);
        }
    };



    const groupedDevices = devices.reduce((acc, device) => {
        const { device_type } = device;
        if (!acc[device_type]) {
            acc[device_type] = [];
        }
        acc[device_type].push(device);
        return acc;
    }, {});

    const isDeviceSelectable = () => quantity > 0; 

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Tên Phòng"
                    name="room_name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
                >
                    <AntInput
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Người Hỗ Trợ"
                    name="user_id"
                    rules={[{ required: true, message: 'Vui lòng chọn người hỗ trợ!' }]}
                >
                    <Select placeholder="Chọn người hỗ trợ">
                        {supportPersons.map((person) => (
                            <Option key={person.id} value={person.id}>
                                {person.fullname}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Số lượng máy tính" required>
                    <AntInput
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={handleQuantityChange}
                        placeholder="Nhập số lượng máy tính"
                    />
                </Form.Item>

                <Form.Item label="Chọn thiết bị" required>
                    {loadingDevices ? (
                        <Spin />
                    ) : (
                        Object.entries(groupedDevices).map(([deviceType, deviceList]) => (
                            <div key={deviceType}>
                                <Typography.Title level={5}>{deviceType}</Typography.Title>
                                {deviceList.map(device => (
                                    <div key={device.device_id} style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                onChange={(e) =>
                                                    handleDeviceChange(device.device_id, e.target.checked ? 1 : 0)
                                                }
                                                disabled={!isDeviceSelectable()}
                                                checked={selectedDevices[device.device_id] > 0}
                                            >
                                                {device.device_name}
                                            </Checkbox>
                                            <span style={{ marginLeft: '10px', marginRight: '10px' }}>
                                                / {deviceQuantities[device.device_id]} có sẵn
                                            </span>
                                            <InputNumber
                                                min={1}
                                                max={deviceQuantities[device.device_id]}
                                                disabled={!selectedDevices[device.device_id]}
                                                value={selectedDevices[device.device_id] || 0}
                                                onChange={(value) => handleDeviceChange(device.device_id, value)}
                                                style={{ width: '60px', marginLeft: 'auto' }}
                                            />
                                        </div>
                                        {errorMessages[device.device_id] && (
                                            <div style={{ color: 'red', marginTop: '5px' }}>
                                                {errorMessages[device.device_id]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </Form.Item>

                <Form.Item label="Chọn phần mềm">
                    {loadingSoftware ? (
                        <Spin />
                    ) : (
                        <Checkbox.Group
                            value={selectedSoftware}
                            onChange={handleSoftwareChange}
                        >
                            {software.map((item) => (
                                <Checkbox key={item.software_id} value={item.software_id}>
                                    {item.software_name} (Version: {item.software_version})
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    )}
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ display: 'none' }}
                    >
                        Thêm máy tính
                    </Button>

                </Form.Item>
            </Form>
        </div>
    );
});

export default AddRoomComputer;

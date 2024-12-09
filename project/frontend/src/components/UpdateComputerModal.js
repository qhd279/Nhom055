import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Button, message, Row, Col, Tag, Select, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import '../styles/test.css';
import { useForm } from 'antd/es/form/Form';
import '../styles/CustomCheckbox.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const UpdateComputerModal = ({ visible, onClose, computerData, fetchComputers, room_id }) => {
  const [form] = useForm();
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [allSoftware, setAllSoftware] = useState([]);
  const [softwareModalVisible, setSoftwareModalVisible] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [temporaryData, setTemporaryData] = useState({
    devices: [],
    software: [],
  });


  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const uniqueDeviceTypes = [...new Set(data.map((device) => device.device_type))];
      setDeviceTypes(uniqueDeviceTypes);
      setDeviceOptions(data);
    } catch (error) {
      message.error('Lỗi khi lấy thiết bị.');
    }
  };


  const fetchSoftware = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/software/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAllSoftware(data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách phần mềm.');
    }
  };

  useEffect(() => {
    if (computerData) {
      form.setFieldsValue({
        computer_name: computerData.computer_name,
      });

      setTemporaryData({
        devices: [...computerData.devices],
        software: [...computerData.software],
      });

      fetchDevices();
      fetchSoftware();
    }
  }, [computerData, form]);


  const handleAddDevice = () => {
    const newDevice = { device_id: '', quantity: 1 };
    setTemporaryData(prevData => ({
      ...prevData,
      devices: [...prevData.devices, newDevice],
    }));
  };


  const handleDeviceTypeChange = (value, index) => {
    const updatedDevices = [...temporaryData.devices];
    updatedDevices[index].device_type = value;
    updatedDevices[index].device_id = '';
    setTemporaryData(prevData => ({
      ...prevData,
      devices: updatedDevices,
    }));
  };


  const handleDeviceChange = (value, index) => {
    const updatedDevices = [...temporaryData.devices];


    const existingDeviceIndex = updatedDevices.findIndex(device => device.computer_device_id === updatedDevices[index].computer_device_id);

    if (existingDeviceIndex !== -1) {

      updatedDevices[existingDeviceIndex].device_id = value;
    } else {

      updatedDevices.push({
        computer_device_id: updatedDevices[index].computer_device_id,
        device_id: value,
      });
    }


    setTemporaryData(prevData => ({
      ...prevData,
      devices: updatedDevices,
    }));
  };



  const handleRemoveDevice = (deviceId) => {
    const updatedDevices = temporaryData.devices.filter(device => device.device_id !== deviceId);
    setTemporaryData(prevData => ({
      ...prevData,
      devices: updatedDevices,
    }));
  };


  const showSoftwareModal = () => {
    setSoftwareModalVisible(true);
  };


  const handleCloseSoftwareModal = () => {
    setSoftwareModalVisible(false);
    setSelectedSoftware([]);
  };


  const handleSoftwareSelectChange = (checkedValues) => {
    setSelectedSoftware(checkedValues);
  };


  const handleAddSoftware = () => {
    const newSoftware = selectedSoftware.map((softwareId) => {
      const selected = allSoftware.find(sw => sw.software_id === softwareId);
      if (selected) {
        return {
          software_id: selected.software_id,
          software_name: selected.software_name,
        };
      }
      return null;
    }).filter(sw => sw !== null);

    setTemporaryData(prevData => ({
      ...prevData,
      software: [...prevData.software, ...newSoftware],
    }));

    handleCloseSoftwareModal();
  };


  const handleRemoveSoftware = (softwareId) => {
    const updatedSoftware = temporaryData.software.filter(sw => sw.software_id !== softwareId);
    setTemporaryData(prevData => ({
      ...prevData,
      software: updatedSoftware,
    }));
  };


  const softwareNotInstalled = allSoftware.filter(
    (sw) => !temporaryData.software.some((installed) => installed.software_id === sw.software_id)
  );


  const handleUpdate = async () => {

    const devicesToAdd = temporaryData.devices.filter(device =>
      !computerData.devices.some(d => d.device_id === device.device_id)
    ).map(device => ({
      device_id: device.device_id,
      quantity: device.quantity || 1,
    }));

    const devicesToDelete = computerData.devices.filter(device =>
      !temporaryData.devices.some(d => d.device_id === device.device_id)
    ).map(device => ({
      computer_device_id: device.computer_device_id,
    }));

    const devicesToUpdate = temporaryData.devices.filter(device =>
      computerData.devices.some(d => d.computer_device_id === device.computer_device_id)
    ).map(device => ({
      computer_device_id: device.computer_device_id,
      new_device_id: device.device_id,
    }));







    const softwareToAdd = temporaryData.software.filter(sw =>
      !computerData.software.some(s => s.software_id === sw.software_id)
    ).map(sw => ({
      software_id: sw.software_id,
    }));

    const softwareToDelete = computerData.software.filter(sw =>
      !temporaryData.software.some(s => s.software_id === sw.software_id)
    ).map(sw => ({
      computer_software_id: sw.computer_software_id,
    }));

    const payload = {
      computer_name: form.getFieldValue("computer_name"),
      room_id: room_id,
      devices: {
        add: devicesToAdd,
        delete: devicesToDelete,
        update: devicesToUpdate,
      },
      softwares: {
        add: softwareToAdd,
        delete: softwareToDelete,
      },
    };

    //   console.log("Payload to send to API:", JSON.stringify(payload, null, 2));


    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/computers/${computerData.computer_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });


      toast.success("Cập nhật thành công");

      fetchComputers();

      onClose();
    } catch (error) {
      toast.error("Cập nhật thất bại.");
    }
  };


  return (
    <Modal
      title="Cập nhật máy tính"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleUpdate}>
          Cập nhật
        </Button>,
      ]}
    >
      <h4>Tên máy tính</h4>
      <Form form={form} layout="vertical">
        <Form.Item
          name="computer_name"
          rules={[{ required: true, message: 'Vui lòng nhập tên máy tính' }]} >
          <Input />
        </Form.Item>

        <h4>
          Thiết bị
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={handleAddDevice}
            style={{ fontSize: '18px', color: '#1890ff', marginLeft: '10px' }}
          />
        </h4>

        {temporaryData.devices.map((device, index) => (
          <div key={device.device_id || index}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item>
                  {device.device_id ? (
                    <span>{device.device_type}</span>
                  ) : (
                    <Select
                      value={device.device_type}
                      onChange={(value) => handleDeviceTypeChange(value, index)}
                      style={{ width: '100%' }}>
                      {deviceTypes.map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name={['devices', device.device_id, 'device_id']}
                  initialValue={device.device_id}
                  rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
                  <Select
                    value={device.device_id}
                    onChange={(value) => handleDeviceChange(value, index)}
                    style={{ width: '100%' }}>
                    {deviceOptions
                      .filter(option => option.device_type === device.device_type)
                      .map(filteredDevice => (
                        <Select.Option key={filteredDevice.device_id} value={filteredDevice.device_id}>
                          {filteredDevice.device_name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={2}>
                <Button
                  type="link"
                  icon={<DeleteOutlined style={{ fontSize: '18px', color: 'red' }} />}
                  onClick={() => handleRemoveDevice(device.device_id)}
                />
              </Col>
            </Row>
          </div>
        ))}

        <h4>
          Phần mềm
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={showSoftwareModal}
            style={{ fontSize: '18px', color: '#1890ff', marginLeft: '10px' }}
          />
        </h4>

        {temporaryData.software.length > 0 ? (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                {temporaryData.software.map((sw) => (
                  <Tag

                    key={sw.software_id}
                    color="blue"
                    closable
                    onClose={() => handleRemoveSoftware(sw.software_id)}
                    style={{ fontSize: '12px', padding: '6px 12px', marginBottom: '10px' }}
                  >
                    {sw.software_name}
                  </Tag>

                ))}
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <span>Không có phần mềm nào được cài đặt</span>
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>


      <Modal
        title="Chọn phần mềm"
        visible={softwareModalVisible}
        onCancel={handleCloseSoftwareModal}
        onOk={handleAddSoftware}
      >
        <Checkbox.Group
          value={selectedSoftware}
          onChange={handleSoftwareSelectChange}
        >
          {softwareNotInstalled.map((sw) => (
            <Checkbox
              key={sw.software_id}
              value={sw.software_id}
              className="custom-checkbox"
            >
              {sw.software_name}
            </Checkbox>
          ))}
        </Checkbox.Group>

      </Modal>
    </Modal>
  );
};

export default UpdateComputerModal;

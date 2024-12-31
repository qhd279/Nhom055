import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const ManageDevices = () => {
  const [devices, setDevices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const fetchDevices = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/devices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error.message);
      if (error.response) {
        console.error('Error details:', error.response);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const showEditModal = (device) => {
    setCurrentDevice(device);
    form.setFieldsValue(device);
    setIsModalVisible(true);
  };

  const handleDelete = async (device_id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/devices/${device_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Xóa thiết bị thành công!');
      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error.message);
    }
  };

  const handleModalOk = async (values) => {
    const token = localStorage.getItem('token');
    try {
      if (currentDevice) {

        await axios.put(`http://localhost:5000/api/devices/${currentDevice.device_id}`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Cập nhật thiết bị thành công!');
      } else {

        await axios.post('http://localhost:5000/api/devices', values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Thêm thiết bị thành công!');
      }
      fetchDevices();
      setIsModalVisible(false);
      setCurrentDevice(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving device:', error.message);
      toast.error(`Có lỗi xảy ra: ${error.message}`);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentDevice(null);
    form.resetFields();
  };

  const handleAddDevice = () => {
    setCurrentDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredDevices = devices.filter((device) =>
    device.device_name.toLowerCase().includes(searchTerm) ||
    device.device_id.toString().includes(searchTerm) ||
    device.device_type.toLowerCase().includes(searchTerm) ||
    device.quantity.toString().includes(searchTerm)
  );

  return (
    <div>
      <h2>Danh Sách Thiết Bị</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>

        <Input
          placeholder="Tìm kiếm thiết bị "
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '300px' }}
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddDevice}
          style={{ marginLeft: 'auto' }}
        >
          Thêm Thiết Bị
        </Button>
      </div>


      <Table dataSource={filteredDevices} rowKey="device_id" loading={loading} pagination={{
        pageSize: 5,
      }}>
        <Table.Column title="ID" dataIndex="device_id" />
        <Table.Column title="Tên Thiết Bị" dataIndex="device_name" />
        <Table.Column title="Loại Thiết Bị" dataIndex="device_type" />
        <Table.Column title="Số Lượng" dataIndex="quantity" />
        <Table.Column
          title="Hành Động"
          render={(text, record) => (
            <span>
              <Button
                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                onClick={() => showEditModal(record)}
                style={{ background: 'transparent', border: 'none', marginRight: 8 }}
              />
              <Button
                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                onClick={() => handleDelete(record.device_id)}
                style={{ background: 'transparent', border: 'none', display: 'none' }}

              />
            </span>
          )}
        />
      </Table>

      <Modal
        title={currentDevice ? "Sửa Thiết Bị" : "Thêm Thiết Bị"}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalOk}
        >
          <Form.Item
            name="device_name"
            label="Tên Thiết Bị"
            rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="device_type"
            label="Loại Thiết Bị"
            rules={[{ required: true, message: 'Vui lòng nhập loại thiết bị' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số Lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { validator: (_, value) => value < 1 ? Promise.reject('Số lượng không được nhỏ hơn 1') : Promise.resolve() }
            ]}
            validateTrigger="onBlur"
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default ManageDevices;

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageSoftware = () => {
  const [softwareList, setSoftwareList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSoftware, setCurrentSoftware] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm(); 

  const fetchSoftware = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/software', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSoftwareList(response.data);
    } catch (error) {
      console.error('Error fetching software:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, []);

  const showEditModal = (software) => {
    setCurrentSoftware(software);
    form.setFieldsValue({
      software_name: software.software_name,
      software_version: software.software_version,
      expiration_date: software.expiration_date ? moment(software.expiration_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (software_id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/software/${software_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSoftware();
      toast.success('Xóa thành công!'); 
    } catch (error) {
      console.error('Error deleting software:', error);
      toast.error('Xóa thất bại!');
    }
  };
  

  const handleModalOk = async (values) => {
    const token = localStorage.getItem('token');
    try {
      
      if (values.expiration_date) {
        values.expiration_date = values.expiration_date.format('YYYY-MM-DD');
      }
  
      if (currentSoftware) {
       
        await axios.put(`http://localhost:5000/api/software/${currentSoftware.software_id}`, values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Cập nhật thành công!'); 
      } else {
        
        await axios.post('http://localhost:5000/api/software', values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Thêm mới thành công!'); 
      }
  
      fetchSoftware();
      setIsModalVisible(false);
      setCurrentSoftware(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving software:', error);
      toast.error('Lỗi!'); 
    }
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentSoftware(null);
    form.resetFields(); 
  };

  const handleAddSoftware = () => {
    setCurrentSoftware(null);
    form.resetFields(); 
    setIsModalVisible(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredSoftware = softwareList.filter(
    (software) =>
      software.software_name.toLowerCase().includes(searchTerm) ||
      software.software_id.toString().includes(searchTerm)
  );

  return (
    <div>
      <h2>Danh Sách Phần Mềm</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm phần mềm "
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '300px' }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSoftware}>
          Thêm Phần Mềm
        </Button>
      </div>
      <Table dataSource={filteredSoftware} rowKey="software_id" loading={loading} pagination={{
          pageSize: 5, 
        }}>
        <Table.Column title="ID" dataIndex="software_id" />
        <Table.Column title="Tên Phần Mềm" dataIndex="software_name" />
        <Table.Column title="Phiên Bản" dataIndex="software_version" />
        <Table.Column
          title="Ngày Hết Hạn"
          dataIndex="expiration_date"
          render={(date) => (date ? moment(date).format('DD/MM/YYYY') : 'Không có')}
        />
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
                onClick={() => handleDelete(record.software_id)}
                style={{ background: 'transparent', border: 'none' }}
              />
            </span>
          )}
        />
      </Table>

      <Modal
        title={currentSoftware ? 'Sửa Phần Mềm' : 'Thêm Phần Mềm'}
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
            name="software_name"
            label="Tên Phần Mềm"
            rules={[{ required: true, message: 'Vui lòng nhập tên phần mềm!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="software_version"
            label="Phiên Bản"
            rules={[{ required: true, message: 'Vui lòng nhập phiên bản!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="expiration_date" label="Ngày Hết Hạn">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
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

export default ManageSoftware;

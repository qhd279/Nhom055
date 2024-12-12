import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/ManageUsers.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showEditModal = (user) => {
        setCurrentUser(user);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
          await axios.delete(`http://localhost:5000/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          fetchUsers();
          toast.success('Xóa thành công!');
        } catch (error) {
          console.error('Error deleting user:', error.response ? error.response.data : error.message);
          toast.error('Xóa thất bại!');
        }
      };
      

      const handleModalOk = async (values) => {
        const token = localStorage.getItem('token');
        try {
          if (currentUser) {
            
            await axios.put(`http://localhost:5000/api/users/${currentUser.id}`, values, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            toast.success('Cập nhật thành công!');
          } else {
            
            values.status = 'active';
            values.password = '123456789'; 
            await axios.post('http://localhost:5000/api/users', values, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            toast.success('Thêm mới thành công!');
          }
          fetchUsers();
          setIsModalVisible(false);
          setCurrentUser(null);
        } catch (error) {
          console.error('Error saving user:', error.response ? error.response.data : error.message);
          toast.error('Lỗi!');
        }
      };
      

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setCurrentUser(null);
    };

    const handleAddUser = () => {
        setCurrentUser(null);
        setIsModalVisible(true);
    };


    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredUsers = users.filter(user =>
        user.fullname.toLowerCase().includes(searchTerm) ||
        user.id.toString().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone_number.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        user.status.toLowerCase().includes(searchTerm)
    );


    const handlePaginationChange = (page, pageSize) => {
        setPagination({
            current: page,
            pageSize: pageSize,
        });
    };
    const roleToVietnamese = {
        admin: 'Quản trị viên',
        teacher: 'Giảng viên',
        support: 'Kỹ thuật viên'
      };

    return (
        <div>
            <h2>Danh Sách Người Dùng</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm theo ID, tên, email, số điện thoại, vai trò, trạng thái"
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ width: '300px' }}
                />
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleAddUser}
                >
                    Thêm Người Dùng
                </Button>
            </div>
            <Table
                dataSource={filteredUsers}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredUsers.length,
                    onChange: handlePaginationChange,
                }}
            >
                <Table.Column title="ID" dataIndex="id" />
                <Table.Column title="Họ Tên" dataIndex="fullname" />
                <Table.Column title="Email" dataIndex="email" />
                <Table.Column title="Số Điện Thoại" dataIndex="phone_number" />
                <Table.Column title="Vai Trò" dataIndex="role" render={(role) => (
                    <Tag color={role === 'admin' ? 'purple' : role === 'teacher' ? 'cyan' : 'orange'}>
                    {roleToVietnamese[role] || role.charAt(0).toUpperCase() + role.slice(1)}
                  </Tag>
                )} />
                <Table.Column title="Trạng Thái" dataIndex="status" render={(status) => {
                    const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Không xác định';
                    return (
                        <Tag color={status === 'active' ? 'green' : 'red'}>
                            {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </Tag>

                    );
                }} />
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
                                onClick={() => handleDelete(record.id)}
                                style={{ background: 'transparent', border: 'none' , display: 'none'}}
                            />
                        </span>
                    )}
                />
            </Table>

            <Modal
                key={currentUser ? currentUser.id : 'new'}
                title={currentUser ? "Sửa Người Dùng" : "Thêm Người Dùng"}
                visible={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                centered
            >
                <Form
                    layout="vertical"
                    initialValues={{
                        id: currentUser?.id,
                        fullname: currentUser?.fullname,
                        email: currentUser?.email,
                        phone_number: currentUser?.phone_number,
                        role: currentUser?.role,
                        status: currentUser?.status,
                        password: currentUser?.password || "123456789",
                    }}
                    onFinish={handleModalOk}
                >
                    <Form.Item name="id" label="ID">
                        <Input disabled={!!currentUser} />
                    </Form.Item>
                    <Form.Item
                        name="fullname"
                        label="Họ Tên"
                        rules={[{ required: true, message: 'Trường này là bắt buộc.' }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Trường này là bắt buộc.' }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone_number"
                        label="Số Điện Thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Vai Trò"
                        rules={[{ required: true, message: 'Trường này là bắt buộc.' }]}>
                        <Select placeholder="Chọn vai trò" style={{ width: '100%' }}>
                            <Option value="admin">Quản trị viên</Option>
                            <Option value="teacher">Giảng viên</Option>
                            <Option value="support">Kỹ thuật viên</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Trạng Thái"
                        rules={[{ required: true, message: 'Trường này là bắt buộc.' }]}
                        initialValue="active"
                    >
                        <Select style={{ width: '100%' }}>
                            <Option value="active">Hoạt động</Option>
                            <Option value="deactive">Không hoạt động</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật Khẩu"
                        rules={[{ required: true, message: 'Trường này là bắt buộc.' }]} >
                        <Input.Password />
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

export default ManageUsers;

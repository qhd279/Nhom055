import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification, Spin } from 'antd';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('token');

  let userId = null;
  if (token) {
    const decodedToken = jwtDecode(token);
    userId = decodedToken.id;
  }

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
          setUserData(response.data);
          setLoading(false);
        })
        .catch(error => {
          notification.error({ message: 'Lỗi khi lấy dữ liệu' });
          setLoading(false);
        });
    }
  }, [token, userId]);

  const onFinish = (values) => {
    setUpdating(true);
    axios.put(`http://localhost:5000/api/users/${userId}`, values, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setUserData(response.data);
        setUpdating(false);
        notification.success({ message: 'Cập nhật hồ sơ thành công' });
      })
      .catch(error => {
        setUpdating(false);
        notification.error({ message: 'Lỗi khi cập nhật hồ sơ' });
      });
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <h2>Thông tin cá nhân</h2>
        <Form
          initialValues={userData}
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%' }}
        >
          <Form.Item
            label="Họ và tên"
            name="fullname"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone_number"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò của bạn!' }]}
            style={{ display: 'none' }}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái của bạn!' }]}
            style={{ display: 'none' }}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updating}>
              {updating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100%',
    backgroundColor: '#f0f2f5',
  },
  formContainer: {
    marginTop: '30px',
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  }
};

export default Profile;

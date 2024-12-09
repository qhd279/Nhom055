import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const ChangePassword = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    const decodedToken = jwtDecode(token);
    userId = decodedToken.id;
  }

  const onFinish = (values) => {
    setUpdating(true);
    const { oldPassword, newPassword } = values;

    // Send request to change the password
    axios.post(`http://localhost:5000/api/auth/change-password`, {
      id: userId,
      oldPassword: oldPassword,
      newPassword: newPassword
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(response => {
        setUpdating(false);
        toast.success('Đổi mật khẩu thành công'); 
      })
      .catch(error => {
        setUpdating(false);
        if (error.response) {
          toast.error(error.response.data.message || 'Lỗi khi đổi mật khẩu'); 
        } else {
          toast.error('Lỗi khi kết nối đến server');
        }
      });
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <h2>Đổi mật khẩu</h2>
        <Form
          name="change-password"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Mật khẩu cũ"
            name="oldPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}>
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={updating} block>
            Đổi mật khẩu
          </Button>
        </Form>
      </div>
      <ToastContainer/>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
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



export default ChangePassword;

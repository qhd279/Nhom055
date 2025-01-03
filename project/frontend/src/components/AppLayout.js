import React from 'react';
import { Layout, Typography, Avatar } from 'antd';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import Sidebar from './Sidebar';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

const { Content, Header } = Layout;
const { Title } = Typography;

const AppLayout = ({ setIsAuthenticated, setUserRole }) => {
  const token = localStorage.getItem('token');
  let userName = 'Guest'; 

  if (token) {
    try {

      const decodedToken = jwtDecode(token);
      userName = decodedToken.fullname || 'Hai'; 
    } catch (error) {
      console.error('Error decoding token', error);
    }
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user ? user.role : 'guest';
  const location = useLocation();
  const params = useParams(); 

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/manage-users':
        return 'Quản lý người dùng';
      case '/manage-rooms':
        return 'Quản lý phòng máy';
      case '/manage-reports':
        return 'Quản lý báo cáo';
      case '/manage-devices':
        return 'Quản lý thiết bị';
      case '/manage-software':
        return 'Quản lý phần mềm';
      case '/statistics':
        return 'Thống kê';
      case '/profile':
        return 'Xem thông tin';
      case '/change-password':
        return 'Đổi mật khẩu';
      case '/repair-history':
        return 'Lịch sử sửa chữa';
      case `/manage-rooms/${params.room_id}`: // Check for the dynamic route
        return 'Chi tiết phòng máy';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar role={role} setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
      <Layout className="site-layout" style={{ marginLeft: 200 }}>
        <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Title level={4} style={{ color: '#000', margin: 0, flexGrow: 1, fontFamily: 'Roboto, sans-serif' }}>
            {getPageTitle()}
          </Title>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <Typography.Text style={{ marginRight: '10px', fontWeight: '500' }}>Xin chào, {userName}</Typography.Text>
            <Avatar icon={<UserOutlined />} />
          </div>
        </Header>
        <Content style={{ overflow: 'initial' }}>
          <div className="site-layout-background" style={{ padding: 24, textAlign: 'center' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

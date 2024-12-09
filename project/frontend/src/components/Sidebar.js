import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  LaptopOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ role, setIsAuthenticated, setUserRole }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/'); // Redirect to login
  };

  const handleMenuClick = (path) => {
    if (path === '/logout') {
      handleLogout();
    } else {
      navigate(path);
    }
  };

  // Determine active keys based on the current path
  const activeKeys = [location.pathname];

  // Add logic for nested routes
  if (location.pathname.startsWith('/manage-rooms')) {
    activeKeys.push('/manage-rooms'); // Keep the parent route active
  }

  // Define menu items based on the user role
  const getMenuItems = (role) => {
    const baseItems = [
      /*{
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => handleMenuClick('/'),
      },*/
    ];

    if (role === 'admin') {
      return [
        ...baseItems,
        { key: '/manage-users', icon: <TeamOutlined />, label: 'Quản lý người dùng', onClick: () => handleMenuClick('/manage-users') },
        { key: '/manage-rooms', icon: <LaptopOutlined />, label: 'Quản lý phòng máy', onClick: () => handleMenuClick('/manage-rooms') },
        { key: '/manage-reports', icon: <FileTextOutlined />, label: 'Quản lý báo cáo', onClick: () => handleMenuClick('/manage-reports') },
        { key: '/manage-devices', icon: <SettingOutlined />, label: 'Quản lý thiết bị', onClick: () => handleMenuClick('/manage-devices') },
        { key: '/manage-software', icon: <FileTextOutlined />, label: 'Quản lý phần mềm', onClick: () => handleMenuClick('/manage-software') },
        { key: '/statistics', icon: <BarChartOutlined />, label: 'Thống kê', onClick: () => handleMenuClick('/statistics') },
        { key: '/profile', icon: <UserOutlined />, label: 'Xem thông tin', onClick: () => handleMenuClick('/profile') },
        { key: '/change-password', icon: <SettingOutlined />, label: 'Đổi mật khẩu', onClick: () => handleMenuClick('/change-password') },
        { key: '/logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: () => handleMenuClick('/logout') },
      ];
    }

    if (role === 'teacher') {
      return [
        ...baseItems,
        { key: '/manage-rooms', icon: <LaptopOutlined />, label: 'Quản lý phòng máy', onClick: () => handleMenuClick('/manage-rooms') },
        { key: '/profile', icon: <UserOutlined />, label: 'Xem thông tin', onClick: () => handleMenuClick('/profile') },
        { key: '/change-password', icon: <SettingOutlined />, label: 'Đổi mật khẩu', onClick: () => handleMenuClick('/change-password') },
        { key: '/logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: () => handleMenuClick('/logout') },
      ];
    }

    if (role === 'support') {
      return [
        ...baseItems,
        { key: '/manage-tasks', icon: <FileTextOutlined />, label: 'Quản lý công việc', onClick: () => handleMenuClick('/manage-tasks') }, // Updated to "Quản lý công việc"
        { key: '/repair-history', icon: <SettingOutlined />, label: 'Lịch sử sửa chữa', onClick: () => handleMenuClick('/repair-history') },
        { key: '/profile', icon: <UserOutlined />, label: 'Xem thông tin', onClick: () => handleMenuClick('/profile') },
        { key: '/change-password', icon: <SettingOutlined />, label: 'Đổi mật khẩu', onClick: () => handleMenuClick('/change-password') },
        { key: '/logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: () => handleMenuClick('/logout') },
      ];
    }

    return baseItems;
  };

  return (
    <Sider style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, padding: '0' }}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <img src="logo2.png" alt="Logo" style={{ width: '100%', height: 'auto' }} />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={activeKeys}
        items={getMenuItems(role)}
      />
    </Sider>
  );
};

export default Sidebar;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ManageUsers from './pages/ManageUsers';
import ManageRooms from './pages/ManageRooms';
import ManageReports from './pages/ManageReports';
import ManageDevices from './pages/ManageDevices';
import ManageSoftware from './pages/ManageSoftware';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import RepairHistory from './pages/RepairHistory';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import RoomDetails from './pages/RoomDetails'; // Import RoomDetails
import ManageTask from './pages/ManageTask';
import ChangePassword from './pages/ChangePassword';
import { jwtDecode } from 'jwt-decode';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAuthenticated(true);
      setUserRole(decodedToken.role);
    }
  }, []);

  const getDefaultPath = () => {
    if (userRole === 'admin') {
      return '/manage-reports';
    } else if (userRole === 'teacher') {
      return '/manage-rooms';
    } else if (userRole === 'support') {
      return '/manage-task';
    }
    return '/';
  };

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <Route path="/" element={<AppLayout setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}>
            <Route index element={<Navigate to={getDefaultPath()} replace />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-rooms" element={<ManageRooms />} />
            <Route path="manage-reports" element={<ManageReports />} />
            <Route path="manage-devices" element={<ManageDevices />} />
            <Route path="manage-software" element={<ManageSoftware />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="repair-history" element={<RepairHistory />} />
            <Route path="manage-rooms/:room_id" element={<RoomDetails />} /> {/* Add this line */}
            <Route path="manage-tasks" element={<ManageTask />} />
            <Route path="change-password" element={<ChangePassword />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;

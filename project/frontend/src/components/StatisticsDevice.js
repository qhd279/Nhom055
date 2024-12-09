import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Divider, Spin, Alert } from 'antd';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsDevice = () => {
  // State for devices
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [deviceChartData, setDeviceChartData] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch Devices
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/devices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        setDevices(response.data);
        setLoading(false);

        // Prepare data for the device chart
        const chartData = response.data.map(device => ({
          name: device.device_name,
          value: device.quantity,
        }));
        setDeviceChartData(chartData);
      })
      .catch(err => {
        setError('Không thể tải dữ liệu thiết bị');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div style={{ padding: '10px' }}>
      {/* Divider for Devices */}
      <Divider orientation="left">Thống kê thiết bị</Divider>

      {/* Device Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={deviceChartData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend
            payload={[{ value: 'Số lượng', type: 'square', id: 'value', color: '#8884d8' }]}
            verticalAlign="top"
            wrapperStyle={{ bottom: 0 }}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticsDevice;

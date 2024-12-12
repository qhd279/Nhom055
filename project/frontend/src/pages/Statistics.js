import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Divider, DatePicker, Typography, Table, Spin, Alert } from 'antd';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import StatisticsDevice from '../components/StatisticsDevice';
import StatisticsSupport from '../components/StatisticsSupport';
import StatisticsSupport2 from '../components/StatisticsSupport2';

import StatisticsReport from '../components/StatisticsReport';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const Statistics = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true); 
        const response = await axios.get('http://localhost:5000/api/reports/');
        if (response.data.success) {
          setReports(response.data.reports);
        } else {
          setError('Không có dữ liệu báo cáo');
        }
      } catch (error) {
        setError('Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);  
      }
    };

    fetchReports();
  }, []);

  
  if (loading) {
    return <Spin size="large" />; 
  }

  if (error) {
    return <Alert message={error} type="error" />; 
  }

  return (
    <div style={{ padding: '10px' }}>
      <StatisticsReport reports={reports} />
      <StatisticsSupport reports={reports} />;
      

      <StatisticsDevice />
    </div>
  );
};

export default Statistics;

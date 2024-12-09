import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Divider, DatePicker, Typography, Spin, Alert } from 'antd';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const Statistics = () => {
  // State for reports
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [roomChartData, setRoomChartData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    onTimeReports: 0,
    overdueReports: 0,
    processingReports: 0,
    pendingReports: 0,
  });
  const [lineChartData, setLineChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [supportStats, setSupportStats] = useState([]);

  // State for support stats filter
  const [supportStatsFiltered, setSupportStatsFiltered] = useState([]);
  const [supportStatsDateRange, setSupportStatsDateRange] = useState(null);

  // State for devices
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [deviceChartData, setDeviceChartData] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch Reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports/');
        if (response.data.success) {
          setReports(response.data.reports);
          setFilteredReports(response.data.reports);
          calculateReportStatistics(response.data.reports);
          calculateSupportStatistics(response.data.reports);
          generateLineChartData(response.data.reports);
          calculatePieChartData(response.data.reports);
          generateRoomChartData(response.data.reports);
        }
      } catch (error) {
        setError('Không thể tải dữ liệu báo cáo');
      }
    };
    fetchReports();
  }, []);

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

  // Calculate statistics for reports
  const calculateReportStatistics = (data) => {
    let totalReports = data.length;
    let onTimeReports = 0;
    let overdueReports = 0;
    let processingReports = 0;
    let pendingReports = 0;

    data.forEach(report => {
      if (report.status === 'processing') {
        processingReports += 1;
      } else if (report.status === 'pending') {
        pendingReports += 1;
      } else if (report.expected_completion_date && report.completion_date) {
        if (moment(report.completion_date).isSameOrBefore(moment(report.expected_completion_date))) {
          onTimeReports += 1;
        } else {
          overdueReports += 1;
        }
      }
    });

    setStatistics({
      totalReports,
      onTimeReports,
      overdueReports,
      processingReports,
      pendingReports,
    });
  };

  // Filter reports by date range
const handleDateRangeChange = (dates) => {
  if (dates && dates.length === 2) {
    const startDate = dates[0].toDate();
    const endDate = dates[1].toDate();
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    // Filter reports by the selected date range
    const filtered = reports.filter(report => {
      const reportDate = moment(report.submission_date);
      return reportDate.isBetween(start, end, null, '[]');
    });

    // Update the filtered reports and statistics related to reports
    setFilteredReports(filtered);
    calculateReportStatistics(filtered);
    generateLineChartData(filtered);
    calculatePieChartData(filtered);
    generateRoomChartData(filtered); // Recalculate room chart data
  } else {
    // If no date range is selected, show all reports
    setFilteredReports(reports);
    calculateReportStatistics(reports);
    generateLineChartData(reports);
    calculatePieChartData(reports);
    generateRoomChartData(reports); // Recalculate room chart data
  }
};

  // Filter support stats by date range
  const handleSupportStatsDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const startDate = dates[0].toDate();
      const endDate = dates[1].toDate();
      const start = moment(startDate).startOf('day');
      const end = moment(endDate).endOf('day');

      const filtered = reports.filter(report => {
        const reportDate = moment(report.submission_date);
        return reportDate.isBetween(start, end, null, '[]');
      });

      setSupportStatsDateRange(dates);
      calculateSupportStatistics(filtered);
    } else {
      setSupportStatsDateRange(null);
      calculateSupportStatistics(reports);
    }
  };

  // Generate Line Chart data for reports
  const generateLineChartData = (data) => {
    const chartData = [];
    data.forEach(report => {
      const date = moment(report.submission_date).format('YYYY-MM-DD');
      const existingDate = chartData.find(item => item.date === date);
      if (existingDate) {
        existingDate.count += 1;
      } else {
        chartData.push({ date, count: 1 });
      }
    });
    setLineChartData(chartData);
  };

  // Generate Room Chart data
  const generateRoomChartData = (data) => {
    const roomData = [];
    data.forEach(report => {
      const roomName = report.room_name;
      const existingRoom = roomData.find(item => item.room === roomName);
      if (existingRoom) {
        existingRoom.count += 1;
      } else {
        roomData.push({ room: roomName, count: 1 });
      }
    });
    setRoomChartData(roomData); // Update room chart data with the filtered data
  };

  // Calculate Pie Chart data (based on report status)
  const calculatePieChartData = (data) => {
    const onTime = data.filter(report => moment(report.completion_date).isSameOrBefore(moment(report.expected_completion_date))).length;
    const overdue = data.filter(report => moment(report.completion_date).isAfter(moment(report.expected_completion_date))).length;
    const processing = data.filter(report => report.status === 'processing').length;
    const pending = data.filter(report => report.status === 'pending').length;

    const pieData = [
      { name: 'Đúng hạn', value: onTime },
      { name: 'Quá hạn', value: overdue },
      { name: 'Đang xử lý', value: processing },
      { name: 'Đang chờ', value: pending },
    ];

    setPieChartData(pieData);
  };

  // Calculate Support Stats
  const calculateSupportStatistics = (data) => {
    const supportStats = {};

    // Iterate through reports to accumulate stats for each support
    data.forEach(report => {
      const supportName = report.support_name;
      if (!supportName) return;

      if (!supportStats[supportName]) {
        supportStats[supportName] = { onTime: 0, overdue: 0, processing: 0, totalReports: 0 };
      }

      // Count the total reports for this support
      supportStats[supportName].totalReports += 1;

      // Count reports based on their status
      if (report.status === 'processing') {
        supportStats[supportName].processing += 1;
      } else if (report.status === 'pending') {
        // Don't count pending status
      } else if (report.expected_completion_date && report.completion_date) {
        if (moment(report.completion_date).isSameOrBefore(moment(report.expected_completion_date))) {
          supportStats[supportName].onTime += 1;
        } else {
          supportStats[supportName].overdue += 1;
        }
      }
    });

    // Create a list of valid support stats, including total reports
    const validSupportStats = Object.entries(supportStats)
      .filter(([supportName]) => supportName)
      .map(([supportName, stats]) => ({
        supportName,
        onTime: stats.onTime,
        overdue: stats.overdue,
        processing: stats.processing,
        totalReports: stats.totalReports, // Include total reports here
      }));

    setSupportStats(validSupportStats);
    setSupportStatsFiltered(validSupportStats);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div style={{ padding: '10px' }}>
      {/* Date Filter Section */}
      <Divider orientation="left">Thống kê báo cáo</Divider>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h4 style={{ marginLeft: 10 }}>Lọc theo ngày</h4>
        <RangePicker onChange={handleDateRangeChange} style={{ marginLeft: 20 }} />
      </div>

      {/* Statistics for Reports */}
      <Row gutter={50} justify="center" style={{ marginTop: '20px' }}>
        <Col span={4.8}>
          <Card>
            <Statistic title="Tổng số báo cáo" value={statistics.totalReports} />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic title="Báo cáo đúng hạn" value={statistics.onTimeReports} />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic title="Báo cáo quá hạn" value={statistics.overdueReports} />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic title="Báo cáo đang xử lý" value={statistics.processingReports} />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card>
            <Statistic title="Báo cáo đang chờ" value={statistics.pendingReports} />
          </Card>
        </Col>
      </Row>

      {/* Charts for Reports */}
      <Row gutter={50} style={{ marginTop: '20px' }}>
        <Col span={12}>
          <Divider orientation="left">Báo cáo theo ngày</Divider>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Số lượng báo cáo" />
            </LineChart>
          </ResponsiveContainer>
        </Col>

        {/* New Chart for Reports by Room */}
        <Col span={12}>
          <Divider orientation="left">Báo cáo theo phòng</Divider>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roomChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="room" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Số lượng báo cáo" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      {/* Move Báo cáo theo hỗ trợ (Support Stats) outside of Statistics */}
      <Divider orientation="left">Thống kê hỗ trợ</Divider>

{/* Move Báo cáo theo hỗ trợ (Support Stats) outside of Statistics */}
<div style={{ display: 'flex', alignItems: 'center' }}>
  <h4 style={{ marginLeft: 10 }}>Lọc theo ngày hỗ trợ</h4>
  <RangePicker onChange={handleSupportStatsDateRangeChange} style={{ marginLeft: 20 }} />
</div>

<Row gutter={50}>
  <Col span={24}>  {/* Ensures the chart takes up the full width */}
    <ResponsiveContainer width="100%" height={300}>  {/* Make the height flexible and take up available space */}
      <BarChart data={supportStatsFiltered}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="supportName"  />
        <YAxis />
        <Tooltip
          content={({ payload }) => {
            // Ensure there's data in the payload
            if (payload && payload.length > 0) {
              // Extract the data for the hovered bar
              const { supportName, onTime, overdue, processing, totalReports } = payload[0].payload;

              return (
                <div style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{supportName}</p>
                  <p style={{ color: '#82ca9d' }}><strong>Đúng hạn:</strong> {onTime}</p>
                  <p style={{ color: '#ff8042' }}><strong>Quá hạn:</strong> {overdue}</p>
                  <p style={{ color: '#8884d8' }}><strong>Đang xử lý:</strong> {processing}</p>
                  <p style={{ fontWeight: 'bold', color: '#333' }}><strong>Tổng số báo cáo:</strong> {totalReports}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar dataKey="onTime" fill="#82ca9d" name="Đúng hạn" />
        <Bar dataKey="overdue" fill="#ff8042" name="Quá hạn" />
        <Bar dataKey="processing" fill="#8884d8" name="Đang xử lý" />
      </BarChart>
    </ResponsiveContainer>
  </Col>
</Row>

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

export default Statistics;

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Divider, DatePicker, Typography, Spin, Alert } from 'antd';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const StatisticsReport = ({ reports }) => {
  const [filteredReports, setFilteredReports] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    onTimeReports: 0,
    overdueReports: 0,
    processingReports: 0,
    pendingReports: 0,
  });
  const [lineChartData, setLineChartData] = useState([]);
  const [roomChartData, setRoomChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    if (reports.length > 0) {
      setLoading(false);
      const filteredData = reports.filter(report => report.report_type === 'report');
      setFilteredReports(filteredData);
      calculateReportStatistics(filteredData);
      generateLineChartData(filteredData);
      generateRoomChartData(filteredData);
    }
  }, []);


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

      // Filter reports by the selected date range and report_type = 'report'
      const filtered = reports.filter(report => 
        report.report_type === 'report' && moment(report.submission_date).isBetween(start, end, null, '[]')
      );

      // Update the filtered reports and statistics related to reports
      setFilteredReports(filtered);
      calculateReportStatistics(filtered);
      generateLineChartData(filtered);
      generateRoomChartData(filtered); // Recalculate room chart data
    } else {
      // If no date range is selected, show all reports
      const filtered = reports.filter(report => report.report_type === 'report');
      setFilteredReports(filtered);
      calculateReportStatistics(filtered);
      generateLineChartData(filtered);
      generateRoomChartData(filtered); // Recalculate room chart data
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

  if (loading) {
    return <Spin size="large" />; // Show the loading spinner while data is being fetched
  }

  if (error) {
    return <Alert message={error} type="error" />; // Display error if data fetching fails
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
    </div>
  );
};

export default StatisticsReport;

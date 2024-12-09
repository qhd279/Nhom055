import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Divider, DatePicker, Spin, Alert } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const { RangePicker } = DatePicker;

const Statistics = ({ reports }) => {
  // State for support stats
  const [supportStats, setSupportStats] = useState([]);
  const [supportStatsFiltered, setSupportStatsFiltered] = useState([]);
  const [supportStatsDateRange, setSupportStatsDateRange] = useState(null);
  const [error, setError] = useState(null);

  // Calculate Support Stats
  const calculateSupportStatistics = (data) => {
    const supportStats = {};

    data.forEach(report => {
      const supportName = report.support_name;
      if (!supportName) return;

      if (!supportStats[supportName]) {
        supportStats[supportName] = { onTime: 0, overdue: 0, processing: 0, totalReports: 0 };
      }

      supportStats[supportName].totalReports += 1;

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

    const validSupportStats = Object.entries(supportStats)
      .filter(([supportName]) => supportName)
      .map(([supportName, stats]) => ({
        supportName,
        onTime: stats.onTime,
        overdue: stats.overdue,
        processing: stats.processing,
        totalReports: stats.totalReports,
      }));

    setSupportStats(validSupportStats);
    setSupportStatsFiltered(validSupportStats);
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

  // Call the calculateSupportStatistics when reports change
  useEffect(() => {
    if (reports.length > 0) {
      calculateSupportStatistics(reports);
    }
  }, [reports]);

  return (
    <div style={{ padding: '10px' }}>
      {/* Thống kê hỗ trợ Section */}
      <Divider orientation="left">Thống kê hỗ trợ</Divider>

      {/* Support Stats Date Range Filter */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h4 style={{ marginLeft: 10 }}>Lọc theo ngày hỗ trợ</h4>
        <RangePicker onChange={handleSupportStatsDateRangeChange} style={{ marginLeft: 20 }} />
      </div>

      {/* Support Stats Chart */}
      <Row gutter={50}>
        <Col span={24}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supportStatsFiltered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="supportName" />
              <YAxis />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
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
    </div>
  );
};

export default Statistics;

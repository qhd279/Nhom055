import React, { useState, useEffect } from 'react';
import { Row, Col, Divider, Table, Tag, DatePicker } from 'antd';
import moment from 'moment';

const StatisticsSupport2 = ({ reports }) => {
  const [filteredReports, setFilteredReports] = useState([]);
  const [supportStats, setSupportStats] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Function to calculate reward/penalty for each support
  const calculateRewardPenalty = (data) => {
    const stats = {};

    data.forEach((report) => {
      const supportName = report.support_name;
      if (!supportName) return;

      // Initialize if not already in the stats object
      if (!stats[supportName]) {
        stats[supportName] = { resolved: 0, resolvedLate: 0, totalReports: 0 };
      }

      // Count reports based on their status (resolved or resolved_late)
      if (report.status === 'resolved') {
        stats[supportName].resolved += 1;
        stats[supportName].totalReports += 1;
      } else if (report.status === 'resolved_late') {
        stats[supportName].resolvedLate += 1;
        stats[supportName].totalReports += 1;
      }
    });

    // Calculate on-time rate (percentage of resolved reports)
    const rewardPenaltyStats = Object.entries(stats).map(([supportName, stats]) => {
      const onTimeRate = (stats.resolved / stats.totalReports) * 100;
      let rewardPenalty = '';

      if (onTimeRate === 100) {
        rewardPenalty = 'Thưởng'; // Reward for 100% on-time completion
      } else if (onTimeRate < 80) {
        rewardPenalty = 'Phạt'; // Penalty for less than 80% on-time completion
      }

      return {
        supportName,
        resolved: stats.resolved,  // Number of reports resolved on time
        resolvedLate: stats.resolvedLate,  // Number of reports resolved late
        onTimeRate: onTimeRate.toFixed(2),
        totalReports: stats.totalReports,
        rewardPenalty,
      };
    });

    setSupportStats(rewardPenaltyStats);
  };

  // Lọc báo cáo theo tháng đã chọn
  const filterReportsForMonth = (month) => {
    // Nếu không có tháng, mặc định là tháng hiện tại
    if (!month) {
      month = moment();
    }
    
    const startMonth = month.toDate();
    const endMonth = month.toDate();
    const startOfMonth = moment(startMonth).startOf('month');
    const endOfMonth = moment(endMonth).endOf('month');

    const filtered = reports.filter((report) => {
      const reportDate = moment(report.submission_date);
      return reportDate.isBetween(startOfMonth, endOfMonth, null, '[]');
    });

    setFilteredReports(filtered);
    calculateRewardPenalty(filtered);
  };

  // Khi người dùng chọn tháng
  const handleMonthChange = (date) => {
    setSelectedMonth(date);
    filterReportsForMonth(date);
  };

  // Hàm useEffect để lọc báo cáo nếu đã có dữ liệu báo cáo và tháng đã được chọn
  useEffect(() => {
    if (reports.length > 0) {
      filterReportsForMonth(selectedMonth);  // Sử dụng selectedMonth (null hoặc tháng hiện tại)
    }
  }, [reports, selectedMonth]);

  // Columns for the Table
  const columns = [
    {
      title: 'Hỗ trợ',
      dataIndex: 'supportName',
      key: 'supportName',
    },
    {
      title: 'Tổng số công việc đã hoàn thành',
      dataIndex: 'totalReports',
      key: 'totalReports',
    },
    {
      title: 'Số công việc hoàn thành đúng hạn',
      dataIndex: 'resolved',
      key: 'resolved',
    },
    {
      title: 'Số công việc hoàn thành trễ',
      dataIndex: 'resolvedLate',
      key: 'resolvedLate',
    },
    {
      title: 'Tỉ lệ hoàn thành đúng hạn (%)',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
    },
    {
      title: 'Kết quả',
      dataIndex: 'rewardPenalty',
      key: 'rewardPenalty',
      render: (text) => (
        <Tag color={text === 'Thưởng' ? 'green' : text === 'Phạt' ? 'red' : 'default'}>{text}</Tag>
      ),
    },
  ];

   return (
    <div style={{ padding: '20px' }}>
      <Divider orientation="left">Danh sách thưởng/phạt</Divider>

      {/* Chọn tháng */}
      <Row style={{ marginBottom: '20px' }} justify="start">
  <Col span={6} style={{ paddingLeft: 0 }}>  {/* Adjust the span and padding to align to the left */}
    <DatePicker.MonthPicker
      value={selectedMonth}
      onChange={handleMonthChange}
      placeholder="Chọn tháng"
      style={{ width: 200 }}
    />
  </Col>
</Row>


      {/* Table Display for Reward/Penalty */}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Table
            dataSource={supportStats}
            columns={columns}
            rowKey="supportName"
            pagination={false}
          />
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsSupport2;
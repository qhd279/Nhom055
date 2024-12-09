import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Spin, message, Select, DatePicker, Modal, Form, Checkbox } from 'antd';
import ReportDetailsModal from '../components/ReportDetailsModal';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { FilterOutlined } from '@ant-design/icons'; 
import '../styles/CustomCheckbox.css';


const { Option } = Select;
const { RangePicker } = DatePicker;

const RepairHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoom, setFilterRoom] = useState('');  
  const [filterCompletionDateRange, setFilterCompletionDateRange] = useState([]);  
  const [rooms, setRooms] = useState([]); 
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
  
      const supportId = localStorage.getItem('userId');
      const url = `http://localhost:5000/api/reports/resolve/${supportId}`;
  
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
  
      const data = await response.json();
      if (data.success && Array.isArray(data.reports)) {
        let filteredReports = data.reports;
  
        
        const uniqueRooms = [...new Set(data.reports.map(report => report.room_name))];
        setRooms(uniqueRooms);
  
        if (filterDateRange.length === 2) {
          const startDate = filterDateRange[0].toDate();
          const endDate = filterDateRange[1].toDate();
          const start = moment(startDate).startOf('day');
          const end = moment(endDate).endOf('day');
  
          filteredReports = filteredReports.filter(report =>
            moment(report.assigned_date).isBetween(start, end, 'day', '[]')
          );
        }
  
        
        if (filterStatus.length > 0) {
          filteredReports = filteredReports.filter((report) => filterStatus.includes(report.status));
        }
  
       
        if (filterRoom.length > 0) {
          filteredReports = filteredReports.filter((report) => filterRoom.includes(report.room_name));
        }
  
        
        if (filterCompletionDateRange.length === 2) {
          const startDate = filterCompletionDateRange[0].toDate();
          const endDate = filterCompletionDateRange[1].toDate();
          const start = moment(startDate).startOf('day');
          const end = moment(endDate).endOf('day');
  
          filteredReports = filteredReports.filter(report =>
            moment(report.completion_date).isBetween(start, end, 'day', '[]')
          );
        }
  
        const sortedReports = filteredReports.sort((a, b) =>
          moment(b.submission_date).unix() - moment(a.submission_date).unix()
        );
        setReports(sortedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Error fetching reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('You need to log in first.');
      setLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);
    setIsAdmin(decodedToken.role === 'admin');

    fetchReports();
  }, [filterDateRange, filterStatus, filterRoom, filterCompletionDateRange]);

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  
  const clearAllFilters = () => {
    setFilterDateRange([]);
    setFilterStatus('');
    setFilterRoom('');
    setFilterCompletionDateRange([]);
    fetchReports(); 
  };

  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'report_id',
      key: 'report_id',
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (_, record) => `Máy ${record.computer_name} phòng ${record.room_name} đang gặp sự cố`,
    },
    {
      title: 'Ngày giao việc',
      dataIndex: 'assigned_date',
      key: 'assigned_date',
      render: (date) => moment(date).format('DD-MM-YYYY'),
      sorter: (a, b) => moment(a.submission_date).unix() - moment(b.submission_date).unix(),
    },
    {
      title: 'Ngày hoàn thành',
      dataIndex: 'completion_date',
      key: 'completion_date',
      render: (date) => date ? moment(date).format('DD-MM-YYYY') : 'Chưa hoàn thành',
      sorter: (a, b) => moment(a.completion_date).unix() - moment(b.completion_date).unix() || 0,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const statusColor = {
          pending: 'orange',         
          processing: 'blue',       
          resolved: 'green',         
          resolved_late: 'red',     
        };
      
        const statusText = {
          pending: 'Đang chờ',
          processing: 'Đang xử lý',
          resolved: 'Đã giải quyết',
          resolved_late: 'Đã giải quyết (trễ)',
        };
      
        return (
          <Tag color={statusColor[record.status] || 'default'}>
            {statusText[record.status] || record.status}
          </Tag>
        );
      },
      sorter: (a, b) => {
        const statusOrder = {
          pending: 1,
          processing: 2,
          resolved: 3,
          resolved_late: 4,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      },
    },
    {
      title: 'Lý do trễ',
      dataIndex: 'late_reason',
      key: 'late_reason',
      render: (text) => text,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => openModal(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
  <Button
    onClick={() => setIsFilterModalVisible(true)}
    type="default"
    style={{ marginRight: 16 }}
    icon={<FilterOutlined />}
  >
    Lọc công việc
  </Button>

  
  {filterDateRange.length > 0 && (
    <Tag
      color="blue"
      closable
      onClose={() => setFilterDateRange([])}
      style={{ fontSize: '14px', padding: '4px 12px', margin: '4px' }}
    >
      {moment(filterDateRange[0].toDate()).format('DD-MM-YYYY')} - {moment(filterDateRange[1].toDate()).format('DD-MM-YYYY')}
    </Tag>
  )}

  
  {filterStatus && filterStatus.length > 0 && filterStatus.map((status) => (
    <Tag
      key={status}
      color="blue"
      closable
      onClose={() => setFilterStatus(filterStatus.filter((item) => item !== status))}
      style={{ fontSize: '14px', padding: '4px 12px', margin: '4px' }}
    >
      {status === 'resolved' ? 'Đã hoàn thành' :
       status === 'resolved_late' ? 'Hoàn thành trễ' :
       status === 'pending' ? 'Chờ xử lý' : 'Đang xử lý'}
    </Tag>
  ))}

  
  {filterRoom && filterRoom.length > 0 && filterRoom.map((room) => (
    <Tag
      key={room}
      color="blue"
      closable
      onClose={() => setFilterRoom(filterRoom.filter((item) => item !== room))}
      style={{ fontSize: '14px', padding: '4px 12px', margin: '4px' }}
    >
      {room}
    </Tag>
  ))}

  
  {filterCompletionDateRange.length > 0 && (
    <Tag
      color="blue"
      closable
      onClose={() => setFilterCompletionDateRange([])}
      style={{ fontSize: '14px', padding: '4px 12px', margin: '4px' }}
    >
      {moment(filterCompletionDateRange[0].toDate()).format('DD-MM-YYYY')} - {moment(filterCompletionDateRange[1].toDate()).format('DD-MM-YYYY')}
    </Tag>
  )}

  
  {(filterDateRange.length > 0 || filterStatus.length > 0 || filterRoom.length > 0 || filterCompletionDateRange.length > 0) && (
    <Button
      type="danger"
      onClick={clearAllFilters}
      style={{ color: 'red' }}
    >
      Xóa tất cả
    </Button>
  )}
</div>


      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="report_id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          isAdmin={isAdmin}
        />
      )}

      <Modal
        title="Lọc Công Việc"
        visible={isFilterModalVisible}
        onCancel={() => setIsFilterModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form layout="vertical">
          <Form.Item label="Ngày giao việc">
            <RangePicker
              value={filterDateRange}
              onChange={setFilterDateRange}
              format="DD-MM-YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Ngày hoàn thành">
            <RangePicker
              value={filterCompletionDateRange}
              onChange={setFilterCompletionDateRange}
              format="DD-MM-YYYY"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Trạng thái">
  <Checkbox.Group
    value={filterStatus}
    onChange={(checkedValues) => setFilterStatus(checkedValues)}
  >
    <Checkbox value="resolved" className="custom-checkbox">Đã hoàn thành</Checkbox>
    <Checkbox value="resolved_late" className="custom-checkbox" >Hoàn thành trễ</Checkbox>
   
  </Checkbox.Group>
</Form.Item>

<Form.Item label="Phòng">
  <Checkbox.Group
    value={filterRoom}
    onChange={(checkedValues) => setFilterRoom(checkedValues)}
  >
    {rooms.map((room) => (
      <Checkbox key={room} value={room} className="custom-checkbox">
        {room}
      </Checkbox>
    ))}
  </Checkbox.Group>
</Form.Item>


          <Form.Item style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={() => { fetchReports(); setIsFilterModalVisible(false); }}>Áp dụng</Button>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default RepairHistory;

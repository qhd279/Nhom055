import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Spin, message, Select, DatePicker, Modal, Form, Checkbox } from 'antd';
import ReportDetailsModal from '../components/ReportDetailsModal';
import CompleteReportModal from '../components/CompleteReportModal';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { FilterOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ManageTasks = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState([]); 
  const [filterCompletionDateRange, setFilterCompletionDateRange] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]); 
  const [selectedRoomNames, setSelectedRoomNames] = useState([]); 
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: [],
    roomNames: [], 
    completionDateRange: [], 
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const supportId = localStorage.getItem('userId');
      const url = `http://localhost:5000/api/reports/processing/${supportId}`;

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
        const rooms = [...new Set(data.reports.map(report => report.room_name))];
        setAvailableRooms(rooms);

        let filteredReports = data.reports;

        
        if (filterDateRange.length === 2) {
          const startDate = filterDateRange[0].toDate();
          const endDate = filterDateRange[1].toDate();
          const start = moment(startDate).startOf('day');
          const end = moment(endDate).endOf('day');

          filteredReports = filteredReports.filter(report =>
            moment(report.assigned_date).isBetween(start, end, 'day', '[]')
          );
        }

        
        if (filterCompletionDateRange.length === 2) {
          const startDate = filterCompletionDateRange[0].toDate();
          const endDate = filterCompletionDateRange[1].toDate();
          const start = moment(startDate).startOf('day');
          const end = moment(endDate).endOf('day');

          filteredReports = filteredReports.filter(report =>
            moment(report.expected_completion_date).isBetween(start, end, 'day', '[]')
          );
        }

        
        if (selectedRoomNames.length > 0) {
          filteredReports = filteredReports.filter(report =>
            selectedRoomNames.includes(report.room_name)
          );
        }

        setReports(filteredReports);
      } else {
        setReports([]);
      }
    } catch (error) {
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
    fetchReports();
  }, [filterDateRange, selectedRoomNames, filterCompletionDateRange]); 

  const openCompleteModal = (report) => {
    setSelectedReport(report);
    setIsCompleteModalVisible(true);
  };

  const closeCompleteModal = async () => {
    setIsCompleteModalVisible(false);
    setSelectedReport(null);
    await fetchReports();
  };

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setIsDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedReport(null);
  };

  const taskColumns = [
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
      render: (date) => date ? moment(date).format('DD-MM-YYYY') : 'Chưa có',
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expected_completion_date',
      key: 'expected_completion_date',
      render: (date) => moment(date).format('DD-MM-YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button type="primary" onClick={() => openDetailsModal(record)}>
            Xem chi tiết
          </Button>
          <Button
            style={{ marginLeft: '8px' }}
            onClick={() => openCompleteModal(record)}
            disabled={record.status === 'resolved'}
          >
            Hoàn thành
          </Button>
        </div>
      ),
    },
  ];

  const handleFilterChange = () => {
    setSelectedFilters({
      dateRange: filterDateRange,
      roomNames: selectedRoomNames,
      completionDateRange: filterCompletionDateRange, 
    });
    setIsFilterModalVisible(false);
  };

  const handleRemoveFilter = (filterType, value) => {
    const newFilters = { ...selectedFilters };
    
    if (filterType === 'roomNames') {
      
      newFilters.roomNames = newFilters.roomNames.filter(room => room !== value);
      setSelectedRoomNames(newFilters.roomNames);
    } else {
      
      newFilters[filterType] = [];
      if (filterType === 'dateRange') setFilterDateRange([]);
      if (filterType === 'completionDateRange') setFilterCompletionDateRange([]);
    }
    
    setSelectedFilters(newFilters);
  };
  

  const clearAllFilters = () => {
    setFilterDateRange([]);
    setSelectedRoomNames([]);
    setFilterCompletionDateRange([]);
    setSelectedFilters({
      dateRange: [],
      roomNames: [],
      completionDateRange: [],
    });
    fetchReports();
  };

  const renderSelectedFilters = () => {
    const filters = [];
    const tagStyle = { fontSize: '14px', padding: '4px 12px', margin: '4px' };
  
    if (selectedFilters.dateRange.length === 2) {
      filters.push(
        <Tag
          key="dateRange"
          color="blue"
          closable
          onClose={() => handleRemoveFilter('dateRange')}
          style={tagStyle}
        >
          {moment(selectedFilters.dateRange[0].toDate()).format('DD-MM-YYYY')} - {moment(selectedFilters.dateRange[1].toDate()).format('DD-MM-YYYY')}
        </Tag>
      );
    }
  
    if (selectedFilters.roomNames.length > 0) {
      selectedFilters.roomNames.forEach((room) =>
        filters.push(
          <Tag
            key={`room-${room}`}
            color="blue"
            closable
            onClose={() => handleRemoveFilter('roomNames', room)}
            style={tagStyle}
          >
            {room}
          </Tag>
        )
      );
    }
  
    if (selectedFilters.completionDateRange.length === 2) {
      filters.push(
        <Tag
          key="completionDateRange"
          color="blue"
          closable
          onClose={() => handleRemoveFilter('completionDateRange')}
          style={tagStyle}
        >
          {moment(selectedFilters.completionDateRange[0].toDate()).format('DD-MM-YYYY')} - {moment(selectedFilters.completionDateRange[1].toDate()).format('DD-MM-YYYY')}
        </Tag>
      );
    }
  
    return filters;
  };
  

  return (
    <div>
      <h2>Danh Sách Công Việc</h2>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button
          type="default"
          onClick={() => setIsFilterModalVisible(true)}
          style={{ marginRight: 16 }}
        >
          <FilterOutlined /> Lọc công việc
        </Button>

        {renderSelectedFilters()}

        {(selectedFilters.dateRange.length > 0 || selectedFilters.roomNames.length > 0 || selectedFilters.completionDateRange.length > 0) && (
          <Button
            type="danger"
            onClick={clearAllFilters}
            style={{ color: 'red' }}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

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
              style={{ width: '100%' }}
              format="DD-MM-YYYY"
            />
          </Form.Item>

          <Form.Item label="Ngày hết hạn">
            <RangePicker
              value={filterCompletionDateRange}
              onChange={setFilterCompletionDateRange}
              style={{ width: '100%' }}
              format="DD-MM-YYYY"
            />
          </Form.Item>

  

          <Form.Item label="Phòng">
  <Checkbox.Group
    value={selectedRoomNames}
    onChange={setSelectedRoomNames}
  >
    {availableRooms.map(room => (
      <Checkbox
        key={room}
        value={room}
        className="custom-checkbox" 
      >
        {room}
      </Checkbox>
    ))}
  </Checkbox.Group>
</Form.Item>


          <Form.Item style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={handleFilterChange}>
              Áp dụng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={reports}
          columns={taskColumns}
          rowKey="report_id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}

      {isCompleteModalVisible && selectedReport && (
        <CompleteReportModal
          report={selectedReport}
          onClose={closeCompleteModal}
        />
      )}

      {isDetailsModalVisible && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isVisible={isDetailsModalVisible}
          onClose={closeDetailsModal}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default ManageTasks;

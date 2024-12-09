import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Spin, message, Checkbox, DatePicker, Modal, Form } from 'antd';
import ReportDetailsModal from '../components/ReportDetailsModal';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { FilterOutlined } from '@ant-design/icons';
import '../styles/CustomCheckbox.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const { RangePicker } = DatePicker;

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterDateRange, setFilterDateRange] = useState([]);
  const [filterRoomName, setFilterRoomName] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    dateRange: [],
    roomName: [],
  });

  
  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const url = 'http://localhost:5000/api/reports';

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

        
        if (filterStatus.length > 0) {
          filteredReports = filteredReports.filter(report => filterStatus.includes(report.status));
        }

        
        if (filterDateRange.length === 2) {
          const startDate = filterDateRange[0].toDate();
          const endDate = filterDateRange[1].toDate();
          const start = moment(startDate).startOf('day');
          const end = moment(endDate).endOf('day');
  
          filteredReports = filteredReports.filter(report =>
            moment(report.submission_date).isBetween(start, end, 'day', '[]')
          );
        }
  
        
        if (filterRoomName.length > 0) {
          filteredReports = filteredReports.filter(report =>
            filterRoomName.includes(report.room_name)
          );
        }

        
        filteredReports = filteredReports.filter(report =>
          report.report_type === 'report'  
        );

       
        const sortedReports = filteredReports.sort((a, b) => {
          const statusOrder = { pending: 1, processing: 2, resolved: 3, resolved_late: 4 };
          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }
          return moment(b.submission_date).unix() - moment(a.submission_date).unix();
        });

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
    if (decodedToken.role !== 'admin') {
      message.error('Access denied. Admins only.');
      return;
    }

    fetchReports();
  }, [filterStatus, filterDateRange, filterRoomName]);

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const adminColumns = [
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
      title: 'Ngày báo cáo',
      dataIndex: 'submission_date',
      key: 'submission_date',
      render: (date) => moment(date).format('DD-MM-YYYY'),
      sorter: (a, b) => moment(a.submission_date).unix() - moment(b.submission_date).unix(),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={
          record.status === 'pending' ? 'orange' :
            record.status === 'processing' ? 'blue' :
              record.status === 'resolved' ? 'green' :
                record.status === 'resolved_late' ? 'red' : 'default'
        }>
          {record.status === 'pending' ? 'Đang chờ' :
            record.status === 'processing' ? 'Đang xử lý' :
              record.status === 'resolved' ? 'Đã giải quyết' :
                record.status === 'resolved_late' ? 'Đã giải quyết (trễ)' : 'default'}
        </Tag>
      )
      ,
      sorter: (a, b) => {
        const statusOrder = { pending: 1, processing: 2, resolved: 3, resolved_late: 4 };
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

  const handleFilterChange = () => {
    setSelectedFilters({
      status: filterStatus,
      dateRange: filterDateRange,
      roomName: filterRoomName,
    });
    setIsFilterModalVisible(false);
  };

  const handleRemoveFilter = (filterType, value) => {
    const newFilters = { ...selectedFilters };

    if (filterType === 'status') {
      newFilters.status = newFilters.status.filter((status) => status !== value);
      setFilterStatus(newFilters.status);
    } else if (filterType === 'dateRange') {
      setFilterDateRange([]); 
    } else if (filterType === 'roomName') {
      newFilters.roomName = newFilters.roomName.filter((room) => room !== value);
      setFilterRoomName(newFilters.roomName);
    }
    setSelectedFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilterStatus([]);
    setFilterDateRange([]);
    setFilterRoomName([]);
    setSelectedFilters({
      status: [],
      dateRange: [],
      roomName: [],
    });
  };

  const renderSelectedFilters = () => {
    const filters = [];
    const tagStyle = { fontSize: '14px', padding: '4px 12px', margin: '4px' };

    if (selectedFilters.status.length > 0) {
      selectedFilters.status.forEach(status => {
        filters.push(
          <Tag
            key={status}
            color="blue"
            closable
            onClose={() => handleRemoveFilter('status', status)}
            style={tagStyle}
          >
            {status}
          </Tag>
        );
      });
    }

    if (filterDateRange.length === 2) {
      filters.push(
        <Tag
          key="dateRange"
          color="blue"
          closable
          onClose={() => handleRemoveFilter('dateRange')}
          style={tagStyle}
        >
      {moment(filterDateRange[0].toDate()).format('DD-MM-YYYY')} - {moment(filterDateRange[1].toDate()).format('DD-MM-YYYY')}
       
        </Tag>
      );
    }

    if (selectedFilters.roomName.length > 0) {
      selectedFilters.roomName.forEach(room => {
        filters.push(
          <Tag
            key={room}
            color="blue"
            closable
            onClose={() => handleRemoveFilter('roomName', room)}
            style={tagStyle}
          >
            {room}
          </Tag>
        );
      });
    }

    return filters;
  };

  return (
    <div>
      <h2>Danh Sách Báo Cáo Sự Cố</h2>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button
          type="default"
          onClick={() => setIsFilterModalVisible(true)}
          style={{ marginRight: 16 }}
        >
          <FilterOutlined />
          Lọc báo cáo
        </Button>

        {renderSelectedFilters()}

        {(selectedFilters.status.length > 0 || selectedFilters.dateRange.length > 0 || selectedFilters.roomName.length > 0) && (
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
        title="Lọc Báo Cáo"
        visible={isFilterModalVisible}
        onCancel={() => setIsFilterModalVisible(false)}
        onOk={handleFilterChange}
      >
        <Form layout="vertical">
          <Form.Item label="Trạng thái">
            <Checkbox.Group
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Checkbox value="pending" className="custom-checkbox">Chờ xử lý</Checkbox>
              <Checkbox value="processing" className="custom-checkbox">Đang xử lý</Checkbox>
              <Checkbox value="resolved" className="custom-checkbox">Đã giải quyết</Checkbox>
              <Checkbox value="resolved_late" className="custom-checkbox">Đã giải quyết (trễ)</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="Ngày báo cáo">
            <RangePicker
              value={filterDateRange}
              onChange={setFilterDateRange}
              style={{ width: '100%' }}
              format="DD-MM-YYYY"
            />
          </Form.Item>

          <Form.Item label="Tên phòng">
            <Checkbox.Group
              value={filterRoomName}
              onChange={setFilterRoomName}
            >
              {availableRooms.map(room => (
                <Checkbox key={room} value={room} className="custom-checkbox">{room}</Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={reports}
          columns={adminColumns}
          rowKey="report_id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isVisible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            fetchReports();
          }}
          isAdmin={true}
        />
      )}
      <ToastContainer/>
    </div>
  );
};

export default ManageReports;

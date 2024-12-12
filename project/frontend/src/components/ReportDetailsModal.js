import React, { useState, useEffect } from 'react'; 
import { Modal, List, DatePicker, Button, message, Select } from 'antd';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportDetailsModal = ({ report, isVisible, onClose, isAdmin }) => {
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(
    report.expected_completion_date ? moment(report.expected_completion_date) : null
  );
  
  const [supportUsers, setSupportUsers] = useState([]);
  const [selectedSupport, setSelectedSupport] = useState(report.room_support_id);

  useEffect(() => {
    if (isVisible && isAdmin) {
      const fetchSupportUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found');

          const response = await fetch('http://localhost:5000/api/users/support', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error('Failed to fetch users');
          const data = await response.json();

          setSupportUsers(data);
        } catch (error) {
          message.error('Error fetching support users');
        }
      };

      fetchSupportUsers();

    }
  }, [isVisible, isAdmin]);

  const handleDateChange = (date) => {
    setExpectedCompletionDate(date);
  };

  const handleSupportChange = (value) => {
    setSelectedSupport(value);
  };

  const handleAssignTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const payload = {
        expected_completion_date: expectedCompletionDate ? expectedCompletionDate.format('YYYY-MM-DD') : null,
        support_id: selectedSupport || null,
        status: 'processing',
        assigned_date: moment().format('YYYY-MM-DD'),
      };
    
      const response = await fetch(`http://localhost:5000/api/reports/${report.report_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onClose();
        toast.success("Gửi yêu cầu xử lý thành công");
      } else {
        throw new Error('Failed to update report');
      }
    } catch (error) {
      toast.error("Gửi yêu cầu xử lý thất bại.");
    }
  };

  const handleSupportButton = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
  
      
      const response = await fetch(`http://localhost:5000/api/computers/${report.computer_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
  
      
      const computerData = await response.json();
  
      
      console.log('Fetched computer data:', computerData);
  
      
      if (!computerData[0] || !Array.isArray(computerData[0].devices)) {
        console.log('Error: Devices not found or invalid format');
        throw new Error('Devices not found or invalid format');
      }
  
      
      const updateData = {
        computer_id: report.computer_id, 
        devices: computerData[0].devices.map(device => ({
          computer_device_id: device.computer_device_id,
          status: "installing", 
        })),
        software: []
      };
  
    
      console.log('Prepared update data:', updateData);
  
      
      const updateResponse = await fetch('http://localhost:5000/api/computers/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
  
      if (updateResponse.ok) {
        toast.success("Bạn đã nhận yêu cầu và thay đổi trạng thái thành công.");
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.error("Không thể nhận yêu cầu và thay đổi trạng thái.");
      console.error(error);  
    }
  };
  
  


  const isEditable = report.status === 'pending';
  const hasDeviceItems = report.device_items && report.device_items.length > 0;
  const hasSoftwareItems = report.software_items && report.software_items.length > 0;
 

  return (
    <Modal
      title={`Báo cáo : ${report.report_id}`}
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Thoát
        </Button>,
        !isAdmin && (
          <Button key="support" type="primary" onClick={handleSupportButton}>
            Đem máy đi
          </Button>
        ),
        isAdmin && report.status === 'pending' && (
          <Button key="assign" type="primary" onClick={handleAssignTask}>
            Giao việc
          </Button>
        ),
      ]}
    >
      {isAdmin && (
        <>
          <p><strong>Ngày hoàn thành dự kiến:</strong></p>
          <DatePicker
            value={expectedCompletionDate}
            onChange={handleDateChange}
            style={{ marginBottom: '16px', width: '100%' }}
            disabled={!isEditable}
          />
          
          <p><strong>Kỹ thuật viên:</strong></p>
          <Select
            value={selectedSupport}
            onChange={handleSupportChange}
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Chọn người phụ trách"
            disabled={!isEditable}
          >
            {supportUsers.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.fullname}
              </Select.Option>
            ))}
          </Select>
        </>
      )}

      {!hasDeviceItems && !hasSoftwareItems && (
        <>
          <p><strong>Mô tả: </strong></p>
          <p>Máy tính không hoạt động</p>
        </>
      )}

      {hasDeviceItems && (
        <List
          header={<strong>Thiết bị gặp sự cố:</strong>}
          dataSource={report.device_items}
          renderItem={(item) => (
            <List.Item>
              Thiết bị ID {item.computer_device_id} - Tên: {item.device_name} - Lý do: {item.reason}
            </List.Item>
          )}
        />
      )}

      {hasSoftwareItems && (
        <List
          header={<strong>Phần mềm gặp sự cố:</strong>}
          dataSource={report.software_items}
          renderItem={(item) => (
            <List.Item>
              Tên: {item.software_name} - Lý do: {item.reason}
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default ReportDetailsModal;

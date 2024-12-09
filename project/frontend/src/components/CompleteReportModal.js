import React, { useEffect, useState } from 'react';
import { Modal, Button, Select, List, message, Input } from 'antd';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CompleteReportModal = ({ report, onClose, onConfirm }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState({});
  const [reason, setReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [computerDetails, setComputerDetails] = useState([]);

  
  const isOverdue = moment().startOf('day').isAfter(moment(report.expected_completion_date).startOf('day'));

 
  useEffect(() => {
    if (isOverdue) {
      setReason("Không có"); 
    } else {
      setReason(null); 
    }
  }, [isOverdue]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/devices', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (Array.isArray(data)) {
          setDevices(data);
        } else {
          message.error('Unexpected response format from devices API');
        }
      } catch (error) {
        message.error('Error fetching devices');
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchComputerDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/computers/${report.computer_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setComputerDetails(data[0].devices || []); 
        } else {
          message.error('Unexpected response format from computers API');
        }
      } catch (error) {
        message.error('Error fetching computer details');
      }
    };

   
    if (report.device_items.length === 0 && report.software_items.length === 0) {
      fetchComputerDetails();
    }
  }, [report]); 

  const handleConfirm = async () => {
    
    const delayReason = reason === 'Khác' ? customReason : reason;
  
    
    const devicesToUse = report.device_items.length > 0 ? report.device_items : computerDetails;
    const softwareToUse = report.software_items.length > 0 ? report.software_items : [];
  
    
    const payload2 = {
      computer_id: report.computer_id,
      devices: devicesToUse.map((device) => ({
        computer_device_id: device.computer_device_id,
        status: "active",
      })),
      software: softwareToUse.map((software) => ({
        computer_software_id: software.computer_software_id,
        status: "active",
      })),
    };
  
    try {
      
      const responseStatusUpdate = await fetch('http://localhost:5000/api/computers/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload2),
      });
  
      if (!responseStatusUpdate.ok) throw new Error('Failed to update computer status');
  
      const updates = [];
      for (const item of devicesToUse) {
        const selectedDeviceId = selectedDevice[item.computer_device_id];
        if (selectedDeviceId && selectedDeviceId !== "Không thay thế") {
          updates.push({
            computer_device_id: item.computer_device_id,
            new_device_id: selectedDeviceId,
            quantity_change: 1,
          });
        }
      }
  
      if (updates.length > 0) {
        const payloadUpdateDevices = { updates };
  
        const responseUpdateDevices = await fetch('http://localhost:5000/api/computers/update-devices', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadUpdateDevices),
        });
  
        if (!responseUpdateDevices.ok) throw new Error('Failed to update devices');
      }
  
      
      const status = isOverdue && delayReason ? 'resolved_late' : 'resolved';
  
     
      const payload = {
        completion_date: moment().format('YYYY-MM-DD'),
        status: status,
        late_reason: delayReason || null,  
      };
  
    //  console.log("Payload to send to API:", JSON.stringify(payload, null, 2));
      const response = await fetch(`http://localhost:5000/api/reports/${report.report_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        onClose();
        toast.success('Xác nhận hoàn thành công việc thành công');
      } else {
        throw new Error('Failed to update report');
      }
    } catch (error) {
     toast.error('Xác nhận hoàn thành công việc thất bại')
    }
  };
  

  const handleDeviceChange = (reportId, value) => {
    setSelectedDevice(prev => ({
      ...prev,
      [reportId]: value,
    }));
  };

  
  const renderDeviceItems = report.device_items.length > 0 ? report.device_items : computerDetails;
  const renderSoftwareItems = report.software_items.length > 0 ? report.software_items : [];

  return (
    <Modal
      title="Xác nhận hoàn thành báo cáo"
      visible={true}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm}>
          Xác nhận
        </Button>,
      ]}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      style={{ top: 20 }}
    >
      <h3>Nội dung:</h3>
      <p>{`Máy ${report.computer_name} phòng ${report.room_name} đang gặp sự cố`}</p>

      {renderDeviceItems.length > 0 && (
        <>
          <h4>Thiết bị bị lỗi:</h4>
          <List
            dataSource={renderDeviceItems}
            renderItem={(item) => (
              <List.Item style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{`Thiết bị bị lỗi: ${item.device_name}`}</span>
                <Select
                  style={{ width: '200px' }}
                  value={selectedDevice[item.computer_device_id] || "Không thay thế"}
                  onChange={(value) => handleDeviceChange(item.computer_device_id, value)}
                  placeholder="Chọn thiết bị tương tự (không bắt buộc)"
                >
                  {devices
                    .filter(device => device.device_type === item.device_type)
                    .map(device => (
                      <Select.Option key={device.device_id} value={device.device_id}>
                        {device.device_name}
                      </Select.Option>
                    ))}
                </Select>
              </List.Item>
            )}
          />
        </>
      )}

      {renderSoftwareItems.length > 0 && (
        <>
          <h4>Phần mềm bị lỗi:</h4>
          <List
            dataSource={renderSoftwareItems}
            renderItem={(software) => (
              <List.Item>
                {`Phần mềm: ${software.software_name}`}
              </List.Item>
            )}
          />
        </>
      )}

      {isOverdue && (
        <>
          <h4>Chọn lý do trễ:</h4>
          <Select
            style={{ width: '100%', marginBottom: '10px' }}
            value={reason || "Không có"} 
            placeholder="Chọn lý do trễ"
            onChange={setReason}
          >
            <Select.Option value="Không đủ thiết bị">Không đủ thiết bị</Select.Option>
            <Select.Option value="Không có">Không có</Select.Option>
            <Select.Option value="Khác">Khác</Select.Option>
          </Select>

          {reason === 'Khác' && (
            <Input
              placeholder="Nhập lý do khác"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default CompleteReportModal;

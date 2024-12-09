import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Input, DatePicker, message } from 'antd';
import { Option } from 'antd/es/mentions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ReportModal = ({
  visible,
  onClose,
  selectedComputer,
  selectedDevices,
  selectedSoftware,
  fetchComputers,
  setSelectedDevices,
  setSelectedSoftware,
  onSubmitReportSuccess, 
}) => {
  const [deviceReasons, setDeviceReasons] = useState({});
  const [softwareReasons, setSoftwareReasons] = useState({});
  const [customReasons, setCustomReasons] = useState({});
  const [completionDate, setCompletionDate] = useState(null);

  useEffect(() => {
    setDeviceReasons({});
    setSoftwareReasons({});
    setCustomReasons({});
    setCompletionDate(null);
  }, [visible]);

  const handleDeviceChange = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId) ? prev.filter(id => id !== deviceId) : [...prev, deviceId]
    );
    setDeviceReasons((prev) => ({ ...prev, [deviceId]: undefined }));
    setCustomReasons((prev) => ({ ...prev, [deviceId]: '' }));
  };

  const handleSoftwareChange = (softwareId) => {
    setSelectedSoftware((prev) =>
      prev.includes(softwareId) ? prev.filter(id => id !== softwareId) : [...prev, softwareId]
    );
    setSoftwareReasons((prev) => ({ ...prev, [softwareId]: undefined }));
    setCustomReasons((prev) => ({ ...prev, [softwareId]: '' }));
  };


  const handleDeviceReasonChange = (deviceId, reason) => {
    setDeviceReasons((prev) => ({ ...prev, [deviceId]: reason }));
    if (reason !== "Other") {
      setCustomReasons((prev) => ({ ...prev, [deviceId]: '' }));
    }
  };

  const handleSoftwareReasonChange = (softwareId, reason) => {
    setSoftwareReasons((prev) => ({ ...prev, [softwareId]: reason }));
    if (reason !== "Other") {
      setCustomReasons((prev) => ({ ...prev, [softwareId]: '' }));
    }
  };

  const handleCustomReasonChange = (id, value) => {
    setCustomReasons((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitReport = async () => {
    if (!selectedComputer) {
      message.error('Please select a computer before submitting the report.');
      return;
    }

    const userId = localStorage.getItem('userId');
    const currentDate = new Date().toISOString().split('T')[0];

    const reportDevices = selectedDevices.map(deviceId => {
      const reason = deviceReasons[deviceId] || "Không hoạt động";
      const customReason = customReasons[deviceId];
      const device = selectedComputer.devices.find(d => d.device_id === deviceId);
      return {
        computer_device_id: device.computer_device_id,
        reason: reason === "Other" && customReason ? customReason : reason,
      };
    });

    const reportSoftware = selectedSoftware.map(softId => {
      const reason = softwareReasons[softId] || "Không hoạt động";
      const customReason = customReasons[softId];
      const software = selectedComputer.software.find(s => s.software_id === softId);
      return {
        software_id: softId,
        computer_software_id: software.computer_software_id,
        reason: reason === "Other" && customReason ? customReason : reason,
      };
    });


    const reportData = {
      computer_id: selectedComputer.computer_id,
      devices: reportDevices,
      software: reportSoftware,
      expected_completion_date: completionDate,
      reporter_id: userId,
      submission_date: currentDate,
    };
    console.log("Payload to send to API:", JSON.stringify(reportData, null, 2));

    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const result = await response.json();

      
      const updateData = {
        computer_id: selectedComputer.computer_id,
        devices: reportDevices.map(device => ({
          computer_device_id: device.computer_device_id,
          status: "issue",
        })),
        software: reportSoftware.map(software => ({
          computer_software_id: software.computer_software_id,
          status: "issue",
        })),
      };

      const updateResponse = await fetch('http://localhost:5000/api/computers/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update computer status');
      }

      
      await fetchComputers();


      onSubmitReportSuccess();

      onClose();
      toast.success("Gửi báo cáo thành công");
    } catch (error) {
      console.error(error); 
      toast.error("Gửi báo cáo thất bại.");
    }
  };



  return (
    <Modal
      title="Tạo báo cáo"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmitReport}>
          Gửi báo cáo
        </Button>,
        
      ]}
      bodyStyle={{ padding: '20px', fontSize: '16px' }}
    >
      <div>
        {selectedDevices.length > 0 && (
          <>
            <h4>Thiết bị đã chọn:</h4>
            <div>
              {selectedDevices.map((deviceId) => {
                const device = selectedComputer?.devices.find(d => d.device_id === deviceId);
                return device ? (
                  <div key={deviceId} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>{device.device_name}</div>
                      <Select
                        placeholder="Select reason"
                        style={{ width: 200, marginLeft: '10px' }}
                        value={deviceReasons[deviceId] || "Không hoạt động"}
                        onChange={(value) => handleDeviceReasonChange(deviceId, value)}
                      >
                        <Option value="Liệt">Liệt</Option>
                        <Option value="Mất">Mất</Option>
                        <Option value="Không hoạt động">Không hoạt động</Option>
                        <Option value="Other">Khác</Option>
                      </Select>
                    </div>
                    {deviceReasons[deviceId] === "Other" && (
                      <Input
                        placeholder="Enter custom reason"
                        value={customReasons[deviceId] || ''}
                        onChange={(e) => handleCustomReasonChange(deviceId, e.target.value)}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </>
        )}

       
        {selectedSoftware.length > 0 && (
          <>
            <h4>Phần mềm đã chọn:</h4>
            <div>
              {selectedSoftware.map((softId) => {
                const software = selectedComputer?.software.find(s => s.software_id === softId);
                return software ? (
                  <div key={softId} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>{software.software_name}</div>
                      <Select
                        placeholder="Select reason"
                        style={{ width: 200, marginLeft: '10px' }}
                        value={softwareReasons[softId] || "Không hoạt động"}
                        onChange={(value) => handleSoftwareReasonChange(softId, value)}
                      >
                        <Option value="Hết bản quyền">Hết bản quyền</Option>
                        <Option value="Lỗi">Lỗi</Option>
                        <Option value="Không hoạt động">Không hoạt động</Option>
                        <Option value="Other">Khác</Option>
                      </Select>
                    </div>
                    {softwareReasons[softId] === "Other" && (
                      <Input
                        placeholder="Enter custom reason"
                        value={customReasons[softId] || ''}
                        onChange={(e) => handleCustomReasonChange(softId, e.target.value)}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </>
        )}

        
        <h4>Ngày sửa xong mong muốn:</h4>
        <DatePicker
          style={{ width: '100%' }}
          onChange={(date, dateString) => setCompletionDate(dateString)}
          placeholder="Chọn ngày sửa xong mong muốn"
        />
      </div>
    </Modal>
  );
};

export default ReportModal;

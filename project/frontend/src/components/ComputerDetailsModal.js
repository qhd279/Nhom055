import React, { useState } from 'react';
import { Modal, Button, Checkbox } from 'antd';
import ReportModal from './ReportModal'; 
import '../styles/CustomCheckbox2.css';


const ComputerDetailsModal = ({
  visible,
  onClose,
  selectedComputer,
  fetchComputers,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [isReportModalVisible, setReportModalVisible] = useState(false);

  const devices = selectedComputer.devices || [];
  const software = selectedComputer.software || [];

  const handleDeviceChange = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId) ? prev.filter(id => id !== deviceId) : [...prev, deviceId]
    );
  };

  const handleSoftwareChange = (softwareId) => {
    setSelectedSoftware((prev) =>
      prev.includes(softwareId) ? prev.filter(id => id !== softwareId) : [...prev, softwareId]
    );
  };

  const openReportModalHandler = () => {
    setReportModalVisible(true); 
  };

  const closeReportModalHandler = () => {
    setReportModalVisible(false); 
  };

  
  const onSubmitReportSuccess = () => {
    onClose(); 
  };

  return (
    <>
      
      <Modal
        title="Chi tiết máy tính"
        visible={visible && !isReportModalVisible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Thoát
          </Button>,
          <Button key="report" onClick={openReportModalHandler} type='primary'>
            Tạo báo cáo
          </Button>,
          
        ]}
      >
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="computer-info">
              <h4><strong>Tên máy tính:</strong> {selectedComputer.computer_name}</h4>
              <p className={`status ${selectedComputer.status}`}>{selectedComputer.status}</p>
            </div>

            <div className="device-section">
              <h4>Thiết bị</h4>
              {devices.length > 0 ? (
                devices.map((device) => (
                  <div
                    key={device.device_id}
                    className="device-item"
                    onClick={() => handleDeviceChange(device.device_id)} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                   
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                     
                      <Checkbox
                        checked={selectedDevices.includes(device.device_id)}
                        onChange={() => handleDeviceChange(device.device_id)}
                        
                       
                      />

                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div><strong>{device.device_type} : </strong>{device.device_name}</div>
                        <p className={`status ${device.status}`} style={{ marginLeft: 'auto', margin: 0 }}>
                        {device.status}
                      </p>
                      </div>
                    </div>

                  </div>

                ))
              ) : (
                <p>Không có thiết bị.</p>
              )}
            </div>

            <div className="software-section">
              <h4>Phần mềm</h4>
              {software.length > 0 ? (
                software.map((soft) => (
                  <div
                    key={soft.software_id}
                    className="software-item"
                    onClick={() => handleSoftwareChange(soft.software_id)} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Checkbox
                        checked={selectedSoftware.includes(soft.software_id)}
                        onChange={() => handleSoftwareChange(soft.software_id)}
                        
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{soft.software_name}</span>
                        <p className={`status ${soft.status}`} style={{ margin: 0 }}>
                          {soft.status}
                        </p>
                      </div>
                    </div>
                  </div>

                ))
              ) : (
                <p>Không có phần mềm nào được cài đặt.</p>
              )}
            </div>
          </>
        )}
      </Modal>

      
      <ReportModal
        visible={isReportModalVisible}
        onClose={closeReportModalHandler}
        selectedComputer={selectedComputer}
        selectedDevices={selectedDevices}
        selectedSoftware={selectedSoftware}
        fetchComputers={fetchComputers}
        onSubmitReportSuccess={onSubmitReportSuccess}
      />
    </>
  );
};

export default ComputerDetailsModal;

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { message, Dropdown, Menu, Button, Modal, Tooltip  } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ComputerDetailsModal from '../components/ComputerDetailsModal';
import AddComputer from '../components/AddComputer'; 
import UpdateComputerModal from '../components/UpdateComputerModal'; 
import '../styles/RoomDetails.css';
import { jwtDecode } from 'jwt-decode';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const RoomDetails = () => {
  const { room_id } = useParams();
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddComputerModalVisible, setIsAddComputerModalVisible] = useState(false); 
  const addComputerRef = useRef(); 
  const [isUpdateComputerModalVisible, setIsUpdateComputerModalVisible] = useState(false); 
  const [computerToUpdate, setComputerToUpdate] = useState(null);
  const token = localStorage.getItem('token');


  const userRole = token ? jwtDecode(token).role : null;

  useEffect(() => {
    if (room_id) {
      fetchComputers();
    }
  }, [room_id]);

  const fetchComputers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/computers/room/${room_id}/computers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch computers');
      const data = await response.json();
  

      const sortedData = data.sort((a, b) => a.computer_name.localeCompare(b.computer_name));
  
      setComputers(sortedData);  
    } catch (error) {
      console.error('Error fetching computers:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleCloseUpdateComputerModal = () => {
    setIsUpdateComputerModalVisible(false);
    setComputerToUpdate(null);
  };

  const handleComputerClick = async (computer) => {
    setSelectedComputer(computer);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedComputer(null);
  };

  const handleMenuClick = async (action, computerId, e) => {
    e.stopPropagation();
  
    if (action === 'update') {
      const computer = computers.find(comp => comp.computer_id === computerId);
      setComputerToUpdate(computer);
      setIsUpdateComputerModalVisible(true);
      
    } else if (action === 'delete') {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/computers/${computerId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Không thể xóa máy tính');
        }
        toast.success(`Xóa thành công!`); 

        
        fetchComputers(); 
      } catch (error) {
        console.error('Error deleting computer:', error);
        toast.error(`Xóa máy tính thất bại! Lỗi: ${error.message}`); // Use toast for error message
      }
    }
  };


  const menu = (computerId) => (
    <Menu onClick={({ key, domEvent }) => handleMenuClick(key, computerId, domEvent)}>
      <Menu.Item
        key="update"
        style={{
          color: '#1890ff',  
          fontWeight: 'bold',
          transition: 'background-color 0.3s, color 0.3s'
        }}
      
      >
          <EditOutlined style={{ marginRight: 8 }} />
          Cập nhật
      </Menu.Item>
      <Menu.Item
        key="delete"
        
        style={{
          color: '#ff4d4f',  
          fontWeight: 'bold',
          transition: 'background-color 0.3s, color 0.3s'
        }}
      
      >
          <DeleteOutlined style={{ marginRight: 8 }} />
          Xóa
      </Menu.Item>
    </Menu>
  );
  const handleCardClick = (e, computer) => {
    e.stopPropagation();
    handleComputerClick(computer);
  };

  const handleAddComputerModal = () => {
    setIsAddComputerModalVisible(true);
    
  };

  const handleCloseAddComputerModal = () => {
    setIsAddComputerModalVisible(false);
    
  };
  

  const handleSubmitAddComputer = () => {
    addComputerRef.current.submitForm(); 
  };

  return (
    <div className="room-details">
      <h2>Danh sách máy tính</h2>
  
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="status-legend" style={{ display: 'flex', alignItems: 'center' }}>
          <h4 style={{ marginRight: '10px' }}>Chú thích: </h4>
          <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '#1890ff', marginRight: '8px' }}></span>
          Máy tính đang hoạt động
          <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '#f44336', margin: '0 8px' }}></span>
          Máy tính gặp sự cố
          <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: "orange", margin: '0 8px' }}></span>
          Đang cài đặt
        </div>
  
        {userRole === 'admin' && (
          <Button
            type="primary"
            onClick={handleAddComputerModal}
          >
            Thêm máy tính
          </Button>
        )}
      </div>
  
      <div className="computer-list">
        {computers.length > 0 ? (
          computers.map((computer) => (
            <div
              key={computer.computer_id}
              className={`computer-card ${computer.status}`}
              onClick={(e) => handleCardClick(e, computer)} 
            >
              <div className="computer-name">{computer.computer_name}</div>
              
              
              {userRole === 'admin' && (
                <Dropdown overlay={menu(computer.computer_id)} trigger={['click']} placement="topRight">
                  <div className="menu-icon" onClick={(e) => e.stopPropagation()}>...</div>
                </Dropdown>
              )}
            </div>
          ))
        ) : (
          <p>Không có máy tính nào trong phòng này.</p>
        )}
      </div>
  
      {selectedComputer && (
        <ComputerDetailsModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          selectedComputer={selectedComputer}
          fetchComputers={fetchComputers}
        />
      )}
      
      {computerToUpdate && (
        <UpdateComputerModal
          visible={isUpdateComputerModalVisible}
          onClose={handleCloseUpdateComputerModal}
          computerData={computerToUpdate}
          fetchComputers={fetchComputers}
          room_id={room_id}
        />
      )}
  
      <Modal
        title="Thêm máy tính"
        visible={isAddComputerModalVisible}
        onCancel={handleCloseAddComputerModal}
        footer={(
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <Button onClick={handleCloseAddComputerModal} style={{ marginRight: '10px' }}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmitAddComputer}
            >
              Thêm
            </Button>
          </div>
        )}
        width={550}
        style={{ top: 10 }} 
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }} 
      >
        <AddComputer 
          ref={addComputerRef} 
          fetchComputers={fetchComputers} 
          onClose={handleCloseAddComputerModal} 
          room_id={room_id}
        />
      </Modal>
      <ToastContainer />
    </div>
  );
  
};

export default RoomDetails;

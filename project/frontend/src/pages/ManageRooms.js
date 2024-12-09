import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Modal,
  Form,
  Input as AntInput,
  Select,
} from 'antd';
import { DesktopOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AddRoomComputer from '../components/AddRoomComputer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Option } = Select;

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [role, setRole] = useState('');
  const [supportPersons, setSupportPersons] = useState([]);
  const [newRoomData, setNewRoomData] = useState({ room_name: '', support_id: undefined });

  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    fetchRooms();
  };

  const handleOpen = () => {
    if (formRef.current) {
      formRef.current.resetForm();
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSupportPersons();
  }, []);

  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
    setRole(decodedToken?.role || '');

    try {
      const response = await fetch('http://localhost:5000/api/rooms/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const roomsWithDetails = await Promise.all(data.map(async (room) => {
        const count = await fetchComputerCount(room.room_id, token);
        const userName = await fetchUserName(room.support_id, token);
        return { ...room, computer_count: count, support_person: userName };
      }));

      setRooms(roomsWithDetails);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportPersons = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/users/support', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch support persons');
      const data = await response.json();
      setSupportPersons(data);
    } catch (error) {
      console.error('Error fetching support persons:', error);
    }
  };

  const fetchComputerCount = async (roomId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/computer-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch computer count');
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching computer count:', error);
      return 0;
    }
  };

  const fetchUserName = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      return data.fullname;
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Unknown User';
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setIsEditModalVisible(true);
  };

  const updateRoom = async (roomName, supportId) => {
    const token = localStorage.getItem('token');
    if (selectedRoom) {
      try {
        const response = await fetch(`http://localhost:5000/api/rooms/${selectedRoom.room_id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_name: roomName, support_id: supportId }),
        });
  
        if (!response.ok) throw new Error('Failed to update room');
        await response.json();
        toast.success('Cập nhật thành công!');
      } catch (error) {
        console.error('Error updating room:', error);
        toast.error('Cập nhật thất bại');
      }
    }
  
    fetchRooms();
  };
  

  const handleEditModalOk = async (values) => {
    const { room_name, user_id } = values;
    await updateRoom(room_name, user_id);
    setIsEditModalVisible(false);
    setSelectedRoom(null);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setSelectedRoom(null);
  };

  const handleDeleteRoom = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomToDelete.room_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json(); 
        console.error('Failed to delete room:', errorData);
        throw new Error('Failed to delete room');
      }
  
      setRooms((prevRooms) => prevRooms.filter((room) => room.room_id !== roomToDelete.room_id));
      setIsDeleteModalVisible(false);
      fetchRooms();
      toast.success('Xóa thành công!');
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Xóa thất bại');
    }
  };
  


  const handleAddRoom = async (values) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) throw new Error('Failed to add room');
      await response.json();
      fetchRooms(); 
      toast.success('Thêm thành công!');
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Thêm thất bại');
    } finally {
      setIsAddModalVisible(false);
      setNewRoomData({ room_name: '', support_id: undefined }); 
    }
  };
  

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.support_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_id.toString().includes(searchTerm)
  );

  return (
    <div>
      <h2>Danh Sách Phòng Máy</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Input
          placeholder="Tìm kiếm phòng"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '300px' }}
        />
        {role === 'admin' && (
  <Button type="primary" onClick={showModal}>
    Thêm Phòng
  </Button>
)}
      </div>

      <Row gutter={16} style={{ flex: 1, justifyContent: 'flex-start' }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          filteredRooms.map((room) => (
            <Col span={6} key={room.room_id} style={{ marginBottom: 16 }}>
              <Card
                hoverable
                onClick={() => navigate(`/manage-rooms/${room.room_id}`)}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#fff',
                  position: 'relative',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#1890ff',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  color: '#fff',
                  margin: '0 auto 10px',
                  fontSize: '24px',
                }}>
                  <DesktopOutlined style={{ fontSize: '32px', color: '#ffffff' }} />
                </div>
                <h3 style={{ marginBottom: '10px', color: '#1890ff' }}>{room.room_name}</h3>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  <strong>Số Lượng Máy:</strong> {room.computer_count}
                </p>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  <strong>Người Hỗ Trợ:</strong> {room.support_person}
                </p>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: role === 'admin' ? 'flex' : 'none',
                  gap: '8px',
                }}>
                  <Button
                    icon={<EditOutlined style={{ color: '#1890ff' }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRoom(room);
                    }}
                    size="small"
                    shape="circle"
                  />
                  <Button
                    icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                    type="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room);
                    }}
                    size="small"
                    shape="circle"
                  />
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal for Edit Room */}
      <Modal
        title="Chỉnh Sửa Phòng"
        visible={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        bodyStyle={{ maxHeight: '400px', overflowY: 'auto' }} 
      >
        <Form
          key={selectedRoom?.room_id} 
          layout="vertical"
          onFinish={handleEditModalOk}
          initialValues={selectedRoom ? {
            room_name: selectedRoom.room_name,
            user_id: selectedRoom.support_id,
          } : {}}
        >
          <Form.Item
            label="Tên Phòng"
            name="room_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <AntInput />
          </Form.Item>

          <Form.Item
            label="Người Hỗ Trợ"
            name="user_id"
            rules={[{ required: true, message: 'Vui lòng chọn người hỗ trợ!' }]}
          >
            <Select placeholder="Chọn người hỗ trợ">
              {supportPersons.map((person) => (
                <Option key={person.id} value={person.id}>
                  {person.fullname}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập Nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      
      <Modal
        title="Tạo Phòng và Máy Tính"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={async () => {
            
            const success = await formRef.current.submitForm(); 
            if (success) {
              handleCancel(); 
            }
          }}>
            Thêm
          </Button>,
        ]}
        afterClose={handleOpen} 
        bodyStyle={{ maxHeight: '550px', overflowY: 'auto' }} 
        style={{ top: 20 }} 
      >
        <AddRoomComputer ref={formRef} onCloseModal={handleCancel} />
      </Modal>




      
      <Modal
        title="Xác Nhận Xóa"
        visible={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        bodyStyle={{ maxHeight: '200px', overflowY: 'auto' }}
      >
        <p>Bạn có chắc chắn muốn xóa phòng "{roomToDelete?.room_name}" không?</p>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default ManageRooms;

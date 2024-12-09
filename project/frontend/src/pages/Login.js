import React, { useState } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { jwtDecode } from 'jwt-decode'; 
import '../styles/Login.css'; 

const Login = ({ setIsAuthenticated, setUserRole }) => {
    const [id, setId] = useState(''); 
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { id, password }); 
            const token = response.data.token;
            localStorage.setItem('token', token);

            const decoded = jwtDecode(token); 
            localStorage.setItem('userId', decoded.id); 
            localStorage.setItem('user', JSON.stringify(decoded));

            setIsAuthenticated(true);
            setUserRole(decoded.role); 

            toast.success('Đăng nhập thành công!'); 

            if (decoded.role === 'admin') {
                navigate('/manage-reports');
            } else if (decoded.role === 'teacher') {
                navigate('/manage-rooms');
            } else if (decoded.role === 'support') {
                navigate('/manage-tasks');
            }

        } catch (error) { 
            if (error.response && error.response.status === 401) {
                toast.error('Đăng nhập thất bại.');
            } else {
                toast.error('Đã xảy ra lỗi, vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="container"> 
    <div className="image-section"> 
        <img src="background.jpg" alt="Hình ảnh mô tả" /> 
    </div> 
    <div className="login-section"> 
        <img src="logo1.png" alt="Logo" className="logo" /> 
        <form className="login-form" onSubmit={handleSubmit}> 
            <h1>Đăng Nhập</h1> 
            <input 
                type="text" 
                placeholder="Tài khoản" 
                value={id} 
                onChange={(e) => setId(e.target.value)} 
                required 
            /> 
            <input 
                type="password" 
                placeholder="Mật khẩu" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            /> 
            <button type="submit">Đăng Nhập</button> 
            <div className="footer"> 
                <a href="#">Quên mật khẩu?</a> 
            </div> 
        </form> 
    </div> 
    <ToastContainer /> 
</div>

    );
}; 

export default Login;

import React from 'react'
import './Login.css';
import icon from '../../assets/img/icon.png';
import background from '../../assets/img/background.png';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useProject();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }
  };
  return (
    <div className="login-container">
      <div className="login-box">
        <form className="left" onSubmit={handleLogin}>
          <img src={icon} alt="logo" className="logo" />
          <h2 >BỘ XÂY DỰNG</h2>
          <h3>CỤC KINH TẾ QUẢN LÝ<br />ĐẦU TƯ XÂY DỰNG</h3>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tài khoản" 
          />
          <input 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password" 
            placeholder="Mật khẩu" 
          />
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          <div className="buttons">
            <button className="login-btn">Đăng nhập</button>
            <button className="exit-btn">Thoát</button>
          </div>
        </form>
        <div className="right" style={{ backgroundImage: `url(${background})` }}>
          <div className="overlay">
            <p>
              Hệ thống quản lý,<br />
              giám sát, dự báo,<br />
              cảnh báo tiến độ và<br />
              chất lượng các dự án<br />
              đường bộ.
            </p>
            <span className="bottom-text">Dữ liệu đường bộ toàn quốc 2025</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
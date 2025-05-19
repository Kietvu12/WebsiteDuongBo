import React from 'react'
import './Login.css';
import icon from '../../assets/img/icon.png';
import background from '../../assets/img/background.png';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/home');
  };
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="left">
          <img src={icon} alt="logo" className="logo" />
          <h2>BỘ XÂY DỰNG</h2>
          <h3>CỤC KINH TẾ QUẢN LÝ<br />ĐẦU TƯ XÂY DỰNG</h3>
          <input type="text" placeholder="Tài khoản" />
          <input type="password" placeholder="Mật khẩu" />
          <div className="buttons">
            <button className="login-btn" onClick={handleLogin}>Đăng nhập</button>
            <button className="exit-btn">Thoát</button>
          </div>
        </div>
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
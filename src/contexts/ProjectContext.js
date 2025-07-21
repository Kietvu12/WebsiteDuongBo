import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  // Lấy giá trị từ localStorage khi khởi tạo
  const getInitialState = (key) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : null;
    }
    return null;
  };

  const [selectedProjectId, setSelectedProjectId] = useState(() => 
    getInitialState('selectedProjectId')
  );
  const [selectedSubProjectId, setSelectedSubProjectId] = useState(() => 
    getInitialState('selectedSubProjectId')
  );

  // Lưu vào localStorage mỗi khi giá trị thay đổi
  useEffect(() => {
    localStorage.setItem('selectedProjectId', JSON.stringify(selectedProjectId));
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem('selectedSubProjectId', JSON.stringify(selectedSubProjectId));
  }, [selectedSubProjectId]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      const fullUser = response.data.user;
      console.log(fullUser);
      
      const filteredUser = {
        NguoiDungID: fullUser.NguoiDungID,
        role: fullUser.PhanQuyenID,
        nhathau: fullUser.NhaThauID
      };
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(filteredUser));
      setUser(response.data.user);
      setAuthChecked(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Đăng nhập thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      await axios.put(
        `${API_BASE_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Đổi mật khẩu thất bại'
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        logout();
      } finally {
        setAuthChecked(true);
      }
    } else {
      setAuthChecked(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthChecked(true);
  };


  return (
    <ProjectContext.Provider 
      value={{ 
        selectedProjectId, 
        setSelectedProjectId, 
        selectedSubProjectId,
        setSelectedSubProjectId,
        user,
        loading,
        authChecked,
        login,
        changePassword,
        fetchUserProfile,
        logout  
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);

import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './page/Login/Login';
import DashBoard from './page/DashBoard/DashBoard';
import Sidebar from './component/SideBar/Sidebar';
import Detail from './page/Detail/Detail';
import Plan from './page/Plan/Plan';
import SideProject from './page/SideProject/SideProject';
import ProjectReport from './page/ProjectReport/ProjectReport';
import WorkItem from './page/WorkItem/WorkItem';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import ProjectProgress from './page/ProjectProgress/ProjectProgress';
import ChatbotButton from './component/ChatbotButton/ChatbotButton';
import Approvals from './page/Approvals/Approvals';
import MapBoard from './page/MapBoard/MapBoard';
import AddNewProject from './page/AddNewProject/AddNewProject';
import AddNewSubProject from './page/AddNewSubProject/AddNewSubProject';
import AddNewPackage from './page/AddNewPackage/AddNewPackage';
import AddNewContructors from './page/AddNewContructors/AddNewContructors';
import { useEffect } from 'react';
import ConstructionProgress from './component/ConstructionProgress/ConstructionProgress';
import ConstructorProgress from './page/ConstructorProgress/ConstructorProgress';
import { useState } from 'react';
import AccountSetting from './page/AccountSetting/AccountSetting';
import ContractorDashboard from './page/CampaignDashboard/CampaignDashboard';
import ProjectProgressManagement from './page/CampaignDashboard/ProjectProgressManagement';
// Tạo một layout chứa sidebar
const LayoutWithSidebar = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Sidebar cố định */}
      <div style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto'
      }}
        className='z-10'>
        <Sidebar />
      </div>

      {/* Content scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        <div style={{ minHeight: '100%' }} className=''>
          {children}
          <div className="fixed bottom-6 right-6 z-40">
            <ChatbotButton />
          </div>
        </div>
      </div>
    </div>
  );
};

function AppWrapper() {
  return (
    <ProjectProvider>
      <App />
    </ProjectProvider>
  );
}

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { fetchUserProfile, loading, authChecked, user } = useProject();
  useEffect(() => {
    // Hàm gọi 2 API
    const capNhatTatCa = async () => {
      try {
        await fetch(`${API_BASE_URL}/capNhatTienDoTatCa`, { method: 'POST' });
        await fetch(`${API_BASE_URL}/goiThau/capNhatPhanTramTatCa`, { method: 'POST' });
        await fetch(`${API_BASE_URL}/cap-nhat-tien-do-tat-ca-nha-thau`, { method: 'POST' });
        console.log('Đã cập nhật thành công lúc: ', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
      }
    };

    // Gọi ngay khi component mount
    capNhatTatCa();

    // Gọi lại mỗi 1 tiếng (3600000 ms)
    const interval = setInterval(capNhatTatCa, 3600000);

    // Clear interval khi component unmount
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading || !authChecked) return <div>Đang tải thông tin người dùng...</div>;
  function ResponsiveZoom({ children }) {
    const [scale, setScale] = useState(1.1); // Mặc định 110%

    useEffect(() => {
      function handleResize() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 2620) {
          setScale(1.4);
        }
        if (screenWidth >= 2420) {
          setScale(1.32);
        }
        else if (screenWidth >= 2220) {
          setScale(1.2);
        }
        else if (screenWidth >= 2020) {
          setScale(1.1);
        }
        else if (screenWidth >= 1920) {
          setScale(1);
        }
        else if (screenWidth >= 1850) {
          setScale(0.98);
        }
        else if (screenWidth >= 1740) {
          setScale(0.96);
        } 
        else if (screenWidth >= 1640) {
          setScale(0.85);
          
        }else if (screenWidth >= 1620) {
          setScale(0.83);
          
        }else if (screenWidth >= 1545) {
          setScale(0.74);
          
        } else if (screenWidth >= 1540) {
          setScale(0.78);
        }
        else if (screenWidth >= 1520) {
          setScale(0.78);
        }
        else if (screenWidth >= 1480) {
          setScale(0.75);
        }
        else if (screenWidth >= 1440) {
          setScale(0.7);

        } else if (screenWidth >= 1420) {
          setScale(0.7);
        } else if (screenWidth >= 1340) {
          setScale(0.65);
        } else if (screenWidth >= 1300) {
          setScale(0.63);

        } else if (screenWidth >= 1280) {
          setScale(0.65);
        } else if (screenWidth >= 1240) {
          setScale(0.6);
        }
        else if (screenWidth >= 1220) {
          setScale(0.58);
        }else if (screenWidth >= 1140) {
          setScale(0.54);

        } 
        else if (screenWidth >= 1040) {
          setScale(0.5);

        }else if (screenWidth >= 1024) {
          setScale(0.62);
        }
        else if (screenWidth >= 945) {
          setScale(0.6);

        } else if (screenWidth >= 768) {
          setScale(0.5);
        } else {
          setScale(1);
        }
      }

      // Gọi ngay lần đầu
      handleResize();

      // Lắng nghe sự kiện resize
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`
      }}>
        {children}
      </div>
    );
  }

  return (
    <ProjectProvider>
      <Router basename="/dadb">
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/home' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ResponsiveZoom>
                  <DashBoard />
                </ResponsiveZoom>
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/map-views' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ResponsiveZoom>
                <MapBoard />
                </ResponsiveZoom>
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/detail' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Detail />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/account-settings' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <AccountSetting />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/plan' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Plan />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/side-project/:DuAnID' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <SideProject />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/project-report/:projectId' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ProjectReport />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/work-items' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ResponsiveZoom>
                  <WorkItem />
                </ResponsiveZoom>
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/project-progress' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ProjectProgress />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/approvals' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Approvals />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/add-new' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <AddNewProject />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/add-new/:projectId' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <AddNewSubProject />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/add-new-package/:projectId' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <AddNewPackage />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/add-new-contructor' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <AddNewContructors />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/contractor-dashboard' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ContractorDashboard />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/contractor-progress' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ProjectProgressManagement />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/project-progress-management' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ProjectProgressManagement />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useProject();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" />;
  }

  // Nếu là nhà thầu (quyền 9) và đang truy cập trang chính, chuyển hướng sang work-items
  if (user.PhanQuyenID === 9 && location.pathname === '/home') {
    return <Navigate to="/work-items" />;
  }

  return children;
};

export default AppWrapper;
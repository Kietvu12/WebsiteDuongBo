
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
import AccountSetting from './page/AccountSetting/AccountSetting';
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

  return (
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/home' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                {user?.PhanQuyenID === 9 ? <Navigate to="/work-items" replace /> : <DashBoard />}
              </LayoutWithSidebar>
            </ProtectedRoute>
          } />
          <Route path='/map-views' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <MapBoard />
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
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
                  <WorkItem />
                </div>
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
          <Route path='/constructor-progress' element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ConstructorProgress />
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

  // Nếu là quyền 9 và đang truy cập trang khác work-item

  return children;
};

export default AppWrapper;
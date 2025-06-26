
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useEffect } from 'react';

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
      }}>
        <Sidebar />
      </div>
      
      {/* Content scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        <div style={{ minHeight: '100%' }}>
          {children}
          <ChatbotButton />
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
  const { fetchUserProfile, loading, authChecked } = useProject();
  
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
              <DashBoard />
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
        <Route path='/plan' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <Plan/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/side-project/:DuAnID' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <SideProject/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/project-report/:projectId' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <ProjectReport/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/work-items' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <WorkItem/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/project-progress' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <ProjectProgress/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/approvals' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <Approvals/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/add-new' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <AddNewProject/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/add-new/:projectId' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <AddNewSubProject/>
            </LayoutWithSidebar>
          </ProtectedRoute>
        } />
        <Route path='/add-new-package/:projectId' element={
          <ProtectedRoute>
            <LayoutWithSidebar>
              <AddNewPackage/>
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
  return user ? children : <Navigate to="/" />;
};

export default AppWrapper;
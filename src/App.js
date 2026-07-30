
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import Login from './page/Login/Login';
import DashBoard from './page/DashBoard/DashBoard';
import Overview from './page/Overview/Overview';
import Sidebar from './component/SideBar/Sidebar';
import Detail from './page/Detail/Detail';
import Plan from './page/Plan/Plan';
import SideProject from './page/SideProject/SideProject';
import ProjectReport from './page/ProjectReport/ProjectReport';
import WorkItem from './page/WorkItem/WorkItem';
import { ProjectProvider } from './contexts/ProjectContext';
import ProjectProgress from './page/ProjectProgress/ProjectProgress';
import ChatbotButton from './component/ChatbotButton/ChatbotButton';
import Approvals from './page/Approvals/Approvals';

// Layout chứa sidebar - giữ nguyên logic gốc, thêm toggle
const LayoutWithSidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      {/* Floating toggle button when sidebar is collapsed */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed', top: 10, left: 10, zIndex: 1000,
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid #ddd', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title="Mở menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
        <ChatbotButton />
      </div>
    </div>
  );
};

function App() {
  return (
    <ProjectProvider>
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />

        <Route path='/overview' element={
          <LayoutWithSidebar>
            <Overview />
          </LayoutWithSidebar>
        } />

        <Route path='/home' element={
          <LayoutWithSidebar>
            <DashBoard />
          </LayoutWithSidebar>
        } />
        <Route path='/detail' element={
          <LayoutWithSidebar>
            <Detail />
          </LayoutWithSidebar>
        } />
        <Route path='/plan' element={
          <LayoutWithSidebar>
            <Plan/>
          </LayoutWithSidebar>
        } />
        <Route path='/side-project/:DuAnID' element={
          <LayoutWithSidebar>
            <SideProject/>
          </LayoutWithSidebar>
        } />
        <Route path='/project-report/:projectId' element={
          <LayoutWithSidebar>
            <ProjectReport/>
          </LayoutWithSidebar>
        } />
        <Route path='/work-items/:projectId' element={
          <LayoutWithSidebar>
            <WorkItem/>
          </LayoutWithSidebar>
        } />
        <Route path='/project-progress/:projectId' element={
          <LayoutWithSidebar>
            <ProjectProgress/>
          </LayoutWithSidebar>
        } />
        <Route path='/approvals/:projectId' element={
          <LayoutWithSidebar>
            <Approvals/>
          </LayoutWithSidebar>
        } />
      </Routes>
    </Router>
    </ProjectProvider>
  );
}

export default App;
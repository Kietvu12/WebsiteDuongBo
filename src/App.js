
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
import { ProjectProvider } from './contexts/ProjectContext';
import ProjectProgress from './page/ProjectProgress/ProjectProgress';
import ChatbotButton from './component/ChatbotButton/ChatbotButton';
import Approvals from './page/Approvals/Approvals';
import MapBoard from './page/MapBoard/MapBoard';
// Tạo một layout chứa sidebar
const LayoutWithSidebar = ({ children }) => {
  
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
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

        <Route path='/home' element={
          <LayoutWithSidebar>
            <DashBoard />
          </LayoutWithSidebar>
        } />
        <Route path='/map-views' element={
          <LayoutWithSidebar>
            <MapBoard />
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
import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import logoSidebar from '../../assets/img/logo_sidebar.png';
import projectIcon from '../../assets/img/project-icon.png';
import downIcon from '../../assets/img/down.png';
import progressIcon from '../../assets/img/progress-icon.png';
import requirementsIcon from '../../assets/img/requirements-icon.png';
import reportIcon from '../../assets/img/report-icon.png';
import settingIcon from '../../assets/img/setting-icon.png';
import backgroundSidebar from '../../assets/img/background_sidebar.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useParams} from 'react-router-dom';
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProjectId } = useProject();
  const [openMenus, setOpenMenus] = useState({
    project: true,
    progress: false,
    requirements: false,
    report: false,
    setting: false
  });

  const isDashboard = ['/home', '/'].includes(location.pathname);
  const handleNavigation = (path) => {
    if (path === '/home') {
      return navigate('/home');
    }
    const finalPath = selectedProjectId ? `${path}/${selectedProjectId}` : path;
    navigate(finalPath);
  };
  const handleDashboard = () => {
    navigate('/home');
  };

  const toggleMenu = (menu) => {
    if (isDashboard && menu !== 'project') return;
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  const isMenuItemDisabled = (menu) => {
    return isDashboard && menu !== 'project';
  };
  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ backgroundImage: `url(${backgroundSidebar})` }}>
        <div className="logo-container">
          <img src={logoSidebar} alt="Logo Bộ Xây Dựng" className="logo" />
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        </div>
      </div>
      
      <div className="menu-section">
        <div className="menu-item" onClick={() => toggleMenu('project')}>
          <img src={projectIcon} width="20" alt="Project Icon" />
          <span>Quản lý dự án</span>
          <img 
            src={downIcon} 
            width="16" 
            alt="Dropdown Icon" 
            className={`dropdown-icon ${openMenus.project ? 'open' : ''}`} 
          />
        </div>
        
        <div className={`submenu ${openMenus.project ? 'open' : ''}`}>
          <div className="submenu-item" onClick={handleDashboard}>Danh sách dự án</div>
          <div className="submenu-item">Thêm dự án mới</div>
          <div className="submenu-item">Phân loại dự án</div>
        </div>
      </div>
      <div className={`menu-section ${isDashboard ? 'disabled' : ''}`}>
        <div 
          className={`menu-item ${isMenuItemDisabled('progress') ? 'disabled' : ''}`} 
          onClick={() => !isMenuItemDisabled('progress') && toggleMenu('progress')}
        >
          <img src={progressIcon} width="20" alt="Progress Icon" />
          <span>Quản lý tiến độ</span>
          <img 
            src={downIcon} 
            width="16" 
            alt="Dropdown Icon" 
            className={`dropdown-icon ${openMenus.progress ? 'open' : ''}`} 
          />
        </div>  
        <div className={`submenu ${openMenus.progress ? 'open' : ''}`}>
          <div className="submenu-item" onClick={() => handleNavigation(`/work-items`)}>Hạng mục công việc</div>
          <div className="submenu-item" onClick={() => handleNavigation('/approvals')}>Đề xuất & phê duyệt</div>
          {/* <div className="submenu-item" onClick={() => handleNavigation('/plan')}>Kế hoạch thi công</div> */}
          <div className="submenu-item" onClick={() => handleNavigation(`/project-progress`)}>Báo cáo tiến độ</div>
        </div>
      </div>
      
      <div className={`menu-section ${isDashboard ? 'disabled' : ''}`}>
        <div 
          className={`menu-item ${isMenuItemDisabled('requirements') ? 'disabled' : ''}`} 
          onClick={() => !isMenuItemDisabled('requirements') && toggleMenu('requirements')}
        >
          <img src={requirementsIcon} width="20" alt="Requirements Icon" />
          <span>Nhà thầu thi công</span>
          <img 
            src={downIcon} 
            width="16" 
            alt="Dropdown Icon" 
            className={`dropdown-icon ${openMenus.requirements ? 'open' : ''}`} 
          />
        </div>
        <div className={`submenu ${openMenus.requirements ? 'open' : ''}`}>
          <div className="submenu-item" onClick={() => handleNavigation('/construction-areas')}>Khu vực thi công</div>
          <div className="submenu-item" onClick={() => handleNavigation('/completion-progress')}>Tiến độ hoàn thành</div>
        </div>
      </div>
      
      <div className={`menu-section ${isDashboard ? 'disabled' : ''}`}>
        <div 
          className={`menu-item ${isMenuItemDisabled('report') ? 'disabled' : ''}`} 
          onClick={() => !isMenuItemDisabled('report') && toggleMenu('report')}
        >
          <img src={reportIcon} width="20" alt="Report Icon" />
          <span>Báo cáo</span>
          <img 
            src={downIcon} 
            width="16" 
            alt="Dropdown Icon" 
            className={`dropdown-icon ${openMenus.report ? 'open' : ''}`} 
          />
        </div>
        <div className={`submenu ${openMenus.report ? 'open' : ''}`}>
          <div className="submenu-item" onClick={() => handleNavigation('/project-report')}>Báo cáo chi tiết theo dự án</div>
          <div className="submenu-item" onClick={() => handleNavigation('/contractor-report')}>Báo cáo theo các nhà thầu</div>
          <div className="submenu-item" onClick={() => handleNavigation('/export-excel')}>Xuất báo cáo Excel</div>
        </div>
      </div>
      
      <div className={`menu-section ${isDashboard ? 'disabled' : ''}`}>
        <div 
          className={`menu-item ${isMenuItemDisabled('setting') ? 'disabled' : ''}`} 
          onClick={() => !isMenuItemDisabled('setting') && toggleMenu('setting')}
        >
          <img src={settingIcon} width="20" alt="Settings Icon" />
          <span>Cài đặt hệ thống</span>
          <img 
            src={downIcon} 
            width="16" 
            alt="Dropdown Icon" 
            className={`dropdown-icon ${openMenus.setting ? 'open' : ''}`} 
          />
        </div>
        <div className={`submenu ${openMenus.setting ? 'open' : ''}`}>
          <div className="submenu-item" onClick={() => navigate('/account-info')}>Thông tin tài khoản</div>
          <div className="submenu-item" onClick={() => navigate('/system-permissions')}>Phân quyền hệ thống</div>
          <div className="submenu-item" onClick={() => navigate('/logout')}>Đăng xuất</div>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="version-info">Phiên bản 1.0.0</div>
        <div className="footer-links">
          <a href="#">Bảo mật</a>
          <a href="#">Điều khoản</a>
          <a href="#">Giấy phép</a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
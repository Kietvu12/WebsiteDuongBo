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

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
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

  const handleNavigation = (path) => {
    if (!path || path === '#') return;
    if (path === '/home' || path === '/overview') {
      return navigate(path);
    }
    const finalPath = selectedProjectId ? `${path}/${selectedProjectId}` : path;
    navigate(finalPath);
  };

  const handleDashboard = () => {
    navigate('/overview');
  };

  const toggleMenu = (menu) => {
    if (isCollapsed) toggleSidebar(); 
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const currentPath = location.pathname;
  const isDashboard = ['/overview', '/'].includes(location.pathname);

  return (
    <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Toggle button */}
      <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div className="sidebar-header" style={{ backgroundImage: `url(${backgroundSidebar})` }}>
        <div className="logo-container">
          <img src={logoSidebar} alt="Logo Bộ Xây Dựng" className="logo" />
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        </div>
      </div>
      
      {/* Dashboard Top Menu Item */}
      <div className="menu-section" style={{ paddingBottom: 0 }}>
        <div className="menu-item" style={{ backgroundColor: isDashboard ? '#e9ecef' : 'transparent', fontWeight: isDashboard ? 700 : 600 }} onClick={handleDashboard}>
          <svg style={{ marginRight: 10, color: '#0891b2' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span style={{ color: isDashboard ? '#0891b2' : '#333' }}>Tổng quan</span>
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
          <div className="submenu-item" onClick={() => handleNavigation('/home')}>Danh sách dự án</div>
          <div className="submenu-item">Thêm dự án mới</div>
          <div className="submenu-item">Phân loại dự án</div>
        </div>
      </div>
      
      <div className="menu-section">
        <div className="menu-item" onClick={() => toggleMenu('progress')}>
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
          <div className="submenu-item" onClick={() => handleNavigation(`/project-progress`)}>Báo cáo tiến độ</div>
        </div>
      </div>
      
      <div className="menu-section">
        <div className="menu-item" onClick={() => toggleMenu('requirements')}>
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
      
      <div className="menu-section">
        <div className="menu-item" onClick={() => toggleMenu('report')}>
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
      
      <div className="menu-section">
        <div className="menu-item" onClick={() => toggleMenu('setting')}>
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
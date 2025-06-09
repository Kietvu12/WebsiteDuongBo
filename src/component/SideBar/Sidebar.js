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
import { useParams } from 'react-router-dom';
import avatarIcon from '../../assets/img/user-icon.png'
import bg from '../../assets/img/background_sidebar.png'
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProjectId } = useProject();

  // Menu mở rộng
  const [openMenus, setOpenMenus] = useState({
    project: true,
    progress: false,
    requirements: false,
    report: false,
    setting: false
  });

  // trạng thái sidebar mở (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDashboard = ['/home', '/'].includes(location.pathname);

  const handleNavigation = (path) => {
    if (path === '/home') {
      navigate('/home');
      setSidebarOpen(false);
      return;
    }
    const finalPath = selectedProjectId ? `${path}/${selectedProjectId}` : path;
    navigate(finalPath);
    setSidebarOpen(false);
  };

  const handleDashboard = () => {
    navigate('/home');
    setSidebarOpen(false);
  };

  const handleMapboard = () => {
    navigate('/map-views');
    setSidebarOpen(false);
  };

  const handleAddNew = () => {
    navigate('/add-new');
    setSidebarOpen(false);
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
    <>
    {/* Header mobile */}
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 h-[56px] shadow-md" style={{ backgroundImage: `url(${bg})` }}>
      <button
        aria-label="Toggle Menu"
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="w-12 h-12 flex items-center justify-center text-white hover:bg-[#00509e] rounded-md focus:outline-none transition"
      >
        {sidebarOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Logo chính giữa */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <img
          src={logoSidebar}
          alt="Logo Bộ Xây Dựng"
          className="h-10 w-auto"
          draggable={false}
        />
      </div>

      {/* Icon avatar bên phải */}
      {/* <button
        aria-label="User Account"
        onClick={() => navigate('/account-info')}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center cursor-pointer"
      >
        <img
          src={avatarIcon}
          alt="Avatar"
          className="object-cover w-full h-full"
          draggable={false}
        />
      </button> */}
    </header>

    {/* Overlay đen khi mở sidebar mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* Sidebar chính */}
    <aside
      className={`
        fixed top-0 left-0 bottom-0 z-40 bg-gray-100 shadow-md font-sans
        w-[300px] h-screen
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static 
      `}
    >
      {/* Phần trên sidebar */}
      <div
        className="relative bg-center bg-cover p-5 rounded-b-xl"
        style={{ backgroundImage: `url(${backgroundSidebar})` }}
      >
        <div className="flex flex-col items-center relative z-10">
          <img
            src={logoSidebar}
            alt="Logo Bộ Xây Dựng"
            className="w-4/5 max-w-[180px] mb-4"
          />
          <div className="w-[250px] flex justify-center items-center rounded-full">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full bg-white bg-opacity-90 text-sm outline-none transition
                focus:border-blue-600 focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-b-xl bg-black bg-opacity-20 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Các phần menu */}
      <div className="flex flex-col flex-grow overflow-auto mt-2 md:mt-0">
        {/* Project menu */}
        <div className="py-1">
          <div
            className="flex items-center px-5 py-2 cursor-pointer text-gray-800 font-semibold text-sm hover:bg-gray-200 transition"
            onClick={() => toggleMenu('project')}
          >
            <img src={projectIcon} width={20} alt="Project Icon" className="mr-2" />
            <span>Quản lý dự án</span>
            <img
              src={downIcon}
              width={16}
              alt="Dropdown Icon"
              className={`ml-auto transition-transform duration-300 ${
                openMenus.project ? 'rotate-180' : ''
              }`}
            />
          </div>
          <div
            className={`overflow-hidden text-sm text-gray-600 transition-max-height duration-300 ease-out
            ${openMenus.project ? 'max-h-[500px]' : 'max-h-0'}`}
          >
            <div
              className="pl-12 py-2 cursor-pointer hover:bg-gray-200 hover:text-gray-900"
              onClick={handleDashboard}
            >
              Danh sách dự án
            </div>
            <div
              className="pl-12 py-2 cursor-pointer hover:bg-gray-200 hover:text-gray-900"
              onClick={handleMapboard}
            >
              Dự án dạng bản đồ
            </div>
            <div onClick= {handleAddNew} className="pl-12 py-2 cursor-pointer hover:bg-gray-200 hover:text-gray-900">
              Thêm dự án mới
            </div>
            <div className="pl-12 py-2 cursor-pointer hover:bg-gray-200 hover:text-gray-900">
              Phân loại dự án
            </div>
          </div>
        </div>

        {/* Các menu khác */}
        {[
          {
            key: 'progress',
            icon: progressIcon,
            label: 'Quản lý tiến độ',
            submenu: [
              { label: 'Hạng mục công việc', onClick: () => handleNavigation(`/work-items`) },
              { label: 'Đề xuất & phê duyệt', onClick: () => handleNavigation('/approvals') },
              { label: 'Báo cáo tiến độ', onClick: () => handleNavigation(`/project-progress`) },
            ],
          },
          {
            key: 'requirements',
            icon: requirementsIcon,
            label: 'Nhà thầu thi công',
            submenu: [
              { label: 'Khu vực thi công', onClick: () => handleNavigation('/construction-areas') },
              { label: 'Tiến độ hoàn thành', onClick: () => handleNavigation('/completion-progress') },
            ],
          },
          {
            key: 'report',
            icon: reportIcon,
            label: 'Báo cáo',
            submenu: [
              { label: 'Báo cáo chi tiết theo dự án', onClick: () => handleNavigation('/project-report') },
              { label: 'Báo cáo theo các nhà thầu', onClick: () => handleNavigation('/contractor-report') },
              { label: 'Xuất báo cáo Excel', onClick: () => handleNavigation('/export-excel') },
            ],
          },
          {
            key: 'setting',
            icon: settingIcon,
            label: 'Cài đặt',
            submenu: [
              { label: 'Cài đặt tài khoản', onClick: () => handleNavigation('/account-settings') },
              { label: 'Đổi mật khẩu', onClick: () => handleNavigation('/change-password') },
            ],
          },
        ].map(({ key, icon, label, submenu }) => (
          <div key={key} className="py-1">
            <div
              className={`flex items-center px-5 py-2 cursor-pointer text-gray-600 font-semibold text-sm
                hover:bg-gray-200 transition
                ${isMenuItemDisabled(key) ? 'cursor-not-allowed opacity-50' : 'text-gray-700'}`}
              onClick={() => {
                if (!isMenuItemDisabled(key)) toggleMenu(key);
              }}
            >
              <img src={icon} width={20} alt={`${label} Icon`} className="mr-2" />
              <span>{label}</span>
              <img
                src={downIcon}
                width={16}
                alt="Dropdown Icon"
                className={`ml-auto transition-transform duration-300 ${
                  openMenus[key] ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden text-sm text-gray-600 transition-max-height duration-300 ease-out
              ${openMenus[key] ? 'max-h-[400px]' : 'max-h-0'}`}
            >
              {submenu.map(({ label: subLabel, onClick }, idx) => (
                <div
                  key={idx}
                  className={`pl-12 py-2 cursor-pointer hover:bg-gray-200 hover:text-gray-900
                  ${isMenuItemDisabled(key) ? 'cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (!isMenuItemDisabled(key)) onClick();
                  }}
                >
                  {subLabel}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
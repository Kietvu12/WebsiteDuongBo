import React, { useEffect, useState, useRef } from 'react'
import './ProjectProgress.css'
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import addIcon from '../../assets/img/add-icon.png';
import ProjectManagement from '../../component/ProjectManagement/ProjectManagement';
import { useProject } from '../../contexts/ProjectContext';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'
import axios from 'axios';
import { FaRegCalendarAlt, FaRegBell } from "react-icons/fa";

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const ProjectProgress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState('2023-02-26');
  const [toDate, setToDate] = useState('2023-09-26');
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCateId, setSelectedCateId] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const { logout } = useProject();
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  useClickOutside(menuRef, () => {
    setShowMenu(false);
  });
  

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    useEffect(() => {
      const savedSearchTerm = localStorage.getItem('lastSearchTerm');
      const savedProjectId = localStorage.getItem('lastSelectedProjectId');
      
      if (savedSearchTerm) setSearchTerm(savedSearchTerm);
      if (savedProjectId) setSelectedProjectId(savedProjectId);
    }, []);
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await fetch(`${API_BASE_URL}/duAnList`);
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
          if (!localStorage.getItem('lastSelectedProjectId') && data.data.length > 0) {
            const firstProject = data.data[0];
            setSearchTerm(firstProject.TenDuAn);
            setSelectedProjectId(firstProject.DuAnID);
            
            // Lưu vào localStorage
            localStorage.setItem('lastSearchTerm', firstProject.TenDuAn);
            localStorage.setItem('lastSelectedProjectId', firstProject.DuAnID);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (selectedProjectId) {
          const response = await axios.get(`${API_BASE_URL}/hangMuc/${selectedProjectId}/detail`);
          setProject(response.data.data.duAnTong);
          localStorage.setItem('lastSelectedProjectId', selectedProjectId);
          localStorage.setItem('lastSearchTerm', searchTerm);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjectId, navigate]);
  
  useEffect(() => {
    // Nếu đang hiển thị gợi ý, hiển thị danh sách dự án theo điều kiện tìm kiếm
    if (showSuggestions) {
      if (searchTerm.trim() === '') {
        // Nếu ô tìm kiếm trống, hiển thị tất cả dự án
        setFilteredProjects(projects);
      } else {
        // Nếu có từ khóa tìm kiếm, lọc theo từ khóa
        const filtered = projects.filter(project =>
          project.TenDuAn.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProjects(filtered);
      }
    } else {
      setFilteredProjects([]);
    }
  }, [searchTerm, projects, showSuggestions]);

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleProjectSelect = (project) => {
    setSearchTerm(project.TenDuAn);
    setSelectedProjectId(project.DuAnID);
    setShowSuggestions(false);
    localStorage.setItem('lastSearchTerm', project.TenDuAn);
    localStorage.setItem('lastSelectedProjectId', project.DuAnID);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredProjects.length > 0) {
      handleProjectSelect(filteredProjects[0]);
    }
  };
  
  const handleInputFocus = () => {
    setShowSuggestions(true);
    // Hiển thị tất cả dự án khi focus vào ô tìm kiếm
    setFilteredProjects(projects);
  };
  
  const renderTitle = () => {
    if (project) {
      return `Tiến độ các hạng mục - ${project.tenDuAn}`;
    }
    return 'Tiến độ các hạng mục';
  };


  return (
    <div className='plan'>
      <div className="w-full bg-white shadow-md px-3 sm:px-4 py-2 sm:py-3 mt-3 md:md-0">
        {/* Top Nav */}
        <div className="flex justify-between items-center gap-2">
  {/* Nút back */}
  <button 
    onClick={() => navigate(-1)} 
    className="p-1 hover:bg-gray-100 rounded text-gray-600"
    aria-label="Quay lại"
  >
    <FaArrowLeft className="w-4 h-4" />
  </button>


  {/* Nhóm icon bên phải */}
  <div className="flex items-center gap-2">
    <span className="text-gray-500">Thông báo</span>
      <FaRegBell />
      <span></span>
      <div className="inline-block" ref={menuRef}>
          <button className="bg-red-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center"
            onClick={() => setShowMenu(!showMenu)}
          >
            R
          </button>
          {showMenu && (
        <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-10">
          <button
            className="block w-full text-left px-4 py-2  text-red-600 hover:bg-gray-100"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Đăng xuất
            </button>
        </div>
      )}
      </div>
  </div>
</div>

        <h1 className="flex-1 text-left  font-bold text-gray-800 px-2 mt-3">
          {renderTitle()}
        </h1>

        {/* Search + Filter */}
        <div className="mt-3 sm:mt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

            {/* Search */}
            <div className="flex-1 relative">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
                <div className="flex-grow relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm dự án..."
                    className="border border-gray-300 rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && filteredProjects.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                      {filteredProjects.map(project => (
                        <li
                          key={project.DuAnID}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleProjectSelect(project)}
                        >
                          {project.TenDuAn}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-gray-200 px-4 py-1.5 rounded hover:bg-gray-300 whitespace-nowrap"
                  disabled={isLoadingProjects}
                >
                  {isLoadingProjects ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải...
                    </span>
                  ) : 'Tìm'}
                </button>
              </form>
              {isLoadingProjects && (
                <p className="text-gray-500 mt-1">Đang tải danh sách dự án...</p>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <span className=" sm: text-gray-700 whitespace-nowrap">Thời gian:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1  sm: w-[130px]"
                />
                <span className=" sm: text-gray-700">đến</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1  sm: w-[130px]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* <span className=" sm: text-gray-700 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1  sm: min-w-[140px] flex-1 sm:flex-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="Chậm tiến độ">Chậm tiến độ</option>
                  <option value="Đang tiến hành">Đang tiến hành</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                </select> */}
              </div>

            </div>
          </div>
        </div>
      </div>
      <ProjectManagement projectId={selectedProjectId} />
    </div>
  )
}

export default ProjectProgress
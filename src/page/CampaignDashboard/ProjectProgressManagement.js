import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaChevronLeft,
  FaSearch,
  FaEllipsisH,
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaRegBell
} from 'react-icons/fa'

import pin from "../../assets/img/pin.png";
import attachment from "../../assets/img/attachment.png";
import trash from "../../assets/img/file.png";
import edit from "../../assets/img/edit.png"
import { useProject } from '../../contexts/ProjectContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const ProjectProgressManagement = () => {
  const navigate = useNavigate();
  const [searchPackage, setSearchPackage] = useState('');
  const [searchContractor, setSearchContractor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const searchInputRef = useRef(null);
  const { logout, user } = useProject();
  // Header user menu
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const savedSearchTerm = localStorage.getItem('lastSearchTerm');
    const savedProjectId = localStorage.getItem('lastSelectedProjectId');

    if (savedSearchTerm) setSearchTerm(savedSearchTerm);
    if (savedProjectId) setSelectedProjectId(savedProjectId);
  }, []);

  const [showPackageSuggestions, setShowPackageSuggestions] = useState(false);
  const [showContractorSuggestions, setShowContractorSuggestions] = useState(false);
  const [packageSuggestions, setPackageSuggestions] = useState([]);
  const [contractorSuggestions, setContractorSuggestions] = useState([]);
  // State cho pop-up kế hoạch
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [tableData, setTableData] = useState([]);


  // State cho toggle menu thao tác
  const [openActionMenus, setOpenActionMenus] = useState({});

  // Data tĩnh cho dropdown


  // Data tĩnh cho bảng mới - cấu trúc phẳng
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      let url = `${API_BASE_URL}/duAnList`;

      // Thêm params nếu là nhà thầu
      if (user?.PhanQuyenID === 9) {
        url += `?nhaThauID=${user.NhaThauID}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data);
        if (data.data.length === 0 && user?.PhanQuyenID === 9) {
          alert('Tài khoản nhà thầu chưa được giao dự án nào');
        }
      }
    } catch (error) {
      console.error('Lỗi tải dự án:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };
  const fetchPackageSuggestions = (keyword) => {
    if (!project) return [];

    const suggestions = project.danhSachGoiThau
      .filter(goiThau =>
        goiThau.tenGoiThau.toLowerCase().includes(keyword.toLowerCase())
      )
      .map(goiThau => ({
        id: goiThau.goiThauId,
        name: goiThau.tenGoiThau
      }));

    setPackageSuggestions(suggestions);
  };

  // Gợi ý tên nhà thầu
  const fetchContractorSuggestions = (keyword) => {
    if (!project) return [];

    const suggestions = project.danhSachGoiThau
      .flatMap(goiThau => goiThau.nhaThau)
      .filter(nhaThau =>
        nhaThau.tenNhaThau.toLowerCase().includes(keyword.toLowerCase())
      )
      .map(nhaThau => ({
        id: nhaThau.nhaThauId,
        name: nhaThau.tenNhaThau
      }));

    setContractorSuggestions(suggestions);
  };

  useEffect(() => {
    if (user) fetchProjects();
  }, [user?.PhanQuyenID, user?.NhaThauID]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (selectedProjectId) {
          const response = await axios.get(`${API_BASE_URL}/duAn/${selectedProjectId}/ke-hoach-theo-nha-thau`);
          setProject(response.data.data);

          // Lưu state vào localStorage khi có thay đổi
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
  console.log(project);
  useEffect(() => {
    if (project) {
      const formattedData = project.danhSachGoiThau.flatMap(goiThau => {
        return goiThau.nhaThau.map(nhaThau => ({
          id: `${goiThau.goiThauId}-${nhaThau.nhaThauId}`,
          goiThauId: goiThau.goiThauId,
          packageName: goiThau.tenGoiThau,
          contractorName: nhaThau.tenNhaThau,
          contractorType: nhaThau.roleSummary.isMainContractor ? 'Nhà thầu chính' : 'Nhà thầu phụ',
          mainContractorOf: nhaThau.roleSummary.parents.map(p => p.tenNhaThauCha).join(', '),
          planCount: nhaThau.tongSoKeHoach,
          completedPercent: nhaThau.phanTramHoanThanh,
          delayedPercent: nhaThau.phanTramChamTienDo,
          inProgressPercent: nhaThau.phanTramDangLam,
          keHoach: nhaThau.keHoach // Lưu toàn bộ danh sách kế hoạch
        }));
      });
      setTableData(formattedData);
    }
  }, [project]);
  useEffect(() => {
    // Nếu đang hiển thị gợi ý và có searchTerm, lọc danh sách
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
  const filteredData = useMemo(() => {
    if (!project) return [];
    let result = tableData;

    // Lọc theo tên gói thầu
    if (searchPackage) {
      result = result.filter(item =>
        item.packageName.toLowerCase().includes(searchPackage.toLowerCase())
      );
    }

    // Lọc theo tên nhà thầu
    if (searchContractor) {
      result = result.filter(item =>
        item.contractorName.toLowerCase().includes(searchContractor.toLowerCase())
      );
    }

    return result;
  }, [tableData, searchPackage, searchContractor, project]);

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleProjectSelect = (project) => {
    setSearchTerm(project.TenDuAn);
    setSelectedProjectId(project.DuAnID);
    setShowSuggestions(false);

    // Lưu vào localStorage khi chọn dự án
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
  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Hàm render badge cho loại nhà thầu
  const renderContractorTypeBadge = (type, mainContractorOf) => {
    if (type === 'Nhà thầu chính') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Nhà thầu chính
        </span>
      );
    } else {
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Nhà thầu phụ
          </span>
          <div className="text-xs text-gray-500">
            của {mainContractorOf}
          </div>
        </div>
      );
    }
  };

  // Hàm render badge cho phần trăm
  const renderPercentBadge = (percent, type) => {
    let bgColor, textColor;
    if (type === 'completed') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (type === 'delayed') {
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
    } else {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {percent}%
      </span>
    );
  };

  // Hàm mở pop-up kế hoạch
  const openPlanModal = (contractor) => {
    setSelectedContractor(contractor);
    setFilteredPlans(contractor.keHoach);
    setShowPlanModal(true);
  };

  // Hàm đóng pop-up kế hoạch
  const closePlanModal = () => {
    setShowPlanModal(false);
    setSelectedContractor(null);
    setPlanSearchTerm('');
  };

  // Hàm toggle action menu
  const toggleActionMenu = (itemId) => {
    setOpenActionMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Hàm đóng tất cả action menu
  const closeAllActionMenus = () => {
    setOpenActionMenus({});
  };

  // Hàm render status badge cho kế hoạch
  const renderPlanStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Hoàn thành
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaClock className="w-3 h-3 mr-1" />
            Đang thực hiện
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationTriangle className="w-3 h-3 mr-1" />
            Chậm tiến độ
          </span>
        );
      case 'not_started':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Chưa bắt đầu
          </span>
        );
      default:
        return null;
    }
  };

  // Lọc kế hoạch theo search term
  useEffect(() => {
    if (selectedContractor) {
      const filtered = selectedContractor.keHoach.filter(plan =>
        plan.tenCongTac.toLowerCase().includes(planSearchTerm.toLowerCase())
      );
      setFilteredPlans(filtered);
    }
  }, [planSearchTerm, selectedContractor]);;

  return (
    <div className="min-h-screen bg-gray-100" onClick={closeAllActionMenus}>
      {/* Header */}
      {/* Header (thay thế phần cũ bằng đoạn này) */}
<div className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate(-1)}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Quay lại"
    >
      <FaChevronLeft className="w-5 h-5 text-gray-700" />
    </button>
    <h1 className="text-lg md:text-xl font-semibold text-gray-900">Quản lý tiến độ dự án theo nhà thầu</h1>
  </div>

  <div className="flex items-center gap-4">
    <span className="text-gray-600 hidden sm:inline">Thông báo</span>
    <FaRegBell className="text-gray-600 w-5 h-5" />

    <div className="relative inline-block" ref={menuRef}>
      <button
        className="bg-red-200 text-gray-800 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        aria-label="Menu người dùng"
      >
        A
      </button>

      {showMenu && (
        <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-50">
          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            onClick={() => {
              if (logout) logout();
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


      {/* Search Section */}
      <div className="bg-white shadow-sm px-4 md:px-6 py-4 mb-4">
        <div className="space-y-4">
          {/* Search theo tên dự án */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Tìm kiếm theo tên dự án</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleInputFocus}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Tìm kiếm dự án..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                  aria-label="Clear"
                >
                  x
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search theo gói thầu */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Tìm kiếm theo gói thầu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchPackage}
                  onChange={(e) => {
                    setSearchPackage(e.target.value);
                    fetchPackageSuggestions(e.target.value);
                    setShowPackageSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => searchPackage && setShowPackageSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPackageSuggestions(false), 200)}
                  placeholder="Nhập tên gói thầu..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchPackage && (
                  <button
                    onClick={() => setSearchPackage('')}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    aria-label="Clear"
                  >
                    x
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Tìm kiếm theo tên nhà thầu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchContractor}
                  onChange={(e) => {
                    setSearchContractor(e.target.value);
                    fetchContractorSuggestions(e.target.value);
                    setShowContractorSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => searchContractor && setShowContractorSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowContractorSuggestions(false), 200)}
                  placeholder="Nhập tên nhà thầu..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchContractor && (
                  <button
                    onClick={() => setSearchContractor('')}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    aria-label="Clear"
                  >
                    x
                  </button>
                )}
              </div>
            </div>

            {/* Search theo tên nhà thầu */}

          </div>
        </div>
      </div>

      {/* Cards (Mobile) */}
      <div className="md:hidden space-y-4 px-4 mb-4">
        {currentItems.map((item, index) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Card */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">#{((currentPage - 1) * itemsPerPage + index + 1)}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {item.contractorType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Pin icon */}
                  <button
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Ghim"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Xử lý logic ghim
                    }}
                  >
                    <img src={pin} alt="Pin" className="w-4 h-4" />
                  </button>

                  {/* Toggle menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActionMenu(item.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Thêm thao tác"
                    >
                      <FaEllipsisH className="w-4 h-4" />
                    </button>

                    {/* Dropdown menu */}
                    {openActionMenus[item.id] && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionMenu(item.id);
                            }}
                          >
                            <img src={attachment} alt="Attachment" className="w-4 h-4 mr-2" />
                            Đính kèm
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionMenu(item.id);
                            }}
                          >
                            <img src={edit} alt="Edit" className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionMenu(item.id);
                            }}
                          >
                            <img src={trash} alt="Delete" className="w-4 h-4 mr-2" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="px-4 py-3 space-y-3">
              {/* Tên gói thầu */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tên gói thầu</label>
                <p className="text-sm text-gray-900 mt-1">{item.packageName}</p>
              </div>

              {/* Tên nhà thầu */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tên nhà thầu</label>
                <p className="text-sm text-gray-900 mt-1">{item.contractorName}</p>
              </div>

              {/* Loại nhà thầu */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Loại nhà thầu</label>
                <div className="mt-1">
                  {renderContractorTypeBadge(item.contractorType, item.mainContractorOf)}
                </div>
              </div>

              {/* Số lượng kế hoạch */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng kế hoạch</label>
                <div className="mt-1">
                  <button
                    onClick={() => openPlanModal(item)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                    title="Xem danh sách kế hoạch"
                  >
                    {item.planCount} kế hoạch
                  </button>
                </div>
              </div>

              {/* Tiến độ */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tiến độ</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Hoàn thành:</span>
                    {renderPercentBadge(item.completedPercent, 'completed')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Chậm tiến độ:</span>
                    {renderPercentBadge(item.delayedPercent, 'delayed')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Đang làm:</span>
                    {renderPercentBadge(item.inProgressPercent, 'inProgress')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (Mobile) */}
      <div className="md:hidden bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STT
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên gói thầu
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên nhà thầu
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loại nhà thầu
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số lượng kế hoạch
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  % Hoàn thành
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  % Chậm tiến độ
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  % Đang làm
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => {
                const statusMap = {
                  'HOAN_THANH': 'completed',
                  'CHAM_TIEN_DO': 'delayed',
                  'DANG_LAM': 'in_progress',
                  'CHUA_LAM': 'not_started'
                };

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {/* Pin icon - luôn hiển thị */}
                        <button
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Ghim"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Xử lý logic ghim
                          }}
                        >
                          <img src={pin} alt="Pin" className="w-4 h-4" />
                        </button>

                        {/* Toggle menu cho 3 icon khác */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionMenu(item.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Thêm thao tác"
                          >
                            <FaEllipsisH className="w-4 h-4" />
                          </button>

                          {/* Dropdown menu */}
                          {openActionMenus[item.id] && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Xử lý logic attachment
                                    toggleActionMenu(item.id);
                                  }}
                                >
                                  <img src={attachment} alt="Attachment" className="w-4 h-4 mr-2" />
                                  Đính kèm
                                </button>
                                <button
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Xử lý logic edit
                                    toggleActionMenu(item.id);
                                  }}
                                >
                                  <img src={edit} alt="Edit" className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </button>
                                <button
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Xử lý logic delete
                                    toggleActionMenu(item.id);
                                  }}
                                >
                                  <img src={trash} alt="Delete" className="w-4 h-4 mr-2" />
                                  Xóa
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={item.packageName}>
                        {item.packageName}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={item.contractorName}>
                        {item.contractorName}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      {renderContractorTypeBadge(item.contractorType, item.mainContractorOf)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => openPlanModal(item)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="Xem danh sách kế hoạch"
                      >
                        {item.planCount} kế hoạch
                      </button>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      {renderPercentBadge(item.completedPercent, 'completed')}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      {renderPercentBadge(item.delayedPercent, 'delayed')}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      {renderPercentBadge(item.inProgressPercent, 'inProgress')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination (Desktop) */}
        <div className="bg-white px-4 md:px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, tableData.length)}
                </span>{' '}
                của <span className="font-medium">{tableData.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Modal Kế hoạch */}
      {showPlanModal && selectedContractor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách kế hoạch tham gia
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedContractor.contractorName} - {selectedContractor.packageName}
                </p>
              </div>
              <button
                onClick={closePlanModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={planSearchTerm}
                  onChange={(e) => setPlanSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm kế hoạch..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {planSearchTerm && (
                  <button
                    onClick={() => setPlanSearchTerm('')}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    aria-label="Clear"
                  >
                    x
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tên kế hoạch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ngày bắt đầu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ngày kết thúc
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tiến độ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan, index) => {
                    const statusMap = {
                      'HOAN_THANH': 'completed',
                      'CHAM_TIEN_DO': 'delayed',
                      'DANG_LAM': 'in_progress',
                      'CHUA_LAM': 'not_started'
                    };

                    return (
                      <tr key={plan.keHoachId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={plan.tenCongTac}>
                            {plan.tenCongTac}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderPlanStatusBadge(statusMap[plan.trangThai])}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400 mr-1" />
                            {plan.ngayBatDau ? new Date(plan.ngayBatDau).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400 mr-1" />
                            {plan.ngayKetThuc ? new Date(plan.ngayKetThuc).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${plan.phanTramHoanThanh === 100 ? 'bg-green-500' :
                                  plan.phanTramHoanThanh >= 50 ? 'bg-blue-500' :
                                    plan.phanTramHoanThanh > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                                  }`}
                                style={{ width: `${plan.phanTramHoanThanh}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{plan.phanTramHoanThanh}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Tổng cộng: <span className="font-medium">{filteredPlans.length}</span> kế hoạch
              </p>
              <button
                onClick={closePlanModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgressManagement; 

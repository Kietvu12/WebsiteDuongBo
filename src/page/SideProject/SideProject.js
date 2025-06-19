import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './SideProject.css';
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import addIcon from '../../assets/img/add-icon.png';
import editIcon from '../../assets/img/edit-icon.png';
import deleteIcon from '../../assets/img/delete-icon.png';
import planIcon from '../../assets/img/plan-icon.png';
import actualIcon from '../../assets/img/actual-icon.png';
import delayIcon from '../../assets/img/delay-icon.png';
import { useProject } from '../../contexts/ProjectContext';
import pin from '../../assets/img/pin.png'
import attachment from '../../assets/img/attachment.png'
import trash from '../../assets/img/file.png'
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import AddNewSubProject from '../AddNewSubProject/AddNewSubProject';
import AddNewPackage from '../AddNewPackage/AddNewPackage';

const SideProject = () => {
  const location = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { DuAnID } = useParams();
  const [selectedDuAnConIds, setSelectedDuAnConIds] = useState([]);
  const [selectedDuAnConId, setSelectedDuAnConId] = useState(null);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [subProjects, setSubProjects] = useState([]);
  const { setSelectedSubProjectId } = useProject()
  const [loading, setLoading] = useState(true);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [completionLevel, setCompletionLevel] = useState('all');
  const [filteredSubProjects, setFilteredProjects] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);

  const filterProjects = () => {
    let result = [...subProjects];
    if (fromDate || toDate) {
      result = result.filter(subProject => {
        const subProjectStartDate = new Date(subProject.NgayKhoiCong || '1970-01-01');
        const filterFromDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        const filterToDate = toDate ? new Date(toDate) : new Date('9999-12-31');

        return subProjectStartDate >= filterFromDate && subProjectStartDate <= filterToDate;
      });
    }
    if (status !== 'all') {
      result = result.filter(subProject => subProject.TrangThai === status);
    }
    if (completionLevel !== 'all') {
      const level = parseInt(completionLevel, 10);
      result = result.filter(subProject => {
        const percentage = parseFloat(subProject.phanTramHoanThanh || '0');
        return percentage > level;
      });
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project =>
        project.TenDuAn && project.TenDuAn.toLowerCase().includes(term)
      )
    }

    setFilteredProjects(result);
  };
  const updateSearchSuggestions = (term) => {
    if (!term) {
      setSearchSuggestions([]);
      return;
    }

    const termLower = term.toLowerCase();
    const suggestions = subProjects
      .filter(project =>
        project.TenDuAn && project.TenDuAn.toLowerCase().includes(termLower))
      .map(project => project.TenDuAn)
      .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
      .slice(0, 5);

    setSearchSuggestions(suggestions);
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchSuggestions(value);
    setShowSuggestions(value.length > 0);
  };
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!DuAnID) {
        console.error('Project ID is missing');
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/duAnThanhPhan/${DuAnID}`);
        setProject(response.data.data.duAnTong);
        setSubProjects(response.data.data.duAnThanhPhan);
        setFilteredProjects(response.data.data.duAnThanhPhan)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [DuAnID, navigate]);
  useEffect(() => {
    filterProjects();
  }, [fromDate, toDate, status, , completionLevel, subProjects, searchTerm]);
  useEffect(() => {
    // Đọc danh sách ID từ URL query parameter
    const queryParams = new URLSearchParams(location.search);

    // Kiểm tra tham số DuAnConIDs (nhiều ID)
    const duAnConIdsString = queryParams.get('DuAnConIDs');
    if (duAnConIdsString) {
      const idList = duAnConIdsString.split(',').map(id => Number(id));
      console.log("Danh sách DuAnConIDs từ URL:", idList);
      setSelectedDuAnConIds(idList);
    }
    // Kiểm tra tham số DuAnConID (một ID)
    else {
      const singleId = queryParams.get('DuAnConID');
      if (singleId) {
        console.log("Đọc DuAnConID từ URL:", singleId);
        setSelectedDuAnConId(Number(singleId));
      }
    }

    // Xóa query params sau khi đã lấy
  }, [location.search, DuAnID]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/duAnThanhPhan/${DuAnID}`);
        console.log(response.data.data);

        if (response.data.data) {
          setProject(response.data.data.duAnTong);
          setSubProjects(response.data.data.duAnThanhPhan);
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dự án:', error);
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [DuAnID, selectedDuAnConIds, selectedDuAnConId]);

  const handleDetail = (subProjectId) => {
    const selectedSubProject = subProjects.find(sp => sp.DuAnID === subProjectId);
    if (!selectedSubProject || !project) {
      console.error('Không tìm thấy dữ liệu dự án');
      return;
    }
    navigate('/detail', {
      state: {
        projectId: DuAnID,
        projectName: project.TenDuAn,
        subProjectName: selectedSubProject.TenDuAn,
        subProjectId: selectedSubProject.DuAnID
      }
    });
    setSelectedSubProjectId(selectedSubProject.DuAnID)
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Đang tiến hành':
        return { backgroundColor: '#f28c5e', color: 'white' };
      case 'Đã hoàn thành':
        return { backgroundColor: '#2ecc71', color: 'black' };
      case 'Chậm tiến độ':
        return { backgroundColor: '#e74c3c', color: 'white' };
      default:
        return { backgroundColor: '#3498db', color: 'white' };
    }
  };
  const [pinnedProjects, setPinnedProjects] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedProjects');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handlePinProject = (subProjectId) => {
    setPinnedProjects(prev => {
      const newPinned = prev.includes(subProjectId)
        ? prev.filter(id => id !== subProjectId)
        : [subProjectId, ...prev];

      // Lưu vào localStorage
      localStorage.setItem('pinnedProjects', JSON.stringify(newPinned));
      return newPinned;
    });
  };
  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatus('all');
    setCompletionLevel('all');
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (!project) {
    return <div className="error">Không tìm thấy dự án</div>;
  }

  return (
    <div className="SideProject">
      <div className="w-full bg-white shadow-sm">
        <div className="flex justify-between items-center px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded hover:bg-gray-200"
              aria-label="Quay lại"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>

            {/* Thêm nút Tạo dự án mới */}
            <button
              onClick={() => setShowAddProject(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
            >
              <FiPlus className="w-3 h-3" />
              <span>Tạo dự án mới</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <img src={menuIcon} alt="Menu" className="w-5 h-5 cursor-pointer" />
            <img src={helpIcon} alt="Help" className="w-5 h-5 cursor-pointer" />
            <img src={userIcon} alt="User profile" className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {/* Compact Header Content */}
        <div className="px-4 py-3">
          <h1 className="md:text-xl text-xs mt-6 font-semibold text-gray-800 mb-3"><span className='md:hidden text-xs text-blue-700'>Dự án thành phần > </span>{project.TenDuAn}</h1>
          <div className="md:hidden mb-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-1.5 text-xs bg-gray-100 rounded border border-gray-300"
            >
              {showMobileFilters ? 'Ẩn bộ lọc ▲' : 'Hiện bộ lọc ▼'}
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm dự án..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow-sm max-h-60 overflow-y-auto text-xs">
                    {searchSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={`contents md:contents ${showMobileFilters ? '' : 'hidden md:grid'}`}>
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">đến</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Chậm tiến độ">Chậm tiến độ</option>
                  <option value="Đang triển khai">Đang triển khai</option>
                  <option value="Đang tiến hành">Đang tiến hành</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                  <option value="Đã phê duyệt - chờ khởi công">Đã phê duyệt-chờ khởi công</option>
                  <option value="Đã phê duyệt - chậm tiến độ">Đã phê duyệt-chậm tiến độ</option>
                  <option value="Dự kiến khởi công">Dự kiến khởi công</option>
                </select>
              </div>

              {/* Completion Level */}
              <div className="col-span-1">
                <select
                  value={completionLevel}
                  onChange={(e) => setCompletionLevel(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Mọi tiến độ</option>
                  <option value="20">&gt;20%</option>
                  <option value="50">&gt;50%</option>
                  <option value="80">&gt;80%</option>
                  <option value="100">100%</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="h-9 px-3 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium md:col-start-4"
              >
                Xóa lọc
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className=" hidden md:block max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] md:min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">STT</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Thao tác</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Dự án</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Dải tuyến</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Trạng thái</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Tiến độ</th>
                </tr>
              </thead>
              {filteredSubProjects.length > 0 ? (
                [...filteredSubProjects]
                  .sort((a, b) => {
                    const aIsPinned = pinnedProjects.includes(a.DuAnID);
                    const bIsPinned = pinnedProjects.includes(b.DuAnID);
                    if (aIsPinned && !bIsPinned) return -1;
                    if (!aIsPinned && bIsPinned) return 1;
                    return 0;
                  })
                  .map((subProject, index) => (
                    <tbody key={subProject.DuAnID} className="divide-y divide-gray-200">

                      <tr

                        onClick={() => handleDetail(subProject.DuAnID)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        {/* Các ô dữ liệu giữ nguyên như trước */}
                        <td className="p-2 text-sm text-gray-800 whitespace-nowrap">{index + 1}</td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                              title="Tệp đính kèm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img src={attachment} alt="Tệp đính kèm" className="w-5 h-5" />
                            </button>
                            <button
                              className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
                              title="Xoá"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img src={trash} alt="Xoá" className="w-5 h-5" />
                            </button>
                            <button
                              className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${pinnedProjects.includes(subProject.DuAnID) ? 'bg-yellow-100' : ''
                                }`}
                              title="Ghim"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePinProject(subProject.DuAnID);
                              }}
                            >
                              <img src={pin} alt="Ghim" className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-800 whitespace-nowrap">{subProject.TenDuAn}</td>
                        <td className="p-2 text-sm text-gray-600 whitespace-nowrap">{subProject.TongChieuDai} Km</td>
                        <td className="p-2 whitespace-nowrap">
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                            style={getStatusStyle(subProject.TrangThai)}
                          >
                            {subProject.TrangThai}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="grid grid-rows-3 gap-2">
                            <div className="flex items-center gap-2">
                              <img src={planIcon} width="16" height="16" alt="Kế hoạch" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Kế hoạch: <strong className="font-medium">{subProject.phanTramKeHoach || '0'}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={actualIcon} width="16" height="16" alt="Hoàn thành" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Hoàn thành: <strong className="font-medium">{subProject.phanTramHoanThanh || '0'}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={delayIcon} width="16" height="16" alt="Chậm tiến độ" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Chậm tiến độ: <strong className="font-medium">{subProject.phanTramChamTienDo || '0'}%</strong>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                    </tbody>
                  ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-sm text-gray-500">
                  <div className="text-center text-gray-500 py-4">
                Không tìm thấy dự án nào phù hợp
                <div className="mt-2 text-sm text-gray-500">
                  <p>Dự án này hiện chưa có dự án thành phần nào.</p>
                  <p className="mt-1">Bạn có thể thêm gói thầu trực tiếp vào dự án này.</p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowAddPackage(true)}
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thêm mới gói thầu
                  </button>
                </div>
              </div>
                  </td>
                </tr>
              )}
            </table>
          </div>
        </div>
        <div className="md:hidden">
          <div className="space-y-3 p-3">
            {filteredSubProjects.length > 0 ? (
              [...filteredSubProjects]
                .sort((a, b) => {
                  const aIsPinned = pinnedProjects.includes(a.DuAnID);
                  const bIsPinned = pinnedProjects.includes(b.DuAnID);
                  if (aIsPinned && !bIsPinned) return -1;
                  if (!aIsPinned && bIsPinned) return 1;
                  return 0;
                })
                .map((subProject, index) => (
                  <div
                    key={subProject.DuAnID}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleDetail(subProject.DuAnID)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-800">{subProject.TenDuAn}</div>
                      <div className="flex space-x-2">
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img src={attachment} alt="Tệp" className="w-4 h-4" />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img src={trash} alt="Xoá" className="w-4 h-4" />
                        </button>
                        <button
                          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${pinnedProjects.includes(project.DuAnID) ? 'bg-yellow-100' : ''
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePinProject(subProject.DuAnID);
                          }}
                        >
                          <img src={pin} alt="Ghim" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Dải tuyến:</span>
                        <span className="ml-1 font-medium">{subProject.TongChieuDai} Km</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={getStatusStyle(subProject.TrangThai)}
                      >
                        {subProject.TrangThai}
                      </span>

                      <div className="flex items-center text-xs text-gray-600">
                        <img src={actualIcon} width="14" alt="Hoàn thành" className="mr-1" />
                        <span>{subProject.phanTramHoanThanh || '0'}%</span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                Không tìm thấy dự án nào phù hợp
                <div className="mt-2 text-sm text-gray-500">
                  <p>Dự án này hiện chưa có dự án thành phần nào.</p>
                  <p className="mt-1">Bạn có thể thêm gói thầu trực tiếp vào dự án này.</p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowAddPackage(true)}
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thêm mới gói thầu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <AddNewSubProject
            DuAnID={project.DuAnID}
            onClose={() => setShowAddProject(false)}
            onSuccess={(newProject) => {
              // Xử lý khi thêm thành công
            }}
          />
        </div>
      )}
            {showAddPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Lớp phủ mờ */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowAddPackage(false)}
            ></div>
            
            {/* Container pop-up - đã điều chỉnh max-width và width */}
            <div className="relative w-full max-w-6xl z-10"> {/* Tăng từ max-w-4xl lên max-w-6xl */}
              <AddNewPackage
                projectId={DuAnID}
                onClose={() => setShowAddPackage(false)}
                onSuccess={(newPackage) => {
                  
                }}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideProject;
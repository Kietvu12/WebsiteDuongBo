import React, { useEffect, useState } from 'react';
import './DashBoard.css';
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import addIcon from '../../assets/img/add-icon.png';
import editIcon from '../../assets/img/edit-icon.png';
import deleteIcon from '../../assets/img/delete-icon.png';
import planIcon from '../../assets/img/plan-icon.png';
import actualIcon from '../../assets/img/actual-icon.png';
import delayIcon from '../../assets/img/delay-icon.png';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../../component/MapComponent/MapComponent';
import axios from 'axios';
import { useProject } from '../../contexts/ProjectContext';
import { FaTrash, FaFileImport } from "react-icons/fa";
import pin from '../../assets/img/pin.png'
import attachment from '../../assets/img/attachment.png'
import trash from '../../assets/img/file.png'

const DashBoard = () => {
  const { setSelectedProjectId } = useProject();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedDuAnIds, setSelectedDuAnIds] = useState([]);
  const [selectedDuAnId, setSelectedDuAnId] = useState(null);
  const navigate = useNavigate();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all');
  const [isMapView, setIsMapView] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [contractor, setContractor] = useState('all');
  const [contractorList, setContractorList] = useState([]);
  const [completionLevel, setCompletionLevel] = useState('all');

  const filterProjects = () => {
    let result = [...projects];

    // Lọc theo ngày
    if (fromDate || toDate) {
      result = result.filter(project => {
        const projectStartDate = new Date(project.NgayKhoiCong || '1970-01-01');
        const filterFromDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        const filterToDate = toDate ? new Date(toDate) : new Date('9999-12-31');
        return projectStartDate >= filterFromDate && projectStartDate <= filterToDate;
      });
    }

    // Lọc theo trạng thái
    if (status !== 'all') {
      result = result.filter(project => project.TrangThai === status);
    }

    // Lọc theo tên dự án
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project =>
        project.TenDuAn && project.TenDuAn.toLowerCase().includes(term)
      );
    }

    // Lọc theo tỉnh thành
    if (selectedProvince) {
      result = result.filter(project => {
        if (!project.TinhThanh) return false;
        const searchProvince = selectedProvince.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const projectProvinces = project.TinhThanh
          .split('–')
          .map(p => p.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        return projectProvinces.some(p => p.includes(searchProvince));
      });
    }

    // Lọc theo nhà thầu (mới thêm)
    if (contractor !== 'all') {
      result = result.filter(project => {
        // Kiểm tra xem dự án có chứa nhà thầu được chọn không
        return project.danhSachNhaThau?.some(
          nhathau => nhathau.NhaThauID.toString() === contractor
        );
      });
    }

    if (completionLevel !== 'all') {
      const minCompletion = parseFloat(completionLevel);
      result = result.filter(project => {
        const completion = parseFloat(project.phanTramHoanThanh || '0');
        console.log(completion);

        return completion >= minCompletion;
      });
    }
    setFilteredProjects(result);
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };
  const updateSearchSuggestions = (term) => {
    if (!term) {
      setSearchSuggestions([]);
      return;
    }

    const termLower = term.toLowerCase();
    const suggestions = projects
      .filter(project =>
        project.TenDuAn && project.TenDuAn.toLowerCase().includes(termLower))
      .map(project => project.TenDuAn)
      .filter((name, index, self) => self.indexOf(name) === index)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, provincesRes, contractorRes] = await Promise.all([
          axios.get('http://localhost:5000/duAnTong'),
          axios.get('https://provinces.open-api.vn/api/?depth=1'),
          axios.get('http://localhost:5000/nhaThauList')
        ]);

        setProjects(projectsRes.data.data);
        setFilteredProjects(projectsRes.data.data);
        setContractorList(contractorRes.data.data);
        setProvinces(provincesRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let fetchedData = [];
        console.log("selectedDuAnIds:", selectedDuAnIds);
        console.log("selectedDuAnId:", selectedDuAnId);

        // Xử lý nhiều ID 
        if (selectedDuAnIds.length > 0) {
          // Tạo mảng các promises cho các request API
          const promises = selectedDuAnIds.map(id =>
            axios.get(`http://localhost:5000/duAn/${id}`)
          );

          // Chạy tất cả các requests cùng lúc
          const results = await Promise.all(promises);

          // Tổng hợp kết quả
          fetchedData = results.map((res, index) => ({
            ...res.data.data,
            DuAnID: selectedDuAnIds[index]
          }));
        }
        // Xử lý một ID
        else if (selectedDuAnId) {
          const response = await axios.get(`http://localhost:5000/duAn/${selectedDuAnId}`);
          fetchedData = [{
            ...response.data.data,
            DuAnID: selectedDuAnId
          }];

          setSelectedDuAnId(null);
        }
        // Trường hợp không có ID nào, lấy tất cả dự án
        else {
          const response = await axios.get('http://localhost:5000/duAnTong');
          fetchedData = response.data.data;
        }

        console.log("Dữ liệu đã tìm nạp:", fetchedData);
        setProjects(fetchedData);
        setFilteredProjects(fetchedData);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedDuAnIds, selectedDuAnId]);
  useEffect(() => {
    filterProjects();
  }, [fromDate, toDate, status, searchTerm, selectedProvince, contractor, completionLevel, projects]);
  const handleDetail = (DuAnID) => {
    navigate(`/side-project/${DuAnID}`);
    setSelectedProjectId(DuAnID)
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
  };
  const [pinnedProjects, setPinnedProjects] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedProjects');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Hàm xử lý ghim/bỏ ghim
  const handlePinProject = (projectId) => {
    setPinnedProjects(prev => {
      const newPinned = prev.includes(projectId)
        ? prev.filter(id => id !== projectId) 
        : [projectId, ...prev]; 

      // Lưu vào localStorage
      localStorage.setItem('pinnedProjects', JSON.stringify(newPinned));
      return newPinned;
    });
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

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setStatus('all');
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setContractor('all')
  };


  const handleExportReport = () => {
    navigate('/bao-cao-tong')
  };

  return (
    <div className="dashboard">
      <div className="w-full bg-white shadow-md">
        {/* Navbar */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div>
            <button className="p-2 rounded hover:bg-gray-200" aria-label="Navigation menu">
            </button>
          </div>

          <div className="flex items-center gap-3">
            <img src={menuIcon} alt="Menu" className="w-5 h-5 cursor-pointer" />
            <img src={helpIcon} alt="Help" className="w-5 h-5 cursor-pointer" />
            <img src={userIcon} alt="User profile" className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
  <h1 className="md:text-xl text-xs font-semibold text-gray-800">
    <span className="md:hidden text-xs text-blue-700">Trang chủ </span>
    Danh sách dự án đường bộ
  </h1>
  <button
    className="hidden md:inline-block text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
    onClick={handleExportReport}
  >
    Xuất báo cáo
  </button>
</div>
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
                  id="project-search"
                  type="text"
                  placeholder="Tìm dự án..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto text-xs">
                    {searchSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer"
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
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả tỉnh</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
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
              <div className="col-span-1">
                <select
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả nhà thầu</option>
                  {contractorList.map((nhathau) => (
                    <option key={nhathau.NhaThauID} value={nhathau.NhaThauID}>
                      {nhathau.TenNhaThau}
                    </option>
                  ))}
                </select>
              </div>
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

              {/* Reset Button */}
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1.5 text-xs rounded transition-colors"
                >
                  Xóa lọc
                </button>
              </div>
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
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">DA Thành phần</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Gói thầu</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Trạng thái</th>
                  <th className="text-sm p-2 text-left whitespace-nowrap font-medium text-gray-700">Tiến độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.length > 0 ? (
                  [...filteredProjects]
                    .sort((a, b) => {
                      const aIsPinned = pinnedProjects.includes(a.DuAnID);
                      const bIsPinned = pinnedProjects.includes(b.DuAnID);
                      if (aIsPinned && !bIsPinned) return -1;
                      if (!aIsPinned && bIsPinned) return 1;
                      return 0;
                    })
                    .map((project, index) => (
                      <tr
                        key={project.DuAnID}
                        onClick={() => handleDetail(project.DuAnID)}
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
                              className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${pinnedProjects.includes(project.DuAnID) ? 'bg-yellow-100' : ''
                                }`}
                              title="Ghim"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePinProject(project.DuAnID);
                              }}
                            >
                              <img src={pin} alt="Ghim" className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-sm text-gray-800 whitespace-nowrap">{project.TenDuAn}</td>
                        <td className="p-2 text-sm text-gray-600 whitespace-nowrap">{project.TongChieuDai} Km</td>
                        <td className="p-2 text-sm text-gray-600 whitespace-nowrap">
                          {project.soLuongDuAnThanhPhan} Dự án thành phần
                        </td>
                        <td className="p-2 text-sm text-gray-600 whitespace-nowrap">
                          {project.soLuongGoiThau} gói thầu xây lắp
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                            style={getStatusStyle(project.TrangThai)}
                          >
                            {project.TrangThai}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="grid grid-rows-3 gap-2">
                            <div className="flex items-center gap-2">
                              <img src={planIcon} width="16" height="16" alt="Kế hoạch" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Kế hoạch: <strong className="font-medium">{project.phanTramKeHoach || '0'}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={actualIcon} width="16" height="16" alt="Hoàn thành" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Hoàn thành: <strong className="font-medium">{project.phanTramHoanThanh || '0'}%</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={delayIcon} width="16" height="16" alt="Chậm tiến độ" className="flex-shrink-0" />
                              <span className="text-xs text-gray-600">
                                Chậm tiến độ: <strong className="font-medium">{project.phanTramChamTienDo || '0'}%</strong>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-sm text-gray-500">
                      Không tìm thấy dự án nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden">
          <div className="space-y-3 p-3">
            {filteredProjects.length > 0 ? (
              [...filteredProjects]
                .sort((a, b) => {
                  const aIsPinned = pinnedProjects.includes(a.DuAnID);
                  const bIsPinned = pinnedProjects.includes(b.DuAnID);
                  if (aIsPinned && !bIsPinned) return -1;
                  if (!aIsPinned && bIsPinned) return 1;
                  return 0;
                })
                .map((project, index) => (
                  <div
                    key={project.DuAnID}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleDetail(project.DuAnID)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-800">{project.TenDuAn}</div>
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
                            handlePinProject(project.DuAnID);
                          }}
                        >
                          <img src={pin} alt="Ghim" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">STT:</span>
                        <span className="ml-1 font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Dải tuyến:</span>
                        <span className="ml-1 font-medium">{project.TongChieuDai} Km</span>
                      </div>
                      <div>
                        <span className="text-gray-500">DA Thành phần:</span>
                        <span className="ml-1 font-medium">{project.soLuongDuAnThanhPhan}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gói thầu:</span>
                        <span className="ml-1 font-medium">{project.soLuongGoiThau}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-medium"
                        style={getStatusStyle(project.TrangThai)}
                      >
                        {project.TrangThai}
                      </span>

                      <div className="flex items-center text-xs text-gray-600">
                        <img src={actualIcon} width="14" alt="Hoàn thành" className="mr-1" />
                        <span>{project.phanTramHoanThanh || '0'}%</span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                Không tìm thấy dự án nào phù hợp
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup thêm mới */}
      {showAddPopup && (
        <div className="popup" onClick={() => setShowAddPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;
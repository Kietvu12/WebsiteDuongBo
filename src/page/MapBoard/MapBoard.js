import React, { useEffect, useState } from 'react';
import './MapBoard.css';
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

const MapBoard = () => {
  const { setSelectedProjectId } = useProject();
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

  return (
    <div className="MapBoard">
      <div className="w-full bg-white shadow-md">
    {/* Navbar */}
    <div className="flex justify-between items-center px-4 py-2 border-b">
      <div>
        <button className="p-2 rounded hover:bg-gray-200" aria-label="Navigation menu">
          {/* Icon hoặc menu toggle button */}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <img src={menuIcon} alt="Menu" className="w-5 h-5 cursor-pointer" />
        <img src={helpIcon} alt="Help" className="w-5 h-5 cursor-pointer" />
        <img src={userIcon} alt="User profile" className="w-5 h-5 cursor-pointer" />
      </div>
    </div>

    {/* Header Main Content */}
    <div className="px-4 py-3">
      <h1 className="text-xl font-semibold text-gray-800 mb-3">Danh sách dự án đường bộ</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search - Full width on mobile, 2 cols on md */}
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

        {/* Date Range - Compact layout */}
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

        {/* Province - Single line */}
        <div className="col-span-1">
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả tỉnh</option>
            {provinces.map(province => (
              <option key={province.code} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status - Single line */}
        <div className="col-span-1">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chậm tiến độ">Chậm tiến độ</option>
            <option value="Đang tiến hành">Đang tiến hành</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>

        {/* Contractor - Single line */}
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

        {/* Completion - Single line */}
        <div className="col-span-1">
          <select
            value={completionLevel}
            onChange={(e) => setCompletionLevel(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Mọi tiến độ</option>
            <option value="20">>20%</option>
            <option value="50">>50%</option>
            <option value="80">>80%</option>
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
      </form>
    </div>
  </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Danh sách dự án</h2>
          <div className="button-group">
            {/* <button className="add-btn" onClick={() => setShowAddPopup(true)}>
              <img src={addIcon} width="16" alt="Add" /> Thêm mới
            </button>
            <button className="toggle-view-btn" onClick={toggleView}>
              {isMapView ? 'Xem dạng bảng' : 'Xem dạng bản đồ'}
            </button> */}
          </div>
        </div>
          <div className="map-view-container">
            <div className="map-app-container">
              <MapComponent projects={filteredProjects} />
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

export default MapBoard;
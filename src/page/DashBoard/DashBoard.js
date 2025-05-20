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

const DashBoard = () => {
  const { setSelectedProjectId } = useProject();
  const navigate = useNavigate();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
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
  const [provinces, setProvinces] = useState([]); // Thêm state cho danh sách tỉnh thành
  const [selectedProvince, setSelectedProvince] = useState('');
  
  const fetchProvinces = async () => {
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/?depth=1');
      setProvinces(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tỉnh thành:', error);
    }
  };
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
        
        // Chuẩn hóa tên tỉnh cần tìm (bỏ dấu, viết thường)
        const searchProvince = selectedProvince.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Chuẩn hóa tên tỉnh trong dữ liệu
        const projectProvinces = project.TinhThanh
          .split('–') // Dấu phân cách tỉnh liên tỉnh
          .map(p => p.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        
        // Kiểm tra xem tỉnh cần tìm có trong danh sách tỉnh của dự án không
        return projectProvinces.some(p => p.includes(searchProvince));
      });
    }
  

    setFilteredProjects(result);
  };


  // Hàm xử lý khi chọn tỉnh thành
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
        const [projectsRes, provincesRes] = await Promise.all([
          axios.get('http://localhost:5000/duAnTongList'),
          axios.get('https://provinces.open-api.vn/api/?depth=1')
        ]);

        setProjects(projectsRes.data.data);
        setFilteredProjects(projectsRes.data.data);
        setProvinces(provincesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cập nhật filter khi có thay đổi
  useEffect(() => {
    filterProjects();
  }, [fromDate, toDate, status, searchTerm, selectedProvince, projects]);
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
  };

  return (
    <div className="dashboard">
      <div className="app-header">
        <div className="header-navbar">
          <div className="navbar-left">
            <button className="nav-button" aria-label="Navigation menu">
            </button>
          </div>

          <div className="navbar-right">
            <div className="user-actions">
              <img src={menuIcon} alt="Menu" className="nav-icon" />
              <img src={helpIcon} alt="Help" className="nav-icon" />
              <img src={userIcon} alt="User profile" className="nav-icon" />
            </div>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="header-main-content">
          <div className="header-content-wrapper">
            <h1 className="page-title">Danh sách dự án đường bộ</h1>
            <div className="search-filters-container">
              <form className="filter-controls-form">
                <div className="search-control">
                  <label htmlFor="project-search" className="filter-label">Tìm kiếm dự án:</label>
                  <div className="search-input-wrapper">
                    <input
                      id="project-search"
                      type="text"
                      placeholder="Nhập tên dự án..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="search-input-field"
                    />
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <ul className="search-suggestions-dropdown">
                        {searchSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => selectSuggestion(suggestion)}
                            className="suggestion-option"
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="date-filter-control">
                  <span className="filter-label">Lọc theo khoảng thời gian:</span>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="date-input"
                      aria-label="Từ ngày"
                    />
                    <span className="date-range-separator">đến</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="date-input"
                      aria-label="Đến ngày"
                    />
                  </div>
                </div>
                <div className="province-filter-control">
                  <span className="filter-label">Lọc theo tỉnh thành:</span>
                  <div className="province-select-wrapper">
                    <select
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      className="province-select"
                      aria-label="Chọn tỉnh thành"
                    >
                      <option value="">Tất cả tỉnh thành</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="status-filter-control">
                  <label htmlFor="status-filter" className="filter-label">Lọc theo trạng thái:</label>
                  <select
                    id="status-filter"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="all">Tất cả</option>
                    <option value="Chậm tiến độ">Chậm tiến độ</option>
                    <option value="Đang tiến hành">Đang tiến hành</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                    <option value="Đang triển khai">Đang triển khai</option>
                    <option value="Đã phê duyệt – chờ khởi công">Đã phê duyệt – chờ khởi công</option>
                    <option value="Dự kiến khởi công">Dự kiến khởi công</option>
                    <option value="Đang hoàn thiện hồ sơ đầu tư">Đang hoàn thiện hồ sơ đầu tư</option>
                  </select>
                </div>

                <div className="reset-button-wrapper">
                  <button
                    type="button"
                    className="reset-filters-button"
                    onClick={resetFilters}
                  >
                    Xóa lọc
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="table-container">
        <div className="table-header">
          <h2>Danh sách dự án</h2>
          <div className="button-group">
            <button className="add-btn" onClick={() => setShowAddPopup(true)}>
              <img src={addIcon} width="16" alt="Add" /> Thêm mới
            </button>
            <button className="toggle-view-btn" onClick={toggleView}>
              {isMapView ? 'Xem dạng bảng' : 'Xem dạng bản đồ'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : isMapView ? (
          <div className="map-view-container">
            <div className="map-app-container">
              <MapComponent projects={filteredProjects} />
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Dự án</th>
                  <th>Dải tuyến</th>
                  <th>DA Thành phần</th>
                  <th>Gói thầu</th>
                  <th>Trạng thái</th>
                  <th>Tiến độ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, index) => (
                    <tr key={project.DuAnID}>
                      <td>{index + 1}</td>
                      <td>{project.TenDuAn}</td>
                      <td>{project.TongChieuDai} Km</td>
                      <td>{project.soLuongDuAnThanhPhan} Dự án thành phần</td>
                      <td>{project.soLuongGoiThau} gói thầu xây lắp</td>
                      <td>
                        <span
                          className="status-badge"
                          style={getStatusStyle(project.TrangThai)}
                        >
                          {project.TrangThai}
                        </span>
                      </td>
                      <td className="progress-cell">
                        <div className="scrollable-progress">
                          {project.duAnThanhPhan?.flatMap(duAnTP =>
                            duAnTP.goiThau?.flatMap(goiThau =>
                              goiThau.hangMuc?.map((hangMuc, idx) => (
                                <div key={`${hangMuc.HangMucID}-${idx}`} className="progress-item">
                                  <img
                                    src={parseFloat(hangMuc.tienDo?.phanTramHoanThanh || 0) >= 100 ? actualIcon :
                                      parseFloat(hangMuc.tienDo?.phanTramHoanThanh || 0) > 0 ? delayIcon : planIcon}
                                    width="18"
                                    alt="Progress"
                                  />
                                  <span>
                                    {hangMuc.TenHangMuc}: <strong>{hangMuc.tienDo?.phanTramHoanThanh || 0}%</strong>
                                  </span>
                                </div>
                              ))
                            )
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          title="Xem chi tiết dự án"
                          onClick={() => handleDetail(project.DuAnID)}
                        >
                          <img src={editIcon} width="24" alt="Edit" />
                        </button>
                        <button className="action-btn" title="Xoá dự án">
                          <img src={deleteIcon} width="24" alt="Delete" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      Không tìm thấy dự án nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popup thêm mới */}
      {showAddPopup && (
        <div className="popup" onClick={() => setShowAddPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            {/* ... giữ nguyên nội dung popup ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;
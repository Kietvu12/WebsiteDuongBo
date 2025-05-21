import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [selectedDuAnIds, setSelectedDuAnIds] = useState([]);
  const [selectedDuAnId, setSelectedDuAnId] = useState(null);
  const location = useLocation();
  const { setSelectedProjectId } = useProject();
  const navigate = useNavigate();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all');
  const [isMapView, setIsMapView] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mcpBlocks, setMcpBlocks] = useState([]);

  useEffect(() => {
    // Đọc danh sách ID từ URL query parameter
    const queryParams = new URLSearchParams(location.search);
    
    // Kiểm tra tham số DuAnIDs (nhiều ID)
    const duAnIdsString = queryParams.get('DuAnIDs');
    if (duAnIdsString) {
      const idList = duAnIdsString.split(',').map(id => Number(id));
      console.log("Danh sách DuAnIDs từ URL:", idList);
      setSelectedDuAnIds(idList);
    }
    // Kiểm tra tham số DuAnID (một ID)
    else {
      const singleId = queryParams.get('DuAnID');
      if (singleId) {
        console.log("Đọc DuAnID từ URL:", singleId);
        setSelectedDuAnId(Number(singleId));
      } else {
        // Kiểm tra sessionStorage nếu không có ID từ URL
        const id = sessionStorage.getItem('selectedDuAnId');
        if (id) setSelectedDuAnId(Number(id));
      }
    }
  }, [location.search]);

  const filterProjects = () => {
    let result = [...projects];
    if (fromDate || toDate) {
      result = result.filter(project => {
        const projectStartDate = new Date(project.NgayKhoiCong || '1970-01-01');
        const projectEndDate = new Date(project.NgayHoanThanh || '9999-12-31');
        const filterFromDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        const filterToDate = toDate ? new Date(toDate) : new Date('9999-12-31');

        return projectStartDate >= filterFromDate && projectEndDate <= filterToDate;
      });
    }
    if (status !== 'all') {
      result = result.filter(project => project.TrangThai === status);
    }
    setFilteredProjects(result);
  };

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
          const response = await axios.get('http://localhost:5000/duAnTongList');
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
  }, [fromDate, toDate, status, projects]);

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
  };

  return (
    <div className="dashboard">
      <div className="header">
        <div className="top-nav">
          <div className="nav-left">
            <button className="nav-btn"></button>
          </div>
          <div className="nav-right">
            <div className="user-profile">
              <img src={menuIcon} alt="Menu" className="small-icon" />
              <img src={helpIcon} alt="Help" className="small-icon" />
              <img src={userIcon} alt="User" className="small-icon" />
            </div>
          </div>
        </div>

        <div className="header-content">
          <div className="header-row">
            <h1>Danh sách dự án đường bộ</h1>

            <div className="search-filter">
              <div className="filter-form">
                <div className="filter-box">
                  <span>Lọc theo khoảng thời gian:</span>
                  <input
                    type="date"
                    name="from_date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="small-input"
                  />
                  <span>đến</span>
                  <input
                    type="date"
                    name="to_date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="small-input"
                  />
                </div>

                <div className="filter-box">
                  <span>Lọc theo trạng thái:</span>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="small-input"
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

                <button
                  className="reset-filter-btn"
                  onClick={resetFilters}
                >
                  Xóa lọc
                </button>
              </div>
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
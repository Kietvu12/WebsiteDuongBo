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
const SideProject = () => {
    const location = useLocation();
    const { DuAnID } = useParams();
    const [selectedDuAnConIds, setSelectedDuAnConIds] = useState([]);
    const [selectedDuAnConId, setSelectedDuAnConId] = useState(null);
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [subProjects, setSubProjects] = useState([]);
    const {setSelectedSubProjectId} = useProject()
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
    useEffect(() => {
        const fetchProjectData = async () => {
            if (!DuAnID) {
                console.error('Project ID is missing');
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/duAnThanhPhan/${DuAnID}`);
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
                // Trường hợp 1: Có danh sách ID dự án con cần hiển thị
                if (selectedDuAnConIds.length > 0) {
                    console.log("Đang xử lý nhiều dự án con:", selectedDuAnConIds);
                    
                    // Tạo mảng các promises cho các request API
                    const promises = selectedDuAnConIds.map(conId => 
                        axios.get(`http://localhost:5000/duAntp/${conId}`)
                    );
                    
                    // Chạy tất cả các requests cùng lúc
                    const results = await Promise.all(promises);
                    
                    // Xử lý kết quả và cập nhật state hiển thị
                    const duAnConData = results.map((res, index) => ({
                        ...res.data.data,
                        DuAnID: selectedDuAnConIds[index]
                    }));
                    
                    // Cập nhật subProjects để hiển thị trong bảng
                    setSubProjects(duAnConData);
                    setLoading(false);
                    
                    // Xóa IDs khỏi URL sau khi đã lấy dữ liệu
                    // window.history.replaceState({}, '', `/side-project/${DuAnID}`);
                    // setSelectedDuAnConIds([]);
                }
                // Trường hợp 2: Có một ID dự án con duy nhất
                else if (selectedDuAnConId) {
                    console.log("Đang xử lý một dự án con:", selectedDuAnConId);
                    
                    const response = await axios.get(`http://localhost:5000/duAntp/${selectedDuAnConId}`);
                    const duAnConData = [{
                        ...response.data.data,
                        DuAnID: selectedDuAnConId
                    }];
                    
                    // Cập nhật subProjects để hiển thị trong bảng
                    setSubProjects(duAnConData);
                    setLoading(false);
                    
                    // Xóa ID khỏi URL sau khi đã lấy dữ liệu
                    window.history.replaceState({}, '', `/side-project/${DuAnID}`);
                    setSelectedDuAnConId(null);
                }
                // Trường hợp 3: Tải tất cả dự án con (trường hợp mặc định)
                else {
                    console.log("Đang tải tất cả dự án con của dự án cha:", DuAnID);
                    
                    // Tải dữ liệu dự án cha và danh sách dự án con
                    const response = await axios.get(`http://localhost:5000/duAnThanhPhan/${DuAnID}`);
                    if (response.data.data) {
                        setProject(response.data.data.duAnTong);
                        setSubProjects(response.data.data.duAnThanhPhan);
                    }
                    setLoading(false);
                }
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
            <div className="w-full bg-white shadow">
                {/* Navbar */}
                <div className="flex justify-between items-center px-4 py-3 border-b">
                    <div>
                        <button aria-label="Navigation menu" className="p-2 hover:bg-gray-100 rounded-md">
                            {/* Icon có thể thêm ở đây nếu cần */}
                        </button>
                    </div>
                    <div className="flex gap-4 items-center">
                        <img src={menuIcon} alt="Menu" className="w-6 h-6 cursor-pointer" />
                        <img src={helpIcon} alt="Help" className="w-6 h-6 cursor-pointer" />
                        <img src={userIcon} alt="User profile" className="w-6 h-6 cursor-pointer" />
                    </div>
                </div>

                {/* Header Content */}
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">Danh sách dự án đường bộ</h1>

                    <form className="flex flex-wrap items-end gap-4">
                        {/* Tìm kiếm dự án */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="project-search" className="block text-sm font-medium text-gray-700 mb-1">
                                Tìm kiếm dự án:
                            </label>
                            <div className="relative">
                                <input
                                    id="project-search"
                                    type="text"
                                    placeholder="Nhập tên dự án..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
                                        {searchSuggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                onClick={() => selectSuggestion(suggestion)}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Lọc theo thời gian */}
                        <div className="flex-1 min-w-[200px]">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Lọc theo khoảng thời gian:</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Từ ngày"
                                />
                                <span className="text-sm text-gray-500">đến</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Đến ngày"
                                />
                            </div>
                        </div>

                        {/* Lọc theo trạng thái */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Lọc theo trạng thái:
                            </label>
                            <select
                                id="status-filter"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {/* Mức độ hoàn thành */}
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="completion-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Mức độ hoàn thành:
                            </label>
                            <select
                                id="completion-filter"
                                value={completionLevel}
                                onChange={(e) => setCompletionLevel(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="20">Trên 20%</option>
                                <option value="30">Trên 30%</option>
                                <option value="50">Trên 50%</option>
                                <option value="80">Trên 80%</option>
                                <option value="100">Đã hoàn thành (100%)</option>
                            </select>
                        </div>

                        {/* Nút reset */}
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
                            >
                                Xóa lọc
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            <div className="table-container">
                <div className="table-header">
                    <h2>Danh sách dự án thành phần</h2>
                    <button className="add-btn" onClick={() => setShowAddPopup(true)}>
                        <img src={addIcon} width="16" alt="Add" /> Thêm mới
                    </button>
                </div>

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Dự án</th>
                                <th>Tỉnh/Thành</th>
                                <th>Chiều dài (km)</th>
                                <th>Trạng thái</th>
                                <th>Tiến độ</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubProjects.map((subProject, index) => (
                                <tr key={subProject.DuAnID}>
                                    <td>{index + 1}</td>
                                    <td>{subProject.TenDuAn}</td>
                                    <td>{subProject.TinhThanh}</td>
                                    <td>{subProject.TongChieuDai || 'N/A'}</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={getStatusStyle(subProject.TrangThai)}
                                        >
                                            {subProject.TrangThai}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateRows: 'repeat(3, 1fr)',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <img src={planIcon} width="16" alt="Kế hoạch" style={{ flexShrink: 0 }} />
                                                <span style={{ fontSize: '13px', color: '#666' }}>
                                                    Kế hoạch: <strong>{subProject.phanTramKeHoach || '0'}%</strong>
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <img src={actualIcon} width="16" alt="Hoàn thành" style={{ flexShrink: 0 }} />
                                                <span style={{ fontSize: '13px', color: '#666' }}>
                                                    Hoàn thành: <strong>{subProject.phanTramHoanThanh || '0'}%</strong>
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <img src={delayIcon} width="16" alt="Chậm tiến độ" style={{ flexShrink: 0 }} />
                                                <span style={{ fontSize: '13px', color: '#666' }}>
                                                    Chậm tiến độ: <strong>{subProject.phanTramChamTienDo || '0'}%</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn"
                                            title="Xem chi tiết dự án"
                                            onClick={() => handleDetail(subProject.DuAnID)}
                                        >
                                            <img src={editIcon} width="24" alt="Edit" />
                                        </button>
                                        <button className="action-btn" title="Xoá dự án">
                                            <img src={deleteIcon} width="24" alt="Delete" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddPopup && (
                <div className="popup" onClick={() => setShowAddPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <h3>Thêm dự án thành phần mới</h3>
                            <button className="close-btn" onClick={() => setShowAddPopup(false)}>×</button>
                        </div>

                        <div className="form-group">
                            <label>Tên dự án</label>
                            <input type="text" placeholder="Nhập tên dự án" />
                        </div>

                        <div className="form-group">
                            <label>Tỉnh/Thành</label>
                            <input type="text" placeholder="Nhập tỉnh/thành" />
                        </div>

                        <div className="form-group">
                            <label>Chiều dài (km)</label>
                            <input type="number" placeholder="Nhập chiều dài" />
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select>
                                <option>Chưa bắt đầu</option>
                                <option>Đang tiến hành</option>
                                <option>Đã hoàn thành</option>
                                <option>Chậm tiến độ</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Mô tả</label>
                            <textarea rows="3" placeholder="Nhập mô tả dự án"></textarea>
                        </div>

                        <div className="form-actions">
                            <button onClick={() => setShowAddPopup(false)}>Hủy bỏ</button>
                            <button className="btn-save">Lưu lại</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideProject;
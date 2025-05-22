import React, { useEffect, useState } from 'react'
import './WorkItem.css'
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import addIcon from '../../assets/img/add-icon.png';
import WorkTable from '../../component/WorkTable/WorkTable';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'
import axios from 'axios';
import { useProject } from '../../contexts/ProjectContext';
import SubProjectTable from '../../component/SubProjectTable/SubProjectTable';
const WorkItem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [fromDate, setFromDate] = useState('2023-02-26');
    const [toDate, setToDate] = useState('2023-09-26');
    const [project, setProject] = useState(null);
    const [status, setStatus] = useState('all');
    const { selectedProjectId, selectedSubProjectId } = useProject();
    const [subProject, setSubProject] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                if (selectedSubProjectId) {
                    const response = await axios.get(`http://localhost:5000/hangMuc/${selectedSubProjectId}/detail`);
                    setSubProject(response.data.data.duAnThanhPhan);
                } else if (selectedProjectId) {
                    const response = await axios.get(`http://localhost:5000/duAnThanhPhan/${selectedProjectId}`);
                    setProject(response.data.data.duAnTong);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedProjectId, selectedSubProjectId, navigate]);
    const renderTitle = () => {
        if (selectedSubProjectId && subProject) {
            return `Kế hoạch các hạng mục - ${subProject.tenDuAn}`;
        } else if (project) {
            return `Kế hoạch các hạng mục - ${project.TenDuAn}`;
        }
        return 'Kế hoạch các hạng mục';
    };

    return (
        <div className='plan'>
<div className="w-full bg-white shadow-md px-4 py-3">
    {/* Top Nav */}
    <div className="flex justify-between items-center">
        <div>
            <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded"
            >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
        </div>
        <div className="flex items-center space-x-3">
            <img src={menuIcon} alt="Menu" className="w-5 h-5" />
            <img src={helpIcon} alt="Help" className="w-6 h-6 rounded-full" />
            <img src={userIcon} alt="User" className="w-6 h-6 rounded-full" />
        </div>
    </div>

    {/* Title */}
    <div className="mt-4">
        <h1 className="text-[22px] text-gray-800 font-semibold m-0">
            {renderTitle()}
        </h1>
    </div>

    {/* Search and Filter */}
    <div className="mt-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Search Box */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setShowAddPopup(true)}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                >
                    <img src={addIcon} alt="Add" className="w-4 h-4" />
                    <span>Thêm mới</span>
                </button>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="border border-gray-300 rounded px-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button className="bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
                    Tìm kiếm
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                {/* Date Filter */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Lọc theo khoảng thời gian:</span>
                    <input
                        type="date"
                        name="from_date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-gray-700">đến</span>
                    <input
                        type="date"
                        name="to_date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Lọc theo trạng thái:</span>
                    <select
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="Chậm tiến độ">Chậm tiến độ</option>
                        <option value="Đang tiến hành">Đang tiến hành</option>
                        <option value="Đã hoàn thành">Đã hoàn thành</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>

            <div className='content'>
                <div className='content'>
                    {selectedSubProjectId !== null ? (
                        // Hiển thị bảng dự án thành phần nếu selectedSubProjectId khác null
                        <SubProjectTable duAnThanhPhanId={selectedSubProjectId} />
                    ) : selectedProjectId !== null ? (
                        // Hiển thị bảng dự án tổng nếu selectedProjectId khác null
                        <WorkTable projectId={selectedProjectId} />
                    ) : (
                        // Hiển thị thông báo nếu cả hai đều null
                        <div className="no-project-selected">
                            <p>Vui lòng chọn dự án từ trang Dashboard</p>
                        </div>
                    )}
                </div>
            </div>
            {showAddPopup && (
                <div className="popup" onClick={() => setShowAddPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <h3>Thêm dự án mới</h3>
                            <button className="close-btn" onClick={() => setShowAddPopup(false)}>×</button>
                        </div>

                        <div className="form-group">
                            <label>Tên dự án</label>
                            <input type="text" placeholder="Nhập tên dự án" />
                        </div>

                        <div className="form-group">
                            <label>Dải tuyến (km)</label>
                            <input type="number" placeholder="Nhập chiều dài dải tuyến" />
                        </div>

                        <div className="form-group">
                            <label>Số dự án thành phần</label>
                            <input type="number" placeholder="Nhập số dự án thành phần" />
                        </div>

                        <div className="form-group">
                            <label>Số gói thầu</label>
                            <input type="number" placeholder="Nhập số gói thầu" />
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select>
                                <option>Chưa bắt đầu</option>
                                <option selected>Đang tiến hành</option>
                                <option>Đã hoàn thành</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tiến độ</label>
                            <textarea rows="3" placeholder="Nhập thông tin tiến độ"></textarea>
                        </div>

                        <div className="form-actions">
                            <button onClick={() => setShowAddPopup(false)}>Hủy bỏ</button>
                            <button className="btn-save">Lưu lại</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkItem
import React, { useEffect, useState } from 'react'
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
const ProjectProgress = () => {
  const { selectedProjectId, selectedSubProjectId } = useProject();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState('2023-02-26');
  const [toDate, setToDate] = useState('2023-09-26');
  const [status, setStatus] = useState('all');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
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
      <div className="w-full bg-white shadow-md px-3 sm:px-4 py-2 sm:py-3">
        {/* Top Nav */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-1 sm:p-2 hover:bg-gray-100 rounded">
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img src={menuIcon} alt="Menu" className="w-4 h-4 sm:w-5 sm:h-5" />
            <img src={helpIcon} alt="Help" className="w-4 h-4 sm:w-6 sm:h-6 rounded-full" />
            <img src={userIcon} alt="User" className="w-4 h-4 sm:w-6 sm:h-6 rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 sm:mt-4">
          <h1 className="mt-8 text-xs md:text-xl text-gray-800 font-semibold">{renderTitle()}</h1>
        </div>

        {/* Search + Filter */}
        <div className="mt-3 sm:mt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="border border-gray-300 rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <button className="bg-gray-200 px-4 py-1.5 rounded hover:bg-gray-300 text-sm whitespace-nowrap">
                  Tìm
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Thời gian:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm w-[130px]"
                />
                <span className="text-xs sm:text-sm text-gray-700">đến</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm w-[130px]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Trạng thái:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm min-w-[140px] flex-1 sm:flex-none"
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

      <ProjectManagement projectId={selectedProjectId} />
    </div>
  )
}

export default ProjectProgress
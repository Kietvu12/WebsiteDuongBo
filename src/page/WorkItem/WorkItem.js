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
import { Chart as ChartJS, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const WorkItem = () => {
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
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Sample data for charts
  const [chartData, setChartData] = useState({
    lineData: {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
      datasets: [
        {
          label: 'Tiến độ kế hoạch',
          data: [10, 30, 50, 70, 90, 100],
          borderColor: '#4CAF50', // Màu xanh lá đậm
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Tiến độ thực tế',
          data: [5, 20, 40, 60, 80, 85],
          borderColor: '#FF5722', // Màu cam đậm
          backgroundColor: 'rgba(255, 87, 34, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        }
      ]
    },
    barData: {
      labels: ['Hạng mục A', 'Hạng mục B', 'Hạng mục C', 'Hạng mục D'],
      datasets: [
        {
          label: 'Đã hoàn thành',
          data: [12, 19, 3, 5],
          backgroundColor: '#4CAF50', // Màu xanh lá
          borderColor: '#388E3C',
          borderWidth: 1
        },
        {
          label: 'Đang thực hiện',
          data: [8, 15, 12, 10],
          backgroundColor: '#2196F3', // Màu xanh dương
          borderColor: '#1976D2',
          borderWidth: 1
        }
      ]
    }
  });

  // Enhanced chart options with better styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: 14,
          weight: 'bold'
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          },
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: 14,
          weight: 'bold'
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await fetch(`${API_BASE_URL}/duAnList`);
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
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
          
          // Here you would update the chart data with real data from the API
          // For now we're using sample data
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
    if (searchTerm.trim() === '') {
      setFilteredProjects([]);
      return;
    }

    const filtered = projects.filter(project =>
      project.TenDuAn.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleProjectSelect = (project) => {
    setSearchTerm(project.TenDuAn);
    setSelectedProjectId(project.DuAnID);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredProjects.length > 0) {
      handleProjectSelect(filteredProjects[0]);
    }
  };

  const renderTitle = () => {
    if (project) {
      return `Kế hoạch các hạng mục - ${project.tenDuAn}`;
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
            <div className="flex-1 relative">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Tìm kiếm dự án..."
                    className="border border-gray-300 rounded px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && filteredProjects.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                      {filteredProjects.map(project => (
                        <li
                          key={project.DuAnID}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                  className="bg-gray-200 px-4 py-1.5 rounded hover:bg-gray-300 text-sm whitespace-nowrap"
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
                <p className="text-xs text-gray-500 mt-1">Đang tải danh sách dự án...</p>
              )}
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

      {/* Chart Section */}
      <div className="chart-section p-4 bg-white shadow-md rounded-lg my-4 mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Line Chart */}
          <div className="chart-container bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-center">Tiến độ dự án</h3>
            <div className="h-64">
              <Line data={chartData.lineData} options={chartOptions} />
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="chart-container bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-center">Trạng thái hạng mục</h3>
            <div className="h-64">
              <Bar data={chartData.barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className='content'>
        <div className='content'>
          {selectedProjectId !== null ? (
            <SubProjectTable duAnThanhPhanId={selectedProjectId} />
          ) : (
            <div className="no-project-selected p-8 text-center">
              <p className="text-gray-500">Vui lòng tìm kiếm một dự án để xem</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Project Popup */}
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
import React, { useState } from 'react';
import { 
  FaChevronLeft, 
  FaSearch, 
  FaEllipsisH, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaFilter,
  FaDownload,
  FaPrint,
  FaChevronDown,
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa'
import pin from "../../assets/img/pin.png";
import attachment from "../../assets/img/attachment.png";
import trash from "../../assets/img/file.png";
import edit from "../../assets/img/edit.png"

const ProjectProgressManagement = () => {
  const [searchProject, setSearchProject] = useState('');
  const [searchPackage, setSearchPackage] = useState('');
  const [searchContractor, setSearchContractor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State cho pop-up kế hoạch
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [planSearchTerm, setPlanSearchTerm] = useState('');

  // State cho toggle menu thao tác
  const [openActionMenus, setOpenActionMenus] = useState({});

  // Data tĩnh cho dropdown
  const packages = [
    { id: 1, name: 'Gói thầu XL01 - Đoạn Km 0+000 đến Km 32+500' },
    { id: 2, name: 'Gói thầu XL02 - Đoạn Km 32+500 đến Km 65+000' },
    { id: 3, name: 'Gói thầu XL03 - Đoạn Km 65+000 đến Km 97+500' },
    { id: 4, name: 'Gói thầu XL04 - Đoạn Km 97+500 đến Km 130+000' }
  ];

  const mainContractors = [
    { id: 1, name: 'Công ty TNHH Tập đoàn Sơn Hải' },
    { id: 2, name: 'Công ty CP Xây dựng Công trình 1' },
    { id: 3, name: 'Công ty CP Xây dựng Công trình 2' },
    { id: 4, name: 'Công ty CP Xây dựng Công trình 3' }
  ];

  const subContractors = [
    { id: 1, name: 'Công ty TNHH Thương mại và Xây dựng ABC' },
    { id: 2, name: 'Công ty CP Đầu tư và Xây dựng XYZ' },
    { id: 3, name: 'Công ty TNHH Xây dựng và Thương mại DEF' },
    { id: 4, name: 'Công ty CP Xây dựng và Thương mại GHI' }
  ];

  // Data tĩnh cho kế hoạch
  const plansData = {
    1: [ // Công ty TNHH Tập đoàn Sơn Hải
      { id: 1, name: 'Kế hoạch thi công móng cầu Km 5+200', status: 'completed', startDate: '2024-01-15', endDate: '2024-03-20', progress: 100 },
      { id: 2, name: 'Kế hoạch đổ bê tông trụ cầu Km 8+500', status: 'completed', startDate: '2024-02-01', endDate: '2024-04-15', progress: 100 },
      { id: 3, name: 'Kế hoạch thi công đường dẫn Km 10+000', status: 'in_progress', startDate: '2024-03-01', endDate: '2024-06-30', progress: 65 },
      { id: 4, name: 'Kế hoạch san lấp mặt bằng Km 12+300', status: 'in_progress', startDate: '2024-03-15', endDate: '2024-05-20', progress: 45 },
      { id: 5, name: 'Kế hoạch thi công cống thoát nước Km 15+800', status: 'delayed', startDate: '2024-02-20', endDate: '2024-04-30', progress: 30 },
      { id: 6, name: 'Kế hoạch đắp đất nền đường Km 18+200', status: 'in_progress', startDate: '2024-04-01', endDate: '2024-07-15', progress: 25 },
      { id: 7, name: 'Kế hoạch thi công lớp móng cấp phối Km 20+500', status: 'not_started', startDate: '2024-05-01', endDate: '2024-08-30', progress: 0 },
      { id: 8, name: 'Kế hoạch thi công lớp móng đá dăm Km 22+800', status: 'not_started', startDate: '2024-06-01', endDate: '2024-09-30', progress: 0 },
      { id: 9, name: 'Kế hoạch thi công lớp bê tông nhựa Km 25+100', status: 'not_started', startDate: '2024-07-01', endDate: '2024-10-31', progress: 0 },
      { id: 10, name: 'Kế hoạch thi công vạch sơn Km 27+400', status: 'not_started', startDate: '2024-08-01', endDate: '2024-11-30', progress: 0 },
      { id: 11, name: 'Kế hoạch thi công biển báo Km 29+700', status: 'not_started', startDate: '2024-09-01', endDate: '2024-12-31', progress: 0 },
      { id: 12, name: 'Kế hoạch thi công đèn chiếu sáng Km 30+500', status: 'not_started', startDate: '2024-10-01', endDate: '2025-01-31', progress: 0 },
      { id: 13, name: 'Kế hoạch thi công rào chắn Km 31+200', status: 'not_started', startDate: '2024-11-01', endDate: '2025-02-28', progress: 0 },
      { id: 14, name: 'Kế hoạch hoàn thiện cảnh quan Km 31+800', status: 'not_started', startDate: '2024-12-01', endDate: '2025-03-31', progress: 0 },
      { id: 15, name: 'Kế hoạch nghiệm thu và bàn giao Km 32+000', status: 'not_started', startDate: '2025-01-01', endDate: '2025-04-30', progress: 0 }
    ],
    2: [ // Công ty TNHH Thương mại và Xây dựng ABC
      { id: 16, name: 'Kế hoạch thi công móng cầu phụ Km 5+500', status: 'completed', startDate: '2024-01-20', endDate: '2024-03-25', progress: 100 },
      { id: 17, name: 'Kế hoạch đổ bê tông dầm cầu Km 6+200', status: 'completed', startDate: '2024-02-10', endDate: '2024-04-20', progress: 100 },
      { id: 18, name: 'Kế hoạch thi công đường dẫn phụ Km 7+800', status: 'in_progress', startDate: '2024-03-10', endDate: '2024-06-15', progress: 70 },
      { id: 19, name: 'Kế hoạch san lấp mặt bằng phụ Km 9+300', status: 'in_progress', startDate: '2024-03-25', endDate: '2024-05-25', progress: 55 },
      { id: 20, name: 'Kế hoạch thi công cống thoát nước phụ Km 11+600', status: 'delayed', startDate: '2024-02-25', endDate: '2024-05-05', progress: 35 },
      { id: 21, name: 'Kế hoạch đắp đất nền đường phụ Km 13+100', status: 'in_progress', startDate: '2024-04-05', endDate: '2024-07-20', progress: 30 },
      { id: 22, name: 'Kế hoạch thi công lớp móng cấp phối phụ Km 14+400', status: 'not_started', startDate: '2024-05-05', endDate: '2024-09-05', progress: 0 },
      { id: 23, name: 'Kế hoạch thi công lớp móng đá dăm phụ Km 15+700', status: 'not_started', startDate: '2024-06-05', endDate: '2024-10-05', progress: 0 }
    ],
    3: [ // Công ty CP Đầu tư và Xây dựng XYZ
      { id: 24, name: 'Kế hoạch thi công móng cầu phụ Km 6+800', status: 'completed', startDate: '2024-01-25', endDate: '2024-03-30', progress: 100 },
      { id: 25, name: 'Kế hoạch đổ bê tông dầm cầu phụ Km 7+500', status: 'in_progress', startDate: '2024-02-15', endDate: '2024-05-25', progress: 60 },
      { id: 26, name: 'Kế hoạch thi công đường dẫn phụ Km 8+200', status: 'in_progress', startDate: '2024-03-15', endDate: '2024-06-20', progress: 40 },
      { id: 27, name: 'Kế hoạch san lấp mặt bằng phụ Km 9+900', status: 'delayed', startDate: '2024-03-30', endDate: '2024-06-30', progress: 25 },
      { id: 28, name: 'Kế hoạch thi công cống thoát nước phụ Km 12+200', status: 'delayed', startDate: '2024-03-05', endDate: '2024-06-10', progress: 20 },
      { id: 29, name: 'Kế hoạch đắp đất nền đường phụ Km 13+700', status: 'in_progress', startDate: '2024-04-10', endDate: '2024-07-25', progress: 15 },
      { id: 30, name: 'Kế hoạch thi công lớp móng cấp phối phụ Km 15+000', status: 'not_started', startDate: '2024-05-10', endDate: '2024-09-10', progress: 0 }
    ]
  };

  // Data tĩnh cho bảng mới - cấu trúc phẳng
  const tableData = [
    {
      id: 1,
      packageName: 'Gói thầu XL01 - Đoạn Km 0+000 đến Km 32+500',
      contractorName: 'Công ty TNHH Tập đoàn Sơn Hải',
      contractorType: 'Nhà thầu chính',
      mainContractorOf: null,
      planCount: 15,
      completedPercent: 75,
      delayedPercent: 5,
      inProgressPercent: 20
    },
    {
      id: 2,
      packageName: 'Gói thầu XL01 - Đoạn Km 0+000 đến Km 32+500',
      contractorName: 'Công ty TNHH Thương mại và Xây dựng ABC',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty TNHH Tập đoàn Sơn Hải',
      planCount: 8,
      completedPercent: 80,
      delayedPercent: 3,
      inProgressPercent: 17
    },
    {
      id: 3,
      packageName: 'Gói thầu XL01 - Đoạn Km 0+000 đến Km 32+500',
      contractorName: 'Công ty CP Đầu tư và Xây dựng XYZ',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty TNHH Tập đoàn Sơn Hải',
      planCount: 7,
      completedPercent: 60,
      delayedPercent: 8,
      inProgressPercent: 32
    },
    {
      id: 4,
      packageName: 'Gói thầu XL02 - Đoạn Km 32+500 đến Km 65+000',
      contractorName: 'Công ty CP Xây dựng Công trình 1',
      contractorType: 'Nhà thầu chính',
      mainContractorOf: null,
      planCount: 12,
      completedPercent: 45,
      delayedPercent: 10,
      inProgressPercent: 45
    },
    {
      id: 5,
      packageName: 'Gói thầu XL02 - Đoạn Km 32+500 đến Km 65+000',
      contractorName: 'Công ty TNHH Xây dựng và Thương mại DEF',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty CP Xây dựng Công trình 1',
      planCount: 6,
      completedPercent: 50,
      delayedPercent: 5,
      inProgressPercent: 45
    },
    {
      id: 6,
      packageName: 'Gói thầu XL03 - Đoạn Km 65+000 đến Km 97+500',
      contractorName: 'Công ty CP Xây dựng Công trình 2',
      contractorType: 'Nhà thầu chính',
      mainContractorOf: null,
      planCount: 18,
      completedPercent: 85,
      delayedPercent: 2,
      inProgressPercent: 13
    },
    {
      id: 7,
      packageName: 'Gói thầu XL03 - Đoạn Km 65+000 đến Km 97+500',
      contractorName: 'Công ty TNHH Thương mại và Xây dựng ABC',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty CP Xây dựng Công trình 2',
      planCount: 9,
      completedPercent: 90,
      delayedPercent: 1,
      inProgressPercent: 9
    },
    {
      id: 8,
      packageName: 'Gói thầu XL03 - Đoạn Km 65+000 đến Km 97+500',
      contractorName: 'Công ty CP Đầu tư và Xây dựng XYZ',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty CP Xây dựng Công trình 2',
      planCount: 9,
      completedPercent: 70,
      delayedPercent: 5,
      inProgressPercent: 25
    },
    {
      id: 9,
      packageName: 'Gói thầu XL04 - Đoạn Km 97+500 đến Km 130+000',
      contractorName: 'Công ty CP Xây dựng Công trình 3',
      contractorType: 'Nhà thầu chính',
      mainContractorOf: null,
      planCount: 10,
      completedPercent: 25,
      delayedPercent: 15,
      inProgressPercent: 60
    },
    {
      id: 10,
      packageName: 'Gói thầu XL04 - Đoạn Km 97+500 đến Km 130+000',
      contractorName: 'Công ty TNHH Xây dựng và Thương mại DEF',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty CP Xây dựng Công trình 3',
      planCount: 5,
      completedPercent: 30,
      delayedPercent: 10,
      inProgressPercent: 60
    },
    {
      id: 11,
      packageName: 'Gói thầu XL04 - Đoạn Km 97+500 đến Km 130+000',
      contractorName: 'Công ty CP Xây dựng và Thương mại GHI',
      contractorType: 'Nhà thầu phụ',
      mainContractorOf: 'Công ty CP Xây dựng Công trình 3',
      planCount: 5,
      completedPercent: 15,
      delayedPercent: 20,
      inProgressPercent: 65
    }
  ];

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
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
    setPlanSearchTerm('');
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
  const filteredPlans = selectedContractor && plansData[selectedContractor.id] 
    ? plansData[selectedContractor.id].filter(plan => 
        plan.name.toLowerCase().includes(planSearchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-100" onClick={closeAllActionMenus}>
      {/* Header */}
      <div className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Quay lại">
            <FaChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Quản lý tiến độ dự án theo nhà thầu</h1>
        </div>
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          A
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
                type="text"
                value={searchProject}
                onChange={(e) => setSearchProject(e.target.value)}
                placeholder="Nhập tên dự án..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
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
                  onChange={(e) => setSearchPackage(e.target.value)}
                  placeholder="Nhập tên gói thầu..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Search theo tên nhà thầu */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Tìm kiếm theo tên nhà thầu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchContractor}
                  onChange={(e) => setSearchContractor(e.target.value)}
                  placeholder="Nhập tên nhà thầu..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
              {currentItems.map((item, index) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
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
                  {filteredPlans.map((plan, index) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={plan.name}>
                          {plan.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {renderPlanStatusBadge(plan.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400 mr-1" />
                          {new Date(plan.startDate).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400 mr-1" />
                          {new Date(plan.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                plan.progress === 100 ? 'bg-green-500' :
                                plan.progress >= 50 ? 'bg-blue-500' :
                                plan.progress > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${plan.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{plan.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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
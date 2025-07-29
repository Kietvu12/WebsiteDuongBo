import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaBuilding,
  FaIndustry,
  FaHardHat,
  FaTools,
  FaCog,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEllipsisH,
  FaChevronDown,
  FaFilter,
  FaUser,
  FaIdCard,
  FaFileContract,
  FaCalendarAlt,
  FaClipboardList,
  FaSearch
} from 'react-icons/fa';
import pin from "../../assets/img/pin.png";
import attachment from "../../assets/img/attachment.png";
import trash from "../../assets/img/file.png";
import edit from "../../assets/img/edit.png"
import { useProject } from '../../contexts/ProjectContext';
const ContractorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [filteredContractors, setFilteredContractors] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { logout, user} = useProject();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarRef = useRef(null);
  const mergedProvinces = [
    "Thành phố Hà Nội",
    "Thành phố Huế",
    "Tỉnh Quảng Ninh",
    "Tỉnh Cao Bằng",
    "Tỉnh Lạng Sơn",
    "Tỉnh Lai Châu",
    "Tỉnh Điện Biên",
    "Tỉnh Sơn La",
    "Tỉnh Thanh Hóa",
    "Tỉnh Nghệ An",
    "Tỉnh Hà Tĩnh",
    "Tỉnh Tuyên Quang",
    "Tỉnh Lào Cai",
    "Tỉnh Thái Nguyên",
    "Tỉnh Phú Thọ",
    "Tỉnh Bắc Ninh",
    "Tỉnh Hưng Yên",
    "Thành phố Hải Phòng",
    "Tỉnh Ninh Bình",
    "Tỉnh Quảng Trị",
    "Thành phố Đà Nẵng",
    "Tỉnh Quảng Ngãi",
    "Tỉnh Gia Lai",
    "Tỉnh Khánh Hòa",
    "Tỉnh Lâm Đồng",
    "Tỉnh Đắk Lắk",
    "Thành phố Hồ Chí Minh",
    "Tỉnh Đồng Nai",
    "Tỉnh Tây Ninh",
    "Thành phố Cần Thơ",
    "Tỉnh Vĩnh Long",
    "Tỉnh Đồng Tháp",
    "Tỉnh Cà Mau",
    "Tỉnh An Giang"
  ];
  // Fetch contractors data
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/nhaThauFullList`);
                          const formattedData = response.data.data.map(contractor => ({
                    ...contractor,
                    iconColor: getRandomColor(),
                    status: "Hoạt động",
                    phoneCount: 1,
                    emailCount: 1,
                    metrics: {
                      duAn: {
                        value: contractor.thongKe?.tongGoiThau || 0,
                        timeframe: "Tổng số dự án"
                      },
                      goiThau: {
                        value: contractor.danhSachGoiThau?.length || 0,
                        timeframe: "Tổng số gói thầu"
                      },
                      hangMuc: {
                        value: contractor.thongKe?.tongHangMuc || 0,
                        timeframe: "Tổng số hạng mục"
                      },
                      keHoach: {
                        value: contractor.thongKe?.tongKeHoach || 0,
                        timeframe: "Tổng số kế hoạch"
                      }
                    },
                    tags: [contractor.Loai || "Xây dựng", "Uy tín"]
                  }));
        setContractors(formattedData);
        setFilteredContractors(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  // Filter contractors based on search term and province
  useEffect(() => {
    let filtered = contractors;

                // Filter by search term (name or tax code)
            if (searchTerm.trim() !== '') {
              filtered = filtered.filter(contractor =>
                (contractor.TenNhaThau && contractor.TenNhaThau.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (contractor.MaSoThue && contractor.MaSoThue.toLowerCase().includes(searchTerm.toLowerCase()))
              );
            }

    // Filter by province
    if (selectedProvince !== 'All') {
      filtered = filtered.filter(contractor => {
        if (!contractor.DiaChiTruSo) return false;
        return contractor.DiaChiTruSo.includes(selectedProvince);
      });
    }

    setFilteredContractors(filtered);
  }, [searchTerm, selectedProvince, contractors]);

  // Close menu when clicking outside


  // Helper function to generate random color
  const getRandomColor = () => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderMetric = (metricData, label) => (
    <div className="text-center p-1 sm:p-2">
      <div className="font-bold text-lg sm:text-xl text-gray-900">{metricData.value}</div>
      <div className="text-xs sm:text-sm text-gray-700 capitalize">{label}</div>
      <div className="text-xs text-gray-500 hidden sm:block">{metricData.timeframe}</div>
    </div>
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedProvince('All');
  };

  const handleEdit = (contractor) => {
    console.log('Edit:', contractor);
    setEditData(contractor);
    setShowEditModal(true);
  };
  const handleDelete = (id) => {
    console.log('Delete:', id);
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };
  const handleUpdateContractor = async (updatedData) => {
    try {
      const body = {
        TenNhaThau: updatedData.TenNhaThau,
        Loai: updatedData.Loai,
        MaSoThue: updatedData.MaSoThue,
        DiaChiTruSo: updatedData.DiaChiTruSo,
        SoDienThoai: updatedData.SoDienThoai,
        Email: updatedData.Email,
        NguoiDaiDien: updatedData.NguoiDaiDien,
        ChucVuNguoiDaiDien: updatedData.ChucVuNguoiDaiDien,
        GhiChu: updatedData.GhiChu,
      };
      await axios.put(`${API_BASE_URL}/api/nhathau/${updatedData.NhaThauID}`, body);
      setShowEditModal(false);
      // Reload lại danh sách
      const response = await axios.get(`${API_BASE_URL}/nhaThauFullList`);
      const formattedData = response.data.data.map(contractor => ({
        ...contractor,
        iconColor: getRandomColor(),
        status: "Hoạt động",
        phoneCount: 1,
        emailCount: 1,
        metrics: {
          duAn: {
            value: contractor.thongKe?.tongGoiThau || 0,
            timeframe: "Tổng số dự án"
          },
          goiThau: {
            value: contractor.danhSachGoiThau?.length || 0,
            timeframe: "Tổng số gói thầu"
          },
          hangMuc: {
            value: contractor.thongKe?.tongHangMuc || 0,
            timeframe: "Tổng số hạng mục"
          },
          keHoach: {
            value: contractor.thongKe?.tongKeHoach || 0,
            timeframe: "Tổng số kế hoạch"
          }
        },
        tags: [contractor.Loai || "Xây dựng", "Uy tín"]
      }));
      setContractors(formattedData);
      setFilteredContractors(formattedData);
    } catch (err) {
      alert('Cập nhật thất bại!');
    }
  };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/nhaThau/${deleteId}`);
      setShowDeleteConfirm(false);
      // Reload lại danh sách
      const response = await axios.get(`${API_BASE_URL}/nhaThauFullList`);
      const formattedData = response.data.data.map(contractor => ({
        ...contractor,
        iconColor: getRandomColor(),
        status: "Hoạt động",
        phoneCount: 1,
        emailCount: 1,
        metrics: {
          duAn: {
            value: contractor.thongKe?.tongGoiThau || 0,
            timeframe: "Tổng số dự án"
          },
          goiThau: {
            value: contractor.danhSachGoiThau?.length || 0,
            timeframe: "Tổng số gói thầu"
          },
          hangMuc: {
            value: contractor.thongKe?.tongHangMuc || 0,
            timeframe: "Tổng số hạng mục"
          },
          keHoach: {
            value: contractor.thongKe?.tongKeHoach || 0,
            timeframe: "Tổng số kế hoạch"
          }
        },
        tags: [contractor.Loai || "Xây dựng", "Uy tín"]
      }));
      setContractors(formattedData);
      setFilteredContractors(formattedData);
    } catch (err) {
      alert('Xóa thất bại! Có thể nhà thầu còn liên kết dữ liệu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Đang tải dữ liệu nhà thầu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h3 className="text-lg font-medium text-red-600 mb-2">Lỗi khi tải dữ liệu</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-200">
      <div className="w-full">
        {/* Header mới */}
        <div className="bg-white shadow-sm px-2 py-2 sm:px-4 sm:py-3 mt-14 md:mt-0 flex flex-wrap items-center justify-between min-h-[48px]" style={{ maxWidth: '100%' }}>
          {/* Bên trái: Nút back + tiêu đề */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-1 sm:p-2 rounded-full hover:bg-gray-100" onClick={() => window.history.back()}>
              <FaChevronDown style={{ transform: 'rotate(90deg)' }} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <span className="text-base sm:text-lg font-semibold text-gray-900">Quản lý nhà thầu</span>
          </div>
          {/* Bên phải: Avatar + Dropdown */}
          <div className="relative" ref={avatarRef}>
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-pink-400 text-white font-bold text-base sm:text-lg cursor-pointer select-none"
              onClick={() => setShowAvatarMenu((v) => !v)}
              title="Tài khoản"
            >
              R
            </div>
            {showAvatarMenu && (
              <div className="absolute right-0 mt-2 w-32 sm:w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  onClick={logout}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Search and Filter Bar */}
        <div className="bg-white shadow-sm px-2 py-2 sm:px-4 sm:py-3 mb-4" style={{ maxWidth: '100%' }}>
          <div className="w-full">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full">
              {/* Search Input */}
              <div className="flex-1 relative min-w-0 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Tìm kiếm theo tên nhà thầu hoặc mã số thuế..."
                  className="block w-full pl-10 pr-10 py-2 sm:py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-md transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Province Filter */}
              <div className="flex-1 w-full sm:w-80">
                <select
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="block w-full py-2 sm:py-2.5 px-3 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all duration-200"
                >
                  <option value="All">Tất cả tỉnh/thành phố</option>
                  {mergedProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Status and Actions */}
            {(searchTerm || selectedProvince !== 'All') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Active Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <FaSearch className="w-3 h-3 mr-1.5" />
                        Tìm kiếm: "{searchTerm}"
                      </span>
                    )}
                    {selectedProvince !== 'All' && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1.5" />
                        Tỉnh: {selectedProvince}
                      </span>
                    )}
                  </div>
                  
                  {/* Clear Button */}
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all duration-200"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Xóa bộ lọc
                  </button>
                </div>

                {/* Results Count */}
                <div className="mt-3 text-sm text-gray-600 font-medium">
                  Tìm thấy <span className="text-blue-600 font-bold">{filteredContractors.length}</span> nhà thầu
                  {searchTerm && <span className="text-gray-500"> cho "{searchTerm}"</span>}
                  {selectedProvince !== 'All' && <span className="text-gray-500"> tại {selectedProvince}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full px-1 sm:px-4 lg:px-6">
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 lg:p-6">
            <div className="space-y-3 sm:space-y-4">
              {filteredContractors.map((contractor) => (
                <div key={contractor.NhaThauID} className="bg-white rounded-lg shadow-sm p-2 sm:p-4 lg:p-6 border border-gray-200 w-full hover:shadow-md transition-shadow duration-200">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
                    <div className="flex items-start">
                      {/* Icon Container */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${contractor.iconColor} shadow-sm`}>
                        <span className="text-white font-bold text-base sm:text-lg">
                          {(contractor.TenNhaThau && contractor.TenNhaThau.charAt(0)) || 'N'}
                        </span>
                      </div>
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 mb-1 sm:mb-2 truncate">
                          {contractor.TenNhaThau || 'Không có tên'}
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                          <div className="flex items-center">
                            <FaIdCard className="w-4 h-4 mr-2 sm:mr-3 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-600">MST:</span>
                            <span className="ml-1 sm:ml-2 font-mono text-gray-800">{contractor.MaSoThue || 'Không có MST'}</span>
                          </div>
                          <div className="flex items-center">
                            <FaUser className="w-4 h-4 mr-2 sm:mr-3 text-gray-500 flex-shrink-0" />
                            <span className="font-medium text-gray-600">Người đại diện:</span>
                            <span className="ml-1 sm:ml-2 truncate text-gray-800">
                              {contractor.NguoiDaiDien || 'Không có'} - {contractor.ChucVuNguoiDaiDien || 'Không có'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                      {/* Pin button */}
                      <button className="text-gray-400 hover:text-blue-600 p-1 sm:p-2 rounded-lg hover:bg-blue-50 flex-shrink-0 transition-all duration-200">
                        <img src={pin} alt="Pin" className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {/* Three dots menu */}
                      <div className="relative" ref={menuRef}>
                        <button 
                          className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-lg hover:bg-gray-100 flex-shrink-0 transition-all duration-200"
                          onClick={() => setOpenMenuId(openMenuId === contractor.NhaThauID ? null : contractor.NhaThauID)}
                        >
                          <FaEllipsisH className="w-5 h-5" />
                        </button>
                        {/* Dropdown menu */}
                        {openMenuId === contractor.NhaThauID && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-2">
                              <button className="flex items-center w-full px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => handleEdit(contractor)}>
                                <img src={edit} alt="Edit" className="w-4 h-4 mr-2 sm:mr-3" />
                                Chỉnh sửa
                              </button>
                              <button className="flex items-center w-full px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => handleDelete(contractor.NhaThauID)}>
                                <img src={trash} alt="Delete" className="w-4 h-4 mr-2 sm:mr-3" />
                                Xóa
                              </button>
                              <button className="flex items-center w-full px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <img src={attachment} alt="Attachment" className="w-4 h-4 mr-2 sm:mr-3" />
                                Tệp đính kèm
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Metrics Section with borders */}
                  <div className="border-t border-b border-gray-200 py-2 sm:py-4 mb-2 sm:mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
                      {renderMetric(contractor.metrics.duAn, 'Dự án')}
                      {renderMetric(contractor.metrics.goiThau, 'Gói thầu')}
                      {renderMetric(contractor.metrics.hangMuc, 'Hạng mục')}
                      {renderMetric(contractor.metrics.keHoach, 'Kế hoạch')}
                    </div>
                  </div>
                  {/* Status & Actions Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1 sm:mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-500 truncate">{contractor.DiaChiTruSo || 'Không có địa chỉ'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaEnvelope className="w-3 h-3 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-500 truncate">{contractor.Email || 'Không có email'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="w-3 h-3 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-500 truncate">{contractor.SoDienThoai || 'Không có số điện thoại'}</span>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 self-start sm:self-auto mt-1 sm:mt-0">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                      {contractor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Pagination */}
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 lg:p-6 mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              {/* Items per page - Mobile: Full width, Desktop: Left */}
              <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-700">Hiển thị</span>
                <select className="border border-gray-300 rounded-md px-1 sm:px-2 py-1 text-xs sm:text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span className="text-xs sm:text-sm text-gray-700">trên trang</span>
              </div>
              {/* Pagination buttons - Mobile: Centered, Desktop: Center */}
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">
                  Trước
                </button>
                <div className="flex space-x-1">
                  <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md">1</button>
                  <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">2</button>
                  <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">3</button>
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500">...</span>
                  <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">10</button>
                </div>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Sau
                </button>
              </div>
              {/* Results info - Mobile: Full width, Desktop: Right */}
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-right">
                Hiển thị 1-{filteredContractors.length} của {filteredContractors.length} kết quả
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa nhà thầu</h3>
            <input
              className="w-full border p-2 mb-2"
              value={editData?.TenNhaThau || ''}
              onChange={e => setEditData({ ...editData, TenNhaThau: e.target.value })}
              placeholder="Tên nhà thầu *"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.Loai || ''}
              onChange={e => setEditData({ ...editData, Loai: e.target.value })}
              placeholder="Loại"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.MaSoThue || ''}
              onChange={e => setEditData({ ...editData, MaSoThue: e.target.value })}
              placeholder="Mã số thuế *"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.DiaChiTruSo || ''}
              onChange={e => setEditData({ ...editData, DiaChiTruSo: e.target.value })}
              placeholder="Địa chỉ trụ sở"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.SoDienThoai || ''}
              onChange={e => setEditData({ ...editData, SoDienThoai: e.target.value })}
              placeholder="Số điện thoại"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.Email || ''}
              onChange={e => setEditData({ ...editData, Email: e.target.value })}
              placeholder="Email"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.NguoiDaiDien || ''}
              onChange={e => setEditData({ ...editData, NguoiDaiDien: e.target.value })}
              placeholder="Người đại diện"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.ChucVuNguoiDaiDien || ''}
              onChange={e => setEditData({ ...editData, ChucVuNguoiDaiDien: e.target.value })}
              placeholder="Chức vụ người đại diện"
            />
            <input
              className="w-full border p-2 mb-2"
              value={editData?.GhiChu || ''}
              onChange={e => setEditData({ ...editData, GhiChu: e.target.value })}
              placeholder="Ghi chú"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
              <button onClick={() => handleUpdateContractor(editData)} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-red-600">Xác nhận xóa nhà thầu?</h3>
            <p>Bạn có chắc chắn muốn xóa nhà thầu này không?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorDashboard;
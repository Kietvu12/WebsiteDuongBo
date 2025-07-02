
import React, { useState, useEffect, useCallback } from 'react';
import downIcon from '../../assets/img/down.png';
import axios from 'axios';
import { FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { FiPlus, FiChevronLeft, FiCalendar, FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import AddNewPlan from '../AddNewPlan/AddNewPlan';
import AddNewCategories from '../AddNewCategories/AddNewCategories';
import UpdateProgress from '../UpdateProgress/UpdateProgress';
import IssueList from '../IssueList/IssueList';
const SubProjectTable = ({ duAnThanhPhanId, packageId, onClose }) => {
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const navigate = useNavigate();
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showIssuePopup, setShowIssuePopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleOpenIssuePopup = (plan, projectId) => {
    setSelectedPlan(plan);
    setSelectedProjectId(projectId);
    setShowIssuePopup(true);
  };

  // Hàm đóng popup
  const handleCloseIssuePopup = () => {
    setShowIssuePopup(false);
    setSelectedPlan(null);
    setSelectedProjectId(null);
  };

  // Hàm mở popup cập nhật tiến độ
  const handleOpenProgressPopup = (plan) => {
    setSelectedPlan(plan);
    setShowProgressPopup(true);
  };

  // Hàm đóng popup
  const handleCloseProgressPopup = () => {
    setShowProgressPopup(false);
    setSelectedPlan(null);
  };
  const [expandedItems, setExpandedItems] = useState({
    packages: {},
    categories: {},
    items: {}
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [progressPopup, setProgressPopup] = useState({
    visible: false,
    plan: null,
    progressData: []
  });
  console.log("Gói thầu bên này:", packageId);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/hangMuc/${duAnThanhPhanId}/detail`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
      console.log('Data fetched:', result.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [duAnThanhPhanId]); // Phụ thuộc vào duAnThanhPhanId

  // Sử dụng trong useEffect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleItem = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  const handleAddCategoryClick = (goiThauId) => {
    setSelectedPackageId(goiThauId);
    setShowAddCategoryModal(true);
  };

  const handleCategoryAdded = (newCategory) => {
    setShowAddCategoryModal(false);
  };
  const handleAddPlanClick = (hangMucId) => {
    setSelectedCategoryId(hangMucId);
    setShowAddPlanModal(true);
  };

  const handlePlanAdded = (newPlan) => {
    setShowAddPlanModal(false);
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fetchProgressData = async (keHoachId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tien-do/${keHoachId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return null;
    }
  };

  const handleViewDetails = async (plan) => {
    const progressData = await fetchProgressData(plan.keHoachId);

    setProgressPopup({
      visible: true,
      plan: plan,
      progressData: progressData?.danhSachTienDo || [] // Chỉ lấy danh sách tiến độ
    });
  };
  const handleDeleteHangMuc = async (hangMucId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng mục này?')) {
      return;
    }

    try {
      setDeletingId(hangMucId); // Để hiển thị loading cho item cụ thể

      const response = await fetch(`${API_BASE_URL}/hangmuc/${hangMucId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Xóa không thành công');
      }

      // Gọi lại fetchData để cập nhật danh sách
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };
  const handleDeleteKeHoach = async (hangMucId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng mục này?')) {
      return;
    }

    try {
      setDeletingId(hangMucId); // Để hiển thị loading cho item cụ thể

      const response = await fetch(`${API_BASE_URL}/kehoach/${hangMucId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Xóa không thành công');
      }

      // Gọi lại fetchData để cập nhật danh sách
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const ProgressPopup = ({ visible, plan, progressData, onClose }) => {
    if (!visible) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chi tiết tiến độ: {plan?.tenCongTac}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>

          {/* Status Alert */}
          {(() => {
            const isCompleted = plan?.tongKhoiLuongThucHien >= plan?.khoiLuongKeHoach;
            const isOverdue = !isCompleted && new Date() > new Date(plan?.ngayKetThuc);
            const daysOverdue = isOverdue
              ? Math.ceil((new Date() - new Date(plan?.ngayKetThuc)) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start ${isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : isOverdue
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                  }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isOverdue ? (
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">
                    {isCompleted
                      ? 'Đã hoàn thành'
                      : isOverdue
                        ? `Đã quá hạn ${Math.floor(daysOverdue)} ngày`
                        : 'Đang thực hiện'}
                  </h4>
                </div>
              </div>
            );
          })()}

          {/* Plan Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-500">Khối lượng kế hoạch</div>
              <div className="font-semibold text-lg mt-1">
                {plan?.khoiLuongKeHoach?.toLocaleString()} {plan?.donViTinh}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-gray-500">Đã thực hiện</div>
              <div className="font-semibold text-lg mt-1">
                {plan?.tongKhoiLuongThucHien?.toLocaleString()} {plan?.donViTinh}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {plan?.khoiLuongKeHoach
                  ? `${Math.round((plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100)}% hoàn thành`
                  : '0% hoàn thành'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-500">Thời gian</div>
              <div className="font-semibold text-sm mt-1">
                {formatDate(plan?.ngayBatDau)} → {formatDate(plan?.ngayKetThuc)}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {calculateDays(plan?.ngayBatDau, plan?.ngayKetThuc)} ngày
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <h4 className="font-medium mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Lịch sử cập nhật tiến độ
          </h4>

          <div className="space-y-4">
            {progressData?.length > 0 ? (
              progressData.map((progress, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4 relative pb-4">
                  {/* Timeline dot */}
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>

                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(progress.NgayCapNhat, true)}
                      </div>
                      <div className="text-blue-600 mt-1 font-semibold">
                        +{progress.KhoiLuongThucHien?.toLocaleString()} {progress.DonViTinh}
                      </div>
                    </div>
                  </div>

                  {progress.MoTaVuongMac && (
                    <div className="mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <div className="flex items-start">
                        <svg
                          className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-yellow-700">Vướng mắc</div>
                          <p className="text-sm text-yellow-600 mt-1">{progress.MoTaVuongMac}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {progress.GhiChu && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-start">
                        <svg
                          className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Ghi chú</div>
                          <p className="text-sm text-gray-600 mt-1">{progress.GhiChu}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500">Chưa có dữ liệu cập nhật tiến độ.</div>
            )}
          </div>
        </div>
      </div>

    );
  };
  const handleApproval = () => navigate(`/approvals/${duAnThanhPhanId}`)
  const handleProjectProgress = () => navigate(`/project-progress/${duAnThanhPhanId}`)
  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">No data available</div>;

  return (
    <div className="w-full overflow-x-auto p-2">
      <div className="hidden md:block">
          {/* Phần tìm kiếm và lọc ngày */}
  <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-md shadow-sm">
    {/* Ô tìm kiếm */}
    <div className="flex-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Tìm kiếm công việc, hạng mục..."
        />
      </div>
    </div>

    {/* Bộ lọc ngày tháng */}
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Ngày bắt đầu */}
      <div className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400" />
          </div>
          <input
            type="date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <label className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white">Từ ngày</label>
        </div>
      </div>

      {/* Ngày kết thúc */}
      <div className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400" />
          </div>
          <input
            type="date"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <label className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white">Đến ngày</label>
        </div>
      </div>

      {/* Nút áp dụng */}
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
        <FiFilter className="w-4 h-4" />
        <span>Lọc</span>
      </button>
    </div>
  </div>
        <div className="w-full overflow-x-auto">
          <table className="divide-y divide-gray-200 border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">STT</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Mã số</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Công việc</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Khối lượng thực hiện</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Khối lượng kế hoạch</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Đơn vị</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Tiến độ thực hiện</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Thời gian (ngày)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Bắt đầu</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Kết thúc</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {([]).concat(
                data?.duAnThanhPhan?.danhSachGoiThau || [],
                data?.duAnTong?.danhSachGoiThauTrucTiep || [],
                data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
              )
                .filter(packageItem => !packageId || packageItem.goiThauId === packageId)
                .map((packageItem, packageIndex) => (

                  <React.Fragment key={`package-${packageItem.goiThauId}`}>
                    <tr className="group bg-blue-50 hover:bg-blue-100">
                      <td className="px-3 py-2 whitespace-nowrap pl-8">{`${packageIndex + 1}`}</td>
                      <td className="px-3 py-2 whitespace-nowrap">GT-{packageItem.goiThauId}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium">
                        <button
                          onClick={() => toggleItem('packages', packageItem.goiThauId)}
                          className="flex items-center focus:outline-none"
                        >
                          <img
                            src={downIcon}
                            alt="Toggle"
                            className={`w-3 h-3 mr-1 transform ${expandedItems.packages[packageItem.goiThauId] ? 'rotate-180' : ''}`}
                          />
                          <span className="truncate">{packageItem.tenGoiThau}</span>
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{packageItem.tongKhoiLuongThucHien?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{packageItem.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap"></td>
                      <td className="px-3 py-2 whitespace-nowrap"></td>
                      <td className="px-3 py-2 whitespace-nowrap"></td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(packageItem.ngayKhoiCong)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(packageItem.ngayHoanThanh)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                            title="Thêm hạng mục"
                            onClick={() => handleAddCategoryClick(packageItem.goiThauId)}
                          >
                            <FaPlus size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>


                    {/* Level 2: Items - Only show if expanded */}
                    {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => {
                      const progress = item.tongKhoiLuongKeHoach
                        ? Math.min((item.tongKhoiLuongThucHien / item.tongKhoiLuongKeHoach) * 100, 100)
                        : 0;

                      const bgColor =
                        progress >= 100
                          ? 'bg-green-100'
                          : progress >= 40
                            ? 'bg-yellow-100'
                            : 'bg-red-100';

                      return (
                        <React.Fragment key={`item-${item.hangMucId}`}>
                          <tr className={`group ${bgColor} hover:${bgColor.replace('100', '200')}`}>
                            <td className="px-3 py-2 whitespace-nowrap pl-12">{`${packageIndex + 1}.${itemIndex + 1}`}</td>
                            <td className="px-3 py-2 whitespace-nowrap">HM-{item.hangMucId}</td>
                            <td className="px-3 py-2 font-medium">
                              <button
                                onClick={() => toggleItem('items', item.hangMucId)}
                                className="flex items-center focus:outline-none"
                              >
                                <img
                                  src={downIcon}
                                  alt="Toggle"
                                  className={`w-3 h-3 mr-1 transform ${expandedItems.items[item.hangMucId] ? 'rotate-180' : ''}`}
                                />
                                <span className="truncate"> Hạng mục: {item.tenHangMuc}</span>
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">{item.tongKhoiLuongThucHien?.toLocaleString()}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{item.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {item.danhSachKeHoach?.[0]?.donViTinh || ''}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap font-medium">
                              {progress.toFixed(0)}%
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap"></td>
                            <td className="px-3 py-2 whitespace-nowrap"></td>
                            <td className="px-3 py-2 whitespace-nowrap"></td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                                  title="Thêm kế hoạch"
                                  onClick={() => handleAddPlanClick(item.hangMucId)}
                                >
                                  <FaPlus size={14} />
                                </button>

                                <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                  title="Xóa hạng mục"
                                  onClick={() => handleDeleteHangMuc(item.hangMucId)}
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>


                          {/* Level 3: Plans - Only show if expanded */}
                          {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                            <tr
                              key={`plan-${plan.keHoachId}`}
                              className="group bg-white hover:bg-gray-50 border-t relative"
                            >
                              <td className="px-3 py-2 whitespace-nowrap pl-20">
                                {`${packageIndex + 1}.${itemIndex + 1}.${planIndex + 1}`}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">KH-{plan.keHoachId}</td>

                              <td className="px-3 py-4 pl-4 relative h-[80px]">
                                <div className="flex flex-col space-y-2">
                                  <div>{plan.tenCongTac}</div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-90 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
                                    <button
                                      onClick={() => handleViewDetails(plan)}
                                      className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                                    >
                                      Chi tiết tiến độ
                                    </button>
                                    <button
                                      onClick={() => handleOpenIssuePopup(plan, duAnThanhPhanId)}
                                      className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                                    >
                                      Khó khăn vướng mắc
                                    </button>
                                    <button
                                      onClick={() => handleOpenProgressPopup(plan)}
                                      className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                                    >
                                      Cập nhật tiến độ
                                    </button>
                                    <button className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all">
                                      Chỉnh sửa
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">{plan.tongKhoiLuongThucHien?.toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{plan.khoiLuongKeHoach?.toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{plan.donViTinh}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {plan.khoiLuongKeHoach
                                  ? Math.min((plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100, 100).toFixed(0) + '%'
                                  : '0%'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {calculateDays(plan.ngayBatDau, plan.ngayKetThuc)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">{formatDate(plan.ngayBatDau)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{formatDate(plan.ngayKetThuc)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="flex space-x-2">


                                  <button
                                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                    title="Xóa hạng mục"
                                    onClick={() => handleDeleteKeHoach(plan.keHoachId)}
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="md:hidden space-y-3">
        {([]).concat(
          data?.duAnThanhPhan?.danhSachGoiThau || [],
          data?.duAnTong?.danhSachGoiThauTrucTiep || [],
          data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
        )
          .filter(packageItem => !packageId || packageItem.goiThauId === packageId)
          .map((packageItem, packageIndex) => (
            <React.Fragment key={`mobile-package-${packageItem.goiThauId}`}>
              {/* Package Card */}
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">
                      <button
                        onClick={() => toggleItem('packages', packageItem.goiThauId)}
                        className="flex items-center focus:outline-none"
                      >
                        <img
                          src={downIcon}
                          alt="Toggle"
                          className={`w-3 h-3 mr-1 transform ${expandedItems.packages[packageItem.goiThauId] ? 'rotate-180' : ''}`}
                        />
                        <span className='text-xs font-bold'>{packageItem.tenGoiThau}</span>
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">GT-{packageItem.goiThauId}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <div className="text-gray-500">Khối lượng TH</div>
                    <div>{packageItem.tongKhoiLuongThucHien?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Khối lượng KH</div>
                    <div>{packageItem.tongKhoiLuongKeHoach?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Bắt đầu</div>
                    <div>{formatDate(packageItem.ngayKhoiCong)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Kết thúc</div>
                    <div>{formatDate(packageItem.ngayHoanThanh)}</div>
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                    title="Thêm hạng mục"
                    onClick={() => handleAddCategoryClick(packageItem.goiThauId)}
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
              </div>

              {/* Items (only show if expanded) */}
              {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => {
                const progress = item.tongKhoiLuongKeHoach
                  ? Math.min((item.tongKhoiLuongThucHien / item.tongKhoiLuongKeHoach) * 100, 100)
                  : 0;

                const bgColor =
                  progress >= 100
                    ? 'bg-green-100'
                    : progress >= 40
                      ? 'bg-yellow-100'
                      : 'bg-red-100';

                return (
                  <React.Fragment key={`mobile-item-${item.hangMucId}`}>
                    <div className={`${bgColor} p-3 rounded-lg shadow-sm border border-gray-200 ml-4`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            <button
                              onClick={() => toggleItem('items', item.hangMucId)}
                              className="flex items-center focus:outline-none"
                            >
                              <img
                                src={downIcon}
                                alt="Toggle"
                                className={`w-3 h-3 mr-1 transform ${expandedItems.items[item.hangMucId] ? 'rotate-180' : ''}`}
                              />
                              <span className='font-bold text-xs'>Hạng mục: {item.tenHangMuc}</span>
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">HM-{item.hangMucId}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <div className="text-gray-500">Khối lượng TH</div>
                          <div>{item.tongKhoiLuongThucHien?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Khối lượng KH</div>
                          <div>{item.tongKhoiLuongKeHoach?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Đơn vị</div>
                          <div>{item.danhSachKeHoach?.[0]?.donViTinh || ''}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tiến độ</div>
                          <div className="font-medium">{progress.toFixed(0)}%</div>
                        </div>
                      </div>

                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                          title="Thêm kế hoạch"
                          onClick={() => handleAddPlanClick(item.hangMucId)}
                        >
                          <FaPlus size={14} />
                        </button>
                        <button
                                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                  title="Xóa hạng mục"
                                  onClick={() => handleDeleteHangMuc(item.hangMucId)}
                                >
                                  <FaTrash size={14} />
                                </button>
                      </div>
                    </div>

                    {/* Plans (only show if expanded) */}
                    {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                      <div key={`mobile-plan-${plan.keHoachId}`} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 ml-8 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-xs">{plan.tenCongTac}</div>
                            <div className="text-sm text-gray-500 mt-1">KH-{plan.keHoachId}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <div className="text-gray-500">Khối lượng TH</div>
                            <div>{plan.tongKhoiLuongThucHien?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Khối lượng KH</div>
                            <div>{plan.khoiLuongKeHoach?.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Đơn vị</div>
                            <div>{plan.donViTinh}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Tiến độ</div>
                            <div>
                              {plan.khoiLuongKeHoach
                                ? Math.min((plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100, 100).toFixed(0) + '%'
                                : '0%'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Thời gian</div>
                            <div>{calculateDays(plan.ngayBatDau, plan.ngayKetThuc)} ngày</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Bắt đầu</div>
                            <div>{formatDate(plan.ngayBatDau)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Kết thúc</div>
                            <div>{formatDate(plan.ngayKetThuc)}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-90 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
                          <button
                            onClick={() => handleViewDetails(plan)}
                            className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                          >
                            Chi tiết tiến độ
                          </button>
                          <button
                            onClick={() => handleOpenIssuePopup(plan, duAnThanhPhanId)} // Truyền cả projectId
                            className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all"
                          >
                            Khó khăn vướng mắc
                          </button>
                          <button onClick={handleProjectProgress} className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all">
                            Cập nhật tiến độ
                          </button>
                          <button className="px-3 py-1 text-xs font-bold text-white bg-blue-800 rounded-lg opacity-80 hover:opacity-100 transition-all">
                            Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
      </div>
      {showAddCategoryModal && (
        <AddNewCategories
          goiThauId={selectedPackageId}
          onClose={() => setShowAddCategoryModal(false)}
          onSuccess={handleCategoryAdded}
        />
      )}

      {showAddPlanModal && (
        <AddNewPlan
          hangMucId={selectedCategoryId}
          onClose={() => setShowAddPlanModal(false)}
          onSuccess={handlePlanAdded}
        />
      )}
      <ProgressPopup
        visible={progressPopup.visible}
        plan={progressPopup.plan}
        progressData={progressPopup.progressData}
        onClose={() => setProgressPopup({ ...progressPopup, visible: false })}
      />
      {showProgressPopup && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Cập nhật tiến độ - KH-{selectedPlan.keHoachId}</h3>
              <button
                onClick={handleCloseProgressPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <UpdateProgress
              keHoachId={selectedPlan.keHoachId}
              DonViTinh={selectedPlan.donViTinh}
              onClose={handleCloseProgressPopup}
              onSuccess={() => {
                // Thêm logic cập nhật dữ liệu sau khi gửi thành công nếu cần
                handleCloseProgressPopup();
              }}
            />
          </div>
        </div>
      )}

      {showIssuePopup && selectedPlan && duAnThanhPhanId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <IssueList
              keHoachId={selectedPlan.keHoachId}
              duAnId={duAnThanhPhanId}
              onClose={handleCloseIssuePopup}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubProjectTable;

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import ProjectMenu from '../ProjectMenu/ProjectMenu';

import {
  FaListOl,
  FaProjectDiagram,
  FaBoxOpen,
  FaTasks,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight, FaChevronUp,
  FaPlus
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Đăng ký các thành phần cần thiết từ ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
const ProjectManagement = ({ tenDuAn, projectId }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showProgressForm, setShowProgressForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [projectContext, setProjectContext] = useState({
    tenDuAn: '',
    tenHangMuc: ''
  });
  const [viewMode, setViewMode] = useState('list');
  const [formData, setFormData] = useState({
    khoiLuongThucHien: '',
    moTaVuongMac: '',
    loaiVuongMac: '',
    ghiChu: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const handleFileChange = (e) => {
    // Lưu tất cả file được chọn vào state
    setFiles([...e.target.files]);
  };
  const issueTypes = [
    { value: 'GPMB', label: 'Giải phóng mặt bằng' },
    { value: 'ThietBi', label: 'Thiết bị' },
    { value: 'NhanLuc', label: 'Nhân lực' },
    { value: 'VatTu', label: 'Vật tư' },
    { value: 'ThoiTiet', label: 'Thời tiết' },
    { value: 'Khac', label: 'Khác' }
  ];

  const handlePlanSelect = (plan, context) => {
    if (plan.type === 'plan') {
      setSelectedPlan(plan);
      setProjectContext(context); 
      setFormData({
        khoiLuongThucHien: '',
        donViTinh: plan.DonViTinh || '',
        moTaVuongMac: '',
        loaiVuongMac: '',
        ghiChu: ''
      });
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  console.log(selectedPlan);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !formData.khoiLuongThucHien) return;
    try {
      setLoading(true);

      const data = new FormData();
      data.append('khoiLuongThucHien', parseFloat(formData.khoiLuongThucHien));
      data.append('moTaVuongMac', formData.moTaVuongMac || '');
      data.append('loaiVuongMac', formData.loaiVuongMac || '');
      data.append('ghiChu', formData.ghiChu || '');

      // Thêm tất cả file vào FormData
      files.forEach(file => {
        data.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/kehoach/them-tiendo/${selectedPlan.keHoachId}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // Reset form
        setFormData({
          khoiLuongThucHien: '',
          moTaVuongMac: '',
          loaiVuongMac: '',
          ghiChu: ''
        });
        setFiles([]);
      }
    } catch (error) {
      console.error('Error reporting progress:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };


  const getStatusText = (percent) => {
    if (percent >= 100) return 'Đã hoàn thành';
    if (percent > 0) return 'Đang thực hiện';
    return 'Chưa bắt đầu';
  };
  const remainingDays = useMemo(() => {
    if (!selectedPlan?.ngayKetThuc) return 0;
    const end = new Date(selectedPlan.ngayKetThuc);
    const now = new Date();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }, [selectedPlan]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Lấy danh sách năm có dữ liệu
  const availableYears = Array.from(
    new Set(
      selectedPlan?.tienDoThucHien?.map(item => 
        new Date(item.NgayCapNhat).getFullYear()
      ) || []
    )
  ).sort();

  // Chuẩn bị dữ liệu sản lượng từng tháng
  const prepareMonthlyProductionData = () => {
    // Khởi tạo mảng 12 tháng
    const monthlyProduction = Array(12).fill(0);
    
    // Tính tổng sản lượng từng tháng
    (selectedPlan?.tienDoThucHien || []).forEach(item => {
      const itemYear = new Date(item.NgayCapNhat).getFullYear();
      const itemMonth = new Date(item.NgayCapNhat).getMonth();
      
      if (itemYear === selectedYear) {
        monthlyProduction[itemMonth] += item.KhoiLuongThucHien || 0;
      }
    });

    return {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
               'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      datasets: [
        {
          label: `Sản lượng thi công năm ${selectedYear}`,
          data: monthlyProduction,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: false,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw.toLocaleString()} ${selectedPlan?.donViTinh}`;
          }
        }
      },
      annotation: {
        annotations: {
          targetLine: {
            type: 'line',
            yMin: selectedPlan?.khoiLuongKeHoach,
            yMax: selectedPlan?.khoiLuongKeHoach,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              content: 'Mục tiêu',
              enabled: true,
              position: 'right'
            }
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: `Sản lượng (${selectedPlan?.donViTinh})`
        },
        min: 0,
        suggestedMax: selectedPlan?.khoiLuongKeHoach ? selectedPlan.khoiLuongKeHoach * 1.2 : undefined,
      },
      x: {
        title: {
          display: true,
          text: 'Tháng'
        }
      }
    }
  };
  console.log("Tiến độ:", selectedPlan);
  

  return (
    <div className="flex flex-col md:flex-row min-w-[600px] h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-blue-700 font-semibold text-sm"
        >
          <FaListOl className="text-blue-600" />
          <span>DANH SÁCH DỰ ÁN</span>
          {mobileMenuOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
        </button>
        {selectedPlan && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.phanTramHoanThanh >= 100
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
            }`}>
            {selectedPlan.phanTramHoanThanh}%
          </span>
        )}
      </div>

      {/* Sidebar - Project Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-96 border-r border-gray-200 bg-white overflow-y-auto`}>
        <ProjectMenu
          projectId={projectId}
          onItemSelect={handlePlanSelect}
          onPlanSelect={(plan, context) => {
            handlePlanSelect(plan); 
            setProjectContext(context); 
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {selectedPlan ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-3">
              {/* Dòng 1: Tên công tác */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-gray-800">
                  {selectedPlan.tenCongTac}
                </h1>
              </div>

              {/* Dòng 2: Thông tin mô tả */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-700">
                <div className="flex gap-1">
                  <span className="font-semibold">Mã số:</span>
                  <span className="text-blue-600 font-medium">KH-{selectedPlan.keHoachId}</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-semibold">Dự án:</span>
                  <span className="font-medium">{projectContext.tenDuAn}</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-semibold">Hạng mục thi công:</span>
                  <span className="font-medium uppercase">{projectContext.tenHangMuc}</span>
                </div>
              </div>

              {/* Dòng 3: Thẻ trạng thái */}
              <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
            {remainingDays > 0 ? `${remainingDays} ngày` : 'Hết hạn'}
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
            {formatDate(selectedPlan.ngayBatDau)}
          </span>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded">
            {formatDate(selectedPlan.ngayKetThuc)}
          </span>
          <span className="border border-green-600 text-green-600 px-3 py-1 rounded">
            Tiến độ hoàn thành: {selectedPlan.phanTramHoanThanh}%
          </span>
        </div>
        
        <button
          onClick={() => setShowProgressForm(!showProgressForm)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          <FaPlus size={12} />
          Thêm tiến độ
        </button>
      </div>
            </div>


            {/* Progress Form */}
            {showProgressForm && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Báo cáo tiến độ</h2>

              <form onSubmit={handleSubmitProgress}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khối lượng hoàn thành *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="khoiLuongThucHien"
                        value={formData.khoiLuongThucHien}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập khối lượng"
                        required
                      />
                      <span className="absolute right-3 top-2 text-sm text-gray-500">
                        {selectedPlan.DonViTinh}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại vướng mắc
                    </label>
                    <select
                      name="loaiVuongMac"
                      value={formData.loaiVuongMac}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Không có --</option>
                      {issueTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.loaiVuongMac && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả vướng mắc
                    </label>
                    <textarea
                      name="moTaVuongMac"
                      value={formData.moTaVuongMac}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mô tả chi tiết vướng mắc"
                      rows="2"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ghi chú bổ sung"
                    rows="2"
                  />
                </div>

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                  </div>
                )}
                <div className="mb-4">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tài liệu đính kèm (có thể chọn nhiều file)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip"
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
                  />
                  {files.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Đã chọn {files.length} file:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {files.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )} */}
                </div>


                <button
                  type="submit"
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    'Báo cáo tiến độ'
                  )}
                </button>
              </form>
            </div>
            )}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Tiến độ: {selectedPlan.tenCongTac}
        </h2>
        {selectedPlan.tienDoThucHien?.length > 0 && (
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition"
          >
            {viewMode === 'list' ? 'Xem dạng biểu đồ' : 'Xem dạng danh sách'}
          </button>
        )}
      </div>

      {selectedPlan.tienDoThucHien?.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          Chưa có báo cáo tiến độ nào cho kế hoạch này
        </div>
      ) : viewMode === '' ? (
        // Chế độ xem danh sách
        <div className="space-y-2">
          {selectedPlan.tienDoThucHien.map((item, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${
                item.MoTaVuongMac
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-700 text-sm truncate max-w-[70%]">
                  {item.GhiChu || 'Không có ghi chú'}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(item.NgayCapNhat).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="flex justify-between my-1.5">
                <span className="text-sm text-gray-600">Khối lượng:</span>
                <span className="font-bold text-blue-600">
                  +{item.KhoiLuongThucHien.toLocaleString()} {selectedPlan.donViTinh}
                </span>
              </div>

              {item.MoTaCongViec && (
                <p className="text-sm text-gray-800 mb-1 line-clamp-2">
                  {item.MoTaCongViec}
                </p>
              )}

              {item.MoTaVuongMac && (
                <div className="mt-1.5 pt-1.5 border-t border-orange-100">
                  <div className="text-xs font-semibold text-orange-600">
                    Vướng mắc: {issueTypes?.find(t => t.value === item.LoaiVuongMac)?.label || 'Khác'}
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5">
                    {item.MoTaVuongMac}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Chế độ xem biểu đồ
<div className="bg-white p-4 rounded-lg shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sản lượng thi công: {selectedPlan?.tenCongTac}</h3>
        {availableYears.length > 0 && (
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 border rounded text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="h-80">
        <Line data={prepareMonthlyProductionData()} options={chartOptions} />
      </div>

      <div className="mt-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
        <p>Tổng kế hoạch: {selectedPlan?.khoiLuongKeHoach?.toLocaleString()} {selectedPlan?.donViTinh}</p>
        <p>Đường biểu đồ thể hiện sản lượng thi công từng tháng</p>
      </div>
    </div>

      )}
    </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h2 className="text-lg md:text-xl font-medium text-gray-700 mb-2">Chọn một kế hoạch công tác</h2>
            <p className="text-sm md:text-base text-gray-500">Vui lòng chọn kế hoạch từ danh sách bên trái để báo cáo tiến độ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
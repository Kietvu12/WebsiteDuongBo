import React, { useState } from 'react';
import axios from 'axios';
import ProjectMenu from '../ProjectMenu/ProjectMenu';
import {
  FaListOl,
  FaProjectDiagram,
  FaBoxOpen,
  FaTasks,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight, FaChevronUp
} from 'react-icons/fa';
const ProjectManagement = ({ projectId }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
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

  const handlePlanSelect = (item) => {
    if (item.type === 'plan') {
      setSelectedPlan(item);
      setFormData({
        khoiLuongThucHien: '',
        donViTinh: item.DonViTinh || '',
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
        `${API_BASE_URL}/kehoach/them-tiendo/${selectedPlan.KeHoachID}`,
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
  



  const remainingQuantity = selectedPlan
    ? selectedPlan.KhoiLuongKeHoach - selectedPlan.tongKhoiLuongThucHien
    : 0;

  const getStatusText = (percentage) => {
    if (percentage >= 100) return 'Hoàn thành';
    if (percentage >= 75) return 'Tiến độ tốt';
    if (percentage >= 50) return 'Đang thực hiện';
    if (percentage > 0) return 'Bắt đầu';
    return 'Chưa bắt đầu';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
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
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {selectedPlan ? (
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {selectedPlan.TenCongTac}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPlan.phanTramHoanThanh >= 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
                  }`}>
                  {selectedPlan.phanTramHoanThanh}% hoàn thành
                  <span className="ml-1 text-gray-500 text-xs">
                    ({getStatusText(selectedPlan.phanTramHoanThanh)})
                  </span>
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Kế hoạch</h3>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">
                  {selectedPlan.KhoiLuongKeHoach} {selectedPlan.DonViTinh}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Đã thực hiện</h3>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">
                  {selectedPlan.tongKhoiLuongThucHien} {selectedPlan.DonViTinh}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Còn lại</h3>
                <p className={`text-xl md:text-2xl font-semibold ${remainingQuantity <= 0 ? 'text-green-600' : 'text-gray-800'
                  }`}>
                  {remainingQuantity < 0 ? 0 : remainingQuantity} {selectedPlan.DonViTinh}
                </p>
              </div>
            </div>

            {/* Progress Form */}
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
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Tài liệu đính kèm (có thể chọn nhiều file)
  </label>
  <input
    type="file"
    multiple // Thêm thuộc tính này để cho phép chọn nhiều file
    onChange={handleFileChange}
    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip"
    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
  />
  {/* Hiển thị danh sách file đã chọn */}
  {files.length > 0 && (
    <div className="mt-2">
      <p className="text-sm text-gray-600">Đã chọn {files.length} file:</p>
      <ul className="list-disc pl-5 text-sm text-gray-600">
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul>
    </div>
  )}
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
                    'Gửi báo cáo'
                  )}
                </button>
              </form>
            </div>

            {/* Progress History */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử báo cáo</h2>

              {selectedPlan.tienDoThucHien?.length > 0 ? (
                <div className="space-y-3">
                  {selectedPlan.tienDoThucHien.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 md:p-4 border rounded-lg ${item.MoTaVuongMac
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-gray-200'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(item.NgayCapNhat).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="font-medium text-blue-600">
                          +{item.KhoiLuongThucHien} {selectedPlan.DonViTinh}
                        </span>
                      </div>

                      {item.MoTaVuongMac && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-orange-600">
                            Vướng mắc: {issueTypes.find(t => t.value === item.LoaiVuongMac)?.label || item.LoaiVuongMac}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {item.MoTaVuongMac}
                          </p>
                        </div>
                      )}

                      {item.GhiChu && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Ghi chú:</span> {item.GhiChu}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có báo cáo tiến độ nào
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
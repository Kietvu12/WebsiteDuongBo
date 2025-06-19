import React, { useState } from 'react';
import axios from 'axios';
import ProjectMenu from'../ProjectMenu/ProjectMenu';
import {
  FaListOl,
  FaProjectDiagram,
  FaBoxOpen,
  FaTasks,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight, FaChevronUp
} from 'react-icons/fa';
const UpdateProgress = ({ keHoachId, DonViTinh }) => {
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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const handleSubmitProgress = async (e) => {
    e.preventDefault()
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
        `${API_BASE_URL}/kehoach/them-tiendo/${keHoachId}`,
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

  return (
    <div className="flex flex-col md:flex-row bg-gray-50">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
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
                        {DonViTinh}
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
          </div>
      </div>
    </div>
  );
};

export default UpdateProgress;
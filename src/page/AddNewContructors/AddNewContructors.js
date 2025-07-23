import React, { useRef, useState } from 'react';
import axios from 'axios';
import { FaBuilding, FaPhone, FaEnvelope, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaFileAlt, FaTrash, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { FaArrowLeft, FaRegBell } from 'react-icons/fa'

const AddNewContructors = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    TenNhaThau: '',
    Loai: '',
    MaSoThue: '',
    DiaChiTruSo: '',
    SoDienThoai: '',
    Email: '',
    NguoiDaiDien: '',
    ChucVuNguoiDaiDien: '',
    GiayPhepKinhDoanh: '',
    NgayCap: '',
    NoiCap: '',
    GhiChu: ''
  });
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const { logout, user } = useProject();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.TenNhaThau) newErrors.TenNhaThau = 'Tên nhà thầu là bắt buộc';
    if (!formData.MaSoThue) newErrors.MaSoThue = 'Mã số thuế là bắt buộc';
    return newErrors;
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/nhathau`, formData);
      setSuccess(true);
      resetForm();
      setErrors({});
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrors({ apiError: error.response.data.error });
      } else {
        setErrors({ apiError: 'Lỗi server khi thêm nhà thầu' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      TenNhaThau: '',
      Loai: '',
      MaSoThue: '',
      DiaChiTruSo: '',
      SoDienThoai: '',
      Email: '',
      NguoiDaiDien: '',
      ChucVuNguoiDaiDien: '',
      GiayPhepKinhDoanh: '',
      NgayCap: '',
      NoiCap: '',
      GhiChu: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white shadow-md px-3 sm:px-4 py-2 sm:py-3 mt-3 md:mt-0">
        {/* Top Nav */}
        <div className="flex justify-between items-center gap-2">
          {/* Nút back */}
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            aria-label="Quay lại"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>

          {/* Nhóm icon bên phải */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Thông báo</span>
            <FaRegBell />
            <span></span>
            <div className="inline-block" ref={menuRef}>
              <button className="bg-red-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center"
                onClick={() => setShowMenu(!showMenu)}
              >
                R
              </button>
              {showMenu && (
                <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h1 className="flex-1 text-left font-bold text-gray-800 px-2 mt-3">
          TẠO MỚI NHÀ THẦU
        </h1>


      </div>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white mt-6 w-full shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 sm:px-8 pt-4">
            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                <p>Thêm nhà thầu thành công!</p>
              </div>
            )}

            {errors.apiError && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p>{errors.apiError}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full px-6 sm:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cột 1 */}
              <div className="space-y-5">
                {/* Tên nhà thầu */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà thầu *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="TenNhaThau"
                      value={formData.TenNhaThau}
                      onChange={handleChange}
                      className={`pl-10 w-full px-4 py-2 rounded-md border ${errors.TenNhaThau ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Nhập tên nhà thầu"
                    />
                  </div>
                  {errors.TenNhaThau && <p className="mt-1 text-sm text-red-600">{errors.TenNhaThau}</p>}
                </div>

                {/* Loại nhà thầu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhà thầu</label>
                  <select
                    name="Loai"
                    value={formData.Loai}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn loại nhà thầu</option>
                    <option value="Trong nước">Trong nước</option>
                    <option value="Nước ngoài">Nước ngoài</option>
                    <option value="Liên doanh">Liên doanh</option>
                  </select>
                </div>

                {/* Mã số thuế */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="MaSoThue"
                      value={formData.MaSoThue}
                      onChange={handleChange}
                      className={`pl-10 w-full px-4 py-2 rounded-md border ${errors.MaSoThue ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Nhập mã số thuế"
                    />
                  </div>
                  {errors.MaSoThue && <p className="mt-1 text-sm text-red-600">{errors.MaSoThue}</p>}
                </div>

                {/* Địa chỉ trụ sở */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="DiaChiTruSo"
                      value={formData.DiaChiTruSo}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập địa chỉ trụ sở"
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="SoDienThoai"
                      value={formData.SoDienThoai}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-5">
                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="Email"
                      value={formData.Email}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                {/* Người đại diện */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người đại diện</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUserTie className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="NguoiDaiDien"
                      value={formData.NguoiDaiDien}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên người đại diện"
                    />
                  </div>
                </div>

                {/* Chức vụ người đại diện */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ người đại diện</label>
                  <input
                    type="text"
                    name="ChucVuNguoiDaiDien"
                    value={formData.ChucVuNguoiDaiDien}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập chức vụ"
                  />
                </div>

                {/* Giấy phép kinh doanh */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép kinh doanh</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFileAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="GiayPhepKinhDoanh"
                      value={formData.GiayPhepKinhDoanh}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số giấy phép"
                    />
                  </div>
                </div>

                {/* Ngày cấp & Nơi cấp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="NgayCap"
                        value={formData.NgayCap}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nơi cấp</label>
                    <input
                      type="text"
                      name="NoiCap"
                      value={formData.NoiCap}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập nơi cấp"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                name="GhiChu"
                value={formData.GhiChu}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập ghi chú (nếu có)"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaTrash className="mr-2" />
                Xóa hết
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Thêm nhà thầu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewContructors;
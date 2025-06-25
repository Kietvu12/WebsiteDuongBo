import React, { useState } from 'react';
import axios from 'axios';

const AddNewContructors = () => {
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

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">Thêm Nhà Thầu Mới</h2>
        </div>

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mx-6 mt-4">
            <p>Thêm nhà thầu thành công!</p>
          </div>
        )}

        {errors.apiError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-4">
            <p>{errors.apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà thầu *</label>
                <input
                  type="text"
                  name="TenNhaThau"
                  value={formData.TenNhaThau}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.TenNhaThau ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.TenNhaThau && <p className="text-red-500 text-xs mt-1">{errors.TenNhaThau}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhà thầu</label>
                <select
                  name="Loai"
                  value={formData.Loai}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Chọn loại nhà thầu</option>
                  <option value="Trong nước">Trong nước</option>
                  <option value="Nước ngoài">Nước ngoài</option>
                  <option value="Liên doanh">Liên doanh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế *</label>
                <input
                  type="text"
                  name="MaSoThue"
                  value={formData.MaSoThue}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.MaSoThue ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.MaSoThue && <p className="text-red-500 text-xs mt-1">{errors.MaSoThue}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
                <input
                  type="text"
                  name="DiaChiTruSo"
                  value={formData.DiaChiTruSo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  name="SoDienThoai"
                  value={formData.SoDienThoai}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người đại diện</label>
                <input
                  type="text"
                  name="NguoiDaiDien"
                  value={formData.NguoiDaiDien}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ người đại diện</label>
                <input
                  type="text"
                  name="ChucVuNguoiDaiDien"
                  value={formData.ChucVuNguoiDaiDien}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép kinh doanh</label>
                <input
                  type="text"
                  name="GiayPhepKinhDoanh"
                  value={formData.GiayPhepKinhDoanh}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                  <input
                    type="date"
                    name="NgayCap"
                    value={formData.NgayCap}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nơi cấp</label>
                  <input
                    type="text"
                    name="NoiCap"
                    value={formData.NoiCap}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setFormData({
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
              })}
            >
              Xóa hết
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Thêm nhà thầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewContructors;
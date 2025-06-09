import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddNewAttribute = ({ loaiHinhId, onClose, onAddSuccess }) => {
  const [formData, setFormData] = useState({
    TenThuocTinh: '',
    KieuDuLieu: 'varchar',
    DonVi: '',
    BatBuoc: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.TenThuocTinh) {
        throw new Error('Tên thuộc tính là bắt buộc');
      }

      const response = await fetch(`${API_BASE_URL}/loaihinh/them-thuoctinh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          LoaiHinh_ID: loaiHinhId,
          ...formData
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Lỗi khi thêm thuộc tính');
      }

      // Thông báo thành công và đóng popup
      onAddSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Thêm thuộc tính mới</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên thuộc tính *</label>
            <input
              type="text"
              name="TenThuocTinh"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.TenThuocTinh}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu dữ liệu</label>
            <select
              name="KieuDuLieu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.KieuDuLieu}
              onChange={handleChange}
            >
              <option value="varchar">Chuỗi ký tự</option>
              <option value="number">Số</option>
              <option value="date">Ngày tháng</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
            <input
              type="text"
              name="DonVi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.DonVi}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="batBuoc"
              name="BatBuoc"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={formData.BatBuoc == 1}
              onChange={(e) => setFormData({...formData, BatBuoc: e.target.checked ? 1 : 0})}
            />
            <label htmlFor="batBuoc" className="ml-2 block text-sm text-gray-700">
              Bắt buộc
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewAttribute;
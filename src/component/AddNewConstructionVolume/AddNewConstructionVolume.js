import React, { useState, useEffect } from 'react';
import { FaTimes, FaCubes, FaBuilding, FaHardHat } from 'react-icons/fa';
import axios from 'axios';

const AddConstructionVolumePopup = ({ packageId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    GoiThau_ID: packageId,
    NhaThauID: '',
    TieuDe: '',
    NoiDung: '',
    VaiTro: 'Nhà thầu phụ'
  });

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Lấy danh sách nhà thầu từ API
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/nhaThauList`);
        setContractors(response.data.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách nhà thầu:', err);
      }
    };
    fetchContractors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/khoiluong-thicong/them-moi`, formData);
      
      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm khối lượng thi công');
      console.error('Lỗi khi thêm khối lượng thi công:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center">
            <FaCubes className="mr-2" />
            <h2 className="text-xl font-semibold">THÊM KHỐI LƯỢNG THI CÔNG</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Nhà thầu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaBuilding className="inline mr-2 text-blue-500" />
                Nhà thầu thi công <span className="text-red-500">*</span>
              </label>
              <select
                name="NhaThauID"
                value={formData.NhaThauID}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Chọn nhà thầu --</option>
                {contractors.map(contractor => (
                  <option key={contractor.NhaThauID} value={contractor.NhaThauID}>
                    {contractor.TenNhaThau} ({contractor.MaSoThue})
                  </option>
                ))}
              </select>
            </div>

            {/* Vai trò */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaHardHat className="inline mr-2 text-blue-500" />
                Vai trò nhà thầu
              </label>
              <select
                name="VaiTro"
                value={formData.VaiTro}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Nhà thầu phụ">Nhà thầu phụ</option>
                <option value="Liên danh">Liên danh</option>
                <option value="Nhà thầu chính">Nhà thầu chính</option>
              </select>
            </div>
          </div>

          {/* Tiêu đề và Nội dung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề khối lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="TieuDe"
              value={formData.TieuDe}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Vd: Đào đất hạng mục móng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung yêu cầu <span className="text-red-500">*</span>
            </label>
            <textarea
              name="NoiDung"
              value={formData.NoiDung}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả chi tiết khối lượng thi công..."
              required
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConstructionVolumePopup;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaChevronDown } from 'react-icons/fa';

const AddVuongMacPopup = ({ hangMucId, onClose, onSuccess }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [keHoachList, setKeHoachList] = useState([]);
  const [selectedKeHoach, setSelectedKeHoach] = useState(null);
  const [showKeHoachDropdown, setShowKeHoachDropdown] = useState(false);
  const [formData, setFormData] = useState({
    KeHoachID: '',
    LoaiVuongMac: 'GPMB',
    MoTaChiTiet: '',
    NgayPhatSinh: new Date().toISOString().split('T')[0],
    NgayKetThuc: '',
    MucDo: 'Nho',
    BienPhapXuLy: ''
  });

  // Lấy danh sách kế hoạch thuộc hạng mục
  useEffect(() => {
    const fetchKeHoachList = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/hangmuc/${hangMucId}/kehoach`);
        if (response.data.success) {
          setKeHoachList(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kế hoạch:', error);
        alert('Lỗi khi tải danh sách kế hoạch');
      } finally {
        setLoading(false);
      }
    };

    fetchKeHoachList();
  }, [hangMucId]);

  const handleSelectKeHoach = (keHoach) => {
    setSelectedKeHoach(keHoach);
    setFormData(prev => ({ ...prev, KeHoachID: keHoach.KeHoachID }));
    setShowKeHoachDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.KeHoachID) {
      alert('Vui lòng chọn kế hoạch');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/vuongmac/tao-moi`, formData);
      
      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Lỗi khi tạo vướng mắc:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo vướng mắc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Thêm Vướng Mắc Mới</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          {/* Dropdown chọn kế hoạch */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn kế hoạch <span className="text-red-500">*</span>
            </label>
            <div 
              className="w-full p-2 border rounded-md cursor-pointer flex justify-between items-center"
              onClick={() => setShowKeHoachDropdown(!showKeHoachDropdown)}
            >
              <span>
                {selectedKeHoach 
                  ? `${selectedKeHoach.TenCongTac} (${new Date(selectedKeHoach.NgayBatDau).toLocaleDateString()})`
                  : '-- Chọn kế hoạch --'}
              </span>
              <FaChevronDown className={`transition-transform ${showKeHoachDropdown ? 'transform rotate-180' : ''}`} />
            </div>
            
            {showKeHoachDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {keHoachList.map(keHoach => (
                  <div
                    key={keHoach.KeHoachID}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectKeHoach(keHoach)}
                  >
                    <p className="font-medium">{keHoach.TenCongTac}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(keHoach.NgayBatDau).toLocaleDateString()} - {new Date(keHoach.NgayKetThuc).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form thêm vướng mắc (chỉ hiển thị khi đã chọn kế hoạch) */}
          {selectedKeHoach && (
            <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Loại vướng mắc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại vướng mắc <span className="text-red-500">*</span>
                </label>
                <select
                  name="LoaiVuongMac"
                  value={formData.LoaiVuongMac}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="GPMB">GPMB</option>
                  <option value="ThietBi">Thiết bị</option>
                  <option value="NhanLuc">Nhân lực</option>
                  <option value="VatTu">Vật tư</option>
                  <option value="ThoiTiet">Thời tiết</option>
                  <option value="Khac">Khác</option>
                </select>
              </div>

              {/* Mức độ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức độ <span className="text-red-500">*</span>
                </label>
                <select
                  name="MucDo"
                  value={formData.MucDo}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Nho">Nhỏ</option>
                  <option value="TrungBinh">Trung bình</option>
                  <option value="NghiemTrong">Nghiêm trọng</option>
                </select>
              </div>

              {/* Ngày phát sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày phát sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="NgayPhatSinh"
                  value={formData.NgayPhatSinh}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Ngày kết thúc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  name="NgayKetThuc"
                  value={formData.NgayKetThuc}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="MoTaChiTiet"
                  value={formData.MoTaChiTiet}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Mô tả chi tiết vướng mắc..."
                />
              </div>

              {/* Biện pháp xử lý */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biện pháp xử lý
                </label>
                <textarea
                  name="BienPhapXuLy"
                  value={formData.BienPhapXuLy}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Các biện pháp xử lý (nếu có)..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  'Thêm Vướng Mắc'
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVuongMacPopup;
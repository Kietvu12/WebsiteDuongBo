import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddNewPlan = ({ hangMucId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    HangMucID: hangMucId,
    NhaThauID: '',
    TenCongTac: '',
    KhoiLuongKeHoach: '',
    DonViTinh: '',
    NgayBatDau: '',
    NgayKetThuc: '',
    GhiChu: ''
  });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nhaThauList, setNhaThauList] = useState([]);
  const [fetchingContractors, setFetchingContractors] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/nhaThauList`);
        if (response.data.success) {
          setNhaThauList(response.data.data);
        } else {
          setFetchError('Không thể tải danh sách nhà thầu');
        }
      } catch (error) {
        console.error('Error fetching contractors:', error);
        setFetchError('Đã xảy ra lỗi khi tải danh sách nhà thầu');
      } finally {
        setFetchingContractors(false);
      }
    };

    fetchContractors();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.NhaThauID || !formData.TenCongTac || !formData.KhoiLuongKeHoach) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await axios.post(`${API_BASE_URL}/kehoach/tao-moi`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error adding ke hoach:', error);
      alert('Có lỗi xảy ra khi thêm kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Thêm Kế Hoạch Mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhà thầu *</label>
              {fetchingContractors ? (
                <div className="animate-pulse py-2 bg-gray-200 rounded-md"></div>
              ) : fetchError ? (
                <div className="text-red-500 text-sm">{fetchError}</div>
              ) : (
                <select
                  name="NhaThauID"
                  value={formData.NhaThauID}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Chọn nhà thầu</option>
                  {nhaThauList && nhaThauList.map(nhaThau => (
                    <option key={nhaThau.NhaThauID} value={nhaThau.NhaThauID}>
                      {nhaThau.TenNhaThau || `Nhà thầu ${nhaThau.NhaThauID}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên công tác *</label>
              <input
                type="text"
                name="TenCongTac"
                value={formData.TenCongTac}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khối lượng kế hoạch *</label>
              <input
                type="number"
                name="KhoiLuongKeHoach"
                value={formData.KhoiLuongKeHoach}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
              <input
                type="text"
                name="DonViTinh"
                value={formData.DonViTinh}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                name="NgayBatDau"
                value={formData.NgayBatDau}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                name="NgayKetThuc"
                value={formData.NgayKetThuc}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                name="GhiChu"
                value={formData.GhiChu}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tài liệu đính kèm</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip"
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
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || fetchingContractors}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Đang xử lý...' : 'Thêm Kế Hoạch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewPlan;
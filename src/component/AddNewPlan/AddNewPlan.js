import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddNewPlan = ({ goiThauId, hangMucId, onClose, onSuccess }) => {
  console.log("GoiThauId", goiThauId);
  
  const [formData, setFormData] = useState({
    GoiThauID: goiThauId,
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
  const [contractorSearchTerm, setContractorSearchTerm] = useState('');
  const [showContractorDropdown, setShowContractorDropdown] = useState(false);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/goiThau/${goiThauId}/nhaThauList`);
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

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.contractor-dropdown')) {
        setShowContractorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cập nhật hiển thị khi đã chọn nhà thầu
  useEffect(() => {
    if (formData.NhaThauID) {
      const selectedContractor = nhaThauList.find(nt => nt.NhaThauID == formData.NhaThauID);
      if (selectedContractor) {
        setContractorSearchTerm(selectedContractor.TenNhaThau);
      }
    }
  }, [formData.NhaThauID, nhaThauList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const getFilteredContractors = () => {
    if (!contractorSearchTerm.trim()) return nhaThauList;
    
    return nhaThauList.filter(contractor =>
      contractor.TenNhaThau.toLowerCase().includes(contractorSearchTerm.toLowerCase())
    );
  };

  const getContractorStatus = (contractor) => {
    if (!contractor) return '';
    
    if (contractor.VaiTro === 'Nhà thầu chính') {
      // Đếm số nhà thầu phụ của nhà thầu chính này
      const subContractors = nhaThauList.filter(nt => nt.ParentId === contractor.NhaThauID);
      const count = subContractors.length;
      return count > 0 ? `${count} nhà thầu phụ` : 'Nhà thầu chính';
    } else if (contractor.VaiTro === 'Nhà thầu phụ' && contractor.ParentId) {
      // Tìm nhà thầu chính của nhà thầu phụ này
      const mainContractor = nhaThauList.find(nt => nt.NhaThauID === contractor.ParentId);
      return mainContractor ? `Thầu phụ của ${mainContractor.TenNhaThau}` : 'Nhà thầu phụ';
    }
    return contractor.VaiTro || 'Không xác định';
  };

  const handleContractorSelect = (contractor) => {
    setFormData(prev => ({ ...prev, NhaThauID: contractor.NhaThauID }));
    setContractorSearchTerm(contractor.TenNhaThau);
    setShowContractorDropdown(false);
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
                <div className="relative contractor-dropdown">
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhà thầu..."
                    value={contractorSearchTerm}
                    onChange={(e) => {
                      setContractorSearchTerm(e.target.value);
                      setShowContractorDropdown(true);
                    }}
                    onFocus={() => setShowContractorDropdown(true)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  
                  {/* Dropdown kết quả tìm kiếm */}
                  {showContractorDropdown && getFilteredContractors().length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredContractors().map(contractor => (
                        <div
                          key={contractor.NhaThauID}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleContractorSelect(contractor)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{contractor.TenNhaThau}</div>
                              <div className="text-xs text-gray-500">{getContractorStatus(contractor)}</div>
                              {contractor.MaSoThue && (
                                <div className="text-xs text-gray-400">MST: {contractor.MaSoThue}</div>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 ml-2">
                              {contractor.VaiTro === 'Nhà thầu chính' ? 'Chính' : 'Phụ'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Thông báo không tìm thấy */}
                  {showContractorDropdown && contractorSearchTerm && getFilteredContractors().length === 0 && (
                    <div className="absolute z-50 w-full mt-1 text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      Không tìm thấy nhà thầu phù hợp
                    </div>
                  )}
                </div>
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
            {/* <div className="md:col-span-2">
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
            </div> */}
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
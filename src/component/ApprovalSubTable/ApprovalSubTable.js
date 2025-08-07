import React, { useState, useEffect } from "react";
import { FaSearch, FaSpinner, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from "axios";

export default function ApprovalSubTable({duAnThanhPhanId}) {
  const [searchText, setSearchText] = useState("");
  const [filterNhaThau, setFilterNhaThau] = useState("");
  const [filterHangMuc, setFilterHangMuc] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    LoaiVuongMac: '',
    MoTaChiTiet: '',
    MucDo: '',
    BienPhapXuLy: '',
    TrangThaiXuLy: '',
    NoiDungXuLy: ''
  });
  // Thêm state để hiển thị chi tiết của một mục
  const [expandedItems, setExpandedItems] = useState({});

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/duAn/${duAnThanhPhanId}/vuongMac`);
        const formattedData = formatData(response.data.data);
        setData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL, duAnThanhPhanId]);

  // Mở modal chỉnh sửa
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      MoTaChiTiet: item.noiDung || '',
      BienPhapXuLy: item.bienPhapXuLy || '',
      TrangThaiXuLy: item.trangThaiXuLy || 'ChuaXuLy',
      NoiDungXuLy: item.noiDungXuLy || ''
    });
    setShowModal(true);
  };

  // Xử lý xóa vướng mắc
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vướng mắc này không?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/vuongmac/${id}`);
      setData(prev => prev.filter(item => item.vuongMacID !== id));
      alert('Xóa vướng mắc thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa vướng mắc:', error);
      alert('Có lỗi xảy ra khi xóa vướng mắc');
    }
  };

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gửi yêu cầu cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/vuongmac/${editingItem.vuongMacID}`, formData);
      setShowModal(false);
      alert('Cập nhật vướng mắc thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật vướng mắc:', error);
      alert('Có lỗi xảy ra khi cập nhật vướng mắc');
    }
  };

  // Format dữ liệu từ API sang cấu trúc phù hợp với giao diện
  const formatData = (apiData) => {
    if (!apiData || !apiData.DanhSachGoiThau) {
      return [];
    }
    return apiData.DanhSachGoiThau.flatMap(goiThau => {
      return goiThau.ThongTinVuongMac.flatMap(hangMuc => {
        return hangMuc.VuongMac.map(vuongMac => ({
          goiThau: goiThau.TenGoiThau,
          nhaThau: vuongMac.NguoiBaoCao?.HoTen || "Không xác định",
          hangMuc: hangMuc.TenHangMuc,
          noiDung: vuongMac.MoTaChiTiet,
          noiDungXuLy: vuongMac.NoiDungXuLy || "Chưa có nội dung xử lý cụ thể nào",
          deXuat: vuongMac.BienPhapXuLy || "Chưa có đề xuất",
          trangThaiXuLy: getStatusText(vuongMac.TrangThaiXuLy),
          ngayCapNhat: new Date(vuongMac.NgayCapNhat).toLocaleDateString(),
          mucDo: vuongMac.MucDo,
          loaiVuongMac: vuongMac.LoaiVuongMac,
          vuongMacID: vuongMac.VuongMacID
        }));
      });
    });
  };

  // Chuyển đổi trạng thái từ ENUM sang tiếng Việt
  const getStatusText = (status) => {
    switch(status) {
      case 'ChuaXuLy': return 'Chưa xử lý';
      case 'DangXuLy': return 'Đang xử lý';
      case 'DaXuLy': return 'Đã xử lý';
      default: return status;
    }
  };

  // Lấy class CSS cho từng trạng thái
  const getStatusClass = (status) => {
    switch(status) {
      case 'Chưa xử lý': 
        return 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium';
      case 'Đang xử lý': 
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium';
      case 'Đã xử lý': 
        return 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium';
      default: 
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium';
    }
  };

  // Toggle nội dung mở rộng của một mục
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Hàm tạo avatar nhà thầu
  const renderNhaThauAvatar = (tenNhaThau) => {
    if (!tenNhaThau) return null;

    const firstLetter = tenNhaThau.charAt(0).toUpperCase();
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;

    return (
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${colors[colorIndex]} relative group`}
        title={tenNhaThau}
      >
        {firstLetter}
        <div className="absolute z-10 hidden group-hover:block bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
          {tenNhaThau}
        </div>
      </div>
    );
  };

  // Lọc dữ liệu
  const filteredData = data.filter(item => {
    const matchSearch =
      item.goiThau.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nhaThau.toLowerCase().includes(searchText.toLowerCase()) ||
      item.hangMuc.toLowerCase().includes(searchText.toLowerCase()) ||
      item.noiDung.toLowerCase().includes(searchText.toLowerCase()) ||
      item.deXuat.toLowerCase().includes(searchText.toLowerCase()) ||
      item.trangThaiXuLy.toLowerCase().includes(searchText.toLowerCase());

    const matchNhaThau = !filterNhaThau || 
      item.nhaThau.toLowerCase().includes(filterNhaThau.toLowerCase());
    
    const matchHangMuc = !filterHangMuc || 
      item.hangMuc.toLowerCase().includes(filterHangMuc.toLowerCase());
    
    return matchSearch && matchNhaThau && matchHangMuc;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Lỗi khi tải dữ liệu: {error}
      </div>
    );
  }

  return (
    <div className="p-4 w-full bg-white rounded-lg shadow-md">
      {/* Khối tìm kiếm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm chung..."
            className="pl-10 pr-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Lọc theo nhà thầu..."
            className="pl-10 pr-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterNhaThau}
            onChange={(e) => setFilterNhaThau(e.target.value)}
          />
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Lọc theo hạng mục..."
            className="pl-10 pr-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterHangMuc}
            onChange={(e) => setFilterHangMuc(e.target.value)}
          />
        </div>
      </div>

      {/* Hiển thị dữ liệu dạng thẻ (Card View) - Chỉ hiển thị trên mobile */}
      <div className="md:hidden grid grid-cols-1 gap-4">
          {filteredData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-blue-700 text-sm mb-1">{item.goiThau}</h3>
                  <div className="text-xs text-gray-600">{item.hangMuc}</div>
                  <div className={getStatusClass(item.trangThaiXuLy)}>
                    {item.trangThaiXuLy}
                </div>
                </div>
                
              </div>
            </div>
            
            <div className="px-4 py-2">
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div className="col-span-2">
                  <div className="font-medium text-gray-500">Người báo cáo:</div>
                  <div>{item.nhaThau}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Ngày cập nhật:</div>
                  <div>{item.ngayCapNhat}</div>
                </div>
              </div>
              
              <div className="text-xs mb-3">
                <div className="font-medium text-gray-500">Nội dung:</div>
                <div className={`mt-1 text-gray-800 ${!expandedItems[`content-${idx}`] ? 'line-clamp-2' : ''}`}>
                  {item.noiDung}
                </div>
                {item.noiDung && item.noiDung.length > 100 && (
                  <button 
                    className="mt-1 text-blue-600 text-xs font-medium"
                    onClick={() => toggleExpand(`content-${idx}`)}
                  >
                    {expandedItems[`content-${idx}`] ? 'Rút gọn' : 'Xem thêm'}
                  </button>
                )}
              </div>
              
              {expandedItems[`item-${idx}`] && (
                <div className="text-xs mb-2">
                  <div className="font-medium text-gray-500">Đề xuất:</div>
                  <div className="mt-1 text-gray-800">{item.deXuat}</div>
                  
                  <div className="font-medium text-gray-500 mt-2">Nội dung xử lý:</div>
                  <div className="mt-1 text-gray-800">{item.noiDungXuLy}</div>
                 
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <button 
                className="text-xs font-medium text-blue-600 flex items-center"
                onClick={() => toggleExpand(`item-${idx}`)}
              >
                <FaEye className="mr-1" size={12} />
                {expandedItems[`item-${idx}`] ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </button>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Sửa"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.vuongMacID)}
                  className="text-red-600 hover:text-red-800"
                  title="Xóa"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredData.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
            {data.length === 0 ? "Không có dữ liệu" : "Không tìm thấy kết quả phù hợp"}
          </div>
        )}
      </div>

      {/* Hiển thị dữ liệu dạng bảng (Table View) - Chỉ hiển thị trên desktop */}
      <div className="hidden md:block overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Gói thầu</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Người báo cáo</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Hạng mục</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Nội dung</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Đề xuất xử lý</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Trạng thái</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Ngày cập nhật</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{index + 1}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 font-bold whitespace-normal text-xs sm:text-sm text-gray-500 max-w-[120px] sm:max-w-none truncate">
                      {item.goiThau}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {renderNhaThauAvatar(item.nhaThau)}
                        <span className="text-xs sm:text-sm">
                          {item.nhaThau}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 font-bold whitespace-normal text-xs sm:text-sm text-gray-500 max-w-[120px] sm:max-w-none truncate">
                      {item.hangMuc}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-normal text-xs sm:text-sm text-gray-500 max-w-[150px] sm:max-w-none truncate">
                      {item.noiDung}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-normal text-xs sm:text-sm text-gray-500 max-w-[150px] sm:max-w-none truncate">
                      {item.deXuat}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${item.trangThaiXuLy === 'Đã xử lý' ? 'bg-green-100 text-green-800' :
                        item.trangThaiXuLy === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {item.trangThaiXuLy}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {item.ngayCapNhat}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.vuongMacID)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    {data.length === 0 ? "Không có dữ liệu" : "Không tìm thấy kết quả phù hợp"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cập nhật vướng mắc</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                    <textarea
                      name="MoTaChiTiet"
                      value={formData.MoTaChiTiet}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Biện pháp xử lý</label>
                    <textarea
                      name="BienPhapXuLy"
                      value={formData.BienPhapXuLy}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái xử lý</label>
                    <select
                      name="TrangThaiXuLy"
                      value={formData.TrangThaiXuLy}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="ChuaXuLy">Chưa xử lý</option>
                      <option value="DangXuLy">Đang xử lý</option>
                      <option value="DaXuLy">Đã xử lý</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Nội dung xử lý</label>
                    <textarea
                      name="NoiDungXuLy"
                      value={formData.NoiDungXuLy}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
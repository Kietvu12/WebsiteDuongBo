import React, { useState, useEffect } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { FaEdit, FaTrash } from 'react-icons/fa';
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

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/duAn/${duAnThanhPhanId}/vuongMac`); // Thay 123 bằng ID dự án thực tế
        const formattedData = formatData(response.data.data);
        setData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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

  // Xử lý xóa (tạm thời chỉ hiển thị console log)
  const handleDelete = (id) => {
    console.log('Xóa vướng mắc có ID:', id);
    // TODO: Thêm API xóa sau này
    alert(`Chức năng xóa tạm thời chưa khả dụng. ID cần xóa: ${id}`);
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
          vuongMacID: vuongMac.VuongMacID // Thêm dòng này
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
  console.log(filteredData);
  

  return (
    <div className="p-4 w-full bg-white rounded-lg shadow-md">
      {/* Khối tìm kiếm */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm chung..."
            className="pl-8 pr-2 py-2 border rounded w-full"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Lọc theo nhà thầu..."
            className="pl-8 pr-2 py-2 border rounded w-full"
            value={filterNhaThau}
            onChange={(e) => setFilterNhaThau(e.target.value)}
          />
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Lọc theo hạng mục..."
            className="pl-8 pr-2 py-2 border rounded w-full"
            value={filterHangMuc}
            onChange={(e) => setFilterHangMuc(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white shadow-sm">
            <th className="px-3 py-2 border">Tên gói thầu</th>
            <th className="px-3 py-2 border">Người báo cáo</th>
            <th className="px-3 py-2 border">Hạng mục</th>
            <th className="px-3 py-2 border">Nội dung</th>
            <th className="px-3 py-2 border">Đề xuất xử lý</th>
            <th className="px-3 py-2 border">Nội dung xử lý</th>
            <th className="px-3 py-2 border">Trạng thái</th>
            <th className="px-3 py-2 border">Ngày cập nhật</th>
            <th className="px-3 py-2 border">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="border px-3 py-2">{item.goiThau}</td>
              <td className="border px-3 py-2">{item.nhaThau}</td>
              <td className="border px-3 py-2">{item.hangMuc}</td>
              <td className="border px-3 py-2">{item.noiDung}</td>
              <td className="border px-3 py-2">{item.deXuat}</td>
              <td className="border px-3 py-2">{item.noiDungXuLy}</td>
              <td className="border px-3 py-2">
                {item.trangThaiXuLy === "Chưa xử lý" && (
                  <span className="text-red-600 font-semibold">
                    {item.trangThaiXuLy}
                  </span>
                )}
                {item.trangThaiXuLy === "Đang xử lý" && (
                  <span className="text-yellow-600 font-semibold">
                    {item.trangThaiXuLy}
                  </span>
                )}
                {item.trangThaiXuLy === "Đã xử lý" && (
                  <span className="text-green-600 font-semibold">
                    {item.trangThaiXuLy}
                  </span>
                )}
              </td>
              <td className="border px-3 py-2">{item.ngayCapNhat}</td>
              <td className="border px-3 py-2">
                <div className="flex justify-center space-x-2">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.vuongMacID)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center p-4 text-gray-500">
                {data.length === 0 ? "Không có dữ liệu" : "Không tìm thấy kết quả phù hợp"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
    </div>
  );
}
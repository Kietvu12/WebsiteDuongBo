import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaSave, FaTimes, FaUserShield } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';

const AccountSetting = () => {
  const [accounts, setAccounts] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    PhanQuyenID: '',
    TrangThai: true
  });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // Lấy danh sách tài khoản và quyền
  useEffect(() => {
    // Sửa phần fetch data trong useEffect
const fetchData = async () => {
  setLoading(true);
  try {
    const [accRes, permRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/tai-khoan`),
      axios.get(`${API_BASE_URL}/api/phan-quyen`)
    ]);
    
    // Đảm bảo dữ liệu trả về có chứa MatKhau
    console.log('API Response:', accRes.data.data[0]); // Kiểm tra object đầu tiên
    
    setAccounts(accRes.data.data);
    setPermissions(permRes.data.data);
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
  } finally {
    setLoading(false);
  }
};
    fetchData();
  }, []);

  // Xử lý tìm kiếm và gợi ý
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = accounts.filter(acc => 
        acc.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.TenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.Email.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, accounts]);

  // Xử lý cập nhật quyền
  const handleUpdatePermission = async (userId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/tai-khoan/${userId}/phan-quyen`, {
        PhanQuyenID: editForm.PhanQuyenID
      });
      
      // Cập nhật lại danh sách
      const updatedAccounts = accounts.map(acc => 
        acc.NguoiDungID === userId 
          ? { ...acc, PhanQuyenID: editForm.PhanQuyenID } 
          : acc
      );
      setAccounts(updatedAccounts);
      setEditingId(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền:', error);
    }
  };

  // Chuyển đổi trạng thái tài khoản
  const toggleAccountStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.patch(`${API_BASE_URL}/api/tai-khoan/${userId}/trang-thai`, {
        TrangThai: newStatus
      });
      
      // Cập nhật lại danh sách
      const updatedAccounts = accounts.map(acc => 
        acc.NguoiDungID === userId 
          ? { ...acc, TrangThai: newStatus } 
          : acc
      );
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  // Hàm lấy tên quyền từ ID
  const getPermissionName = (id) => {
    const permission = permissions.find(p => p.PhanQuyenID === id);
    return permission ? permission.TenQuyen : 'Không xác định';
  };

  // Lọc tài khoản theo từ khóa tìm kiếm
  const filteredAccounts = accounts.filter(acc => 
    acc.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.TenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.TenNhaThau && acc.TenNhaThau.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  console.log(filteredAccounts);
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FaUserShield className="mr-2" /> QUẢN LÝ TÀI KHOẢN
      </h1>

      {/* Thanh tìm kiếm */}
      <div className="relative mb-6">
        <div className="flex items-center bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-3 py-2 bg-gray-100">
            <FaSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, tên đăng nhập hoặc nhà thầu..."
            className="flex-1 px-4 py-2 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Gợi ý tìm kiếm */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {suggestions.map(suggestion => (
              <div 
                key={suggestion.NguoiDungID}
                className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                onClick={() => {
                  setSearchTerm(suggestion.HoTen);
                  setSuggestions([]);
                }}
              >
                <div className="font-medium">{suggestion.HoTen}</div>
                <div className="text-sm text-gray-600">{suggestion.Email} • {suggestion.TenDangNhap}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bảng danh sách tài khoản */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mật khẩu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà thầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map(account => (
                <tr key={account.NguoiDungID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{account.HoTen}</div>
                    
                    <div className="text-sm text-gray-500">{account.ChucVu}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.Email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.TenDangNhap}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.MatKhau}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.TenNhaThau || 'Không thuộc nhà thầu'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative"> {/* Thêm relative vào đây */}
  {editingId === account.NguoiDungID ? (
    <div className="relative z-50"> {/* Thêm wrapper div với z-50 */}
      <Select
        options={permissions.map(p => ({
          value: p.PhanQuyenID,
          label: p.TenQuyen
        }))}
        value={{
          value: editForm.PhanQuyenID,
          label: getPermissionName(editForm.PhanQuyenID)
        }}
        onChange={(selected) => setEditForm({
          ...editForm,
          PhanQuyenID: selected.value
        })}
        className="w-48"
        menuPortalTarget={document.body} // Quan trọng: render menu ra ngoài flow
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }) // Đảm bảo menu hiển thị trên cùng
        }}
      />
    </div>
  ) : (
    <span className="text-sm font-medium">
      {getPermissionName(account.PhanQuyenID)}
    </span>
  )}
</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${account.TrangThai ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {account.TrangThai ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === account.NguoiDungID ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdatePermission(account.NguoiDungID)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Lưu"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Hủy"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setEditingId(account.NguoiDungID);
                            setEditForm({
                              PhanQuyenID: account.PhanQuyenID,
                              TrangThai: account.TrangThai
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Đổi quyền"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => toggleAccountStatus(account.NguoiDungID, account.TrangThai)}
                          className={`p-1 ${account.TrangThai ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          title={account.TrangThai ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {account.TrangThai ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountSetting;
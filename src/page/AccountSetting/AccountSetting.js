import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaEdit, FaSave, FaTimes, FaUserShield } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import { FaBuilding, FaPhone, FaEnvelope, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaFileAlt, FaTrash} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { FaArrowLeft, FaRegBell } from 'react-icons/fa'

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
      <div className="w-full bg-white  px-3 sm:px-4 py-2 sm:py-3 mt-3 md:mt-0">
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
          QUẢN LÝ TÀI KHOẢN
        </h1>


      </div>

      {/* Thanh tìm kiếm */}
      <div className="mt-6 relative mb-6">
        <div className="flex items-center bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-3 py-2">
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
        <>
          {/* Bảng cho desktop */}
          <div className="bg-white rounded-lg shadow overflow-x-auto hidden md:block w-full">
            <table className="min-w-max w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell hidden">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell hidden">Tên đăng nhập</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell hidden">Mật khẩu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell hidden">Nhà thầu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map(account => (
                  <tr key={account.NguoiDungID} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{account.HoTen}</div>
                      <div className="text-sm text-gray-500">{account.ChucVu}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 md:table-cell hidden">{account.Email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 md:table-cell hidden">{account.TenDangNhap}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 md:table-cell hidden">{account.MatKhau}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 md:table-cell hidden">{account.TenNhaThau || 'Không thuộc nhà thầu'}</td>
                    <td className="px-4 py-4 whitespace-nowrap relative">
                      {editingId === account.NguoiDungID ? (
                        <div className="relative z-50">
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
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-medium">
                          {getPermissionName(account.PhanQuyenID)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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

          {/* Card cho mobile */}
          <div className="md:hidden space-y-4">
            {filteredAccounts.map(account => (
              <div key={account.NguoiDungID} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-gray-900 text-base">{account.HoTen}</div>
                    <div className="text-xs text-gray-500">{account.ChucVu}</div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {getPermissionName(account.PhanQuyenID)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-1">Email: {account.Email}</div>
                <div className="text-xs text-gray-500 mb-1">Tên đăng nhập: {account.TenDangNhap}</div>
                <div className="text-xs text-gray-500 mb-1">Nhà thầu: {account.TenNhaThau || 'Không thuộc nhà thầu'}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingId(account.NguoiDungID);
                      setEditForm({
                        PhanQuyenID: account.PhanQuyenID,
                        TrangThai: account.TrangThai
                      });
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1 text-xs border rounded"
                    title="Đổi quyền"
                  >
                    <FaEdit /> Đổi quyền
                  </button>
                  <button
                    onClick={() => toggleAccountStatus(account.NguoiDungID, account.TrangThai)}
                    className={`p-1 text-xs border rounded ${account.TrangThai ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                    title={account.TrangThai ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {account.TrangThai ? 'Vô hiệu' : 'Kích hoạt'}
                  </button>
                </div>
                {editingId === account.NguoiDungID && (
                  <div className="mt-3">
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
                      className="w-full mb-2"
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdatePermission(account.NguoiDungID)}
                        className="text-green-600 hover:text-green-900 p-1 text-xs border rounded flex-1"
                        title="Lưu"
                      >
                        <FaSave /> Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900 p-1 text-xs border rounded flex-1"
                        title="Hủy"
                      >
                        <FaTimes /> Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSetting;
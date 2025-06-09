import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import axios from 'axios';
import { FaCheckCircle, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';


const AddNewPackage = () => {
    const { projectId } = useParams(); 

  
  // State cho form
  const [formData, setFormData] = useState({
    TenGoiThau: '',
    DuAn_ID: projectId,
    GiaTriHĐ: '',
    Km_BatDau: '',
    Km_KetThuc: '',
    ToaDo_BatDau_X: '',
    ToaDo_BatDau_Y: '',
    ToaDo_KetThuc_X: '',
    ToaDo_KetThuc_Y: '',
    NgayKhoiCong: '',
    NgayHoanThanh: '',
    TrangThai: 'dang_chuan_bi',
    NhaThauID: '',
    LoaiHinh_ID: '',
    ThuocTinhValues: {}
  });

  // State khác
  const [nhaThauList, setNhaThauList] = useState([]);
  const [loaiHinhList, setLoaiHinhList] = useState([]);
  const [thuocTinhList, setThuocTinhList] = useState([]);
  const [removedThuocTinh, setRemovedThuocTinh] = useState([]);
  const [selectedLoaiHinh, setSelectedLoaiHinh] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddressType, setSelectedAddressType] = useState(null);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  
  // Refs cho bản đồ
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([14.0583, 108.2772], 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapRef.current = map;

      map.on('click', (e) => {
        if (selectedAddressType === 'start') {
          setStartPoint(e.latlng);
        } else if (selectedAddressType === 'end') {
          setEndPoint(e.latlng);
        }
      });
    }

    // Load danh sách nhà thầu và loại hình
    fetchNhaThauList();
    fetchLoaiHinhList();
  }, []);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const fetchNhaThauList = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}nhaThauList`);
      setNhaThauList(response.data.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà thầu:', error);
    }
  };

  const fetchLoaiHinhList = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}loaihinh`);
      if (response.data.success) {
        setLoaiHinhList(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại hình:', error);
    }
  };

  const handleLoaiHinhChange = async (e) => {
    const value = e.target.value;
    const loaiHinh = loaiHinhList.find(lh => lh.LoaiHinh_ID == value);
    setSelectedLoaiHinh(loaiHinh);
    setFormData({ ...formData, LoaiHinh_ID: value });
    setRemovedThuocTinh([]);

    try {
      const response = await axios.get(`${API_BASE_URL}loaihinh/${value}/thuoctinh`);
      if (response.data.success) {
        setThuocTinhList(response.data.data.thuocTinh);
      }
    } catch (error) {
      console.error('Lỗi khi tải thuộc tính loại hình:', error);
    }
  };

  const setStartPoint = (latlng) => {
    const { lat, lng } = latlng;
    
    setFormData({
      ...formData,
      ToaDo_BatDau_X: lng,
      ToaDo_BatDau_Y: lat
    });
    
    if (startMarkerRef.current) {
      startMarkerRef.current.setLatLng(latlng);
    } else {
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: 'start-marker',
          html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%;"></div>',
          iconSize: [20, 20]
        })
      }).addTo(mapRef.current);
      startMarkerRef.current = marker;
    }
    
    setSelectedAddressType(null);
  };

  const setEndPoint = (latlng) => {
    const { lat, lng } = latlng;
    
    setFormData({
      ...formData,
      ToaDo_KetThuc_X: lng,
      ToaDo_KetThuc_Y: lat
    });
    
    if (endMarkerRef.current) {
      endMarkerRef.current.setLatLng(latlng);
    } else {
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: 'end-marker',
          html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%;"></div>',
          iconSize: [20, 20]
        })
      }).addTo(mapRef.current);
      endMarkerRef.current = marker;
    }
    
    setSelectedAddressType(null);
  };

  const handleAddressSearch = async (query, type) => {
    setSelectedAddressType(type);
    
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query });
      setAddressSuggestions(results);
    } catch (error) {
      console.error('Lỗi tìm kiếm địa chỉ:', error);
      setAddressSuggestions([]);
    }
  };

  const selectAddress = (result, type) => {
    const { x: lng, y: lat } = result;
    const latlng = L.latLng(lat, lng);
    
    if (type === 'start') {
      setStartPoint(latlng);
    } else {
      setEndPoint(latlng);
    }
    
    mapRef.current.setView(latlng, 15);
    setAddressSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleThuocTinhChange = (ThuocTinh_ID, value) => {
    setFormData({
      ...formData,
      ThuocTinhValues: {
        ...formData.ThuocTinhValues,
        [ThuocTinh_ID]: value
      }
    });
  };

  const removeThuocTinh = (thuocTinh) => {
    setThuocTinhList(thuocTinhList.filter(t => t.ThuocTinh_ID !== thuocTinh.ThuocTinh_ID));
    setRemovedThuocTinh([...removedThuocTinh, thuocTinh]);
  };

  const restoreThuocTinh = (thuocTinh) => {
    setRemovedThuocTinh(removedThuocTinh.filter(t => t.ThuocTinh_ID !== thuocTinh.ThuocTinh_ID));
    setThuocTinhList([...thuocTinhList, thuocTinh]);
  };

  const renderInputByType = (thuocTinh) => {
    const value = formData.ThuocTinhValues[thuocTinh.ThuocTinh_ID] || '';
    
    switch (thuocTinh.KieuDuLieu) {
      case 'number':
        return (
          <input
            type="number"
            className="w-full px-2 py-1 border rounded text-xs"
            value={value}
            onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-2 py-1 border rounded text-xs"
            value={value}
            onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
          />
        );
      case 'boolean':
        return (
          <select
            className="w-full px-2 py-1 border rounded text-xs"
            value={value}
            onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
          >
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        );
      default:
        return (
          <input
            type="text"
            className="w-full px-2 py-1 border rounded text-xs"
            value={value}
            onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
          />
        );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_BASE_URL}goithau/tao-moi`, formData);
      alert('Tạo gói thầu thành công!');
      // Reset form hoặc chuyển hướng
    } catch (error) {
      console.error('Lỗi khi tạo gói thầu:', error);
      alert('Có lỗi xảy ra khi tạo gói thầu');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Tạo Mới Gói Thầu</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Phần form nhập liệu */}
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Thông tin cơ bản */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói thầu *</label>
                <input
                  type="text"
                  name="TenGoiThau"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.TenGoiThau}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị hợp đồng (VND)</label>
                <input
                  type="number"
                  name="GiaTriHĐ"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.GiaTriHĐ}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Km bắt đầu</label>
                  <input
                    type="number"
                    step="0.01"
                    name="Km_BatDau"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.Km_BatDau}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Km kết thúc</label>
                  <input
                    type="number"
                    step="0.01"
                    name="Km_KetThuc"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.Km_KetThuc}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Điểm đầu và điểm cuối */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">Vị trí công trình</h2>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Điểm bắt đầu</label>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm địa chỉ hoặc click trên bản đồ"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    onChange={(e) => handleAddressSearch(e.target.value, 'start')}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600"
                    onClick={() => setSelectedAddressType('start')}
                  >
                    Chọn trên bản đồ
                  </button>
                </div>
                
                {selectedAddressType === 'start' && addressSuggestions.length > 0 && (
                  <ul className="border rounded-md max-h-40 overflow-y-auto text-sm">
                    {addressSuggestions.map((result, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectAddress(result, 'start')}
                      >
                        {result.label}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Kinh độ"
                    className="px-3 py-2 border rounded-md text-sm"
                    value={formData.ToaDo_BatDau_X}
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Vĩ độ"
                    className="px-3 py-2 border rounded-md text-sm"
                    value={formData.ToaDo_BatDau_Y}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Điểm kết thúc</label>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm địa chỉ hoặc click trên bản đồ"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    onChange={(e) => handleAddressSearch(e.target.value, 'end')}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600"
                    onClick={() => setSelectedAddressType('end')}
                  >
                    Chọn trên bản đồ
                  </button>
                </div>
                
                {selectedAddressType === 'end' && addressSuggestions.length > 0 && (
                  <ul className="border rounded-md max-h-40 overflow-y-auto text-sm">
                    {addressSuggestions.map((result, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectAddress(result, 'end')}
                      >
                        {result.label}
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Kinh độ"
                    className="px-3 py-2 border rounded-md text-sm"
                    value={formData.ToaDo_KetThuc_X}
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Vĩ độ"
                    className="px-3 py-2 border rounded-md text-sm"
                    value={formData.ToaDo_KetThuc_Y}
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            {/* Thông tin thời gian */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">Thời gian</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi công</label>
                  <input
                    type="date"
                    name="NgayKhoiCong"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.NgayKhoiCong}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hoàn thành</label>
                  <input
                    type="date"
                    name="NgayHoanThanh"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={formData.NgayHoanThanh}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Thông tin khác */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">Thông tin khác</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà thầu</label>
                <select
                  name="NhaThauID"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.NhaThauID}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn nhà thầu</option>
                  {nhaThauList.map(nhaThau => (
                    <option key={nhaThau.NhaThauID} value={nhaThau.NhaThauID}>{nhaThau.TenNhaThau}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
                <select
                  name="LoaiHinh_ID"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.LoaiHinh_ID}
                  onChange={handleLoaiHinhChange}
                >
                  <option value="">Chọn loại hình</option>
                  {loaiHinhList.map(loaiHinh => (
                    <option key={loaiHinh.LoaiHinh_ID} value={loaiHinh.LoaiHinh_ID}>{loaiHinh.TenLoaiHinh}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="TrangThai"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={formData.TrangThai}
                  onChange={handleInputChange}
                >
                  <option value="dang_chuan_bi">Đang chuẩn bị</option>
                  <option value="dang_thi_cong">Đang thi công</option>
                  <option value="hoan_thanh">Hoàn thành</option>
                  <option value="tam_dung">Tạm dừng</option>
                </select>
              </div>
            </div>
            
            {/* Thuộc tính tùy chỉnh */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded p-2 border border-gray-200 lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xs font-semibold text-gray-700 flex items-center">
                    <FaCheckCircle className="mr-1 text-green-500 text-xs" />
                    Thuộc tính dự án
                  </h2>
                  <button
                    onClick={() => setShowAddAttribute(true)}
                    className="flex items-center px-2 py-0.5 bg-green-500 text-white rounded text-xxs hover:bg-green-600 transition-colors"
                  >
                    <FaPlus className="mr-0.5 text-xs" />
                    Thêm thuộc tính
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {thuocTinhList.length > 0 ? (
                    thuocTinhList.map(thuocTinh => (
                      <div
                        key={thuocTinh.ThuocTinh_ID}
                        className="p-1 border border-gray-200 rounded hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start space-x-1">
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-xxs font-medium text-gray-700 truncate">
                                {thuocTinh.TenThuocTinh}
                                {thuocTinh.BatBuoc === 1 && <span className="text-red-500 ml-0.5">*</span>}
                              </label>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-red-500 transition-colors text-xxs"
                                onClick={() => removeThuocTinh(thuocTinh)}
                              >
                                <FaTimes className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            {renderInputByType(thuocTinh)}
                            {thuocTinh.DonVi && (
                              <div className="text-xxs text-gray-500 truncate">Đơn vị: {thuocTinh.DonVi}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-3 text-gray-400 text-xxs">
                      {selectedLoaiHinh ? 'Chưa có thuộc tính nào' : 'Vui lòng chọn loại hình dự án'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Thuộc tính có sẵn
                  </h2>
                </div>

                <div className="p-3 max-h-[300px] overflow-y-auto">
                  {removedThuocTinh.length > 0 ? (
                    <div className="space-y-2">
                      {removedThuocTinh.map(thuocTinh => (
                        <div
                          key={thuocTinh.ThuocTinh_ID}
                          className="p-2 bg-gray-50 rounded-md hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
                          onClick={() => restoreThuocTinh(thuocTinh)}
                        >
                          <span className="text-sm text-gray-700 truncate">{thuocTinh.TenThuocTinh}</span>
                          <FaPlus className="h-3 w-3 text-green-500" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      Không có thuộc tính nào
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Nút submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Tạo gói thầu
              </button>
            </div>
          </form>
        </div>
        
        {/* Phần bản đồ */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Bản đồ công trình</h2>
          <div id="map" className="h-96 rounded-md border"></div>
          
          {selectedAddressType && (
            <div className="mt-3 p-2 bg-yellow-100 rounded-md text-xs">
              <p className="font-medium">
                {selectedAddressType === 'start' ? 'Đang chọn điểm bắt đầu' : 'Đang chọn điểm kết thúc'}
              </p>
              <p>Vui lòng click vào vị trí trên bản đồ hoặc tìm kiếm địa chỉ</p>
            </div>
          )}
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-blue-100 rounded-md">
              <p className="text-xs font-medium">Điểm bắt đầu</p>
              {formData.ToaDo_BatDau_X && formData.ToaDo_BatDau_Y ? (
                <p className="text-xxs">{formData.ToaDo_BatDau_X}, {formData.ToaDo_BatDau_Y}</p>
              ) : (
                <p className="text-xxs text-gray-500">Chưa chọn</p>
              )}
            </div>
            <div className="p-2 bg-red-100 rounded-md">
              <p className="text-xs font-medium">Điểm kết thúc</p>
              {formData.ToaDo_KetThuc_X && formData.ToaDo_KetThuc_Y ? (
                <p className="text-xxs">{formData.ToaDo_KetThuc_X}, {formData.ToaDo_KetThuc_Y}</p>
              ) : (
                <p className="text-xxs text-gray-500">Chưa chọn</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewPackage;
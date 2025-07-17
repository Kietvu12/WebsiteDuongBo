
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import axios from 'axios';
import { FaCheckCircle, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { kml } from '@mapbox/togeojson';
import { DOMParser } from 'xmldom';
import vietnamGeoJson from '../../assets/data/vietnam.json'
import './AddNewPackage.css'

const AddNewPackage = ({ isEdit, projectId, goiThau, onClose, onSuccess }) => {
  // State cho form
  const [formData, setFormData] = useState({
    TenGoiThau: goiThau?.TenGoiThau || '',
    DuAn_ID: projectId,
    GiaTriHĐ: goiThau?.GiaTriHĐ || '',
    Km_BatDau: goiThau?.Km_BatDau || '',
    Km_KetThuc: goiThau?.Km_KetThuc || '',
    ToaDo_BatDau_X: goiThau?.ToaDo_BatDau_X || '',
    ToaDo_BatDau_Y: goiThau?.ToaDo_BatDau_Y || '',
    ToaDo_KetThuc_X: goiThau?.ToaDo_KetThuc_X || '',
    ToaDo_KetThuc_Y: goiThau?.ToaDo_KetThuc_Y || '',
    NgayKhoiCong: goiThau?.NgayKhoiCong ? goiThau.NgayKhoiCong.split('T')[0] : '',
    NgayHoanThanh: goiThau?.NgayHoanThanh ? goiThau.NgayHoanThanh.split('T')[0] : '',
    TrangThai: goiThau?.TrangThai || 'Đang chuẩn bị',
    NhaThauID: goiThau?.NhaThauID || '',
    LoaiHinh_ID: goiThau?.LoaiHinh_ID || '',
    ThuocTinhValues: goiThau?.ThuocTinhValues || {}
  });

  const [files, setFiles] = useState([]);
  const [kmlFile, setKmlFile] = useState(null);
  const [existingFiles, setExistingFiles] = useState(goiThau?.taiLieu || []);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [nhaThauList, setNhaThauList] = useState([]);
  const [loaiHinhList, setLoaiHinhList] = useState([]);
  const [thuocTinhList, setThuocTinhList] = useState([]);
  const [removedThuocTinh, setRemovedThuocTinh] = useState([]);
  const [selectedLoaiHinh, setSelectedLoaiHinh] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedAddressType, setSelectedAddressType] = useState(null);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Khởi tạo bản đồ và tải dữ liệu ban đầu
  useEffect(() => {
    // Khởi tạo bản đồ
    if (!mapRef.current) {
      const map = L.map('map').setView([16.0583, 108.2772], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

    // Khởi tạo marker nếu có tọa độ
    if (goiThau?.ToaDo_BatDau_X && goiThau?.ToaDo_BatDau_Y) {
      setStartPoint({ lat: goiThau.ToaDo_BatDau_Y, lng: goiThau.ToaDo_BatDau_X });
    }
    if (goiThau?.ToaDo_KetThuc_X && goiThau?.ToaDo_KetThuc_Y) {
      setEndPoint({ lat: goiThau.ToaDo_KetThuc_Y, lng: goiThau.ToaDo_KetThuc_X });
    }

    fetchNhaThauList();
    fetchLoaiHinhList();

    // Tải thuộc tính nếu ở chế độ sửa và có LoaiHinh_ID
    if (isEdit && goiThau?.LoaiHinh_ID) {
      fetchThuocTinhList(goiThau.LoaiHinh_ID);
    }
  }, [isEdit, goiThau]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1️⃣ Xóa các layer overlay cũ (mask + border)
    if (map._maskLayer) map.removeLayer(map._maskLayer);

    // 2️⃣ Tạo polygon "world" bao quanh toàn bản đồ (dùng lat,lng)
    const outer = [
      [ 90, -180],
      [ 90,  180],
      [-90,  180],
      [-90, -180]
    ];

    // 3️⃣ Chuẩn bị mảng các hole từ GeoJSON Việt Nam
    const holes = vietnamGeoJson.features.flatMap(feature => {
      const coords = feature.geometry.coordinates;
      if (feature.geometry.type === 'Polygon') {
        // coords: [ [ [lng,lat], ... ] , ... ]
        return coords.map(ring =>
          ring.map(([lng, lat]) => [lat, lng])
        );
      } else /* MultiPolygon */ {
        // coords: [ [ [ [lng,lat], ... ], ... ] , ... ]
        return coords.flatMap(poly =>
          poly.map(ring =>
            ring.map(([lng, lat]) => [lat, lng])
          )
        );
      }
    });

    // 4️⃣ Vẽ mask đen với "hole" ngay vùng Việt Nam
    const maskLayer = L.polygon(
      [ outer, ...holes ],
      {
        fillColor: '#000',
        fillOpacity: 0.5,
        weight: 0,
        interactive: false
      }
    ).addTo(map);

    // 7️⃣ Lưu lại để cleanup lần sau
    map._maskLayer   = maskLayer;

    // Cleanup khi unmount hoặc khi effect chạy lại
    return () => {
      if (map._maskLayer)   map.removeLayer(map._maskLayer);
      map._maskLayer = null;
    };
  }, [mapRef.current]);



  const fetchNhaThauList = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nhaThauList`);
      setNhaThauList(response.data.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà thầu:', error);
    }
  };
  
  const drawRouteOnMap = (coordinates) => {
    // Xóa layer cũ nếu có
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // Chuyển đổi tọa độ từ [lng, lat] sang [lat, lng]
    const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

    // Xác định màu sắc dựa trên trạng thái
    let routeColor;
    switch(formData.TrangThai) {
      case 'Đang chuẩn bị':
        routeColor = '#3b82f6'; // blue-600
        break;
      case 'Đang thi công':
        routeColor = '#16a34a'; // green-600
        break;
      case 'Hoàn thành':
        routeColor = '#eab308'; // yellow-500
        break;
      case 'Tạm dừng':
        routeColor = '#9333ea'; // purple-500
        break;
      case 'Chậm tiến độ':
        routeColor = '#dc2626'; // purple-500
        break;
      default:
        routeColor = '#3388ff'; // màu mặc định
    }

    // Tạo polyline mới với màu tương ứng trạng thái
    const polyline = L.polyline(latLngs, {
      color: routeColor,
      weight: 5,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(mapRef.current);

    routeLayerRef.current = polyline;

    // Zoom vào toàn bộ tuyến đường
    mapRef.current.fitBounds(polyline.getBounds());
  };

  // Thêm legend vào bản đồ
  useEffect(() => {
    if (mapRef.current) {
      const legend = L.control({ position: 'bottomright' });
      
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const statuses = [
          { status: 'Đang chuẩn bị', color: '#3b82f6' },
          { status: 'Đang thi công', color: '#16a34a' },
          { status: 'Hoàn thành', color: '#eab308' },
          { status: 'Tạm dừng', color: '#9333ea' },
          { status: 'Chậm tiến độ', color: '#dc2626' }
        ];
        
        let html = '<h4>Trạng thái</h4>';
        statuses.forEach(({ status, color }) => {
          html += `
            <div style="display: flex; align-items: center; margin: 5px 0;">
              <span style="display: inline-block; width: 20px; height: 3px; background: ${color}; margin-right: 5px;"></span>
              <span>${status}</span>
            </div>
          `;
        });
        
        div.innerHTML = html;
        return div;
      };
      
      legend.addTo(mapRef.current);
      
      // Cleanup khi component unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.removeControl(legend);
        }
      };
    }
  }, [mapRef.current]);

  const fetchLoaiHinhList = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loaihinh`);
      if (response.data.success) {
        setLoaiHinhList(response.data.data);
        if (isEdit && goiThau?.LoaiHinh_ID) {
          const loaiHinh = response.data.data.find(lh => lh.LoaiHinh_ID == goiThau.LoaiHinh_ID);
          setSelectedLoaiHinh(loaiHinh);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại hình:', error);
    }
  };

  const fetchThuocTinhList = async (loaiHinhId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loaihinh/${loaiHinhId}/thuoctinh`);
      if (response.data.success) {
        setThuocTinhList(response.data.data.thuocTinh);
      }
    } catch (error) {
      console.error('Lỗi khi tải thuộc tính loại hình:', error);
    }
  };

  const handleLoaiHinhChange = async (e) => {
    const value = e.target.value;
    const loaiHinh = loaiHinhList.find(lh => lh.LoaiHinh_ID == value);
    setSelectedLoaiHinh(loaiHinh);
    setFormData({ ...formData, LoaiHinh_ID: value, ThuocTinhValues: {} });
    setRemovedThuocTinh([]);
    setThuocTinhList([]);

    if (value) {
      await fetchThuocTinhList(value);
    }
  };

  const setStartPoint = (latlng) => {
    const { lat, lng } = latlng;
    setFormData(prev => ({
      ...prev,
      ToaDo_BatDau_X: lng.toString(),
      ToaDo_BatDau_Y: lat.toString()
    }));

    if (startMarkerRef.current) {
      startMarkerRef.current.setLatLng(latlng);
    } else {
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          html: `
            <div style="
              background-color: white;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid black;
              box-shadow: 0 0 3px rgba(0,0,0,0.5);
            "></div>
          `,
          iconSize: [16, 16], // Kích thước tổng bao gồm cả border
          iconAnchor: [8, 8] // Điểm neo ở giữa marker
        })
      }).addTo(mapRef.current);
      startMarkerRef.current = marker;
    }

    setSelectedAddressType(null);
  };

  const setEndPoint = (latlng) => {
    const { lat, lng } = latlng;
    setFormData(prev => ({
      ...prev,
      ToaDo_KetThuc_X: lng.toString(),
      ToaDo_KetThuc_Y: lat.toString()
    }));

    if (endMarkerRef.current) {
      endMarkerRef.current.setLatLng(latlng);
    } else {
      const marker = L.marker(latlng, {
      icon: L.divIcon({
        html: `
          <div style="
            background-color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid black;
            box-shadow: 0 0 3px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [16, 16], // Kích thước tổng bao gồm cả border
        iconAnchor: [8, 8] // Điểm neo ở giữa marker
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const kmlFile = selectedFiles.find(f => f.name.toLowerCase().endsWith('.kml'));
    
    if (kmlFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const kmlContent = event.target.result;
          const kmlDom = new DOMParser().parseFromString(kmlContent, 'text/xml');
          const geoJson = kml(kmlDom);
          
          console.log('Parsed GeoJSON:', geoJson); // Debug

          // Kiểm tra kỹ cấu trúc GeoJSON
          if (!geoJson?.features?.length) {
            throw new Error('KML không có dữ liệu features');
          }

          const lineString = geoJson.features.find(
            f => f.geometry?.type === 'LineString'
          );
          
          if (!lineString) {
            throw new Error('Không tìm thấy LineString trong KML');
          }

          const coordinates = lineString.geometry.coordinates;
          console.log('LineString coordinates:', coordinates); // Debug

          if (!coordinates?.length || coordinates.length < 2) {
            throw new Error('LineString phải có ít nhất 2 điểm');
          }

          // Lấy điểm đầu và cuối - đảm bảo đúng thứ tự [lng, lat]
          const [startLng, startLat] = coordinates[0];
          const [endLng, endLat] = coordinates[coordinates.length - 1];

          console.log('Start:', { lng: startLng, lat: startLat });
          console.log('End:', { lng: endLng, lat: endLat });

          console.log('Before setting formData:', formData);

          // Cập nhật state
          setFormData(prev => ({
            ...prev,
            ToaDo_BatDau_X: startLng.toString(),
            ToaDo_BatDau_Y: startLat.toString(),
            ToaDo_KetThuc_X: endLng.toString(),
            ToaDo_KetThuc_Y: endLat.toString()
          }));

          console.log('After setting formData:', {
            ToaDo_BatDau_X: startLng.toString(),
            ToaDo_BatDau_Y: startLat.toString(),
            ToaDo_KetThuc_X: endLng.toString(),
            ToaDo_KetThuc_Y: endLat.toString()
          });

          console.log('Raw KML content:', kmlContent); // Kiểm tra nội dung KML
          console.log('KML DOM:', kmlDom); // Kiểm tra DOM sau khi parse
          console.log('GeoJSON:', geoJson); // Kiểm tra GeoJSON sau khi convert

          // Cập nhật bản đồ
          setStartPoint({ lat: startLat, lng: startLng });
          setEndPoint({ lat: endLat, lng: endLng });
          drawRouteOnMap(coordinates);

        } catch (error) {
          console.error('Error processing KML:', error);
          alert(`Lỗi xử lý KML: ${error.message}`);
        }
      };
      reader.readAsText(kmlFile);
    }
  };

  const handleRemoveExistingFile = (taiLieuID) => {
    setFilesToRemove([...filesToRemove, taiLieuID]);
    setExistingFiles(existingFiles.filter(file => file.taiLieuID !== taiLieuID));
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
      const formDataToSend = new FormData();
      formDataToSend.append('TenGoiThau', formData.TenGoiThau);
      formDataToSend.append('DuAn_ID', formData.DuAn_ID);
      formDataToSend.append('GiaTriHĐ', formData.GiaTriHĐ);
      formDataToSend.append('Km_BatDau', formData.Km_BatDau);
      formDataToSend.append('Km_KetThuc', formData.Km_KetThuc);
      formDataToSend.append('ToaDo_BatDau_X', formData.ToaDo_BatDau_X);
      formDataToSend.append('ToaDo_BatDau_Y', formData.ToaDo_BatDau_Y);
      formDataToSend.append('ToaDo_KetThuc_X', formData.ToaDo_KetThuc_X);
      formDataToSend.append('ToaDo_KetThuc_Y', formData.ToaDo_KetThuc_Y);
      formDataToSend.append('NgayKhoiCong', formData.NgayKhoiCong);
      formDataToSend.append('NgayHoanThanh', formData.NgayHoanThanh);
      formDataToSend.append('TrangThai', formData.TrangThai);
      formDataToSend.append('NhaThauID', formData.NhaThauID);
      formDataToSend.append('LoaiHinh_ID', formData.LoaiHinh_ID);
      formDataToSend.append('ThuocTinhValues', JSON.stringify(formData.ThuocTinhValues));

      // Thêm danh sách tài liệu cần xóa (nếu có)
      if (isEdit && filesToRemove.length > 0) {
        formDataToSend.append('TaiLieuXoa', JSON.stringify(filesToRemove));
      }

      // Thêm file KML nếu có
      if (kmlFile) {
        formDataToSend.append('kmlFile', kmlFile);
      }

      // Thêm các file khác (không phải KML)
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const url = isEdit
        ? `${API_BASE_URL}/goithau/sua/${goiThau.GoiThau_ID}`
        : `${API_BASE_URL}/goithau/tao-moi`;

      const response = await axios({
        method: isEdit ? 'put' : 'post',
        url,
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert(isEdit ? 'Cập nhật gói thầu thành công!' : 'Tạo gói thầu thành công!');
        // Reset form
        setFormData({
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
          TrangThai: 'Đang chuẩn bị',
          NhaThauID: '',
          LoaiHinh_ID: '',
          ThuocTinhValues: {}
        });
        setFiles([]);
        setKmlFile(null); // Thêm dòng này để reset KML file
        setExistingFiles([]);
        setFilesToRemove([]);
        setThuocTinhList([]);
        setRemovedThuocTinh([]);
        setSelectedLoaiHinh(null);
        onSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error(`Lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} gói thầu:`, error);
      alert(`Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} gói thầu`);
    }
  };

  return (
    <div className="container bg-white rounded-lg  mx-auto p-2 max-w-screen-2xl">
      <div className="flex justify-between items-center mb-4"> {/* Thêm div wrapper với flex */}
        <h1 className="text-xl font-bold">Tạo Mới Gói Thầu</h1>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Đóng"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
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
                    type="text"
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
                    type="text"
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
                  <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                  <option value="Đang thi công">Đang thi công</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                  <option value="Chậm tiến độ">Chậm tiến độ</option>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tài liệu đính kèm (có thể chọn nhiều file)
              </label>
              <input
                type="file"
                accept=".kml"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
              />

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
          <div className="space-y-3 mt-2">
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
                  onChange={(e) => setFormData({
                    ...formData,
                    ToaDo_BatDau_X: e.target.value
                  })}
                />
                <input
                  type="text"
                  placeholder="Vĩ độ"
                  className="px-3 py-2 border rounded-md text-sm"
                  value={formData.ToaDo_BatDau_Y}
                  onChange={(e) => setFormData({
                    ...formData,
                    ToaDo_BatDau_Y: e.target.value
                  })}
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
                  onChange={(e) => setFormData({
                    ...formData,
                    ToaDo_KetThuc_X: e.target.value
                  })}
                />
                <input
                  type="text"
                  placeholder="Vĩ độ"
                  className="px-3 py-2 border rounded-md text-sm"
                  value={formData.ToaDo_KetThuc_Y}
                  onChange={(e) => setFormData({
                    ...formData,
                    ToaDo_KetThuc_Y: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewPackage;
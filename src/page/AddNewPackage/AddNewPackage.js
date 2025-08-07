
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { FaCheckCircle, FaPlus, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { kml } from '@mapbox/togeojson';
// DOMParser is built-in in browser environment
import vietnamGeoJson from '../../assets/data/vietnam.json'


import './AddNewPackage.css'
import AddNewAttribute from '../../component/AddNewAttribute/AddNewAtrribute';

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

  // State cho quản lý nhà thầu phân cấp
  const [contractorHierarchy, setContractorHierarchy] = useState([]);
  const [showAddSubcontractorModal, setShowAddSubcontractorModal] = useState(false);
  const [selectedMainContractor, setSelectedMainContractor] = useState(null);
  const [expandedContractors, setExpandedContractors] = useState(new Set());
  const [selectedSubContractors, setSelectedSubContractors] = useState(new Set());
  const [contractorSearchTerm, setContractorSearchTerm] = useState('');
  const [subContractorSearchTerm, setSubContractorSearchTerm] = useState('');
  const [availableThuocTinh, setAvailableThuocTinh] = useState([]);

  const [files, setFiles] = useState([]);
  const [kmlFile, setKmlFile] = useState(null);
  const [existingFiles, setExistingFiles] = useState(goiThau?.taiLieu || []);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [nhaThauList, setNhaThauList] = useState([]);
  const [loaiHinhList, setLoaiHinhList] = useState([]);
  const [thuocTinhList, setThuocTinhList] = useState([]);
  const [removedThuocTinh, setRemovedThuocTinh] = useState([]);
  const [selectedLoaiHinh, setSelectedLoaiHinh] = useState(null);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [requiredFieldsError, setRequiredFieldsError] = useState({});
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
  const handleAddAttributeSuccess = (newAttribute) => {
    setThuocTinhList(prev => [...prev, newAttribute]);
  setAvailableThuocTinh(prev => [...prev, newAttribute]);
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

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Kiểm tra các trường cơ bản
    const requiredFields = [
      'TenGoiThau', 'GiaTriHĐ', 'Km_BatDau', 'Km_KetThuc', 
      'ToaDo_BatDau_X', 'ToaDo_BatDau_Y', 'ToaDo_KetThuc_X', 'ToaDo_KetThuc_Y',
      'NgayKhoiCong', 'NgayHoanThanh', 'LoaiHinh_ID'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = ' ';
        isValid = false;
      }
    });

    // Kiểm tra nhà thầu
    if (contractorHierarchy.length === 0) {
      errors['contractors'] = 'Vui lòng chọn ít nhất một nhà thầu chính';
      isValid = false;
    }

    setRequiredFieldsError(errors);
    return isValid;
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

  // Hàm xử lý nhà thầu phân cấp
  const addMainContractor = (nhaThauId) => {
    const nhaThau = nhaThauList.find(nt => nt.NhaThauID == nhaThauId);
    if (!nhaThau) return;

    const newContractor = {
      NhaThauID: nhaThau.NhaThauID,
      TenNhaThau: nhaThau.TenNhaThau,
      VaiTro: 'Nhà thầu chính',
      ParentId: null,
      subContractors: []
    };

    setContractorHierarchy([...contractorHierarchy, newContractor]);
  };

  const addSubContractor = (mainContractorId, subContractorId) => {
    const subContractor = nhaThauList.find(nt => nt.NhaThauID == subContractorId);
    if (!subContractor) return;

    setContractorHierarchy(prev => prev.map(contractor => {
      if (contractor.NhaThauID === mainContractorId) {
        return {
          ...contractor,
          subContractors: [...contractor.subContractors, {
            NhaThauID: subContractor.NhaThauID,
            TenNhaThau: subContractor.TenNhaThau,
            VaiTro: 'Nhà thầu phụ',
            ParentId: mainContractorId
          }]
        };
      }
      return contractor;
    }));
  };

  const toggleSubContractorSelection = (subContractorId) => {
    setSelectedSubContractors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subContractorId)) {
        newSet.delete(subContractorId);
      } else {
        newSet.add(subContractorId);
      }
      return newSet;
    });
  };

  const addSelectedSubContractors = () => {
    if (!selectedMainContractor || selectedSubContractors.size === 0) return;

    selectedSubContractors.forEach(subContractorId => {
      addSubContractor(selectedMainContractor.NhaThauID, subContractorId);
    });

    // Reset và đóng modal
    setSelectedSubContractors(new Set());
    setShowAddSubcontractorModal(false);
    setSelectedMainContractor(null);
    setSubContractorSearchTerm('');
  };

  const removeSubContractor = (mainContractorId, subContractorId) => {
    setContractorHierarchy(prev => prev.map(contractor => {
      if (contractor.NhaThauID === mainContractorId) {
        return {
          ...contractor,
          subContractors: contractor.subContractors.filter(sub => sub.NhaThauID !== subContractorId)
        };
      }
      return contractor;
    }));
  };

  const removeMainContractor = (contractorId) => {
    setContractorHierarchy(prev => prev.filter(contractor => contractor.NhaThauID !== contractorId));
  };

  const toggleContractorExpansion = (contractorId) => {
    setExpandedContractors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractorId)) {
        newSet.delete(contractorId);
      } else {
        newSet.add(contractorId);
      }
      return newSet;
    });
  };

  const getAvailableSubContractors = (mainContractorId) => {
    const mainContractor = contractorHierarchy.find(c => c.NhaThauID === mainContractorId);
    const usedContractorIds = new Set([
      ...contractorHierarchy.map(c => c.NhaThauID),
      ...(mainContractor?.subContractors.map(s => s.NhaThauID) || [])
    ]);
    
    return nhaThauList.filter(nt => !usedContractorIds.has(nt.NhaThauID));
  };

  const getAvailableMainContractors = () => {
    const usedContractorIds = new Set([
      ...contractorHierarchy.map(c => c.NhaThauID),
      ...contractorHierarchy.flatMap(c => c.subContractors.map(s => s.NhaThauID))
    ]);
    
    return nhaThauList.filter(nt => !usedContractorIds.has(nt.NhaThauID));
  };

  const getFilteredMainContractors = () => {
    const availableContractors = getAvailableMainContractors();
    if (!contractorSearchTerm.trim()) return availableContractors;
    
    return availableContractors.filter(contractor =>
      contractor.TenNhaThau.toLowerCase().includes(contractorSearchTerm.toLowerCase())
    );
  };

  const getFilteredSubContractors = (mainContractorId) => {
    const availableSubContractors = getAvailableSubContractors(mainContractorId);
    if (!subContractorSearchTerm.trim()) return availableSubContractors;
    
    return availableSubContractors.filter(contractor =>
      contractor.TenNhaThau.toLowerCase().includes(subContractorSearchTerm.toLowerCase())
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const kmlFileSelected = selectedFiles.find(f => f.name.toLowerCase().endsWith('.kml'));
    
    if (kmlFileSelected) {
      // Lưu file KML vào state để upload
      setKmlFile(kmlFileSelected);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const kmlContent = event.target.result;
          console.log('KML Content length:', kmlContent.length);
          
          // Sử dụng browser's native DOMParser
          const parser = new DOMParser();
          const kmlDom = parser.parseFromString(kmlContent, 'application/xml');
          console.log('KML DOM:', kmlDom);
          
          // Kiểm tra lỗi parsing
          const parseError = kmlDom.getElementsByTagName('parsererror');
          if (parseError.length > 0) {
            throw new Error('Lỗi parse XML: ' + parseError[0].textContent);
          }
          
          // Thử parse KML với error handling tốt hơn
          let geoJson;
          try {
            geoJson = kml(kmlDom);
            console.log('Parsed GeoJSON:', geoJson); // Debug
          } catch (kmlError) {
            console.error('Lỗi khi parse KML với @mapbox/togeojson:', kmlError);
            console.error('KML DOM structure:', kmlDom);
            throw new Error('Không thể parse file KML. Vui lòng kiểm tra định dạng file.');
          }

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
      reader.readAsText(kmlFileSelected);
    }
    
    // Lưu các file khác (không phải KML)
    const otherFiles = selectedFiles.filter(f => !f.name.toLowerCase().endsWith('.kml'));
    setFiles(otherFiles);
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

    console.log('=== SUBMIT DEBUG ===');
    console.log('contractorHierarchy at submit:', contractorHierarchy);
    console.log('contractorHierarchy length:', contractorHierarchy.length);

    if (!validateForm()) {
      const firstErrorField = Object.keys(requiredFieldsError)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                        document.querySelector(`[data-thuoctinh="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

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
      formDataToSend.append('LoaiHinh_ID', formData.LoaiHinh_ID);
      formDataToSend.append('ThuocTinhValues', JSON.stringify(formData.ThuocTinhValues));

      // Chuẩn bị dữ liệu nhà thầu phân cấp
      const nhaThauData = [];
      contractorHierarchy.forEach(mainContractor => {
        // Thêm nhà thầu chính
        nhaThauData.push({
          NhaThauID: parseInt(mainContractor.NhaThauID),
          VaiTro: 'Nhà thầu chính',
          ParentId: null
        });
        
        // Thêm các nhà thầu phụ
        mainContractor.subContractors.forEach(subContractor => {
          nhaThauData.push({
            NhaThauID: parseInt(subContractor.NhaThauID),
            VaiTro: 'Nhà thầu phụ',
            ParentId: parseInt(mainContractor.NhaThauID) // ParentId là ID của nhà thầu chính
          });
        });
      });

      console.log('=== DEBUG Frontend NhaThauData ===');
      console.log('contractorHierarchy:', contractorHierarchy);
      console.log('contractorHierarchy length:', contractorHierarchy.length);
      
      contractorHierarchy.forEach((contractor, index) => {
        console.log(`Main contractor ${index + 1}:`, contractor);
        console.log(`  - Subcontractors count:`, contractor.subContractors.length);
        contractor.subContractors.forEach((sub, subIndex) => {
          console.log(`  - Subcontractor ${subIndex + 1}:`, sub);
        });
      });
      
      console.log('nhaThauData to send:', nhaThauData);
      console.log('nhaThauData length:', nhaThauData.length);
      console.log('NhaThauData JSON string:', JSON.stringify(nhaThauData));

      formDataToSend.append('NhaThauData', JSON.stringify(nhaThauData));
      
      // Fallback cho compatibility với API cũ
      if (contractorHierarchy.length > 0) {
        formDataToSend.append('NhaThauID', contractorHierarchy[0].NhaThauID);
      }

      // Thêm danh sách tài liệu cần xóa (nếu có)
      if (isEdit && filesToRemove.length > 0) {
        formDataToSend.append('TaiLieuXoa', JSON.stringify(filesToRemove));
      }

      // Thêm tất cả files (bao gồm cả KML và files khác)
      if (kmlFile) {
        formDataToSend.append('files', kmlFile);
      }
      
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
        setContractorHierarchy([]);
        setExpandedContractors(new Set());
        onSuccess(response.data.data);
        onClose();
      } else {
          // Xử lý khi server trả về lỗi
          throw new Error(response.data.message || 'Có lỗi xảy ra khi xử lý dữ liệu');
        }
    } catch (error) {
      console.error(`Lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} gói thầu:`, error);
      alert(`Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} gói thầu`);
    }
  };

  return (
    <div className="container bg-white rounded-lg  mx-auto p-4 max-w-screen-2xl">
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
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    requiredFieldsError.TenGoiThau ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.TenGoiThau}
                  onChange={handleInputChange}
                />
                {requiredFieldsError.TenGoiThau && (
                  <p className="mt-1 text-xs text-red-600">{requiredFieldsError.TenGoiThau}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị hợp đồng (VND)</label>
                <input
                  type="number"
                  name="GiaTriHĐ"
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    requiredFieldsError.GiaTriHĐ ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.GiaTriHĐ}
                  onChange={handleInputChange}
                />
                {requiredFieldsError.GiaTriHĐ && (
                  <p className="mt-1 text-xs text-red-600">{requiredFieldsError.GiaTriHĐ}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Km bắt đầu</label>
                  <input
                    type="text"
                    step="0.01"
                    name="Km_BatDau"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      requiredFieldsError.Km_BatDau ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      requiredFieldsError.Km_KetThuc ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      requiredFieldsError.NgayKhoiCong ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.NgayKhoiCong}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hoàn thành</label>
                  <input
                    type="date"
                    name="NgayHoanThanh"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      requiredFieldsError.NgayHoanThanh ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.NgayHoanThanh}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Thông tin khác */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">Thông tin khác</h2>

              {/* Quản lý nhà thầu phân cấp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhà thầu</label>
                
                {/* Giao diện tìm kiếm và chọn nhà thầu chính */}
                <div className="mb-3 relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhà thầu chính..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10"
                      value={contractorSearchTerm}
                      onChange={(e) => setContractorSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Dropdown kết quả tìm kiếm */}
                  {contractorSearchTerm && getFilteredMainContractors().length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredMainContractors().map(nhaThau => (
                        <div
                          key={nhaThau.NhaThauID}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            addMainContractor(nhaThau.NhaThauID);
                            setContractorSearchTerm('');
                          }}
                        >
                          {nhaThau.TenNhaThau}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Thông báo không tìm thấy */}
                  {contractorSearchTerm && getFilteredMainContractors().length === 0 && (
                    <div className="absolute z-50 w-full mt-1 text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      Không tìm thấy nhà thầu phù hợp
                    </div>
                  )}
                </div>

                {/* Danh sách nhà thầu đã chọn */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contractorHierarchy.map(contractor => (
                    <div key={contractor.NhaThauID} className="border border-gray-200 rounded-md">
                      {/* Nhà thầu chính */}
                      <div className="flex items-center justify-between p-3 bg-blue-50">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleContractorExpansion(contractor.NhaThauID)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedContractors.has(contractor.NhaThauID) ? '▼' : '▶'}
                          </button>
                          <span className="font-medium text-sm">{contractor.TenNhaThau}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Nhà thầu chính
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMainContractor(contractor);
                              setSelectedSubContractors(new Set()); // Reset selection
                              setShowAddSubcontractorModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                            title="Thêm nhà thầu phụ"
                          >
                            <FaPlus />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMainContractor(contractor.NhaThauID)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Xóa nhà thầu chính"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>

                      {/* Nhà thầu phụ */}
                      {expandedContractors.has(contractor.NhaThauID) && contractor.subContractors.length > 0 && (
                        <div className="p-2 bg-gray-50">
                          {contractor.subContractors.map(subContractor => (
                            <div key={subContractor.NhaThauID} className="flex items-center justify-between py-2 px-3 bg-white rounded border mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm ml-4">└ {subContractor.TenNhaThau}</span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  Nhà thầu phụ
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSubContractor(contractor.NhaThauID, subContractor.NhaThauID)}
                                className="text-red-600 hover:text-red-800 text-sm"
                                title="Xóa nhà thầu phụ"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {contractorHierarchy.length === 0 && (
                  <div className={`text-center py-4 text-gray-500 text-sm border border-dashed rounded-md ${
                    requiredFieldsError.contractors ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}>
                    Chưa có nhà thầu nào được chọn
                  </div>
                )}
                
                {requiredFieldsError.contractors && (
                  <p className="mt-1 text-xs text-red-600">{requiredFieldsError.contractors}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="TrangThai"
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    requiredFieldsError.TrangThai ? 'border-red-500' : 'border-gray-300'
                  }`}
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tài liệu đính kèm (có thể chọn nhiều file)
              </label>
              <input
                type="file"
                multiple
                accept=".kml,.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Hỗ trợ: KML, PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, ZIP (tối đa 5 files, 100MB mỗi file)
              </p>
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
          {/* Loại hình và thuộc tính */}
          <div className="space-y-3 mt-4">
            <h2 className="text-lg font-semibold border-b pb-2">Loại hình và thuộc tính</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
              <select
                name="LoaiHinh_ID"
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  requiredFieldsError.LoaiHinh_ID ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.LoaiHinh_ID}
                onChange={handleLoaiHinhChange}
              >
                <option value="">Chọn loại hình</option>
                {loaiHinhList.map(loaiHinh => (
                  <option key={loaiHinh.LoaiHinh_ID} value={loaiHinh.LoaiHinh_ID}>{loaiHinh.TenLoaiHinh}</option>
                ))}
              </select>
            </div>

            {/* Thuộc tính tùy chỉnh */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FaCheckCircle className="mr-2 text-green-500" />
                    Thuộc tính dự án
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddAttribute(true);
                    }}
                    className="flex items-center px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    <FaPlus className="mr-1 text-xs" />
                    Thêm thuộc tính
                  </button>
                </div>

                <div className="p-3 max-h-48 overflow-y-auto">
                  {thuocTinhList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {thuocTinhList.map(thuocTinh => (
                        <div
                          key={thuocTinh.ThuocTinh_ID}
                          className="p-2 border border-gray-200 rounded hover:border-blue-300 transition-colors"
                          data-thuoctinh={`thuocTinh_${thuocTinh.ThuocTinh_ID}`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-gray-700 truncate">
                                  {thuocTinh.TenThuocTinh}
                                  {thuocTinh.BatBuoc === 1 && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                                  onClick={() => removeThuocTinh(thuocTinh)}
                                >
                                  <FaTimes className="h-3 w-3" />
                                </button>
                              </div>
                              {renderInputByType(thuocTinh)}
                              {thuocTinh.DonVi && (
                                <div className="text-xs text-gray-500 truncate">Đơn vị: {thuocTinh.DonVi}</div>
                              )}
                            </div>
                          </div>
                          {requiredFieldsError[`thuocTinh_${thuocTinh.ThuocTinh_ID}`] && (
                            <p className="mt-1 text-xs text-red-600">
                              {requiredFieldsError[`thuocTinh_${thuocTinh.ThuocTinh_ID}`]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      {selectedLoaiHinh ? 'Chưa có thuộc tính nào' : 'Vui lòng chọn loại hình dự án'}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Thuộc tính có sẵn
                  </h3>
                </div>

                <div className="p-3 max-h-48 overflow-y-auto">
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
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Không có thuộc tính nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddAttribute && selectedLoaiHinh && (
                <AddNewAttribute
                    loaiHinhId={selectedLoaiHinh.LoaiHinh_ID}
                    onClose={() => setShowAddAttribute(false)}
                    onAddSuccess={handleAddAttributeSuccess}
                />
            )}

      {/* Modal thêm nhà thầu phụ */}
      {showAddSubcontractorModal && selectedMainContractor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Thêm nhà thầu phụ cho {selectedMainContractor.TenNhaThau}
              </h3>
              <button
                onClick={() => {
                  setShowAddSubcontractorModal(false);
                  setSelectedMainContractor(null);
                  setSubContractorSearchTerm('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Ô tìm kiếm nhà thầu phụ */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhà thầu phụ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10"
                  value={subContractorSearchTerm}
                  onChange={(e) => setSubContractorSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getFilteredSubContractors(selectedMainContractor.NhaThauID).length > 0 ? (
                getFilteredSubContractors(selectedMainContractor.NhaThauID).map(nhaThau => (
                  <div
                    key={nhaThau.NhaThauID}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedSubContractors.has(nhaThau.NhaThauID)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSubContractorSelection(nhaThau.NhaThauID)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubContractors.has(nhaThau.NhaThauID)}
                      onChange={() => toggleSubContractorSelection(nhaThau.NhaThauID)}
                      className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm flex-1">{nhaThau.TenNhaThau}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {subContractorSearchTerm ? 'Không tìm thấy nhà thầu phù hợp' : 'Không có nhà thầu nào khả dụng'}
                </div>
              )}
            </div>
            
            {getFilteredSubContractors(selectedMainContractor.NhaThauID).length > 0 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  Đã chọn: {selectedSubContractors.size} nhà thầu
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSubContractors(new Set());
                      setShowAddSubcontractorModal(false);
                      setSelectedMainContractor(null);
                      setSubContractorSearchTerm('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={addSelectedSubContractors}
                    disabled={selectedSubContractors.size === 0}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedSubContractors.size > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Thêm ({selectedSubContractors.size})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewPackage;

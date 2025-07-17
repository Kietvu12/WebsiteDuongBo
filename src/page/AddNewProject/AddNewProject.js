
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { XMarkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AddNewAttribute from '../../component/AddNewAttribute/AddNewAtrribute';
import { FaChevronUp, FaChevronDown, FaPlus, FaTimes, FaRoad, FaCalendarAlt, FaInfoCircle, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const DocThongMinh = ({ onClose, setFormData, loaiHinhList = [],
    setSelectedLoaiHinh = () => { },
    setSelectedProvinces = () => { } } = {}, setThuocTinhList = () => {}, thuocTinhList = []) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);
    const [userInput, setUserInput] = useState(null);
    const [preview, setPreview] = useState({ url: null, icon: null });
    const [dragActive, setDragActive] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState(null);

    const [projectInfo, setProjectInfo] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const handleTextChange = (e) => {
        // Lấy giá trị từ event và loại bỏ khoảng trắng thừa và xuống dòng
        const rawValue = e.target.value;
        const normalizedValue = rawValue
            .replace(/\s+/g, ' ') // Thay thế nhiều khoảng trắng bằng 1 khoảng trắng
            .replace(/\n/g, ' ') // Thay thế xuống dòng bằng khoảng trắng
            .trim(); // Loại bỏ khoảng trắng ở đầu và cuối

        setTextInput(normalizedValue);
        setError(null);
        setJsonOutput(null);
    };

    const normalizeText = (text) => {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n/g, ' ')
            .trim();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';

        // Xử lý định dạng dd/mm/yyyy
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return dateStr;
    };
    const convertLengthToFloat = (lengthStr) => {
        if (!lengthStr) return null;
        
        // Loại bỏ các ký tự không phải số, dấu phẩy/thập phân
        const numericStr = lengthStr
            .replace(/[^\d,.]/g, '')  // Giữ lại chỉ số, dấu phẩy và dấu chấm
            .replace(',', '.');        // Chuyển dấu phẩy thành dấu chấm để parseFloat
        
        // Chuyển sang số
        const floatValue = parseFloat(numericStr);
        
        // Kiểm tra nếu kết quả là số hợp lệ
        return isNaN(floatValue) ? null : floatValue;
    };

    const handleParseText = async () => {
        setIsLoading(true);
        try {
            const normalizedText = normalizeText(textInput);
            const response = await fetch('http://210.245.52.119/api_ai_dadb_v2/analyze_du_an', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textInput
                })
            });

            const data = await response.json();
            console.log('Full API Response:', data);

            if (!response.ok || !data.project_info) {
                throw new Error(data.project_info?.message || 'Không thể phân tích dữ liệu');
            }

            // Lấy danh sách loại hình từ API
            const loaiHinhResponse = await fetch(`${API_BASE_URL}/loaihinh`);
            const loaiHinhData = await loaiHinhResponse.json();

            if (!loaiHinhResponse.ok || !loaiHinhData.success) {
                throw new Error('Không thể lấy danh sách loại hình');
            }

            // Tìm loại hình phù hợp
            const matchedLoaiHinh = loaiHinhData.data.find(
                lh => lh.TenLoaiHinh.toLowerCase() === data.project_info.loai_hinh.toLowerCase()
            );

            if (!matchedLoaiHinh) {
                throw new Error(`Không tìm thấy loại hình "${data.project_info.loai_hinh}" trong hệ thống`);
            }

            // Lấy danh sách thuộc tính hiện có của loại hình
            const thuocTinhResponse = await fetch(`${API_BASE_URL}/loaihinh/${matchedLoaiHinh.LoaiHinh_ID}/thuoctinh`);
            const thuocTinhData = await thuocTinhResponse.json();

            if (!thuocTinhResponse.ok || !thuocTinhData.success) {
                throw new Error('Không thể lấy danh sách thuộc tính loại hình');
            }

            // Chuẩn bị danh sách thuộc tính cần thêm
            const thuocTinhToAdd = [];
            const existingThuocTinh = thuocTinhData.data.thuocTinh || [];

            if (data.project_info.thuoc_tinh) {
                for (const tt of data.project_info.thuoc_tinh) {
                    const isExist = existingThuocTinh.some(
                        ett => ett.TenThuocTinh.toLowerCase() === tt.TenThuocTinh.toLowerCase()
                    );

                    if (!isExist) {
                        thuocTinhToAdd.push({
                            LoaiHinh_ID: matchedLoaiHinh.LoaiHinh_ID,
                            TenThuocTinh: tt.TenThuocTinh,
                            DonVi: tt.DonVi || null,
                            GiaTri: tt.GiaTri
                        });
                    }
                }
            }

            const normalizedData = {
                ...data.project_info,
                TenDuAn: data.project_info.ten_du_an,
                LoaiHinh: data.project_info.loai_hinh,
                LoaiHinh_ID: matchedLoaiHinh.LoaiHinh_ID,
                TinhThanh: data.project_info.tinh_thanh,
                TrangThai: 'Đang chuẩn bị',
                NguonVon: data.project_info.nguon_von,
                ChuDauTu: data.project_info.chu_dau_tu,
                NgayKhoiCong: formatDate(data.project_info.ngay_khoi_cong),
                KeHoachHoanThanh: formatDate(data.project_info.ke_hoach_hoan_thanh),
                TongChieuDai: convertLengthToFloat(data.project_info.tong_chieu_dai),
                MoTaChung: data.project_info.mo_ta_chung,
                thuocTinhToAdd, // Danh sách thuộc tính cần thêm
                existingThuocTinh // Danh sách thuộc tính hiện có
            };

            setProjectInfo(normalizedData);
            setError(null);

        } catch (err) {
            console.error('API Error:', err);
            setError(`Lỗi: ${err.message}`);
            setProjectInfo(null);
        } finally {
            setIsLoading(false);
        }
    };
    const handleApplyToForm = async () => {
        if (!projectInfo) return;
    
        try {
            setIsLoading(true);
    
            // 1. Tạo mapping giữa tên thuộc tính và giá trị từ API
            const thuocTinhValueMap = {};
            projectInfo.thuoc_tinh.forEach(tt => {
                thuocTinhValueMap[tt.TenThuocTinh] = tt.GiaTri;
            });
    
            // 2. Xử lý thêm thuộc tính mới nếu có
            let newThuocTinhValues = {};
            if (projectInfo.thuocTinhToAdd && projectInfo.thuocTinhToAdd.length > 0) {
                const addedAttributes = [];
                
                for (const tt of projectInfo.thuocTinhToAdd) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/loaihinh/them-thuoctinh`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                LoaiHinh_ID: tt.LoaiHinh_ID,
                                TenThuocTinh: tt.TenThuocTinh,
                                DonVi: tt.DonVi,
                                KieuDuLieu: 'varchar',
                                BatBuoc: 0
                            })
                        });
    
                        const result = await response.json();
                        if (response.ok) {
                            addedAttributes.push({
                                ...tt,
                                ThuocTinh_ID: result.data?.ThuocTinh_ID
                            });
                            // Thêm giá trị của thuộc tính mới vào mapping
                            if (thuocTinhValueMap[tt.TenThuocTinh]) {
                                newThuocTinhValues[result.data?.ThuocTinh_ID] = thuocTinhValueMap[tt.TenThuocTinh];
                            }
                        }
                    } catch (error) {
                        console.error(`Lỗi khi thêm thuộc tính ${tt.TenThuocTinh}:`, error);
                    }
                }
            }
    
            // 3. Xử lý thuộc tính đã tồn tại
            projectInfo.existingThuocTinh.forEach(tt => {
                if (thuocTinhValueMap[tt.TenThuocTinh]) {
                    newThuocTinhValues[tt.ThuocTinh_ID] = thuocTinhValueMap[tt.TenThuocTinh];
                }
            });
    
            // 4. Cập nhật formData với tất cả thông tin
            setFormData(prev => ({
                ...prev,
                TenDuAn: projectInfo.TenDuAn,
                TinhThanh: projectInfo.TinhThanh,
                ChuDauTu: projectInfo.ChuDauTu,
                NgayKhoiCong: projectInfo.NgayKhoiCong,
                KeHoachHoanThanh: projectInfo.KeHoachHoanThanh,
                TongChieuDai: projectInfo.TongChieuDai,
                MoTaChung: projectInfo.MoTaChung,
                LoaiHinh_ID: projectInfo.LoaiHinh_ID,
                ThuocTinhValues: {
                    ...prev.ThuocTinhValues,
                    ...newThuocTinhValues
                }
            }));
    
            // 5. Cập nhật UI
            const loaiHinh = loaiHinhList.find(lh => lh.LoaiHinh_ID === projectInfo.LoaiHinh_ID);
            if (loaiHinh) {
                setSelectedLoaiHinh(loaiHinh);
                
                // Load lại thuộc tính của loại hình này
                const response = await fetch(`${API_BASE_URL}/loaihinh/${loaiHinh.LoaiHinh_ID}/thuoctinh`);
                const data = await response.json();
                if (response.ok && data.success) {
                    setThuocTinhList(data.data.thuocTinh || []);
                }
            }
    
            if (projectInfo.TinhThanh) {
                const provinces = projectInfo.TinhThanh.split(/,\s*|\s-\s/);
                setSelectedProvinces(provinces);
            }
    
            onClose();
        } catch (err) {
            console.error('Error applying to form:', err);
            setError(`Lỗi khi áp dụng dữ liệu: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (preview.url) {
                URL.revokeObjectURL(preview.url);
            }
        };
    }, [preview.url]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-base">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Nhập thông tin dự án từ văn bản</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-base font-medium text-gray-700 mb-2">
                            Nhập văn bản mô tả dự án:
                        </label>
                        <textarea
                            value={textInput}
                            onChange={handleTextChange}
                            onPaste={(e) => {
                                e.preventDefault();
                                const pastedText = e.clipboardData.getData('text/plain');
                                const normalizedText = pastedText
                                    .replace(/\s+/g, ' ')
                                    .replace(/\n/g, ' ')
                                    .trim();
                                setTextInput(normalizedText);
                            }}
                            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập thông tin dự án..."
                        />
                    </div>

                    <div className="flex justify-center space-x-3">
                        <button
                            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleParseText}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang phân tích...
                                </span>
                            ) : 'Phân tích văn bản'}
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none transition-colors"
                            onClick={() => {
                                setTextInput('');
                                setJsonOutput(null);
                                setError(null);
                            }}
                        >
                            Xóa
                        </button>
                    </div>

                    {projectInfo && (
                        <div className="p-4 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Kết quả phân tích</h3>
                                <button
                                    className="px-3 py-1 bg-green-600 text-white rounded text-base hover:bg-green-700"
                                    onClick={handleApplyToForm}
                                >
                                    Áp dụng vào form
                                </button>
                            </div>
                            <pre className="text-base whitespace-pre-wrap max-h-60 overflow-auto bg-white p-3 rounded border border-gray-200">
                                {JSON.stringify(projectInfo, null, 2)}
                            </pre>
                        </div>
                    )}

                    {error && !jsonOutput && (
                        <div className="p-3 bg-red-50 text-red-600 rounded text-base">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AddNewProject = () => {
    const navigate = useNavigate();
    const [showAddAttribute, setShowAddAttribute] = useState(false);
    const [tinhThanhList, setTinhThanhList] = useState([]);
    const [loaiHinhList, setLoaiHinhList] = useState([]);
    const [thuocTinhList, setThuocTinhList] = useState([]);
    const [removedThuocTinh, setRemovedThuocTinh] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLoaiHinh, setSelectedLoaiHinh] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [availableThuocTinh, setAvailableThuocTinh] = useState([]);
    const [expandedInputs, setExpandedInputs] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState(null);
    const [showDocThongMinh, setShowDocThongMinh] = useState(false);
    const [nhaThauList, setNhaThauList] = useState([]);
    const [fetchingContractors, setFetchingContractors] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const dropdownRef = useRef();
    const [selectedProvinces, setSelectedProvinces] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const mergedProvinces = [
        "Thành phố Hà Nội",
        "Thành phố Huế",
        "Tỉnh Quảng Ninh",
        "Tỉnh Cao Bằng",
        "Tỉnh Lạng Sơn",
        "Tỉnh Lai Châu",
        "Tỉnh Điện Biên",
        "Tỉnh Sơn La",
        "Tỉnh Thanh Hóa",
        "Tỉnh Nghệ An",
        "Tỉnh Hà Tĩnh",
        "Tỉnh Tuyên Quang",
        "Tỉnh Lào Cai",
        "Tỉnh Thái Nguyên",
        "Tỉnh Phú Thọ",
        "Tỉnh Bắc Ninh",
        "Tỉnh Hưng Yên",
        "Thành phố Hải Phòng",
        "Tỉnh Ninh Bình",
        "Tỉnh Quảng Trị",
        "Thành phố Đà Nẵng",
        "Tỉnh Quảng Ngãi",
        "Tỉnh Gia Lai",
        "Tỉnh Khánh Hòa",
        "Tỉnh Lâm Đồng",
        "Tỉnh Đắk Lắk",
        "Thành phố Hồ Chí Minh",
        "Tỉnh Đồng Nai",
        "Tỉnh Tây Ninh",
        "Thành phố Cần Thơ",
        "Tỉnh Vĩnh Long",
        "Tỉnh Đồng Tháp",
        "Tỉnh Cà Mau",
        "Tỉnh An Giang"
    ];
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [requiredFieldsError, setRequiredFieldsError] = useState({});

    const [formData, setFormData] = useState({
        TenDuAn: '',
        TinhThanh: '',
        ChuDauTu: '',
        NgayKhoiCong: '',
        TrangThai: 'Đang chuẩn bị',
        NguonVon: 'Ngân sách',
        TongChieuDai: '',
        KeHoachHoanThanh: '',
        MoTaChung: '',
        LoaiHinh_ID: '',
        ThuocTinhValues: {}
    });
    const [files, setFiles] = useState([]);
    useEffect(() => {
        fetchLoaiHinh();
    }, []);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const fetchLoaiHinh = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/loaihinh`);
            const data = await response.json();
            if (data.success) {
                setLoaiHinhList(data.data);
            }
        } catch (error) {
            alert('Lỗi khi tải danh sách loại hình');
        }
    };

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

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Kiểm tra các trường cơ bản
        const requiredFields = [
            'TenDuAn',
            'TinhThanh',
            'ChuDauTu',
            'NgayKhoiCong',
            'TrangThai',
            'NguonVon',
            'TongChieuDai',
            'KeHoachHoanThanh',
            'LoaiHinh_ID'
        ];

        requiredFields.forEach(field => {
        if (!formData[field]) {
            errors[field] = ' ';
            isValid = false;
        }
        });

        setRequiredFieldsError(errors);
        return isValid;
    };

    const handleLoaiHinhChange = async (e) => {
        const value = e.target.value;
        const loaiHinh = loaiHinhList.find(lh => lh.LoaiHinh_ID == value);
        setSelectedLoaiHinh(loaiHinh);
        setFormData({ ...formData, LoaiHinh_ID: value });
        setRemovedThuocTinh([]);

        try {
            const response = await fetch(`${API_BASE_URL}/loaihinh/${value}/thuoctinh`);
            const data = await response.json();
            if (data.success) {
                setThuocTinhList(data.data.thuocTinh);
            }
        } catch (error) {
            alert('Lỗi khi tải thuộc tính loại hình');
        }
    };
    
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then(data => {
                setTinhThanhList(data);
            })
            .catch(err => console.error("Lỗi khi lấy tỉnh thành: ", err));
    }, []);
    const removeThuocTinh = (thuocTinh) => {
        setThuocTinhList(prev => prev.filter(tt => tt.ThuocTinh_ID !== thuocTinh.ThuocTinh_ID));
        setRemovedThuocTinh(prev => [...prev, thuocTinh]);
        const newThuocTinhValues = { ...formData.ThuocTinhValues };
        delete newThuocTinhValues[thuocTinh.ThuocTinh_ID];
        setFormData({ ...formData, ThuocTinhValues: newThuocTinhValues });
    };
    const restoreThuocTinh = (thuocTinh) => {
        setRemovedThuocTinh(prev => prev.filter(tt => tt.ThuocTinh_ID !== thuocTinh.ThuocTinh_ID));
        setThuocTinhList(prev => [...prev, thuocTinh]);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleProvinceToggle = (province) => {
        setSelectedProvinces(prev => {
            const updated = prev.includes(province)
                ? prev.filter(p => p !== province)
                : [...prev, province];

            // Cập nhật formData
            setFormData(prevData => ({
                ...prevData,
                TinhThanh: updated.join(" - ")
            }));

            return updated;
        });
    };
    useEffect(() => {
        if (formData.LoaiHinh_ID) {
            // Load danh sách thuộc tính khi loại hình thay đổi
            fetch(`${API_BASE_URL}/loaihinh/${formData.LoaiHinh_ID}/thuoctinh`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setThuocTinhList(data.data.thuocTinh || []);
                    }
                });
        }
    }, [formData.LoaiHinh_ID]);

    const handleThuocTinhChange = (thuocTinhId, value) => {
        setFormData({
            ...formData,
            ThuocTinhValues: {
                ...formData.ThuocTinhValues,
                [thuocTinhId]: value
            }
        });
    };

    const handleDateChange = (name, date) => {
        setFormData({ ...formData, [name]: date });
    };
    const handleAddAttributeSuccess = (newAttribute) => {
          setThuocTinhList(prev => [...prev, newAttribute]);
        setAvailableThuocTinh(prev => [...prev, newAttribute]);
    };
    const onFinish = async (e) => {
        e.preventDefault();

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

        setLoading(true);
    
        // Validate TenDuAn and LoaiHinh_ID
        if (!formData.TenDuAn || !formData.LoaiHinh_ID) {
            alert('Vui lòng điền tên dự án và chọn loại hình');
            setLoading(false);
            return;
        }
    
        const formattedValues = {
            ...formData,
            NgayKhoiCong: formData.NgayKhoiCong ? moment(formData.NgayKhoiCong).format('YYYY-MM-DD') : null,
            KeHoachHoanThanh: formData.KeHoachHoanThanh ? moment(formData.KeHoachHoanThanh).format('YYYY-MM-DD') : null,
        };
    
        try {
            const formDataToSend = new FormData();
            Object.entries(formattedValues).forEach(([key, value]) => {
                if (key === 'ThuocTinhValues') {
                    formDataToSend.append(key, JSON.stringify(value));
                } else {
                    formDataToSend.append(key, value);
                }
            });
    
            // Thêm các file vào FormData
            files.forEach(file => {
                formDataToSend.append('files', file);
            });
    
            const response = await fetch(`${API_BASE_URL}/duan/tao-moi`, {
                method: 'POST',
                body: formDataToSend,
            });
    
            const data = await response.json();
            if (data.success) {
                setCreatedProjectId(data.data.DuAnID);
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 2000);
                // Reset form
                setFormData({
                    TenDuAn: '',
                    TinhThanh: '',
                    ChuDauTu: '',
                    NgayKhoiCong: '',
                    TrangThai: 'dang_chuan_bi',
                    NguonVon: 'ngan_sach',
                    TongChieuDai: '',
                    KeHoachHoanThanh: '',
                    MoTaChung: '',
                    LoaiHinh_ID: '', 
                    ThuocTinhValues: {}
                });
                setFiles([]);
            } else {
                alert(data.message || 'Lỗi khi tạo dự án');
            }
        } catch (error) {
            alert('Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };
    const renderInputByType = (thuocTinh) => {
        const value = formData.ThuocTinhValues?.[thuocTinh.ThuocTinh_ID] 
        || (thuocTinh.GiaTriMacDinh ? thuocTinh.GiaTriMacDinh : '');

        const baseClass = "w-full px-2 py-1 text-base border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500";
        const textareaClass = `${baseClass} resize-y min-h-[32px] max-h-[200px] overflow-auto`;

        switch (thuocTinh.KieuDuLieu) {
            case 'date':
                return (
                    <div className="relative">
                        <input
                            type="date"
                            className={`${baseClass} pl-8 h-8`}
                            value={value}
                            onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
                        />
                        <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                    </div>
                );

            case 'boolean':
                return (
                    <select
                        className={`${baseClass} h-8`}
                        value={value}
                        onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
                    >
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                    </select>
                );

            case 'number':
                return (
                    <textarea
                        className={textareaClass}
                        value={value}
                        onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
                        rows={1}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                );

            case 'string':
            default:
                return (
                    <textarea
                        className={textareaClass}
                        value={value}
                        onChange={(e) => handleThuocTinhChange(thuocTinh.ThuocTinh_ID, e.target.value)}
                        rows={1}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder="Nhập nội dung..."
                    />
                );
        }
    };

    return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container justify-center item-center mx-auto p-2 max-w-screen-2xl text-base">
            {/* Header gọn */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaRoad className="mr-1 text-blue-500" />
                    Thêm dự án mới
                </h1>
                <button
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-base hover:shadow transition-all"
                    onClick={() => setShowDocThongMinh(true)}
                >
                    <span>Đọc thông minh</span>
                    <span className="bg-white text-purple-600 font-bold px-1 py-0.5 rounded text-base animate-pulse">
                        AI
                    </span>
                </button>

                {showDocThongMinh && (
                    <DocThongMinh
                        onClose={() => setShowDocThongMinh(false)}
                        formData={formData}
                        setFormData={setFormData}
                        loaiHinhList={loaiHinhList}
                        setSelectedLoaiHinh={setSelectedLoaiHinh}
                        setSelectedProvinces={setSelectedProvinces}
                        setThuocTinhList={setThuocTinhList}
                        thuocTinhList={thuocTinhList}
                    />
                )}
            </div>
            <form onSubmit={onFinish} className="grid mt-6 md:mt-0 grid-cols-1 gap-2">
                <div className="bg-white rounded p-2 border border-gray-200" style={{ boxShadow: '0 2px 4px rgba(240, 240, 240, 0.5)' }}>
                    <div className="flex items-center space-x-2">
                        <label className="text-base font-medium text-gray-700 flex items-center">
                            <FaRoad className="mr-1 text-gray-500 text-base" />
                            Loại dự án:
                        </label>
                        <select
                            className={`flex-1 px-2 py-1 border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                ${requiredFieldsError.LoaiHinh_ID ? 'border-red-500' : 'border-gray-300'}`}
                            onChange={handleLoaiHinhChange}
                            value={formData.LoaiHinh_ID}
                        >
                            <option value="">Chọn loại hình dự án</option>
                            {loaiHinhList.map(loaiHinh => (
                                <option key={loaiHinh.LoaiHinh_ID} value={loaiHinh.LoaiHinh_ID}>
                                    {loaiHinh.TenLoaiHinh}
                                </option>
                            ))}
                        </select>
                        {selectedLoaiHinh && (
                            <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded-full text-base whitespace-nowrap flex items-center">
                                <FaCheckCircle className="mr-0.5 text-base" />
                                {selectedLoaiHinh.TenLoaiHinh}
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded p-3 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3" style={{ boxShadow: '0 2px 4px rgba(240, 240, 240, 0.5)' }}>
                    <div className="col-span-2">
                        <h2 className="text-base font-semibold text-gray-700 pb-1 border-b border-gray-200 flex items-center">
                            <FaInfoCircle className="mr-1.5 text-lg text-gray-500" />
                            Thông tin điển hình
                        </h2>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Tên dự án <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="text"
                                name="TenDuAn"
                                className={`w-full px-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                    ${requiredFieldsError.TenDuAn ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.TenDuAn}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Tổng chiều dài <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="text"
                                name="TongChieuDai"
                                className={`w-full px-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                    ${requiredFieldsError.TongChieuDai ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.TongChieuDai}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <FaCalendarAlt className="mr-1.5 text-gray-500 text-base" />
                                Ngày khởi công
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className={`w-full px-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                        ${requiredFieldsError.NgayKhoiCong? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.NgayKhoiCong}
                                    onChange={(e) => handleDateChange('NgayKhoiCong', e.target.value)}
                                />
                                <FaCalendarAlt className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Chủ đầu tư
                            </label>
                            <select
                                name="ChuDauTu"
                                className={`w-full px-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                    ${requiredFieldsError.ChuDauTu ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.ChuDauTu}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Chọn nhà thầu --</option>
                                {nhaThauList && nhaThauList.map(nhaThau => (
                                    <option key={nhaThau.NhaThauID} value={nhaThau.NhaThauID}>
                                        {nhaThau.TenNhaThau || `Nhà thầu ${nhaThau.NhaThauID}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-col relative" ref={dropdownRef}>
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <FaMapMarkerAlt className="mr-1.5 text-gray-500 text-base" />
                                Tỉnh thành
                            </label>
                            <div
                                className={`w-full px-1.5 py-[3px] border  rounded text-base bg-white cursor-pointer
                                    ${requiredFieldsError.TinhThanh? 'border-red-500' : 'border-gray-300'}`}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {selectedProvinces.length > 0
                                    ? selectedProvinces.join(" - ")
                                    : <span className="text-gray-400">-- Chọn tỉnh thành --</span>}
                            </div>
                            {showDropdown && (
                                <div
                                    className="absolute left-0 top-full mt-1 w-full bg-white border  rounded shadow-lg max-h-52 overflow-auto text-base transition-all duration-200 ease-out animate-slide-down z-50"
                                >
                                    {mergedProvinces.map((tinh, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleProvinceToggle(tinh)}
                                            className="px-2 py-1 hover:bg-blue-50 cursor-pointer flex items-center transition-all"
                                        >
                                            <input
                                                type="checkbox"
                                                className="mr-2 accent-blue-500"
                                                checked={selectedProvinces.includes(tinh)}
                                                readOnly
                                            />
                                            {tinh}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <FaMoneyBillWave className="mr-1.5 text-gray-500 text-base" />
                                Nguồn vốn
                            </label>
                            <select
                                name="NguonVon"
                                className={`w-full px-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                    ${requiredFieldsError.NguonVon ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.NguonVon}
                                onChange={handleInputChange}
                            >
                                <option value="Ngân sách">Ngân sách</option>
                                <option value="Tự nguyện">Tự nguyện</option>
                                <option value="Hợp tác">Hợp tác</option>
                                <option value="Nước ngoài">Nước ngoài</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <FaCalendarAlt className="mr-1.5 text-gray-500 text-base" />
                                Kế hoạch hoàn thành
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className={`w-full pl-7 pr-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                        ${requiredFieldsError.KeHoachHoanThanh ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.KeHoachHoanThanh}
                                    onChange={(e) => handleDateChange('KeHoachHoanThanh', e.target.value)}
                                />
                                <FaCalendarAlt className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-base text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Trạng thái
                            </label>
                            <select
                                name="TrangThai"
                                className={`w-full px-1.5 py-[3px] border  rounded text-base focus:ring-blue-500 focus:border-blue-500
                                    ${requiredFieldsError.TrangThai ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.TrangThai}
                                onChange={handleInputChange}
                            >
                                <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                                <option value="Đang thi công">Đang thi công</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Tạm dừng">Tạm dừng</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="text-base text-gray-700 flex items-center mb-px">
                            <span className="w-2 mr-1">•</span>
                            Mô tả chung
                        </label>
                        <textarea
                            name="MoTaChung"
                            rows={2}
                            className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-base focus:ring-blue-500 focus:border-blue-500"
                            value={formData.MoTaChung}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="bg-white rounded p-2 border border-gray-200 lg:col-span-9 bg-white rounded-lg border border-gray-200 shadow-sm" style={{ boxShadow: '0 2px 4px rgba(240, 240, 240, 0.5)' }}>
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-base font-semibold text-gray-700 flex items-center">
                                <FaCheckCircle className="mr-1 text-green-500 text-base" />
                                Thuộc tính dự án
                            </h2>
                            <button
                                 onClick={(e) => {
                                    e.preventDefault();
                                     
                                    setShowAddAttribute(true)}}
                                className="flex items-center px-2 py-0.5 bg-green-500 text-white rounded text-base hover:bg-green-600 transition-colors"
                            >
                                <FaPlus className="mr-0.5 text-base" />
                                Thêm thuộc tính
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                            {thuocTinhList.length > 0 ? (
                                thuocTinhList.map(thuocTinh => (
                                    <div
                                        key={thuocTinh.ThuocTinh_ID}
                                        className="p-1 border border-gray-200 rounded hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-start space-x-1">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xm font-bold text-gray-700 truncate">
                                                        {thuocTinh.TenThuocTinh}
                                                        {thuocTinh.BatBuoc === 1 && <span className="text-red-500 ml-0.5">*</span>}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="text-gray-400 hover:text-red-500 transition-colors text-base"
                                                        onClick={() => removeThuocTinh(thuocTinh)}
                                                    >
                                                        <FaTimes className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                                {renderInputByType(thuocTinh)}
                                                {thuocTinh.DonVi && (
                                                    <div className="text-base text-gray-500 truncate">Đơn vị: {thuocTinh.DonVi}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-3 text-gray-400 text-base">
                                    {selectedLoaiHinh ? 'Chưa có thuộc tính nào' : 'Vui lòng chọn loại hình dự án'}
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm lg:col-span-3" style={{ boxShadow: '0 2px 4px rgba(240, 240, 240, 0.5)' }}>
                        <div className="p-3 border-b border-gray-200">
                            <h2 className="text-base font-semibold text-gray-700 flex items-center">
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
                                            <span className="text-base text-gray-700 truncate">{thuocTinh.TenThuocTinh}</span>
                                            <FaPlus className="h-3 w-3 text-green-500" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-base">
                                    Không có thuộc tính nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                    <button
                        type="button"
                        className="px-2 py-1 border border-gray-300 rounded text-white bg-red-500 hover:bg-red-700 transition-colors flex items-center text-base"
                        onClick={() => navigate('/home')}
                    >
                        <FaTimes className="mr-1 text-base" />
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        className={`px-2 py-1 rounded text-white flex items-center space-x-1 text-base ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                        disabled={loading}
                    >
                        {loading ? <FaSpinner className="animate-spin text-base" /> : <FaCheckCircle className="text-base" />}
                        <span>Tạo dự án</span>
                    </button>
                </div>
            </form>
            {showAddAttribute && selectedLoaiHinh && (
                <AddNewAttribute
                    loaiHinhId={selectedLoaiHinh.LoaiHinh_ID}
                    onClose={() => setShowAddAttribute(false)}
                    onAddSuccess={handleAddAttributeSuccess}
                />
            )}
            {/* Overlay loading */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-4 rounded shadow flex items-center space-x-3">
                        <FaSpinner className="animate-spin text-blue-500" />
                        <span className="text-base text-gray-700">Đang tạo dự án, vui lòng chờ...</span>
                    </div>
                </div>
            )}

            {/* Modal thành công */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white px-6 py-6 rounded shadow-lg text-center w-80">
                        <div className="text-green-600 text-3xl mb-2">
                            <FaCheckCircle />
                        </div>
                        <h2 className="text-lg font-semibold mb-1">Tạo dự án thành công!</h2>
                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-base hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                           
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
    );
};

export default AddNewProject;

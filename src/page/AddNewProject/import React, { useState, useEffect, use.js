import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { XMarkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AddNewAttribute from '../../component/AddNewAttribute/AddNewAtrribute';
import { FaChevronUp, FaChevronDown, FaPlus, FaTimes, FaRoad, FaCalendarAlt, FaInfoCircle, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
  faFileImage
} from '@fortawesome/free-solid-svg-icons';

const DocThongMinh = ({ onClose } = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);
    const [userInput, setUserInput] = useState(null);
    const [preview, setPreview] = useState({ url: null, icon: null });
    const [dragActive, setDragActive] = useState(false);

    const allowedFileTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return faFileImage;
        if (fileType.includes('pdf')) return faFilePdf;
        if (fileType.includes('word')) return faFileWord;
        if (fileType.includes('excel')) return faFileExcel;
        return faFileAlt;
    };

    const getFileTypeName = (fileType) => {
        const typeMap = {
            'image/jpeg': 'JPEG Image',
            'image/png': 'PNG Image',
            'application/pdf': 'PDF Document',
            'application/msword': 'Word Document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
            'application/vnd.ms-excel': 'Excel Spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
            'text/plain': 'Text File'
        };
        return typeMap[fileType] || 'File';
    };

    const handleFileUpload = (file) => {
        // Kiểm tra loại file
        if (!allowedFileTypes.includes(file.type)) {
            setError(`Loại file không được hỗ trợ. Các loại được hỗ trợ: ${allowedFileTypes.map(t => getFileTypeName(t)).join(', ')}`);
            return false;
        }

        // Giới hạn kích thước file (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('Kích thước file quá lớn (tối đa 5MB)');
            return false;
        }

        setUserInput(file);
        setApiResponse(null);
        setError(null);

        // Xử lý preview
        if (file.type.startsWith('image/')) {
            setPreview({ url: URL.createObjectURL(file), icon: null });
        } else {
            setPreview({
                url: null,
                icon: (
                    <div className="flex flex-col items-center p-4">
                        <FontAwesomeIcon 
                            icon={getFileIcon(file.type)} 
                            className="text-4xl text-gray-400 mb-2" 
                        />
                        <span className="text-xs text-gray-500">
                            {getFileTypeName(file.type)}
                        </span>
                    </div>
                )
            });
        }

        return true;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleCancel = () => {
        if (preview.url) URL.revokeObjectURL(preview.url);
        setUserInput(null);
        setPreview({ url: null, icon: null });
        setApiResponse(null);
        setError(null);
    };

    const handleReadFile = async () => {
        if (!userInput) return;

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', userInput);
            const response = await fetch('https://786d-42-119-222-118.ngrok-free.app/analyze-project/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            setApiResponse({ status: "success", data });
        } catch (err) {
            console.error("Upload error:", err);
            setError("Lỗi khi tải file lên server");
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Đọc thông tin từ file</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                {userInput ? (
                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col items-center mb-4">
                                {preview.url ? (
                                    <img
                                        src={preview.url}
                                        alt="Preview"
                                        className="max-h-60 max-w-full object-contain"
                                    />
                                ) : (
                                    preview.icon
                                )}
                                <div className="mt-2 text-sm text-gray-600 text-center">
                                    <p>{userInput.name}</p>
                                    <p>{(userInput.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-3">
                                <button
                                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleReadFile}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </span>
                                    ) : 'Đọc thông tin'}
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none transition-colors"
                                    onClick={handleCancel}
                                >
                                    Chọn file khác
                                </button>
                            </div>
                        </div>

                        {apiResponse && (
                            <div className={`p-4 rounded-lg ${apiResponse.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-gray-50'}`}>
                                <h3 className="font-medium mb-2">
                                    {apiResponse.status === 'success' ? 'Kết quả nhận dạng' : 'Lỗi'}
                                </h3>
                                <pre className="text-sm whitespace-pre-wrap max-h-60 overflow-auto bg-white p-3 rounded border border-gray-200">
                                    {JSON.stringify(apiResponse, null, 2)}
                                </pre>
                            </div>
                        )}

                        {error && !apiResponse && (
                            <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <label className="cursor-pointer block">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <svg className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p className={`font-medium ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {dragActive ? 'Thả file vào đây' : 'Tải file lên'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Kéo thả file vào đây hoặc click để chọn
                                </p>
                                <p className="text-xs text-gray-400">
                                    Hỗ trợ: JPEG, PNG, PDF, Word, Excel, TXT (tối đa 5MB)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleChange}
                                accept=".jpeg,.jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                            />
                        </label>
                    </div>
                )}
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

    const toggleExpand = (id) => {
        setExpandedInputs(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
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

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };


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

        // Xóa giá trị thuộc tính khỏi formData
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
        setAvailableThuocTinh(prev => [...prev, newAttribute]);
    };
    const onFinish = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Kiểm tra dữ liệu bắt buộc trước khi gửi
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

            // Thêm từng trường dữ liệu vào FormData
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
                // KHÔNG đặt header Content-Type để browser tự thiết lập
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
    const handleAddSubProject = () => {
        setShowSuccessModal(false);
        navigate('/duan/thanh-phan'); // nếu dùng react-router-dom
    }

    const renderInputByType = (thuocTinh) => {
        const value = formData.ThuocTinhValues[thuocTinh.ThuocTinh_ID] || '';

        const baseClass = "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500";
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
                        <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
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
        <div className="container justify-center item-center mx-auto p-2 max-w-screen-2xl">
            {/* Header gọn */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaRoad className="mr-1 text-blue-500 text-sm" />
                    Thêm dự án mới
                </h1>
                <button
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs hover:shadow transition-all"
                    onClick={() => setShowDocThongMinh(true)}
                >
                    <span>Đọc thông minh</span>
                    <span className="bg-white text-purple-600 font-bold px-1 py-0.5 rounded text-xxs animate-pulse">
                        AI
                    </span>
                </button>

                {showDocThongMinh && <DocThongMinh onClose={() => setShowDocThongMinh(false)} />}
            </div>

            {/* Form chính - sử dụng grid để tối ưu không gian */}
            <form onSubmit={onFinish} className="grid mt-6 md:mt-0 grid-cols-1 gap-2">
                {/* Chọn loại dự án */}
                <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium text-gray-700 flex items-center">
                            <FaRoad className="mr-1 text-gray-500 text-xs" />
                            Loại dự án:
                        </label>
                        <select
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
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
                            <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded-full text-xxs whitespace-nowrap flex items-center">
                                <FaCheckCircle className="mr-0.5 text-xs" />
                                {selectedLoaiHinh.TenLoaiHinh}
                            </span>
                        )}
                    </div>
                </div>

                {/* Thông tin cơ bản - sử dụng grid 2 cột */}
                <div className="bg-white rounded p-3 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <h2 className="text-xs font-semibold text-gray-700 pb-1 border-b border-gray-200 flex items-center">
                            <FaInfoCircle className="mr-1.5 text-lg text-gray-500" />
                            Thông tin điển hình
                        </h2>
                    </div>

                    {/* Left Column */}
                    <div className="space-y-2">
                        {/* Tên dự án */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Tên dự án <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="text"
                                name="TenDuAn"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={formData.TenDuAn}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Tổng chiều dài */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Tổng chiều dài <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="text"
                                name="TongChieuDai"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={formData.TongChieuDai}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Ngày khởi công */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <FaCalendarAlt className="mr-1.5 text-gray-500 text-xs" />
                                Ngày khởi công
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full pl-7 pr-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.NgayKhoiCong}
                                    onChange={(e) => handleDateChange('NgayKhoiCong', e.target.value)}
                                />
                                <FaCalendarAlt className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                            </div>
                        </div>

                        {/* Chủ đầu tư */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Chủ đầu tư
                            </label>
                            <select
                                name="ChuDauTu"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
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

                    {/* Right Column */}
                    <div className="space-y-2">
                        {/* Tỉnh thành */}
                        <div className="flex flex-col relative" ref={dropdownRef}>
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <FaMapMarkerAlt className="mr-1.5 text-gray-500 text-xs" />
                                Tỉnh thành
                            </label>

                            {/* Ô hiển thị */}
                            <div
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs bg-white cursor-pointer"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {selectedProvinces.length > 0
                                    ? selectedProvinces.join(" - ")
                                    : <span className="text-gray-400">-- Chọn tỉnh thành --</span>}
                            </div>
                            {showDropdown && (
                                <div
                                    className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-52 overflow-auto text-xs transition-all duration-200 ease-out animate-slide-down z-50"
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

                        {/* Nguồn vốn */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <FaMoneyBillWave className="mr-1.5 text-gray-500 text-xs" />
                                Nguồn vốn
                            </label>
                            <select
                                name="NguonVon"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={formData.NguonVon}
                                onChange={handleInputChange}
                            >
                                <option value="Ngân sách">Ngân sách</option>
                                <option value="Tự nguyện">Tự nguyện</option>
                                <option value="Hợp tác">Hợp tác</option>
                                <option value="Nước ngoài">Nước ngoài</option>
                            </select>
                        </div>

                        {/* Kế hoạch hoàn thành */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <FaCalendarAlt className="mr-1.5 text-gray-500 text-xs" />
                                Kế hoạch hoàn thành
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full pl-7 pr-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.KeHoachHoanThanh}
                                    onChange={(e) => handleDateChange('KeHoachHoanThanh', e.target.value)}
                                />
                                <FaCalendarAlt className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <span className="w-2 mr-1">•</span>
                                Trạng thái
                            </label>
                            <select
                                name="TrangThai"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
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

                    {/* Mô tả chung */}
                    <div className="col-span-2">
                        <label className="text-xs text-gray-700 flex items-center mb-px">
                            <span className="w-2 mr-1">•</span>
                            Mô tả chung
                        </label>
                        <textarea
                            name="MoTaChung"
                            rows={2}
                            className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                            value={formData.MoTaChung}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>


                {/* Thuộc tính tùy chọn - sử dụng grid 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="bg-white rounded p-2 border border-gray-200 lg:col-span-9 bg-white rounded-lg border border-gray-200 shadow-sm">
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
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm lg:col-span-3">
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
                    {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tài liệu đính kèm (có thể chọn nhiều file)
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip"
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
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
                    )} */}
                </div>
                {/* Nút submit */}
                <div className="flex justify-end space-x-2 mt-2">
                    <button
                        type="button"
                        className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-xs"
                        onClick={() => navigate('/home')}
                    >
                        <FaTimes className="mr-1 text-xs" />
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        className={`px-2 py-1 rounded text-white flex items-center space-x-1 text-xs ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                        disabled={loading}
                    >
                        {loading ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                        <span>Tạo dự án</span>
                    </button>
                </div>
            </form>

            {/* Popup thêm thuộc tính */}
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
                        <span className="text-sm text-gray-700">Đang tạo dự án, vui lòng chờ...</span>
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
                        <p className="text-sm text-gray-600 mb-4">Bạn muốn tiếp tục thêm dự án thành phần?</p>
                        <div className="flex justify-center space-x-2">
                
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AddNewProject;
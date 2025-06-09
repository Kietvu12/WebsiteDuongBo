import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { XMarkIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import AddNewAttribute from '../../component/AddNewAttribute/AddNewAtrribute';
import { FaChevronUp, FaChevronDown, FaPlus, FaTimes, FaRoad, FaCalendarAlt, FaInfoCircle, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';



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
        TrangThai: 'dang_chuan_bi',
        NguonVon: 'ngan_sach',
        TongChieuDai: '',
        KeHoachHoanThanh: '',
        MoTaChung: '',
        LoaiHinh_ID: '',
        ThuocTinhValues: {}
    });

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

        const formattedValues = {
            ...formData,
            NgayKhoiCong: formData.NgayKhoiCong ? moment(formData.NgayKhoiCong).format('YYYY-MM-DD') : null,
            KeHoachHoanThanh: formData.KeHoachHoanThanh ? moment(formData.KeHoachHoanThanh).format('YYYY-MM-DD') : null,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/duan/tao-moi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedValues),
            });

            const data = await response.json();
            if (data.success) {
                setCreatedProjectId(data.data.DuAnID);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 2000);
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
        <div className="container mx-auto p-2 max-w-screen-2xl">
            {/* Header gọn */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaRoad className="mr-1 text-blue-500 text-sm" />
                    Thêm dự án mới
                </h1>
                <button
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs hover:shadow transition-all"
                >
                    <span>Đọc thông minh</span>
                    <span className="bg-white text-purple-600 font-bold px-1 py-0.5 rounded text-xxs animate-pulse">
                        AI
                    </span>
                </button>
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
                            <input
                                type="text"
                                name="ChuDauTu"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={formData.ChuDauTu}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                        {/* Tỉnh thành */}
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-700 flex items-center mb-px">
                                <FaMapMarkerAlt className="mr-1.5 text-gray-500 text-xs" />
                                Tỉnh thành
                            </label>
                            <select
                                name="TinhThanh"
                                className="w-full px-1.5 py-[3px] border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                value={formData.TinhThanh}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Chọn tỉnh thành --</option>
                                {tinhThanhList.map((tinh, index) => (
                                    <option key={index} value={tinh.name}>
                                        {tinh.name}
                                    </option>
                                ))}
                            </select>
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
                                <option value="ngan_sach">Ngân sách</option>
                                <option value="tu_nguyen">Tự nguyện</option>
                                <option value="hop_tac">Hợp tác</option>
                                <option value="nuoc_ngoai">Nước ngoài</option>
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
                                <option value="dang_chuan_bi">Đang chuẩn bị</option>
                                <option value="dang_thi_cong">Đang thi công</option>
                                <option value="hoan_thanh">Hoàn thành</option>
                                <option value="tam_dung">Tạm dừng</option>
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


                {/* Nút submit */}
                <div className="flex justify-end space-x-2 mt-2">
                    <button
                        type="button"
                        className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-xs"
                        onClick={() => navigate('/duan')}
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
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    // Chuyển hướng đến trang thêm dự án thành phần
                                    navigate(`/add-new/${createdProjectId}`);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                Thêm dự án thành phần
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AddNewProject;
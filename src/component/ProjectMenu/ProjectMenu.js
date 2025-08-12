import React, { useState, useEffect, useMemo, useRef } from 'react';

import {
  FaListOl,
  FaProjectDiagram,
  FaBoxOpen,
  FaTasks,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaSearch,
  FaChartLine,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import './ProjectMenu.css';

const ProjectMenu = ({ projectId, onItemSelect, onPlanSelect }) => {
  const restoredRef = useRef(false);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({
    project: true,
    packages: {},
    workItems: {},
    plans: {}
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [apiResult, setApiResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [editableData, setEditableData] = useState([]);
  const [processingInput, setProcessingInput] = useState(false);
  const [selectedGoiThauId, setSelectedGoiThauId] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/hangMuc/${projectId}/detail`);
        setProjectData(response.data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, API_BASE_URL]);

  const combinedPackages = useMemo(() => {
    return [].concat(
      projectData?.duAnThanhPhan?.danhSachGoiThau || [],
      projectData?.duAnTong?.danhSachGoiThauTrucTiep || [],
      projectData?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    );
  }, [projectData]);

  // Lọc dữ liệu dựa trên searchTerm
  const filteredPackages = useMemo(() => {
    if (!searchTerm.trim()) {
      return combinedPackages;
    }

    const searchLower = searchTerm.toLowerCase();
    
    return combinedPackages.map(pkg => {
      // Lọc hạng mục trong gói thầu
      const filteredWorkItems = pkg.danhSachHangMuc?.map(workItem => {
        // Lọc kế hoạch trong hạng mục
        const filteredPlans = workItem.danhSachKeHoach?.filter(plan => {
          const planIdMatch = plan.keHoachId?.toString().includes(searchTerm);
          const planNameMatch = plan.tenCongTac?.toLowerCase().includes(searchLower);
          return planIdMatch || planNameMatch;
        });

        // Kiểm tra xem hạng mục có kế hoạch phù hợp không
        const hasMatchingPlans = filteredPlans && filteredPlans.length > 0;
        const workItemIdMatch = workItem.hangMucId?.toString().includes(searchTerm);
        const workItemNameMatch = workItem.tenHangMuc?.toLowerCase().includes(searchLower);

        // Trả về hạng mục nếu có kế hoạch phù hợp hoặc tên/id hạng mục phù hợp
        if (hasMatchingPlans || workItemIdMatch || workItemNameMatch) {
          return {
            ...workItem,
            danhSachKeHoach: hasMatchingPlans ? filteredPlans : workItem.danhSachKeHoach
          };
        }
        return null;
      }).filter(Boolean);

      // Trả về gói thầu nếu có hạng mục phù hợp
      if (filteredWorkItems.length > 0) {
        return {
          ...pkg,
          danhSachHangMuc: filteredWorkItems
        };
      }
      return null;
    }).filter(Boolean);
  }, [combinedPackages, searchTerm]);

  // Tự động mở rộng các mục khi tìm kiếm
  useEffect(() => {
    if (searchTerm.trim()) {
      const newExpandedItems = {
        project: true,
        packages: {},
        workItems: {},
        plans: {}
      };

      filteredPackages.forEach(pkg => {
        newExpandedItems.packages[pkg.goiThauId] = true;
        pkg.danhSachHangMuc?.forEach(workItem => {
          newExpandedItems.workItems[workItem.hangMucId] = true;
        });
      });

      setExpandedItems(newExpandedItems);
    } else {
      // Khi xóa tìm kiếm, trả về trạng thái mở rộng ban đầu
      if (combinedPackages.length === 0) return;

      const newPackages = {};
      const newWorkItems = {};

      combinedPackages.forEach((pkg) => {
        newPackages[pkg.goiThauId] = true;
        pkg.danhSachHangMuc?.forEach((workItem) => {
          newWorkItems[workItem.hangMucId] = true;
        });
      });

      setExpandedItems(prev => ({
        ...prev,
        packages: newPackages,
        workItems: newWorkItems
      }));
    }
  }, [searchTerm, filteredPackages, combinedPackages]);

  useEffect(() => {
    if (combinedPackages.length === 0 || Object.keys(expandedItems.packages).length > 0) return;

    const newPackages = {};
    const newWorkItems = {};

    combinedPackages.forEach((pkg) => {
      newPackages[pkg.goiThauId] = true;
      pkg.danhSachHangMuc?.forEach((workItem) => {
        newWorkItems[workItem.hangMucId] = true;
      });
    });

    setExpandedItems(prev => ({
      ...prev,
      packages: newPackages,
      workItems: newWorkItems
    }));
  }, [combinedPackages, expandedItems.packages]);

  useEffect(() => {
    if (!projectData || restoredRef.current) return;
  
    const last = localStorage.getItem('lastSelectedPlan');
    if (!last) return;
  
    const lastPlan = JSON.parse(last);
    const foundPlan = combinedPackages
      .flatMap(pkg =>
        (pkg.danhSachHangMuc || []).flatMap(workItem =>
          (workItem.danhSachKeHoach || []).map(plan => ({
            ...plan,
            parent: {
              packageId: pkg.goiThauId,
              workItemId: workItem.hangMucId,
              workItemName: workItem.tenHangMuc,
              projectName: projectData.tenDuAn || projectData.duAnTong?.tenDuAn
            }
          }))
        )
      )
      .find(plan => plan.keHoachId === lastPlan.keHoachId);
  
    if (foundPlan) {
      restoredRef.current = true;
  
      setExpandedItems(prev => ({
        ...prev,
        project: true,
        packages: {
          ...prev.packages,
          [foundPlan.parent.packageId]: true
        },
        workItems: {
          ...prev.workItems,
          [foundPlan.parent.workItemId]: true
        }
      }));
  
      setSelectedItem({ ...foundPlan, type: 'plan' });
      if (onItemSelect) {
        onItemSelect(
          { ...foundPlan, type: 'plan' },
          {
            tenDuAn: foundPlan.parent.projectName,
            tenHangMuc: foundPlan.parent.workItemName
          }
        );
      }
    }
  }, [projectData, combinedPackages, onItemSelect]);

  const toggleExpand = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  const handlePlanSelect = (plan) => {
    const selected = { ...plan, type: 'plan' };
    setSelectedItem(selected);
    localStorage.setItem('lastSelectedPlan', JSON.stringify(selected));

    if (onItemSelect) {
      onItemSelect(selected);
    }
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  const handleItemSelect = (item, type) => {
    setSelectedItem({ ...item, type });
    if (onItemSelect) {
      onItemSelect({ ...item, type });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Sửa hàm handleReportClick để nhận thêm goiThauId
  const handleReportClick = (type, title, goiThauId = null) => {
    setReportType(type);
    setReportTitle(title);
    setShowReportForm(true);
    setReportData('');
    setReportDate(new Date().toISOString().split('T')[0]); // Set today's date as default
    setSelectedGoiThauId(goiThauId);
  };

  // Xử lý input từ người dùng qua API AI
  const handleProcessInput = async () => {
    const cleanedData = cleanInputText(reportData);
    
    if (!cleanedData.trim()) {
      setApiError('Vui lòng nhập dữ liệu báo cáo!');
      return;
    }

    setProcessingInput(true);
    setApiError(null);
    setApiResult(null);
    
    try {
      console.log('Sending request with data:', { text: cleanedData });
      
      const response = await fetch('http://210.245.52.119/api_ai_dadb_v2/add_tien_do', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanedData
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText || 'Lỗi mạng hoặc API không phản hồi!'}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.project_info && Array.isArray(data.project_info)) {
        // Thêm các trường cần thiết cho việc chỉnh sửa
        const processedData = data.project_info.map((item, index) => ({
          ...item,
          id: index,
          selected: true,
          // Không set ngày từ reportDate, để trống để hiển thị --/--/----
          ngay_bat_dau: '', // Luôn để trống ban đầu
          ngay_ket_thuc: '', // Luôn để trống ban đầu
          tien_do: item.khoi_luong_ke_hoach > 0 ? 
            ((item.khoi_luong_hoan_thanh / item.khoi_luong_ke_hoach) * 100).toFixed(2) : 0
        }));

        setEditableData(processedData);
        setApiResult({
          success: true,
          ocr_text: data.ocr_text,
          project_info: processedData
        });
      } else {
        console.error('Invalid data format:', data);
        throw new Error('Dữ liệu trả về không đúng định dạng!');
      }
    } catch (err) {
      console.error('API Call Error:', err);
      setApiError(err.message || 'Đã xảy ra lỗi không xác định!');
    } finally {
      setProcessingInput(false);
    }
  };

  // Cập nhật dữ liệu có thể chỉnh sửa
  const updateEditableData = (index, field, value) => {
    const newData = [...editableData];
    newData[index][field] = value;
    
    // Tính toán lại tiến độ nếu thay đổi khối lượng
    if (field === 'khoi_luong_hoan_thanh' || field === 'khoi_luong_ke_hoach') {
      const khoiLuongHoanThanh = parseFloat(newData[index].khoi_luong_hoan_thanh) || 0;
      const khoiLuongKeHoach = parseFloat(newData[index].khoi_luong_ke_hoach) || 0;
      newData[index].tien_do = khoiLuongKeHoach > 0 ? 
        ((khoiLuongHoanThanh / khoiLuongKeHoach) * 100).toFixed(2) : 0;
    }
    
    setEditableData(newData);
    
    // Cập nhật apiResult để hiển thị
    setApiResult(prev => ({
      ...prev,
      project_info: newData
    }));
  };

  // Gửi dữ liệu đã chỉnh sửa
  const handleReportSubmit = async () => {
    const selectedData = editableData.filter(item => item.selected);
    
    if (selectedData.length === 0) {
      setApiError('Vui lòng chọn ít nhất một mục để gửi!');
      return;
    }

    setApiLoading(true);
    setApiError(null);
    
    try {
      const submitData = {
        goiThauId: selectedGoiThauId, // Lấy từ state thay vì fix cứng
        ngayCapNhat: reportDate,
        duLieuTienDo: selectedData.map(item => ({
          ten_hang_muc: item.ten_hang_muc,
          ten_ke_hoach: item.ten_ke_hoach,
          khoi_luong_hoan_thanh: parseFloat(item.khoi_luong_hoan_thanh) || 0,
          khoi_luong_ke_hoach: parseFloat(item.khoi_luong_ke_hoach) || 0,
          don_vi: item.don_vi,
          // Chỉ gửi ngày nếu có giá trị hợp lệ (không rỗng và không phải --/--/----)
          ...(item.ngay_bat_dau && item.ngay_bat_dau.trim() !== '' && item.ngay_bat_dau !== '--/--/----' && { ngay_bat_dau: item.ngay_bat_dau }),
          ...(item.ngay_ket_thuc && item.ngay_ket_thuc.trim() !== '' && item.ngay_ket_thuc !== '--/--/----' && { ngay_ket_thuc: item.ngay_ket_thuc }),
          vuong_mac: item.vuong_mac,
          mo_ta_vuong_mac: item.mo_ta_vuong_mac
        }))
      };

      const response = await fetch(`${API_BASE_URL}/api/bao-cao-tien-do/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error('Lỗi mạng hoặc API không phản hồi!');
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Gửi dữ liệu thành công!');
        handleReportCancel();
      } else {
        throw new Error(data.message || 'Đã xảy ra lỗi khi gửi báo cáo!');
      }
    } catch (err) {
      setApiError(err.message || 'Đã xảy ra lỗi không xác định!');
    } finally {
      setApiLoading(false);
    }
  };

  const handleReportCancel = () => {
    setShowReportForm(false);
    setReportData('');
    setReportDate('');
    setApiResult(null);
    setApiError(null);
    setApiLoading(false);
    setEditableData([]);
    setProcessingInput(false);
    setSelectedGoiThauId(null);
  };

  // Hàm loại bỏ xuống dòng và khoảng trống không cần thiết
  const cleanInputText = (text) => {
    return text
      .replace(/\n+/g, ' ')           // Thay thế xuống dòng bằng khoảng trống
      .replace(/\r+/g, ' ')           // Thay thế carriage return bằng khoảng trống
      .replace(/\t+/g, ' ')           // Thay thế tab bằng khoảng trống
      .replace(/\s+/g, ' ')           // Thay thế nhiều khoảng trống liên tiếp bằng 1 khoảng trống
      .trim();                        // Loại bỏ khoảng trống đầu và cuối
  };

  // Hàm xử lý khi người dùng nhập vào textarea
  const handleReportDataChange = (e) => {
    const cleanedText = cleanInputText(e.target.value);
    setReportData(cleanedText);
  };

  if (loading) return <div className="loading-message">Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">Lỗi: {error}</div>;
  if (!projectData) return <div className="no-data">Không có dữ liệu dự án</div>;

  return (
    <div className="p-2 sm:p-4 min-w-0 h-full">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-2">
        <button
          className="w-full flex items-center justify-between bg-white border border-gray-300 rounded px-4 py-2 text-blue-700 font-semibold text-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="flex items-center gap-2">
            <FaListOl className="text-blue-600" />
            DANH SÁCH DỰ ÁN & GÓI THẦU
          </div>
          {mobileMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Menu Content */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block h-full overflow-y-auto`}>
        <div className="w-full max-w-full min-w-0">
          <div className="bg-white rounded shadow min-w-0 h-full">
            {/* Header - Hidden on mobile */}
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm kế hoạch theo ID hoặc tên..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-3 text-blue-700 font-semibold text-sm">
              <FaListOl className="text-blue-600" />
              DANH SÁCH DỰ ÁN & GÓI THẦU
            </div>

            {/* Gói thầu */}
            {filteredPackages.length > 0 && (
              <div className="ml-4 border-l border-gray-200 min-w-0">
                <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b">
                  <h3 className="text-xs font-bold text-gray-600">Danh sách gói thầu</h3>
                 
                </div>
                {filteredPackages.map((pkg) => (
                  <div key={pkg.goiThauId}>
                    <div
                      className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b bg-[#E3EDF8] hover:bg-[#73A9DD] min-w-0 ${selectedItem?.type === 'package' && selectedItem?.goiThauId === pkg.goiThauId
                        ? 'border-l-4 border-blue-600'
                        : ''
                        }`}
                      onClick={() => {
                        toggleExpand('packages', pkg.goiThauId);
                        handleItemSelect(pkg, 'package');
                      }}
                    >
                      <div className="flex gap-2 items-center text-sm text-gray-700 min-w-0">
                        <FaBoxOpen className="text-green-600 flex-shrink-0" />
                        <span className="font-semibold">GOI-{pkg.goiThauId}</span>
                      </div>
                      <div className="flex-1 ml-4 min-w-0">
                        <div className="font-semibold text-xs truncate">{pkg.tenGoiThau}</div>
                        <div className="text-xs text-gray-500">{pkg.phanTramHoanThanh}% hoàn thành</div>
                      </div>
                      {/* Nút báo cáo thông minh riêng cho từng gói thầu */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleReportClick('packages', `Báo cáo thông minh cho gói thầu GOI-${pkg.goiThauId}`, pkg.goiThauId);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ml-2"
                        title={`Báo cáo thông minh cho gói thầu GOI-${pkg.goiThauId}`}
                      >
                        <FaChartLine className="text-xs" />
                        Báo cáo
                      </button>
                      {pkg.danhSachHangMuc?.length > 0 && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedItems.packages[pkg.goiThauId] ? <FaChevronDown /> : <FaChevronRight />}
                        </div>
                      )}
                    </div>

                    {/* Hạng mục */}
                    {expandedItems.packages[pkg.goiThauId] && pkg.danhSachHangMuc?.length > 0 && (
                      <div className="ml-4 border-l border-gray-200 min-w-0">
                        <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b">
                          <h3 className="text-xs font-bold text-gray-600">Hạng mục thực hiện</h3>
                        </div>
                        {pkg.danhSachHangMuc.map((workItem) => (
                          <div key={workItem.hangMucId}>
                            <div
                              className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b bg-[#FAF3EC] hover:bg-[#DBA975] min-w-0 ${selectedItem?.type === 'work' && selectedItem?.hangMucId === workItem.hangMucId
                                ? 'bg-blue-50 border-l-4 border-blue-600'
                                : ''
                                }`}
                              onClick={() => {
                                toggleExpand('workItems', workItem.hangMucId);
                                handleItemSelect(workItem, 'work');
                              }}
                            >
                              <div className="flex gap-2 items-center text-sm text-gray-700 min-w-0">
                                <FaTasks className="text-yellow-600 flex-shrink-0" />
                                <span className="font-semibold">HM-{workItem.hangMucId}</span>
                              </div>
                              <div className="flex-1 ml-4 min-w-0">
                                <div className="font-semibold text-xs truncate">{workItem.tenHangMuc}</div>
                                <div className="text-xs text-gray-500">{workItem.phanTramHoanThanh}% hoàn thành</div>
                              </div>
                              {workItem.danhSachKeHoach?.length > 0 && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {expandedItems.workItems[workItem.hangMucId] ? (
                                    <FaChevronDown />
                                  ) : (
                                    <FaChevronRight />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Kế hoạch */}
                            {expandedItems.workItems[workItem.hangMucId] && workItem.danhSachKeHoach?.length > 0 && (
                              <div className="ml-4 border-l border-gray-200 min-w-0">
                                <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b">
                                  <h3 className="text-xs font-bold text-gray-600">Kế hoạch thực hiện</h3>
                                </div>
                                {workItem.danhSachKeHoach.map((plan) => (
                                  <div
                                    key={plan.keHoachId}
                                    className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 min-w-0 ${selectedItem?.type === 'plan' && selectedItem?.keHoachId === plan.keHoachId
                                      ? 'bg-blue-50 border-l-4 border-blue-600'
                                      : ''
                                      }`}
                                    onClick={() => {
                                      const context = {
                                        tenDuAn: projectData.tenDuAn || projectData.duAnTong?.tenDuAn,
                                        tenHangMuc: workItem.tenHangMuc
                                      };
                                      
                                      handlePlanSelect(plan);
                                      onPlanSelect( 
                                        { ...plan, type: 'plan' },
                                        context
                                      );
                                    }}
                                  >
                                    <div className="flex gap-2 items-center text-sm text-gray-700 min-w-0">
                                      <FaCalendarAlt className="text-purple-600 flex-shrink-0" />
                                      <span className="font-semibold">KH-{plan.keHoachId}</span>
                                    </div>
                                    <div className="flex-1 ml-4 min-w-0">
                                      <div className="font-semibold text-xs truncate">{plan.tenCongTac}</div>
                                      <div className="text-xs text-gray-500">
                                        {plan.phanTramHoanThanh}% hoàn thành
                                        <div className="text-xs text-gray-400 truncate">{plan.TenNhaThau}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hiển thị thông báo khi không tìm thấy kết quả */}
            {searchTerm && filteredPackages.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>Không tìm thấy kế hoạch nào phù hợp với "{searchTerm}"</p>
                <button
                  onClick={clearSearch}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form báo cáo thông minh */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">{reportTitle}</h3>
              <button
                onClick={handleReportCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày báo cáo
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Form nhập dữ liệu báo cáo */}
              {!apiResult && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập dữ liệu báo cáo tiến độ
                  </label>
                  <textarea
                    value={reportData}
                    onChange={handleReportDataChange}
                    placeholder="Nhập hoặc dán nội dung báo cáo tiến độ tại đây... (Xuống dòng và khoảng trống thừa sẽ được tự động loại bỏ)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    💡 Hệ thống sẽ tự động loại bỏ xuống dòng và khoảng trống không cần thiết
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleProcessInput}
                      disabled={!reportData.trim() || processingInput}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {processingInput ? 'Đang xử lý...' : 'Phân tích dữ liệu'}
                    </button>
                  </div>
                </div>
              )}

              {/* Loading khi xử lý input */}
              {processingInput && (
                <div className="mb-6 flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3 text-green-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="text-sm font-medium">Đang phân tích dữ liệu...</span>
                  </div>
                </div>
              )}

              {/* Hiển thị bảng dữ liệu sau khi xử lý */}
              {apiResult && (
                <div className="mb-6 space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-green-800">Dữ liệu tiến độ đã phân tích</h3>
                    </div>

                    {/* Hiển thị OCR text */}
                    {apiResult.ocr_text && (
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h4 className="text-sm font-semibold text-gray-700">Nội dung phân tích</h4>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-700 leading-relaxed">{apiResult.ocr_text}</p>
                        </div>
                      </div>
                    )}
                  
                    {/* Bảng dữ liệu có thể chỉnh sửa */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <h4 className="text-sm font-semibold text-gray-700">Chi tiết dữ liệu tiến độ</h4>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {editableData.length} mục
                        </span>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      onChange={(e) => {
                                        const newData = editableData.map(item => ({
                                          ...item,
                                          selected: e.target.checked
                                        }));
                                        setEditableData(newData);
                                        setApiResult(prev => ({
                                          ...prev,
                                          project_info: newData
                                        }));
                                      }}
                                    />
                                    <span>Thao tác</span>
                                  </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">STT</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Hạng mục</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Kế hoạch</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">KL kế hoạch</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">KL thực hiện</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Đơn vị</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Tiến độ (%)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Ngày bắt đầu</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Ngày kết thúc</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {editableData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                  <td className="px-4 py-3 whitespace-nowrap w-20">
                                    <input 
                                      type="checkbox" 
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      checked={item.selected}
                                      onChange={(e) => updateEditableData(index, 'selected', e.target.checked)}
                                    />
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap w-12">
                                    <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                                  </td>
                                  <td className="px-4 py-3 w-32">
                                    <input
                                      type="text"
                                      value={item.ten_hang_muc}
                                      onChange={(e) => updateEditableData(index, 'ten_hang_muc', e.target.value)}
                                      className="text-sm font-medium text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-3 w-40">
                                    <textarea
                                      value={item.ten_ke_hoach}
                                      onChange={(e) => updateEditableData(index, 'ten_ke_hoach', e.target.value)}
                                      className="text-sm text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full resize-none"
                                      rows={2}
                                      style={{ minHeight: '40px', maxHeight: '80px' }}
                                    />
                                  </td>
                                  <td className="px-4 py-3 w-24">
                                    <input
                                      type="number"
                                      value={item.khoi_luong_ke_hoach}
                                      onChange={(e) => updateEditableData(index, 'khoi_luong_ke_hoach', e.target.value)}
                                      className="text-sm font-semibold text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-3 w-24">
                                    <input
                                      type="number"
                                      value={item.khoi_luong_hoan_thanh}
                                      onChange={(e) => updateEditableData(index, 'khoi_luong_hoan_thanh', e.target.value)}
                                      className="text-sm font-semibold text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-3 w-20">
                                    <input
                                      type="text"
                                      value={item.don_vi}
                                      onChange={(e) => updateEditableData(index, 'don_vi', e.target.value)}
                                      className="text-sm font-medium text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                                    />
                                  </td>
                                  <td className="px-4 py-3 w-24">
                                    <div className={`text-sm font-semibold px-2 py-1 rounded-full text-center ${
                                      parseFloat(item.tien_do) >= 100 ? 'bg-green-100 text-green-800' :
                                      parseFloat(item.tien_do) >= 80 ? 'bg-blue-100 text-blue-800' :
                                      parseFloat(item.tien_do) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                      parseFloat(item.tien_do) >= 40 ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {item.tien_do}%
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 w-28">
                                    {item.ngay_bat_dau ? (
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="date"
                                          value={item.ngay_bat_dau}
                                          onChange={(e) => updateEditableData(index, 'ngay_bat_dau', e.target.value)}
                                          className="text-sm text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1"
                                        />
                                        <button
                                          onClick={() => updateEditableData(index, 'ngay_bat_dau', '')}
                                          className="text-red-500 hover:text-red-700 text-xs px-1"
                                          title="Xóa ngày"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ) : (
                                      <div 
                                        className="text-sm text-gray-400 italic cursor-pointer hover:text-gray-600 hover:bg-gray-50 px-2 py-1 rounded"
                                        onClick={() => updateEditableData(index, 'ngay_bat_dau', new Date().toISOString().split('T')[0])}
                                        title="Click để thêm ngày"
                                      >
                                        --/--/----
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 w-28">
                                    {item.ngay_ket_thuc ? (
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="date"
                                          value={item.ngay_ket_thuc}
                                          onChange={(e) => updateEditableData(index, 'ngay_ket_thuc', e.target.value)}
                                          className="text-sm text-gray-900 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1"
                                        />
                                        <button
                                          onClick={() => updateEditableData(index, 'ngay_ket_thuc', '')}
                                          className="text-red-500 hover:text-red-700 text-xs px-1"
                                          title="Xóa ngày"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ) : (
                                      <div 
                                        className="text-sm text-gray-400 italic cursor-pointer hover:text-gray-600 hover:bg-gray-50 px-2 py-1 rounded"
                                        onClick={() => updateEditableData(index, 'ngay_ket_thuc', new Date().toISOString().split('T')[0])}
                                        title="Click để thêm ngày"
                                      >
                                        --/--/----
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kết quả trả về từ API */}
              {apiLoading && (
                <div className="mb-6 flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3 text-blue-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium">Đang gửi dữ liệu tiến độ...</span>
                  </div>
                </div>
              )}
              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                      <p className="text-sm text-red-700 mt-1">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleReportCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={apiLoading}
                >
                  Hủy
                </button>
                {apiResult && (
                  <button
                    onClick={() => {
                      setApiResult(null);
                      setEditableData([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled={apiLoading}
                  >
                    Nhập lại
                  </button>
                )}
                {apiResult && (
                  <button
                    onClick={handleReportSubmit}
                    disabled={apiLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {apiLoading ? 'Đang gửi...' : 'Gửi dữ liệu tiến độ'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMenu;

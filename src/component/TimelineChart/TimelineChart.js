import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GanttTimeline = ({ 
  duAnThanhPhanId, 
  packageId,
  API_BASE_URL = process.env.REACT_APP_API_BASE_URL 
}) => {
  const navigate = useNavigate();
  
  // State quản lý data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // State quản lý UI
  const [expandedItems, setExpandedItems] = useState({});
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/hangMuc/${duAnThanhPhanId}/detail`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
      calculateDateRange(result.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [duAnThanhPhanId, API_BASE_URL]);

  // Tính toán phạm vi ngày
  const calculateDateRange = (data) => {
    let allDates = [];
    
    // Lấy tất cả ngày từ các gói thầu
    const allPackages = [].concat(
      data?.duAnThanhPhan?.danhSachGoiThau || [],
      data?.duAnTong?.danhSachGoiThauTrucTiep || [],
      data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    );

    allPackages.forEach(pkg => {
      if (pkg.ngayKhoiCong) allDates.push(new Date(pkg.ngayKhoiCong));
      if (pkg.ngayHoanThanh) allDates.push(new Date(pkg.ngayHoanThanh));
      
      pkg.danhSachHangMuc?.forEach(item => {
        item.danhSachKeHoach?.forEach(plan => {
          if (plan.ngayBatDau) allDates.push(new Date(plan.ngayBatDau));
          if (plan.ngayKetThuc) allDates.push(new Date(plan.ngayKetThuc));
        });
      });
    });

    if (allDates.length > 0) {
      const startDate = new Date(Math.min(...allDates.map(date => date.getTime())));
      const endDate = new Date(Math.max(...allDates.map(date => date.getTime())));
      setDateRange({ start: startDate, end: endDate });
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm xử lý dropdown
  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Render thanh tiến độ
  const renderProgressBar = (startDate, endDate, progress, color) => {
    if (!dateRange.start || !dateRange.end || !startDate || !endDate) return null;
    
    const totalDays = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24);
    const startOffset = (new Date(startDate) - dateRange.start) / (1000 * 60 * 60 * 24);
    const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    
    const progressWidth = duration * (progress / 100);
    
    return (
      <div 
        className="absolute h-6 flex items-center"
        style={{
          left: `${(startOffset / totalDays) * 100}%`,
          width: `${(duration / totalDays) * 100}%`
        }}
      >
        <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute h-full ${color}`}
            style={{ width: `${progressWidth / duration * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render header timeline (các tháng)
  const renderTimelineHeader = () => {
    if (!dateRange.start || !dateRange.end) return null;
    
    const months = [];
    const current = new Date(dateRange.start);
    current.setDate(1); // Bắt đầu từ ngày đầu tháng
    
    while (current <= dateRange.end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return (
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-64 border-r"></div> {/* Cột trống cho tên công việc */}
        <div className="flex-1 flex">
          {months.map((month, index) => (
            <div 
              key={index} 
              className="flex-1 text-center text-xs py-2 border-r"
            >
              {month.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render các mục công việc
  const renderWorkItems = () => {
    if (!data || !dateRange.start || !dateRange.end) return null;
    
    const allPackages = [].concat(
      data?.duAnThanhPhan?.danhSachGoiThau || [],
      data?.duAnTong?.danhSachGoiThauTrucTiep || [],
      data?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    ).filter(packageItem => !packageId || packageItem.goiThauId === packageId);

    return (
      <div className="divide-y">
        {allPackages.map((packageItem, pkgIndex) => (
          <React.Fragment key={`pkg-${packageItem.goiThauId}`}>
            {/* Package row */}
            <div className="flex group hover:bg-gray-50">
              <div className="w-64 border-r p-2 flex items-center">
                <button
                  onClick={() => toggleItem(`pkg-${packageItem.goiThauId}`)}
                  className="mr-2 text-gray-600"
                >
                  {expandedItems[`pkg-${packageItem.goiThauId}`] ? (
                    <FaChevronDown size={14} />
                  ) : (
                    <FaChevronRight size={14} />
                  )}
                </button>
                <span className="font-medium">GT-{packageItem.goiThauId}: {packageItem.tenGoiThau}</span>
              </div>
              <div className="flex-1 relative h-8">
                {renderProgressBar(
                  packageItem.ngayKhoiCong,
                  packageItem.ngayHoanThanh,
                  packageItem.tienDoThucHien || 0,
                  'bg-blue-500'
                )}
              </div>
            </div>
            
            {/* Category items - chỉ hiển thị khi mở rộng */}
            {expandedItems[`pkg-${packageItem.goiThauId}`] && 
              packageItem.danhSachHangMuc?.map((item, itemIndex) => (
                <React.Fragment key={`item-${item.hangMucId}`}>
                  <div className="flex group hover:bg-gray-50">
                    <div className="w-64 border-r p-2 flex items-center pl-8">
                      <button
                        onClick={() => toggleItem(`item-${item.hangMucId}`)}
                        className="mr-2 text-gray-600"
                      >
                        {expandedItems[`item-${item.hangMucId}`] ? (
                          <FaChevronDown size={14} />
                        ) : (
                          <FaChevronRight size={14} />
                        )}
                      </button>
                      <span>HM-{item.hangMucId}: {item.tenHangMuc}</span>
                    </div>
                    <div className="flex-1 relative h-8">
                      {renderProgressBar(
                        item.ngayBatDau,
                        item.ngayKetThuc,
                        item.tongKhoiLuongKeHoach 
                          ? (item.tongKhoiLuongThucHien / item.tongKhoiLuongKeHoach) * 100 
                          : 0,
                        'bg-green-500'
                      )}
                    </div>
                  </div>
                  
                  {/* Plan items - chỉ hiển thị khi mở rộng */}
                  {expandedItems[`item-${item.hangMucId}`] && 
                    item.danhSachKeHoach?.map((plan, planIndex) => {
                      const progress = plan.khoiLuongKeHoach
                        ? (plan.tongKhoiLuongThucHien / plan.khoiLuongKeHoach) * 100
                        : 0;
                      const progressColor = progress >= 100 ? 'bg-green-500' :
                                          progress >= 70 ? 'bg-yellow-500' : 'bg-red-500';
                      
                      return (
                        <div key={`plan-${plan.keHoachId}`} className="flex group hover:bg-gray-50">
                          <div className="w-64 border-r p-2 flex items-center pl-12">
                            <span>KH-{plan.keHoachId}: {plan.tenCongTac}</span>
                          </div>
                          <div className="flex-1 relative h-8">
                            {renderProgressBar(
                              plan.ngayBatDau,
                              plan.ngayKetThuc,
                              progress,
                              progressColor
                            )}
                          </div>
                        </div>
                      );
                    })}
                </React.Fragment>
              ))}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Zoom controls */}
      <div className="bg-gray-100 p-2 flex justify-end">
        <button 
          onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
          className="px-3 py-1 bg-white border rounded-l"
        >
          -
        </button>
        <button 
          onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
          className="px-3 py-1 bg-white border rounded-r"
        >
          +
        </button>
      </div>
      
      {/* Timeline header */}
      {renderTimelineHeader()}
      
      {/* Timeline content */}
      <div 
        className="overflow-auto"
        style={{ transform: `scaleX(${zoomLevel})`, transformOrigin: 'left' }}
      >
        {renderWorkItems()}
      </div>
    </div>
  );
};

export default GanttTimeline;
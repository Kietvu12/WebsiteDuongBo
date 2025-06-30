import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBars, FaChevronRight, FaCheckCircle, FaExclamationTriangle, FaClock, FaTimes } from 'react-icons/fa'; 
import SubProjectTable from '../SubProjectTable/SubProjectTable';

const ConstructionProgress = ({ tasks = [], projectId, packageId }) => {
  const [showCategory, setShowCategory] = useState(false);
  const navigate = useNavigate();
  console.log("Gói thầu được chọn:", packageId);
  
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('vi-VN', { 
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' 
  });

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    if (typeof dateString === 'string') {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    if (dateString instanceof Date) {
      return `${dateString.getDate().toString().padStart(2, '0')}/${(dateString.getMonth() + 1).toString().padStart(2, '0')}/${dateString.getFullYear()}`;
    }
    return dateString; 
  };

  // Hàm tính ngày còn lại
  const getDaysRemaining = (endDate) => {
    if (!endDate) return Infinity;
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Hàm xác định style trạng thái
  const getStatusStyle = (status, endDate) => {
    if (status === 'Đã hoàn thành') {
      return {
        className: 'bg-green-100 text-green-800',
        icon: <FaCheckCircle className="text-green-500 mr-1" />
      };
    }
    
    const daysRemaining = getDaysRemaining(endDate);
    
    if (daysRemaining < 0) {
      return {
        className: 'bg-red-100 text-red-800',
        icon: <FaExclamationTriangle className="text-red-500 mr-1" />
      };
    }
    
    if (daysRemaining <= 3) { // Cảnh báo khi còn 3 ngày
      return {
        className: 'bg-yellow-100 text-yellow-800',
        icon: <FaClock className="text-yellow-500 mr-1" />,
        text: `Còn ${daysRemaining} ngày`
      };
    }
    
    return {
      className: 'bg-gray-100 text-gray-800',
      icon: null,
      text: 'Đang thực hiện'
    };
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <FaBars className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-800">TIẾN ĐỘ THI CÔNG</h2>
        </div>
        <button 
          onClick={() => setShowCategory(true)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          Xem chi tiết <FaChevronRight className="ml-1" size={10} />
        </button>
      </div>
      
      {/* Ngày hiện tại */}
      <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
        {todayFormatted}
      </div>
      
      {/* Bảng công việc */}
      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const statusStyle = getStatusStyle(task.TrangThai, task.NgayKetThuc);
            const daysRemaining = getDaysRemaining(task.NgayKetThuc);
            
            return (
              <div 
                className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                key={`task-${index}`}
                onClick={() => navigate(`/task-detail/${task.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate mb-1">
                      {task.TenCongTac}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span>Hạn: {formatDate(task.NgayKetThuc)}</span>
                      {daysRemaining !== Infinity && (
                        <span className="text-xs">
                          ({daysRemaining >= 0 ? `Còn ${daysRemaining} ngày` : 'Quá hạn'})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`flex items-center text-xs px-3 py-1 rounded-full ${statusStyle.className}`}>
                    {statusStyle.icon}
                    {statusStyle.text || task.TrangThai}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            Không có công việc nào được ghi nhận
          </div>
        )}
      </div>
      
      {/* Modal chi tiết */}
      {showCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-8xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold">Chi tiết hạng mục</h3>
              <button 
                onClick={() => setShowCategory(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-4">
              <SubProjectTable 
                duAnThanhPhanId={projectId}
                packageId={packageId}
                onClose={() => setShowCategory(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionProgress;
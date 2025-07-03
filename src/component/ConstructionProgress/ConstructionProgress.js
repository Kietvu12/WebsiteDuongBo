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
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 xs:p-1.5 border-b border-gray-100 gap-2 sm:gap-0">
        <div className="flex items-center space-x-2">
          <FaBars className="text-gray-500 text-base sm:text-lg xs:text-sm" />
          <h2 className="text-sm sm:text-base xs:text-xs font-semibold text-gray-800">TIẾN ĐỘ THI CÔNG</h2>
        </div>
        <button
          onClick={() => setShowCategory(true)}
          className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 xs:px-1.5 xs:py-0.5 bg-green-600 hover:bg-green-700 text-white font-medium text-xs sm:text-sm xs:text-xs transition-colors rounded"
        >
          <span>Chi tiết tiến độ</span>
          <FaChevronRight className="hidden sm:block" size={12} />
        </button>
      </div>

      {/* Ngày hiện tại */}
      <div className="px-3 py-1.5 text-xs sm:text-sm xs:text-xs text-gray-500 bg-gray-50">
        {todayFormatted}
      </div>

      {/* Bảng công việc */}
      <div className="divide-y divide-gray-100 max-h-[250px] sm:max-h-[220px] xs:max-h-[180px] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const statusStyle = getStatusStyle(task.TrangThai, task.NgayKetThuc);
            const daysRemaining = getDaysRemaining(task.NgayKetThuc);

            return (
              <div
                className="p-2 sm:p-2 xs:p-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
                key={`task-${index}`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                  <div className="flex-1 min-w-0 max-w-[calc(100%-100px)] sm:max-w-[calc(100%-120px)] xs:max-w-[calc(100%-90px)]">
                    <h3 className="text-xs sm:text-sm xs:text-xs font-medium text-gray-800 break-words mb-1 line-clamp-2">
                      {task.TenCongTac}
                    </h3>
                    <div className="flex flex-wrap items-center text-2xs sm:text-xs xs:text-2xs text-gray-500 gap-x-2">
                      <span>Hạn: {formatDate(task.NgayKetThuc)}</span>
                      {daysRemaining !== Infinity && (
                        <span className={daysRemaining < 0 ? "text-red-500" : ""}>
                          ({daysRemaining >= 0 ? `Còn ${daysRemaining} ngày` : 'Quá hạn'})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`flex items-center text-2xs sm:text-xs xs:text-2xs px-2 py-0.5 sm:px-3 sm:py-1 xs:px-1.5 xs:py-0.5 rounded-full mt-1 sm:mt-0 ${statusStyle.className}`}>
                    {statusStyle.icon}
                    {statusStyle.text || task.TrangThai}
                  </span>     
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-3 sm:p-2 xs:p-1.5 text-center text-xs sm:text-sm xs:text-xs text-gray-500">
            Không có công việc nào được ghi nhận
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {showCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 xs:p-1 bg-black bg-opacity-50">
          <div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl sm:max-w-5xl md:max-w-6xl lg:max-w-7xl max-h-[85vh] sm:max-h-[90vh] xs:max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-2 sm:p-3 xs:p-1.5 flex justify-between items-center z-10">
              <h3 className="text-base sm:text-lg xs:text-sm font-semibold">Chi tiết hạng mục</h3>
              <button
                onClick={() => setShowCategory(false)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 xs:w-4 xs:h-4" />
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-1 sm:p-2 xs:p-1">
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
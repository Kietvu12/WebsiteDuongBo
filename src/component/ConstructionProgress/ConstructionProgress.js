import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBars, FaChevronRight, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';

const ConstructionProgress = ({ tasks = [], projectId }) => {  
  const navigate = useNavigate();
  const today = new Date();
  
  const todayFormatted = today.toLocaleDateString('vi-VN', { 
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' 
  });

  const formatDate = (dateString) => {
    if (typeof dateString === 'string') {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    if (dateString instanceof Date) {
      return `${dateString.getDate().toString().padStart(2, '0')}/${(dateString.getMonth() + 1).toString().padStart(2, '0')}/${dateString.getFullYear()}`;
    }
    return dateString; 
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusStyle = (status, endDate) => {
    if (status === 'Đã hoàn thành') {
      return {
        className: 'bg-green-50 text-green-800',
        icon: <FaCheckCircle className="text-green-500 mr-1" />
      };
    }
    
    const daysRemaining = getDaysRemaining(endDate);
    
    if (daysRemaining < 0) {
      return {
        className: 'bg-red-50 text-red-800',
        icon: <FaExclamationTriangle className="text-red-500 mr-1" />
      };
    }
    
    if (daysRemaining === 1) {
      return {
        className: 'bg-yellow-50 text-yellow-800',
        icon: <FaClock className="text-yellow-500 mr-1" />
      };
    }
    
    return {
      className: 'bg-gray-100 text-gray-800',
      icon: null
    };
  };

  const handleNavigateToWorkItems = () => projectId && navigate(`/work-items/${projectId}`);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center">
          <FaBars className="text-gray-500 mr-2" />
          <h2 className="text-base font-semibold text-gray-800">TIẾN ĐỘ THI CÔNG</h2>
        </div>
        <button onClick={handleNavigateToWorkItems} className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-bold">
          Xem chi tiết kế hoạch các hạng mục <FaChevronRight className="ml-1" size={10} />
        </button>
      </div>
      <div className="px-3 py-1 text-xs text-gray-500">{todayFormatted}</div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {tasks.map((task, index) => {
          const statusStyle = getStatusStyle(task.TrangThai, task.NgayKetThuc);
          
          return (
            <div className="p-3 hover:bg-gray-50" key={index}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">{formatDate(task.NgayKetThuc)}</div>
                  <h3 className="text-xs font-medium text-gray-800 truncate">{task.TenCongTac}</h3>
                </div>
                <span className={`flex items-center text-xs px-2 py-1 rounded-full ${statusStyle.className}`}>
                  {statusStyle.icon}
                  {task.TrangThai}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConstructionProgress;
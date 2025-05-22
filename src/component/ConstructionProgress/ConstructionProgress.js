import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBars, FaChevronRight } from 'react-icons/fa';

const ConstructionProgress = ({ tasks = [], projectId }) => {  
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('vi-VN', { 
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
  
  const handleNavigateToWorkItems = () => projectId && navigate(`/work-items/${projectId}`);

  const getStatusColor = (status) => ({
    'Hoàn thành': 'bg-green-100 text-green-800',
    'Đang thực hiện': 'bg-blue-100 text-blue-800',
    'Chậm tiến độ': 'bg-yellow-100 text-yellow-800',
    'Tạm dừng': 'bg-red-100 text-red-800'
  }[status] || 'bg-gray-100 text-gray-800');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center">
          <FaBars className="text-gray-500 mr-2" />
          <h2 className="text-base font-semibold text-gray-800">TIẾN ĐỘ THI CÔNG</h2>
        </div>
        <button onClick={handleNavigateToWorkItems} className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium">
          Xem chi tiết <FaChevronRight className="ml-1" size={10} />
        </button>
      </div>
      <div className="px-3 py-1 text-xs text-gray-500">{today}</div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {tasks.map((task, index) => (
          <div className="p-3 hover:bg-gray-50" key={index}>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">{formatDate(task.NgayKetThuc)}</div>
                <h3 className="text-xs font-medium text-gray-800 truncate">{task.TenCongTac}</h3>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(task.TrangThai)}`}>
                {task.TrangThai}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstructionProgress;
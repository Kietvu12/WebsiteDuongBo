import React from 'react';
import './ConstructionProgress.css';

const ConstructionProgress = ({ tasks = [] }) => {  
  const today = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const formatDate = (dateString) => {
    if (typeof dateString === 'string') {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    if (dateString instanceof Date) {
      const day = dateString.getDate().toString().padStart(2, '0');
      const month = (dateString.getMonth() + 1).toString().padStart(2, '0');
      const year = dateString.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return dateString; 
  };

  return (
    <div className="progress-container"> 
      <div className="progress-wrapper">
        <div className="header-bar">
          <div className="menu-icon">☰</div>
          <div className="title">TIẾN ĐỘ THI CÔNG</div>
        </div>
        <div className="today-date">{today}</div>
        <div className="task-list">
          {tasks.map((task, index) => (
            <div className="task-card" key={index}>
              <div className="task-date-time">
              {formatDate(task.NgayKetThuc)}
              </div>
              <div className="task-content">
                <div className="task-title">{task.TenCongTac}</div>
                <div className={`task-status`}>
                  {task.TrangThai}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConstructionProgress;
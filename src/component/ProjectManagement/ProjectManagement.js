import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectManagement.css';
import ProjectMenu from '../ProjectMenu/ProjectMenu';

const ProjectManagement = ({ projectId }) => {
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [formData, setFormData] = useState({
    khoiLuongThucHien: '',
    moTaVuongMac: '',
    ghiChu: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const handleWorkItemSelect = (item) => {
    if (item.type === 'work') {
      setSelectedWorkItem(item);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkItem) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/kehoach/capnhat-tiendo/${selectedWorkItem.HangMucID}`,
        formData
      );

      if (response.data.success) {
        setSuccessMessage('Cập nhật tiến độ thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-management-container">
      <div className="project-menu-container">
        <ProjectMenu 
          projectId={projectId} 
          onItemSelect={handleWorkItemSelect}
        />
      </div>
      <div className="work-detail-container">
        {selectedWorkItem ? (
          <div className="work-detail-content">
            <h2 className="work-item-title">
              {selectedWorkItem.TenHangMuc}
              <span className="progress-badge">
                {selectedWorkItem.phanTramHoanThanh}% hoàn thành
              </span>
            </h2>

            <div className="work-item-stats">
              <div className="stat-card">
                <h3>Khối lượng kế hoạch</h3>
                <p>{selectedWorkItem.tongKhoiLuongKeHoach} {selectedWorkItem.DonViTinh}</p>
              </div>
              <div className="stat-card">
                <h3>Khối lượng thực hiện</h3>
                <p>{selectedWorkItem.tongKhoiLuongThucHien} {selectedWorkItem.DonViTinh}</p>
              </div>
              <div className="stat-card">
                <h3>Tình trạng</h3>
                <p>{getStatusText(selectedWorkItem.phanTramHoanThanh)}</p>
              </div>
            </div>

            {/* Form cập nhật tiến độ */}
            <form onSubmit={handleSubmit} className="progress-form">
              <h3>Cập nhật tiến độ</h3>
              
              <div className="form-group">
                <label>Khối lượng thực hiện mới:</label>
                <input
                  type="number"
                  name="khoiLuongThucHien"
                  value={formData.khoiLuongThucHien}
                  onChange={handleInputChange}
                  placeholder="Nhập khối lượng"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Vướng mắc:</label>
                <textarea
                  name="moTaVuongMac"
                  value={formData.moTaVuongMac}
                  onChange={handleInputChange}
                  placeholder="Mô tả vướng mắc (nếu có)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleInputChange}
                  placeholder="Ghi chú bổ sung"
                  rows="3"
                />
              </div>

              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật tiến độ'}
              </button>
            </form>
          </div>
        ) : (
          <div className="no-selection">
            <h2>Chọn một hạng mục công việc để xem chi tiết</h2>
            <p>Vui lòng chọn một hạng mục từ danh sách bên trái</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusText = (percentage) => {
  if (percentage >= 100) return 'Hoàn thành';
  if (percentage >= 75) return 'Tiến độ tốt';
  if (percentage >= 50) return 'Đang thực hiện';
  if (percentage > 0) return 'Bắt đầu';
  return 'Chưa bắt đầu';
};

export default ProjectManagement;
import React, { useState } from 'react'
import './ProjectProgress.css'
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import addIcon from '../../assets/img/add-icon.png';
import { useParams } from 'react-router-dom';
import ProjectManagement from '../../component/ProjectManagement/ProjectManagement';
import { useProject } from '../../contexts/ProjectContext';
const ProjectProgress = () => {
  const { selectedProjectId } = useProject();
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [fromDate, setFromDate] = useState('2023-02-26');
  const [toDate, setToDate] = useState('2023-09-26');
  const [status, setStatus] = useState('all');
  return (
    <div className='plan'>
      <div className="header">
        <div className="top-nav">
          <div className="nav-left">
            <button className="nav-btn">
            </button>
          </div>
          <div className="nav-right">
            <div className="user-profile">
              <img src={menuIcon} alt="Menu" className="small-icon" />
              <img src={helpIcon} alt="Help" className="avatar small-icon" />
              <img src={userIcon} alt="User" className="avatar small-icon" />
            </div>
          </div>
        </div>

        <div className="header-content">
          <div className="header-row">
            <h1 style={{ margin: 0, fontSize: '22px', color: '#333', fontWeight: 600 }}>
              BÁO CÁO TIẾN ĐỘ DỰ ÁN 
            </h1>
            <div className="search-box-sub">
              <button
                onClick={() => setShowAddPopup(true)}
                className="add-btn"
              >
                <img src={addIcon} alt="Add" />
                Thêm mới
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10 }} className="header-content">
          <div className="header-row">
            <div className="search-filter">
              <div className="filter-form">
                <div className="filter-box">
                  <span>Lọc theo khoảng thời gian:</span>
                  <input
                    type="date"
                    name="from_date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="small-input"
                  />
                  <span>đến</span>
                  <input
                    type="date"
                    name="to_date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="small-input"
                  />
                </div>

                <div className="filter-box">
                  <span>Lọc theo trạng thái:</span>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="small-input"
                  >
                    <option value="all">Tất cả</option>
                    <option value="Chậm tiến độ">Chậm tiến độ</option>
                    <option value="Đang tiến hành">Đang tiến hành</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProjectManagement projectId={selectedProjectId} />
    </div>
  )
}

export default ProjectProgress
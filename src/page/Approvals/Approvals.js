import React, { useState } from 'react'
import './Approvals.css';

import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import addIcon from '../../assets/img/add-icon.png';
import WorkTable from '../../component/WorkTable/WorkTable';

const Approvals = () => {
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
              ĐỀ XUẤT & PHÊ DUYỆT
            </h1>
          </div>
        </div>

        <div style={{ marginTop: 10 }} className="header-content">
          <div className="header-row">
            <div className="search-box-sub">
              <button
                onClick={() => setShowAddPopup(true)}
                className="add-btn"
              >
                <img src={addIcon} alt="Add" />
                Thêm mới
              </button>
              <input type="text" placeholder="Tìm kiếm..." />
              <button className="search-btn">
                Tìm kiếm
              </button>
            </div>

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
      {showAddPopup && (
        <div className="popup" onClick={() => setShowAddPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Thêm dự án mới</h3>
              <button className="close-btn" onClick={() => setShowAddPopup(false)}>×</button>
            </div>

            <div className="form-group">
              <label>Tên dự án</label>
              <input type="text" placeholder="Nhập tên dự án" />
            </div>

            <div className="form-group">
              <label>Dải tuyến (km)</label>
              <input type="number" placeholder="Nhập chiều dài dải tuyến" />
            </div>

            <div className="form-group">
              <label>Số dự án thành phần</label>
              <input type="number" placeholder="Nhập số dự án thành phần" />
            </div>

            <div className="form-group">
              <label>Số gói thầu</label>
              <input type="number" placeholder="Nhập số gói thầu" />
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select>
                <option>Chưa bắt đầu</option>
                <option selected>Đang tiến hành</option>
                <option>Đã hoàn thành</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tiến độ</label>
              <textarea rows="3" placeholder="Nhập thông tin tiến độ"></textarea>
            </div>

            <div className="form-actions">
              <button onClick={() => setShowAddPopup(false)}>Hủy bỏ</button>
              <button className="btn-save">Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}

export default Approvals
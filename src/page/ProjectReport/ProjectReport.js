import React, { useEffect, useRef, useState } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './ProjectReport.css';
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
function ProjectReport() {
    const [fromDate, setFromDate] = useState('2023-02-26');
    const [toDate, setToDate] = useState('2023-09-26');
    const [status, setStatus] = useState('all');
    const [isMapView, setIsMapView] = useState(false);
  const spreadsheetRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false); 

  useEffect(() => {
    if (isLoaded) {
      fetch('/report.xlsx')
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'report.xlsx');
          if (spreadsheetRef.current) {
            spreadsheetRef.current.open({ file });
          }
        })
        .catch(error => console.error('Lỗi tải file:', error));
    }
  }, [isLoaded]);

  return (
    <div className="app">
      <div className="header">
        <div className="header-container">
          <h1 className="header-title">Quản lý dự án</h1>
          
          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">Từ:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="filter-input date-input"
              />
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Đến:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="filter-input date-input"
              />
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Trạng thái:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="filter-input"
              >
                <option value="all">Tất cả</option>
                <option value="Chậm tiến độ">Chậm tiến độ</option>
                <option value="Đang tiến hành">Đang tiến hành</option>
                <option value="Đã hoàn thành">Hoàn thành</option>
              </select>
            </div>
            
            <button className="search-btn">
              Áp dụng
            </button>
          </div>
          
          <div className="user-actions">
            <img src={menuIcon} alt="Menu" className="action-icon" />
            <img src={helpIcon} alt="Help" className="action-icon" />
            <img src={userIcon} alt="User" className="action-icon" />
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="spreadsheet-container">
        <SpreadsheetComponent
        ref={(spreadsheet) => {
          spreadsheetRef.current = spreadsheet;
          if (spreadsheet) setIsLoaded(true);
        }}
        allowOpen={true}
        allowSave={true}
        openUrl="https://services.syncfusion.com/react/production/api/spreadsheet/open"
        saveUrl="https://services.syncfusion.com/react/production/api/spreadsheet/save"
      />
        </div>
      </div>
    </div>
  );
}

export default ProjectReport;

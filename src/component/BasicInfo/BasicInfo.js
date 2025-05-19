import React from 'react';
import './BasicInfo.css'; 

const BasicInfo = ({ data }) => {
  return (
    <div className="general-info-card">
      <div className="general-info-header">
        THÔNG TIN CHUNG
      </div>
      <div className="general-info-content">
        <div className="info-item">
          <span className="info-label">Tổng chiều dài tuyến:</span>
          <span className="info-value">55.34km</span>
        </div>
        <div className="info-item">
          <span className="info-label">Tổng mức đầu tư:</span>
          <span className="info-value"> {data.GiaTriHĐ}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Chủ đầu tư:</span>
          <span className="info-value">{data.ChuDauTu}</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
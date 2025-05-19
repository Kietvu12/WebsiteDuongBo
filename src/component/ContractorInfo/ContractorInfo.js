import React from 'react';
import './ContractorInfo.css';

const ContractorInfo = ({ data }) => {
  if (!data) return null;

  const {
    NgayKhoiCong,
    NgayHoanThanh,
    TrangThai,
    danhGiaRuiRo,
    nhaThau = [],
  } = data;

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const contractorNames = nhaThau.map((nt) => nt.TenNhaThau).join(' - ');

  return (
    <div className="contractor-card">
      <div className="contractor-header">
        NHÀ THẦU CHÍNH
      </div>
      
      <div className="contractor-content">
        <div className="contractor-names">
          <p>{contractorNames || 'Không có thông tin nhà thầu'}</p>
        </div>
        
        <div className="contractor-dates">
          <div className="date-column">
            <span className="date-header">Ngày bắt đầu</span>
            <span className="date-value">{formatDate(NgayKhoiCong)}</span>
          </div>
          <div className="date-column">
            <span className="date-header">Ngày kết thúc</span>
            <span className="date-value">{formatDate(NgayHoanThanh)}</span>
          </div>
          <div className="status-column">
            <span className="date-header">Tình trạng</span>
            <span className={`status-value ${danhGiaRuiRo === 'Rủi ro cao' ? 'risk' : ''}`}>
              {danhGiaRuiRo || TrangThai || '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorInfo;

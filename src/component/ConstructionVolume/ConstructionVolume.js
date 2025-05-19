import React from 'react';
import './ConstructionVolume.css';

const ConstructionVolume = ({ data }) => {
  if (!data || !data.khoiLuongThiCong || data.khoiLuongThiCong.length === 0) {
    return <div className="volume-card">
    <div className="volume-header">
      KHỐI LƯỢNG THI CÔNG YÊU CẦU
    </div>

    <div className="volume-content">
      <p>Không có dữ liệu</p>
    </div>
  </div>
  }

  return (
    <div className="volume-card">
      <div className="volume-header">
        KHỐI LƯỢNG THI CÔNG YÊU CẦU
      </div>

      <div className="volume-content">
        <ul className="volume-list">
          {data.khoiLuongThiCong.map((item, index) => (
            <li key={item.KhoiLuong_ID || index} className="volume-item">
              <strong>{item.TieuDe}:</strong> {item.NoiDung} 
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConstructionVolume;

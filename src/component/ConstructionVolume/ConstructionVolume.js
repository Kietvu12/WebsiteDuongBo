import React from 'react';
import { FaCubes } from 'react-icons/fa';

const ConstructionVolume = ({ data }) => {
  if (!data || !data.khoiLuongThiCong || data.khoiLuongThiCong.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center">
          <FaCubes className="text-gray-500 mr-2" size={14} />
          <h2 className="text-base font-semibold text-gray-800">KHỐI LƯỢNG THI CÔNG YÊU CẦU</h2>
        </div>
        <div className="p-3 h-40 overflow-y-auto">
          <p className="text-sm text-gray-800 text-left">Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center">
        <FaCubes className="text-gray-500 mr-2" size={14} />
        <h2 className="text-base font-semibold text-gray-800">KHỐI LƯỢNG THI CÔNG YÊU CẦU</h2>
      </div>
      <div className="p-3 h-40 overflow-y-auto">
        <ul className="list-disc pl-4 space-y-2">
          {data.khoiLuongThiCong.map((item, index) => (
            <li
              key={item.KhoiLuong_ID || index}
              className="text-sm text-gray-800 text-left"
            >
              <strong>{item.TieuDe}:</strong> {item.NoiDung}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConstructionVolume;
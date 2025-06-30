import React, { useState } from 'react';
import { FaCubes } from 'react-icons/fa';
import AddConstructionVolumePopup from '../AddNewConstructionVolume/AddNewConstructionVolume';

const ConstructionVolume = ({ data, packageId }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleSuccess = (newData) => {
    console.log('Thêm thành công:', newData);
    // Cập nhật state hoặc refetch data ở đây
  };

  console.log("Dữ liệu tại trang:", data);

  const Header = () => (
    <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center">
        <FaCubes className="text-gray-500 mr-2" size={14} />
        <h2 className="text-base font-semibold text-gray-800">KHỐI LƯỢNG THI CÔNG YÊU CẦU</h2>
      </div>
      <button 
        onClick={() => setShowPopup(true)}
        className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-1.5 rounded text-sm"
      >
        Thêm khối lượng
      </button>
    </div>
  );

  if (!data || !data.khoiLuongThiCong || data.khoiLuongThiCong.length === 0) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <Header />
        <div className="p-3 h-60 overflow-y-auto">
          <p className="text-sm text-gray-800 text-left">Không có dữ liệu</p>
        </div>
        {showPopup && (
          <AddConstructionVolumePopup
            packageId={packageId}
            onClose={() => setShowPopup(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <Header />
      <div className="p-3 h-60 overflow-y-auto">
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
      {showPopup && (
        <AddConstructionVolumePopup
          packageId={packageId}
          onClose={() => setShowPopup(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ConstructionVolume;

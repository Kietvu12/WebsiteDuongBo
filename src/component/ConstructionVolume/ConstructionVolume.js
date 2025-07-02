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
      <div className="bg-white rounded-lg overflow-hidden h-full flex flex-col">
        <Header />
        <div className="flex-1 p-3 overflow-y-auto min-h-[100px]">
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
<div className="bg-white rounded-lg overflow-hidden h-full flex flex-col shadow-sm">
  <Header />
  <div className="flex-1 p-3 md:p-4 overflow-y-auto min-h-[100px]">
    <ul className="list-disc pl-4 md:pl-5 space-y-2 md:space-y-3">
      {data.khoiLuongThiCong.map((item, index) => (
        <li
          key={item.KhoiLuong_ID || index}
          className="text-sm md:text-base text-gray-800 text-left leading-relaxed"
        >
          <strong className="font-semibold">{item.TieuDe}:</strong> {item.NoiDung}
        </li>
      ))}
    </ul>
    
    {/* Nút thêm khối lượng - responsive */}
    <div className="mt-4 md:mt-6 flex justify-end">
      <button
        onClick={() => setShowPopup(true)}
        className="px-3 py-2 md:px-4 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm md:text-base transition-colors duration-200 flex items-center gap-1.5"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Thêm khối lượng</span>
      </button>
    </div>
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
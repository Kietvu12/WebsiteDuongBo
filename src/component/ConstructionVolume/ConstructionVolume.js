import React, { useState } from 'react';
import { FaCubes } from 'react-icons/fa';
import AddConstructionVolumePopup from '../AddNewConstructionVolume/AddNewConstructionVolume';

const ConstructionVolume = ({ data, packageId, variant = 'default' }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleSuccess = (newData) => {
    console.log('Thêm thành công:', newData);
  };

  console.log('Dữ liệu tại trang:', data);

  const headerBar =
    variant === 'blue'
      ? 'p-3 bg-[#0f3460] text-white flex items-center justify-between gap-2 flex-shrink-0'
      : variant === 'orange'
        ? 'p-3 bg-[#e67e22] text-white flex items-center justify-between gap-2 flex-shrink-0'
        : 'p-3 sm:p-2 xs:p-1 bg-gray-50 border-b border-gray-100 flex items-center justify-between';

  const iconClass = variant === 'default' ? 'text-gray-500 mr-2' : 'text-white mr-2 shrink-0';
  const titleClass =
    variant === 'default'
      ? 'text-lg sm:text-base xs:text-sm font-semibold text-gray-800'
      : 'text-xs font-bold text-white uppercase tracking-wide leading-tight';

  const addBtnClass =
    variant === 'default'
      ? 'bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-1.5 sm:px-3 sm:py-1 xs:px-2 xs:py-0.5 rounded text-sm sm:text-xs xs:text-xs'
      : 'bg-white/20 hover:bg-white/30 transition text-white px-2 py-1 rounded text-xs font-medium shrink-0';

  const shellClass =
    variant === 'orange'
      ? 'bg-white rounded-lg overflow-hidden h-full flex flex-col border border-orange-300 shadow-sm'
      : variant === 'blue'
        ? 'bg-white rounded-lg overflow-hidden h-full flex flex-col border border-[#0f3460]/25 shadow-sm'
        : 'bg-white rounded-lg overflow-hidden h-full flex flex-col';

  const Header = () => (
    <div className={headerBar}>
      <div className="flex items-center min-w-0">
        <FaCubes className={iconClass} size={14} />
        <h2 className={titleClass}>KHỐI LƯỢNG THI CÔNG YÊU CẦU</h2>
      </div>
      <button type="button" onClick={() => setShowPopup(true)} className={addBtnClass}>
        {variant === 'default' ? 'Thêm khối lượng' : 'Thêm'}
      </button>
    </div>
  );

  if (!data || !data.khoiLuongThiCong || data.khoiLuongThiCong.length === 0) {
    return (
      <div className={shellClass}>
        <Header />
        <div className="flex-1 p-3 sm:p-2 xs:p-1 overflow-y-auto min-h-[100px]">
          <p className="text-sm sm:text-xs xs:text-xs text-gray-500 text-left italic">Không có dữ liệu</p>
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
    <div className={`${shellClass} ${variant === 'default' ? 'shadow-sm' : ''}`}>
      <Header />
      <div className="flex-1 p-3 md:p-4 sm:p-2 xs:p-1 overflow-y-auto min-h-[100px]">
        <ul className="space-y-2 md:space-y-3 sm:space-y-1.5 xs:space-y-1">
          {data.khoiLuongThiCong.map((item, index) => (
            <li
              key={item.KhoiLuong_ID || index}
              className="text-sm md:text-base sm:text-xs xs:text-xs text-gray-800 text-left"
            >
              <div className="break-words overflow-hidden">
                <strong className="font-semibold">{item.TieuDe}:</strong>
                <span className="whitespace-normal"> {item.NoiDung}</span>
              </div>
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

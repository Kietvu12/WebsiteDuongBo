import React from 'react';

const BasicInfo = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header với logo */}
      <div className="flex items-center bg-blue-600 px-4 py-3">
        <img 
          src="/path-to-your-logo.png" 
          alt="Logo" 
          className="h-8 w-8 mr-2" 
        />
        <div className="text-white font-semibold text-lg">
          THÔNG TIN CHUNG
        </div>
      </div>

      {/* Nội dung thông tin */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tổng chiều dài tuyến:</span>
          <span className="text-gray-800">55.34km</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tổng mức đầu tư:</span>
          <span className="text-gray-800">{data.GiaTriHĐ}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Chủ đầu tư:</span>
          <span className="text-gray-800">{data.ChuDauTu}</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
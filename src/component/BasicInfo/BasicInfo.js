import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const BasicInfo = ({ data }) => {
  console.log("Chủ đầu tư:", data);
  
  return (
    <div className="bg-white w-full rounded-lg mt-2 overflow-hidden">
      <div className="flex items-center px-4 py-1 border-b border-gray-200">
        <FaInfoCircle className="h-5 w-5 mr-2 text-gray-500" />
        <div className="text-gray-800 font-bold text-lg">
          THÔNG TIN CHUNG
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tổng chiều dài tuyến:</span>
          <span className="text-gray-800 font-bold">55.34km</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Tổng mức đầu tư:</span>
          <span className="text-gray-800 font-bold">{data.GiaTriHĐ || "Chưa có giá trị"}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">Chủ đầu tư:</span>
          <span className="text-gray-800 font-bold">{data.TenChuDauTu}</span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
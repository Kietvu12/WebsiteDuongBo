import React from 'react';
import { FaUsers } from 'react-icons/fa';

const ContractorInfo = ({ data }) => {
  if (!data) return null;

  const { NgayKhoiCong, NgayHoanThanh, TrangThai, danhGiaRuiRo, nhaThau = [] } = data;

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const contractorNames = nhaThau.map((nt) => nt.TenNhaThau).join(' - ');

  const getRiskBorder = (risk) => {
    switch (risk) {
      case 'Rủi ro cao':
        return 'border-red-600 text-red-600';
      case 'Rủi ro trung bình':
        return 'border-yellow-600 text-yellow-600';
      case 'Rủi ro thấp':
        return 'border-green-600 text-green-600';
      default:
        return 'border-gray-600 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg mt-2 shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center">
        <FaUsers className="text-gray-500 mr-2" size={14} />
        <h2 className="text-base font-semibold text-gray-800">NHÀ THẦU CHÍNH</h2>
      </div>
      <div className="p-3 max-h-40 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xm font-bold text-gray-800 text-center truncate">{contractorNames || 'Không có thông tin nhà thầu'}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          <div className="w-full text-center">
            <span className="block text-sm font-medium text-gray-500">Ngày bắt đầu</span>
            <span className="text-sm text-gray-800">{formatDate(NgayKhoiCong)}</span>
          </div>
          <div className="w-full text-center">
            <span className="block text-sm font-medium text-gray-500">Ngày kết thúc</span>
            <span className="text-sm text-gray-800">{formatDate(NgayHoanThanh)}</span>
          </div>
          <div className="w-full text-center">
            <span className="block text-sm font-medium text-gray-500">Tình trạng</span>
            <span className={`text-sm border rounded-sm px-2 py-0.5 ${getRiskBorder(danhGiaRuiRo || TrangThai)}`}>
              {danhGiaRuiRo || TrangThai || '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorInfo;
import React from 'react';
import { FaUsers } from 'react-icons/fa';

const ContractorInfo = ({ data }) => {
  if (!data) return null;
  console.log("Dữ liệu nhà thầu:", data);

  const { NgayKhoiCong, NgayHoanThanh, TrangThai, danhGiaRuiRo, nhaThau = [] } = data;
  console.log("Dữ liệu nahf thầu:", data);

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const contractorNames = nhaThau.map((nt) => nt.TenNhaThau).join(' - ');

  const getRiskBorder = (risk) => {
    switch (risk) {
      case 'Rủi ro cao':
        return 'border-red-600 text-red-600 bg-red-50 rounded-full';
      case 'Rủi ro trung bình':
        return 'border-yellow-600 text-yellow-600 bg-yellow-50 rounded-full';
      case 'Rủi ro thấp':
        return 'border-green-600 text-green-600 bg-green-50 rounded-full';
      default:
        return 'border-gray-600 text-gray-600 bg-gray-50 rounded-full';
    }
  };

  return (
    <div className="bg-white rounded-lg mt-2 overflow-hidden">
      <div className="p-1 bg-gray-50 border-b border-gray-100 flex items-center">
        <FaUsers className="text-gray-500 mr-2" size={14} />
        <h2 className="text-lg font-semibold text-gray-800">NHÀ THẦU CHÍNH</h2>
      </div>
      <div className="p-4 max-h-50 overflow-y-auto flex flex-col justify-between h-auto"> {/* Quan trọng: justify-between */}
        {/* Phần thông tin nhà thầu */}
        <div className="text-sm">
          <div className="mb-2 flex items-start">
            <p className="text-xm font-bold text-gray-800 w-1/4">Tên công ty:</p>
            <p className="text-xm font-medium text-gray-800 truncate flex-grow">
              {contractorNames || 'Không có thông tin nhà thầu'}
            </p>
          </div>
          <div className="mb-2 flex items-start">
            <p className="text-xm font-bold text-gray-800 w-1/4">Địa chỉ:</p>
            <p className="text-xm font-medium text-gray-800 break-words whitespace-normal flex-grow">
              {data.DiaChiTruSo || 'Không có thông tin nhà thầu'}
            </p>
          </div>
          <div className="mb-2 flex items-start">
            <p className="text-xm font-bold text-gray-800 w-1/4">Mã số thuế:</p>
            <p className="text-xm font-medium text-gray-800 truncate flex-grow">
              {data.MaSoThue || 'Không có thông tin nhà thầu'}
            </p>
          </div>
        </div>

        {/* Phần ngày tháng - LUÔN Ở DƯỚI CÙNG */}
        <div className="grid grid-cols-3 gap-4 justify-items-center pt-4"> {/* pt-4 để tạo khoảng cách */}
          <div className="w-full text-center">
            <span className="block text-sm font-medium text-gray-500">Ngày bắt đầu</span>
            <span className="text-sm font-bold text-[#15294A] bg-[#B4D5F6] rounded-full px-2 py-1">
              {formatDate(NgayKhoiCong)}
            </span>
          </div>
          <div className="w-full text-center">
            <span className="block text-sm font-medium text-gray-500">Ngày kết thúc</span>
            <span className="text-sm font-bold text-[#7F3232] bg-[#F2AEA9] rounded-full px-2 py-1">
              {formatDate(NgayHoanThanh)}
            </span>
          </div>
          <div className="w-full text-center">
            <span className="block text-sm font-medium text-gray-500">Tình trạng</span>
            <span className={`text-sm font-bold border rounded-full px-3 py-1 ${getRiskBorder(danhGiaRuiRo || TrangThai)}`}>
              {danhGiaRuiRo || TrangThai || '---'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorInfo;
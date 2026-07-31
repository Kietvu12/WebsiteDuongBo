import React from 'react';
import { FaUsers } from 'react-icons/fa';

const ContractorInfo = ({ data, ps, pe, variant = 'default', showSchedule = true }) => {
  if (!data) return null;

  const { NgayKhoiCong, NgayHoanThanh, TrangThai, danhGiaRuiRo, nhaThau = [] } = data;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const contractorNames = nhaThau.map((nt) => nt.TenNhaThau).join(' - ');

  const getRiskBorder = (risk) => {
    switch (risk) {
      case 'Rủi ro cao':
        return 'border-red-600 text-red-600 bg-red-50';
      case 'Rủi ro trung bình':
        return 'border-yellow-600 text-yellow-600 bg-yellow-50';
      case 'Rủi ro thấp':
        return 'border-green-600 text-green-600 bg-green-50';
      default:
        return 'border-gray-600 text-gray-600 bg-gray-50';
    }
  };

  const shellClass =
    variant === 'blue'
      ? 'bg-white rounded-lg overflow-hidden border border-[#0f3460]/25 shadow-sm h-full flex flex-col'
      : variant === 'orange'
        ? 'bg-white rounded-lg overflow-hidden border border-orange-300 shadow-sm h-full flex flex-col'
        : 'bg-white rounded-lg mt-2 overflow-hidden shadow-sm h-full flex flex-col';

  const headerClass =
    variant === 'blue'
      ? 'p-3 bg-[#0f3460] text-white flex items-center flex-shrink-0'
      : variant === 'orange'
        ? 'p-3 bg-[#e67e22] text-white flex items-center flex-shrink-0'
        : 'p-3 bg-gray-50 border-b border-gray-100 flex items-center flex-shrink-0';

  const iconClass = variant === 'default' ? 'text-gray-500 mr-2' : 'text-white mr-2';
  const titleClass =
    variant === 'default'
      ? 'text-lg font-semibold text-gray-800'
      : 'text-sm font-bold text-white uppercase tracking-wide';

  return (
    <div className={shellClass}>
      <div className={headerClass}>
        <FaUsers className={iconClass} size={14} />
        <h2 className={titleClass}>NHÀ THẦU CHÍNH</h2>
      </div>

      <div className="p-4 overflow-y-auto flex-1 min-h-0">
        <div className="space-y-3">
          <div className="flex">
            <span className="text-sm font-bold text-gray-800 w-28 flex-shrink-0">Tên công ty:</span>
            <span className="text-sm text-gray-800 break-words">{contractorNames || data.tenNhaThau || '---'}</span>
          </div>

          <div className="flex">
            <span className="text-sm font-bold text-gray-800 w-28 flex-shrink-0">Địa chỉ:</span>
            <span className="text-sm text-gray-800 break-words">{data.DiaChiTruSo || data.diaChiTruSo || 'Không có dữ liệu'}</span>
          </div>

          <div className="flex">
            <span className="text-sm font-bold text-gray-800 w-28 flex-shrink-0">Mã số thuế:</span>
            <span className="text-sm text-gray-800 break-words">{data.MaSoThue || data.maSoThue || 'Không có dữ liệu'}</span>
          </div>
        </div>

        {showSchedule && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="flex flex-col items-stretch">
              <span className="text-xs font-medium text-gray-500 mb-1">Ngày bắt đầu</span>
              <span className="text-xs font-bold text-[#15294A] bg-[#B4D5F6] rounded-md px-3 py-2 w-full text-center">
                {NgayKhoiCong ? formatDate(NgayKhoiCong) : ps ? formatDate(ps) : '---'}
              </span>
            </div>

            <div className="flex flex-col items-stretch">
              <span className="text-xs font-medium text-gray-500 mb-1">Ngày kết thúc</span>
              <span className="text-xs font-bold text-[#7F3232] bg-[#F2AEA9] rounded-md px-3 py-2 w-full text-center">
                {NgayHoanThanh ? formatDate(NgayHoanThanh) : pe ? formatDate(pe) : '---'}
              </span>
            </div>

            <div className="flex flex-col items-stretch">
              <span className="text-xs font-medium text-gray-500 mb-1">Tình trạng</span>
              <span
                className={`text-xs font-bold border rounded-md px-3 py-2 w-full text-center ${getRiskBorder(danhGiaRuiRo || TrangThai)}`}
              >
                {danhGiaRuiRo || TrangThai || 'Không có dữ liệu'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorInfo;

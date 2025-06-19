import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IssueList = ({ keHoachId, duAnId, onClose }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/hangMuc/${duAnId}/vuongMac`);
        const responseData = response.data.data;

        const filteredIssues = [];

        // Helper function to extract issues from a list of goiThau
        const extractIssuesFromGoiThau = (goiThauList) => {
          if (!goiThauList) return;
          goiThauList.forEach(goiThau => {
            goiThau.danhSachHangMuc?.forEach(hangMuc => {
              hangMuc.danhSachVuongMac?.forEach(vuongMac => {
                // Ensure type coercion doesn't break comparison
                if (String(vuongMac.keHoachId) === String(keHoachId)) {
                  filteredIssues.push(vuongMac);
                }
              });
            });
          });
        };

        // Handle parent project
        if (responseData.duAnTong) {
          // Direct tenders
          extractIssuesFromGoiThau(responseData.duAnTong.danhSachGoiThauTrucTiep);
          // Child projects
          responseData.duAnTong.danhSachDuAnCon?.forEach(duAnCon => {
            extractIssuesFromGoiThau(duAnCon.danhSachGoiThau);
          });
        }

        // Handle child project
        if (responseData.duAnThanhPhan) {
          extractIssuesFromGoiThau(responseData.duAnThanhPhan.danhSachGoiThau);
        }

        // Debugging: Log the results
        console.log('Filtered Issues:', filteredIssues);
        console.log('keHoachId:', keHoachId);
        console.log('API Response:', responseData);

        setIssues(filteredIssues);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [keHoachId, duAnId]);

  if (loading) return <div className="text-center py-4">Đang tải dữ liệu...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Danh sách vướng mắc - KH-{keHoachId}</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có vướng mắc nào được báo cáo</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Loại vướng mắc</th>
                <th className="py-2 px-4 border">Mô tả</th>
                <th className="py-2 px-4 border">Ngày phát sinh</th>
                <th className="py-2 px-4 border">Trạng thái</th>
                <th className="py-2 px-4 border">Biện pháp xử lý</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.vuongMacId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{getIssueTypeLabel(issue.loaiVuongMac)}</td>
                  <td className="py-2 px-4 border">{issue.moTaChiTiet}</td>
                  <td className="py-2 px-4 border">{formatDate(issue.ngayPhatSinh)}</td>
                  <td className="py-2 px-4 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      issue.trangThai === 'Đã phê duyệt' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.trangThai}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">{issue.bienPhapXuLy || 'Chưa có'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper functions remain unchanged
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const getIssueTypeLabel = (type) => {
  const issueTypes = {
    'GPMB': 'Giải phóng mặt bằng',
    'ThietBi': 'Thiết bị',
    'NhanLuc': 'Nhân lực',
    'VatTu': 'Vật tư',
    'ThoiTiet': 'Thời tiết',
    'Khac': 'Khác'
  };
  return issueTypes[type] || type;
};

export default IssueList;
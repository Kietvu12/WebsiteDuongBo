import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TienDoHangMucPopup = ({ duAnId, status, onClose }) => {
  console.log(duAnId);
  
  console.log(status);
  
  const [hangMucData, setHangMucData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [nhaThauList, setNhaThauList] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // Map trạng thái từ popup sang API
  const statusMap = {
    'danglam': 'DANG_THUC_HIEN',
    'hoanthanh': 'HOAN_THANH',
    'chamtienDo': 'CHAM_TIEN_DO'
  };

  // Tiêu đề popup theo trạng thái
  const titleMap = {
    'danglam': 'Hạng mục đang thực hiện',
    'hoanthanh': 'Hạng mục đã hoàn thành',
    'chamtienDo': 'Hạng mục chậm tiến độ'
  };

  useEffect(() => {
    // Lấy danh sách hạng mục
    const fetchHangMuc = async () => {
      try {
        setLoading(true);
        console.log('Fetching data with params:', {
          duAnId,
          status,
          mappedStatus: statusMap[status]
        });
        
        const response = await axios.get(`${API_BASE_URL}/${duAnId}/hang-muc`, {
          params: {
            trangThai: statusMap[status]
          }
        });
        
        console.log('API Response:', response.data);
        
        // Xác định key dữ liệu dựa trên status
        const dataKey = `hangMuc${
          status === 'chamtienDo' ? 'ChamTienDo' : 
          status === 'hoanthanh' ? 'HoanThanh' : 
          'DangThucHien'
        }`;
        
        // Lấy dữ liệu hoặc mảng rỗng nếu không có
        const data = response.data.data[dataKey] || [];
        
        console.log('Extracted data:', data);
        
        setHangMucData(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách hạng mục:', error);
        setHangMucData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };
    

    // Lấy danh sách nhà thầu
    const fetchNhaThau = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/nhaThauList`);
        setNhaThauList(response.data.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhà thầu:', error);
      }
    };

    fetchHangMuc();
    fetchNhaThau();
  }, [duAnId, status]);

  useEffect(() => {
    // Filter dữ liệu khi searchTerm thay đổi
    if (searchTerm.trim() === '') {
      setFilteredData(hangMucData);
    } else {
      const filtered = hangMucData.filter(item => 
        item.tenHangMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tenGoiThau.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nhaThau.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, hangMucData]);

  // Hàm tạo avatar nhà thầu
  const renderNhaThauAvatar = (tenNhaThau) => {
    if (!tenNhaThau) return null;
    
    const firstLetter = tenNhaThau.charAt(0).toUpperCase();
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;
    
    return (
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${colors[colorIndex]} relative group`}
        title={tenNhaThau}
      >
        {firstLetter}
        {/* Tooltip hiển thị tên nhà thầu */}
        <div className="absolute z-10 hidden group-hover:block bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
          {tenNhaThau}
        </div>
      </div>
    );
  };

  // Hàm xử lý phần trăm tiến độ
  const handleTienDo = (phanTram) => {
    const percent = parseFloat(phanTram);
    return Math.min(percent, 100).toFixed(2);
  };


  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col mx-2 sm:mx-4">
    {/* Header */}
    <div className="flex justify-between items-center border-b p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold">{titleMap[status]}</h3>
      <button 
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 p-1"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    {/* Search */}
    <div className="p-3 sm:p-4 border-b">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-9 sm:pl-10 pr-3 py-1 sm:py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          placeholder="Tìm kiếm theo tên hạng mục, gói thầu, nhà thầu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
    
    {/* Table Container */}
    <div className="overflow-auto flex-grow">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gói thầu</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạng mục</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà thầu</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt đầu</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết thúc</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiến độ</th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{index + 1}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-normal text-xs sm:text-sm font-medium text-gray-900 max-w-[120px] sm:max-w-none truncate">{item.tenGoiThau}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-normal text-xs sm:text-sm text-gray-500 max-w-[120px] sm:max-w-none truncate">{item.tenHangMuc}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {item.nhaThau.split(', ').map((nhaThau, i) => (
                          <div key={i} className="flex-shrink-0">
                            {renderNhaThauAvatar(nhaThau.trim())}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{item.batDau}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{item.ketThuc}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              parseFloat(item.phanTramTienDo) >= 100 ? 'bg-green-500' : 
                              status === 'chamtienDo' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} 
                            style={{ width: `${handleTienDo(item.phanTramTienDo)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-[10px] sm:text-xs font-medium text-gray-500">
                          {handleTienDo(item.phanTramTienDo)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full ${
                        item.trangThai === 'HOAN_THANH' ? 'bg-green-100 text-green-800' :
                        item.trangThai === 'CHAM_TIEN_DO' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.trangThai === 'HOAN_THANH' ? 'Hoàn thành' : 
                         item.trangThai === 'CHAM_TIEN_DO' ? 'Chậm tiến độ' : 'Đang thực hiện'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có dữ liệu hạng mục
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    
    {/* Footer */}
    <div className="border-t p-3 sm:p-4 flex justify-end">
      <button
        onClick={onClose}
        className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm sm:text-base"
      >
        Đóng
      </button>
    </div>
  </div>
</div>
  );
};

export default TienDoHangMucPopup;
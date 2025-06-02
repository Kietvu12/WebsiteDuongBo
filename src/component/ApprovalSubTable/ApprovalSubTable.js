import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';

const ApprovalSubTable = ({ duAnThanhPhanId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({
    goiThau: {},
    loaiHangMuc: {},
    hangMuc: {}
  });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/hangMuc/${duAnThanhPhanId}/vuongMac`);
        setData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    console.log("dự án thành phần:", duAnThanhPhanId);
    if (duAnThanhPhanId !== null) fetchData();
  }, [duAnThanhPhanId]);

  const toggleItem = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleAdd = (parentId, type) => {
    console.log(`Thêm mới vào ${type} với ID: ${parentId}`);

  };

  const handleDelete = (vuongMacId) => {
    console.log(`Xóa vướng mắc với ID: ${vuongMacId}`);
  };

  if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-4">Không có dữ liệu</div>;

  return (
<div className="w-full p-2 sm:p-4">
  {/* Desktop Table (hidden on mobile) */}
  <div className="hidden sm:block">
    <div className="max-h-[750px] overflow-y-auto border rounded-lg">
      {/* Giữ nguyên bảng gốc cho desktop */}
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40px] sm:w-[60px]">STT</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px] sm:w-[120px]">Mã số</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px] sm:w-[220px]">Công việc</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px] sm:w-[300px]">Vướng mắc</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px] sm:w-[200px]">Biện pháp</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[150px]">Ngày phát sinh</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] sm:w-[150px]">Ngày kết thúc</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px] sm:w-[150px]">Trạng thái</th>
            <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[70px] sm:w-[100px]">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Level 1 - Dự án */}
          <tr className="bg-green-50 hover:bg-green-100">
            <td className="px-2 sm:px-4 py-2">1</td>
            <td className="px-2 sm:px-4 py-2">DA-{data.duAnThanhPhan.duAnId}</td>
            <td className="px-2 sm:px-4 py-2 font-medium">{data.duAnThanhPhan.tenDuAn}</td>
            <td colSpan="5" className="px-2 sm:px-4 py-2 text-sm">
              Tổng số vướng mắc: {data.duAnThanhPhan.tongVuongMac}
              (Đã phê duyệt: {data.duAnThanhPhan.tongDaPheDuyet} | Chưa phê duyệt: {data.duAnThanhPhan.tongChuaPheDuyet})
            </td>
            <td className="px-2 sm:px-4 py-2">
              <button
                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                title="Thêm vướng mắc"
              >
                <FaPlus size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </td>
          </tr>

          {/* Level 2 - Gói thầu */}
          {data.duAnThanhPhan.danhSachGoiThau.map((goiThau, indexGT) => (
            <React.Fragment key={`goithau-${goiThau.goiThauId}`}>
              <tr className="bg-yellow-50 hover:bg-yellow-100">
                <td className="px-2 sm:px-4 py-2">{indexGT + 1}</td>
                <td className="px-2 sm:px-4 py-2">GT-{goiThau.goiThauId}</td>
                <td className="px-2 sm:px-4 py-2 font-medium">
                  <button
                    onClick={() => toggleItem('goiThau', goiThau.goiThauId)}
                    className="flex items-center focus:outline-none"
                  >
                    <span className={`text-xs sm:text-sm transform ${expandedItems.goiThau[goiThau.goiThauId] ? 'rotate-90' : ''}`}>▸</span>
                    <span className="ml-1 text-sm sm:text-base">{goiThau.tenGoiThau}</span>
                  </button>
                </td>
                <td colSpan="5" className="px-2 sm:px-4 py-2 text-sm">
                  Vướng mắc: {goiThau.tongVuongMac} (Đã phê duyệt: {goiThau.tongDaPheDuyet} | Chưa phê duyệt: {goiThau.tongChuaPheDuyet})
                </td>
                <td className="px-2 sm:px-4 py-2">
                  <div className="flex space-x-1">
                    <button
                      className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                      title="Thêm vướng mắc"
                    >
                      <FaPlus size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                      title="Xóa vướng mắc"
                    >
                      <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Level 3 - Hạng mục */}
              {expandedItems.goiThau[goiThau.goiThauId] && goiThau.danhSachHangMuc?.map((hangMuc, indexHM) => (
                <React.Fragment key={`hangmuc-${hangMuc.hangMucId}`}>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 pl-6 sm:pl-8">{`${indexGT + 1}.${indexHM + 1}`}</td>
                    <td className="px-2 sm:px-4 py-2">HM-{hangMuc.hangMucId}</td>
                    <td className="px-2 sm:px-4 py-2 font-medium">
                      <button
                        onClick={() => toggleItem('hangMuc', hangMuc.hangMucId)}
                        className="flex items-center focus:outline-none"
                      >
                        <span className={`text-xs sm:text-sm transform ${expandedItems.hangMuc[hangMuc.hangMucId] ? 'rotate-90' : ''}`}>▸</span>
                        <span className="ml-1 text-sm sm:text-base">{hangMuc.tenHangMuc}</span>
                      </button>
                    </td>
                    <td colSpan="5" className="px-2 sm:px-4 py-2 text-sm">
                      Vướng mắc: {hangMuc.tongVuongMac} (Đã phê duyệt: {hangMuc.soVuongMacDaPheDuyet} | Chưa phê duyệt: {hangMuc.soVuongMacChuaPheDuyet})
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      <div className="flex space-x-1">
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                          title="Thêm vướng mắc"
                        >
                          <FaPlus size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                          title="Xóa vướng mắc"
                        >
                          <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                          title="Chỉnh sửa"
                        >
                          <FaPencilAlt size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Level 4 - Vướng mắc */}
                  {expandedItems.hangMuc[hangMuc.hangMucId] && hangMuc.danhSachVuongMac?.map((vuongMac, indexVM) => {
                    const isApproved = vuongMac.trangThai === 'Đã phê duyệt';
                    return (
                      <tr
                        key={`vuongmac-${vuongMac.vuongMacId}`}
                        className={`hover:bg-gray-100 ${isApproved ? 'bg-green-50' : 'bg-yellow-50'}`}
                      >
                        <td className="px-2 sm:px-4 py-2 pl-8 sm:pl-12 text-sm">{`${indexGT + 1}.${indexHM + 1}.${indexVM + 1}`}</td>
                        <td className="px-2 sm:px-4 py-2 text-sm">VM-{vuongMac.vuongMacId}</td>
                        <td className="px-2 sm:px-4 py-2 text-sm">{vuongMac.tenCongTac} (KH-{vuongMac.keHoachId})</td>
                        <td className="px-2 sm:px-4 py-2 text-sm">{vuongMac.moTaChiTiet}</td>
                        <td className="px-2 sm:px-4 py-2 text-sm">{vuongMac.bienPhapXuLy || 'Chưa có'}</td>
                        <td className="px-2 sm:px-4 py-2 text-sm">{formatDate(vuongMac.ngayPhatSinh)}</td>
                        <td className="px-2 sm:px-4 py-2 text-sm">{formatDate(vuongMac.ngayKetThuc)}</td>
                        <td className="px-2 sm:px-4 py-2">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${isApproved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {vuongMac.trangThai}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          <div className="flex space-x-1">
                            <button
                              className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                              title="Xóa"
                            >
                              <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                              title="Chỉnh sửa"
                            >
                              <FaPencilAlt size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Mobile Cards (shown on mobile) */}
  <div className="sm:hidden space-y-3">
    {/* Level 1 - Dự án */}
    <div className="bg-green-50 p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-gray-900">DA-{data.duAnThanhPhan.duAnId}</div>
          <div className="text-sm text-gray-700 mt-1">{data.duAnThanhPhan.tenDuAn}</div>
        </div>
        <div className="text-sm font-medium">1</div>
      </div>
      
      <div className="mt-2 text-sm">
        <div className="text-gray-700">Tổng số vướng mắc: {data.duAnThanhPhan.tongVuongMac}</div>
        <div className="text-gray-700">Đã phê duyệt: {data.duAnThanhPhan.tongDaPheDuyet}</div>
        <div className="text-gray-700">Chưa phê duyệt: {data.duAnThanhPhan.tongChuaPheDuyet}</div>
      </div>
      
      <div className="mt-2 flex justify-end">
        <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
          <FaPlus size={14} />
        </button>
      </div>
    </div>

    {/* Level 2 - Gói thầu */}
    {data.duAnThanhPhan.danhSachGoiThau.map((goiThau, indexGT) => (
      <React.Fragment key={`mobile-goithau-${goiThau.goiThauId}`}>
        <div className="bg-yellow-50 p-3 rounded-lg shadow-sm border border-gray-200 ml-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">
                <button
                  onClick={() => toggleItem('goiThau', goiThau.goiThauId)}
                  className="flex items-center focus:outline-none"
                >
                  <span className={`transform ${expandedItems.goiThau[goiThau.goiThauId] ? 'rotate-90' : ''}`}>▸</span>
                  <span className="ml-1">GT-{goiThau.goiThauId}</span>
                </button>
              </div>
              <div className="text-sm text-gray-700 mt-1">{goiThau.tenGoiThau}</div>
            </div>
            <div className="text-sm font-medium">{indexGT + 1}</div>
          </div>
          
          <div className="mt-2 text-sm">
            <div className="text-gray-700">Vướng mắc: {goiThau.tongVuongMac}</div>
            <div className="text-gray-700">Đã phê duyệt: {goiThau.tongDaPheDuyet}</div>
            <div className="text-gray-700">Chưa phê duyệt: {goiThau.tongChuaPheDuyet}</div>
          </div>
          
          <div className="mt-2 flex justify-end space-x-1">
            <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
              <FaPlus size={14} />
            </button>
            <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
              <FaTrash size={14} />
            </button>
          </div>
        </div>

        {/* Level 3 - Hạng mục (chỉ hiển thị khi mở rộng) */}
        {expandedItems.goiThau[goiThau.goiThauId] && goiThau.danhSachHangMuc?.map((hangMuc, indexHM) => (
          <React.Fragment key={`mobile-hangmuc-${hangMuc.hangMucId}`}>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 ml-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    <button
                      onClick={() => toggleItem('hangMuc', hangMuc.hangMucId)}
                      className="flex items-center focus:outline-none"
                    >
                      <span className={`transform ${expandedItems.hangMuc[hangMuc.hangMucId] ? 'rotate-90' : ''}`}>▸</span>
                      <span className="ml-1">HM-{hangMuc.hangMucId}</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{hangMuc.tenHangMuc}</div>
                </div>
                <div className="text-sm font-medium">{indexGT + 1}.{indexHM + 1}</div>
              </div>
              
              <div className="mt-2 text-sm">
                <div className="text-gray-700">Vướng mắc: {hangMuc.tongVuongMac}</div>
                <div className="text-gray-700">Đã phê duyệt: {hangMuc.soVuongMacDaPheDuyet}</div>
                <div className="text-gray-700">Chưa phê duyệt: {hangMuc.soVuongMacChuaPheDuyet}</div>
              </div>
              
              <div className="mt-2 flex justify-end space-x-1">
                <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                  <FaPlus size={14} />
                </button>
                <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                  <FaTrash size={14} />
                </button>
                <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                  <FaPencilAlt size={14} />
                </button>
              </div>
            </div>

            {/* Level 4 - Vướng mắc (chỉ hiển thị khi mở rộng) */}
            {expandedItems.hangMuc[hangMuc.hangMucId] && hangMuc.danhSachVuongMac?.map((vuongMac, indexVM) => {
              const isApproved = vuongMac.trangThai === 'Đã phê duyệt';
              return (
                <div 
                  key={`mobile-vuongmac-${vuongMac.vuongMacId}`}
                  className={`${isApproved ? 'bg-green-50' : 'bg-yellow-50'} p-3 rounded-lg shadow-sm border border-gray-200 ml-9`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">VM-{vuongMac.vuongMacId}</div>
                      <div className="text-sm text-gray-700 mt-1">{vuongMac.tenCongTac} (KH-{vuongMac.keHoachId})</div>
                    </div>
                    <div className="text-sm font-medium">{indexGT + 1}.{indexHM + 1}.{indexVM + 1}</div>
                  </div>
                  
                  <div className="mt-2 text-sm space-y-1">
                    <div>
                      <span className="text-gray-500">Vướng mắc:</span>
                      <div className="text-gray-700">{vuongMac.moTaChiTiet}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Biện pháp:</span>
                      <div className="text-gray-700">{vuongMac.bienPhapXuLy || 'Chưa có'}</div>
                    </div>
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-gray-500">Ngày phát sinh:</span>
                        <div className="text-gray-700">{formatDate(vuongMac.ngayPhatSinh)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Ngày kết thúc:</span>
                        <div className="text-gray-700">{formatDate(vuongMac.ngayKetThuc)}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Trạng thái:</span>
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${isApproved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {vuongMac.trangThai}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-end space-x-1">
                    <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                      <FaTrash size={14} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                      <FaPencilAlt size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </React.Fragment>
    ))}
  </div>
</div>
  );
};

export default ApprovalSubTable;
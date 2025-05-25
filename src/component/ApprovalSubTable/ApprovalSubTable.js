import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';

const ApprovalSubTable = ({ duAnThanhPhanId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({
    goiThau: {},
    loaiHangMuc: {},
    hangMuc: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/hangMuc/${duAnThanhPhanId}/vuongMac`);
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
    <div className="w-full overflow-x-auto p-4">
      <div className="max-h-[750px] overflow-y-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">STT</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Mã số</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[220px]">Công việc</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[300px]">Vướng mắc</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">Biện pháp</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Ngày phát sinh</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Ngày kết thúc</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Level 1 */}
            <tr className="bg-green-50 hover:bg-green-100">
              <td className="px-4 py-2">1</td>
              <td className="px-4 py-2">DA-{data.duAnThanhPhan.duAnId}</td>
              <td className="px-4 py-2 font-medium">{data.duAnThanhPhan.tenDuAn}</td>
              <td colSpan="5" className="px-4 py-2">
                Tổng số vướng mắc: {data.duAnThanhPhan.tongVuongMac}
                (Đã phê duyệt: {data.duAnThanhPhan.tongDaPheDuyet} | Chưa phê duyệt: {data.duAnThanhPhan.tongChuaPheDuyet})
              </td>
            </tr>

            {/* Level 2 */}
            {data.duAnThanhPhan.danhSachGoiThau.map((goiThau, indexGT) => (
              <React.Fragment key={`goithau-${goiThau.goiThauId}`}>
                <tr className="bg-yellow-50 hover:bg-yellow-100">
                  <td className="px-4 py-2">{indexGT + 1}</td>
                  <td className="px-4 py-2">GT-{goiThau.goiThauId}</td>
                  <td className="px-4 py-2 font-medium">
                    <button onClick={() => toggleItem('goiThau', goiThau.goiThauId)} className="flex items-center focus:outline-none">
                      <span className={`transform ${expandedItems.goiThau[goiThau.goiThauId] ? 'rotate-90' : ''}`}>▸</span>
                      <span className="ml-1">{goiThau.tenGoiThau}</span>
                    </button>
                  </td>
                  <td colSpan="5" className="px-4 py-2">
                    Vướng mắc: {goiThau.tongVuongMac} (Đã phê duyệt: {goiThau.tongDaPheDuyet} | Chưa phê duyệt: {goiThau.tongChuaPheDuyet})
                  </td>
                </tr>

                {/* Level 3 */}
                {expandedItems.goiThau[goiThau.goiThauId] && goiThau.danhSachHangMuc?.map((hangMuc, indexHM) => (
                  <React.Fragment key={`hangmuc-${hangMuc.hangMucId}`}>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-2 pl-8">{`${indexGT + 1}.${indexHM + 1}`}</td>
                      <td className="px-4 py-2">HM-{hangMuc.hangMucId}</td>
                      <td className="px-4 py-2 font-medium">
                        <button onClick={() => toggleItem('hangMuc', hangMuc.hangMucId)} className="flex items-center focus:outline-none">
                          <span className={`transform ${expandedItems.hangMuc[hangMuc.hangMucId] ? 'rotate-90' : ''}`}>▸</span>
                          <span className="ml-1">{hangMuc.tenHangMuc}</span>
                        </button>
                      </td>
                      <td colSpan="5" className="px-4 py-2">
                        Vướng mắc: {hangMuc.tongVuongMac} (Đã phê duyệt: {hangMuc.soVuongMacDaPheDuyet} | Chưa phê duyệt: {hangMuc.soVuongMacChuaPheDuyet})
                      </td>
                    </tr>

                    {/* Level 4 */}
                    {expandedItems.hangMuc[hangMuc.hangMucId] && hangMuc.danhSachVuongMac?.map((vuongMac, indexVM) => {
                      const isApproved = vuongMac.trangThai === 'Đã phê duyệt';
                      return (
                        <tr
                          key={`vuongmac-${vuongMac.vuongMacId}`}
                          className={`hover:bg-gray-100 border-t ${isApproved ? 'bg-green-100' : 'bg-yellow-100'} group`}
                        >
                          <td className="px-4 py-2 pl-12">{`${indexGT + 1}.${indexHM + 1}.${indexVM + 1}`}</td>
                          <td className="px-4 py-2">VM-{vuongMac.vuongMacId}</td>
                          <td className="px-4 py-2">{vuongMac.tenCongTac} (KH-{vuongMac.keHoachId})</td>
                          <td className="px-4 py-2 relative">
                            {vuongMac.moTaChiTiet}
                            <div className=" transform opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                              <button 
                                onClick={() => handleAdd(hangMuc.hangMucId, 'hangMuc')}
                                className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                                title="Thêm vướng mắc"
                              >
                                <FaPlus size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(vuongMac.vuongMacId)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                title="Xóa vướng mắc"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2">{vuongMac.bienPhapXuLy || 'Chưa có'}</td>
                          <td className="px-4 py-2">{formatDate(vuongMac.ngayPhatSinh)}</td>
                          <td className="px-4 py-2">{formatDate(vuongMac.ngayKetThuc)}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isApproved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                              {vuongMac.trangThai}
                            </span>
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
  );
};

export default ApprovalSubTable;
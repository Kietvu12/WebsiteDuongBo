import React, { useState, useEffect } from 'react';
import downIcon from '../../assets/img/down.png';
import axios from 'axios';
import { FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';

const SubProjectTable = ({ duAnThanhPhanId }) => {
  const [expandedItems, setExpandedItems] = useState({
    packages: {},
    categories: {},
    items: {}
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressPopup, setProgressPopup] = useState({
    visible: false,
    plan: null,
    progressData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/hangMuc/${duAnThanhPhanId}/detail`);
        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
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

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fetchProgressData = async (keHoachId) => {
    try {
      const response = await axios.get(`http://localhost:5000/tien-do/${keHoachId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return null;
    }
  };

  const handleViewDetails = async (plan) => {
    const progressData = await fetchProgressData(plan.keHoachId);
    setProgressPopup({
      visible: true,
      plan: plan,
      progressData: progressData || []
    });
  };

  const ProgressPopup = ({ visible, plan, progressData, onClose }) => {
    if (!visible) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chi tiết tiến độ: {plan?.tenCongTac}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>
  
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-gray-500">Khối lượng kế hoạch</div>
              <div className="font-semibold">
                {plan?.khoiLuongKeHoach?.toLocaleString()} {plan?.donViTinh}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-gray-500">Đã thực hiện</div>
              <div className="font-semibold">
                {plan?.tongKhoiLuongThucHien?.toLocaleString()} {plan?.donViTinh}
              </div>
            </div>
          </div>
  
          <h4 className="font-medium mb-3">Lịch sử cập nhật tiến độ:</h4>
          <div className="space-y-3">
            {progressData?.length > 0 ? (
              progressData.map((progress, index) => (
                <div key={index} className="border-b pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{formatDate(progress.NgayCapNhat)}</div>
                      <div className="text-blue-600 mt-1">
                        +{progress.KhoiLuongThucHien?.toLocaleString()} {progress.DonViTinh}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Người cập nhật</div>
                      <div>{progress.NguoiCapNhat || 'Không xác định'}</div>
                    </div>
                  </div>
                  
                  {progress.MoTaVuongMac && (
                    <div className="mt-2 bg-yellow-50 p-2 rounded">
                      <div className="text-sm font-medium text-yellow-700">Vướng mắc:</div>
                      <p className="text-sm">{progress.MoTaVuongMac}</p>
                    </div>
                  )}
                  
                  {progress.GhiChu && (
                    <div className="mt-2 bg-gray-50 p-2 rounded">
                      <div className="text-sm font-medium text-gray-700">Ghi chú:</div>
                      <p className="text-sm">{progress.GhiChu}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Chưa có dữ liệu tiến độ thi công
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">No data available</div>;

  return (
    <div className="w-full overflow-x-auto p-2">
      <table className="divide-y divide-gray-200 border text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">STT</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Mã số</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Công việc</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Khối lượng thực hiện</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Khối lượng kế hoạch</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Đơn vị</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Đơn vị thực hiện</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Thời gian (ngày)</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Bắt đầu</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Kết thúc</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.duAnThanhPhan.danhSachGoiThau?.map((packageItem, packageIndex) => (
            <React.Fragment key={`package-${packageItem.goiThauId}`}>
              <tr className="group bg-green-50 hover:bg-green-100">
                <td className="px-3 py-2 whitespace-nowrap pl-8">{`${packageIndex + 1}`}</td>
                <td className="px-3 py-2 whitespace-nowrap">GT-{packageItem.goiThauId}</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  <button
                    onClick={() => toggleItem('packages', packageItem.goiThauId)}
                    className="flex items-center focus:outline-none"
                  >
                    <img
                      src={downIcon}
                      alt="Toggle"
                      className={`w-3 h-3 mr-1 transform ${expandedItems.packages[packageItem.goiThauId] ? 'rotate-180' : ''}`}
                    />
                    <span className="truncate">{packageItem.tenGoiThau}</span>
                  </button>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{packageItem.tongKhoiLuongThucHien?.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap">{packageItem.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap"></td>
                <td className="px-3 py-2 whitespace-nowrap"></td>
                <td className="px-3 py-2 whitespace-nowrap"></td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(packageItem.ngayKhoiCong)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(packageItem.ngayHoanThanh)}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                      title="Thêm hạng mục"
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Level 2: Items - Only show if expanded */}
              {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => (
                <React.Fragment key={`item-${item.hangMucId}`}>
                  <tr className="group bg-yellow-50 hover:bg-yellow-100">
                    <td className="px-3 py-2 whitespace-nowrap pl-12">{`${packageIndex + 1}.${itemIndex + 1}`}</td>
                    <td className="px-3 py-2 whitespace-nowrap">HM-{item.hangMucId}</td>
                    <td className="px-3 py-2 font-medium">
                      <button
                        onClick={() => toggleItem('items', item.hangMucId)}
                        className="flex items-center focus:outline-none"
                      >
                        <img
                          src={downIcon}
                          alt="Toggle"
                          className={`w-3 h-3 mr-1 transform ${expandedItems.items[item.hangMucId] ? 'rotate-180' : ''}`}
                        />
                        <span className="truncate"> Hạng mục: {item.tenHangMuc}</span>
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{item.tongKhoiLuongThucHien?.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{item.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item.danhSachKeHoach?.[0]?.donViTinh || ''}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{item.nhanLucThiCong || ''}</td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                          title="Thêm kế hoạch"
                        >
                          <FaPlus size={14} />
                        </button>
                        <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Xóa"
                          >
                            <FaTrash size={14} />
                          </button>
                      </div>
                    </td>
                  </tr>

                  {/* Level 3: Plans - Only show if expanded */}
                  {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                    <tr
                      key={`plan-${plan.keHoachId}`}
                      className="group bg-white hover:bg-gray-50 border-t"
                    >
                      <td className="px-3 py-2 whitespace-nowrap pl-20">{`${packageIndex + 1}.${itemIndex + 1}.${planIndex + 1}`}</td>
                      <td className="px-3 py-2 whitespace-nowrap">KH-{plan.keHoachId}</td>
                      <td className="px-3 py-2 pl-4">{plan.tenCongTac}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{plan.tongKhoiLuongThucHien?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{plan.khoiLuongKeHoach?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{plan.donViTinh}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{item.nhanLucThiCong}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{calculateDays(plan.ngayBatDau, plan.ngayKetThuc)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(plan.ngayBatDau)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(plan.ngayKetThuc)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Xem chi tiết"
                            onClick={() => handleViewDetails(plan)}
                          >
                            <FaInfoCircle size={14} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                            title="Xóa"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <ProgressPopup
        visible={progressPopup.visible}
        plan={progressPopup.plan}
        progressData={progressPopup.progressData}
        onClose={() => setProgressPopup({ ...progressPopup, visible: false })}
      />
    </div>
  );
};

export default SubProjectTable;
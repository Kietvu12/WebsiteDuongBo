import React, { useState, useEffect } from 'react';
import downIcon from '../../assets/img/down.png';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';


const SubProjectTable = ({ duAnThanhPhanId }) => {
  const [expandedItems, setExpandedItems] = useState({
    packages: {},
    categories: {},
    items: {}
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedPlan: null
  });

  const handleContextMenu = (e, plan) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      selectedPlan: plan
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };
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

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  const toggleItem = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">No data available</div>;

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
  const ContextMenu = ({ x, y, visible, onClose, onViewProgress, plan }) => {
    if (!visible) return null;

    return (
      <div
        className="fixed bg-white shadow-lg rounded-md py-2 z-50"
        style={{ left: `${x}px`, top: `${y}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          onClick={() => {
            onViewProgress(plan);
            onClose();
          }}
        >
          Xem chi tiết tiến độ thi công
        </button>
        <button
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          onClick={onClose}
        >
          Thêm mới kế hoạch
        </button>
      </div>
    );
  };


  const fetchProgressData = async (keHoachId) => {
    try {
      const response = await axios.get(`http://localhost:5000/tien-do/${keHoachId}`);
      setProgressPopup(prev => ({
        ...prev,
        progressData: response.data.danhSachTienDo
      }));
      console.log(keHoachId);

    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const handleViewProgress = (plan) => {
    fetchProgressData(plan.keHoachId);
    setProgressPopup({
      visible: true,
      plan: plan,
      progressData: []
    });
  };
  const ProgressPopup = ({ visible, plan, progressData, onClose }) => {
    if (!visible) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{plan.tenCongTac}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {progressData?.danhSachTienDo?.length > 0 ? (
              progressData.danhSachTienDo.map((progress, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{formatDate(progress.NgayCapNhat)}</span>
                    <span className="text-blue-600">
                      {progress.KhoiLuongThucHien?.toLocaleString()} {progress.DonViTinh}
                    </span>
                  </div>
                  {progress.MoTaVuongMac && (
                    <p className="text-gray-600 mt-1">{progress.MoTaVuongMac}</p>
                  )}
                  {progress.GhiChu && (
                    <p className="text-gray-600 mt-1">{progress.GhiChu}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có dữ liệu tiến độ</p>
            )}
          </div>
        </div>
      </div>
    );
  };
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.duAnThanhPhan.danhSachGoiThau?.map((packageItem, packageIndex) => (
            <React.Fragment key={`package-${packageItem.goiThauId}`}>
              <tr className="group bg-green-50 hover:bg-green-100">
                <td className="px-3 py-2 whitespace-nowrap pl-8">{`${packageIndex + 1}`}</td>
                <td className="px-3 py-2 whitespace-nowrap">GT-{packageItem.goiThauId}</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium relative">
                  <div className="flex flex-col">
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
                    {/* Action buttons that appear on hover */}
                    <div className="flex space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 items-center">
                      <button
                        className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                        title="Thêm hạng mục"
                        onClick={(e) => {
                          e.stopPropagation();
                          // handleAddItem(packageItem.goiThauId);
                        }}
                      >
                        <FaPlus size={14} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                        title="Xóa gói thầu"
                        onClick={(e) => {
                          e.stopPropagation();
                          // handleDeletePackage(packageItem.goiThauId);
                        }}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{packageItem.tongKhoiLuongThucHien?.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap">{packageItem.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap"></td>
                <td className="px-3 py-2 whitespace-nowrap"></td>
                <td className="px-3 py-2 whitespace-nowrap"></td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(packageItem.ngayKhoiCong)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(packageItem.ngayHoanThanh)}</td>
              </tr>

              {/* Level 2: Items - Only show if expanded */}
              {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachHangMuc?.map((item, itemIndex) => (
                <React.Fragment key={`item-${item.hangMucId}`}>
                  <tr className="group bg-yellow-50 hover:bg-yellow-100">
                    <td className="px-3 py-2 whitespace-nowrap pl-12">{`${packageIndex + 1}.${itemIndex + 1}`}</td>
                    <td className="px-3 py-2 whitespace-nowrap">HM-{item.hangMucId}</td>
                    <td className="px-3 py-2 font-medium relative">
                      <div className="flex flex-col">
                        <button
                          onClick={() => toggleItem('items', item.hangMucId)}
                          className="flex items-center focus:outline-none"
                        >
                          <img
                            src={downIcon}
                            alt="Toggle"
                            className={`w-3 h-3 mr-1 transform ${expandedItems.items[item.hangMucId] ? 'rotate-180' : ''}`}
                          />
                          <span className="truncate">{item.tenHangMuc}</span>
                        </button>
                        {/* Nút thêm/xóa hiển thị khi hover */}
                        <div className="flex space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                            title="Thêm kế hoạch"
                          >
                            <FaPlus size={14} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                            title="Xóa hạng mục"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
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
                  </tr>

                  {/* Level 3: Plans - Only show if expanded */}
                  {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                    <tr
                      onContextMenu={(e) => handleContextMenu(e, plan)}
                      key={`plan-${plan.keHoachId}`}
                      className="group bg-white hover:bg-gray-50 border-t"
                    >
                      <td className="px-3 py-2 whitespace-nowrap pl-20">{`${packageIndex + 1}.${itemIndex + 1}.${planIndex + 1}`}</td>
                      <td className="px-3 py-2 whitespace-nowrap">KH-{plan.keHoachId}</td>
                      <td className="px-3 py-2 pl-4 relative">
                        <div className="flex flex-col">
                          <div className="whitespace-nowrap">{plan.tenCongTac}</div>
                          {/* Nút thêm/xóa hiển thị khi hover */}
                          <div className="flex space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                              title="Xóa"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{plan.tongKhoiLuongThucHien?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{plan.khoiLuongKeHoach?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{plan.donViTinh}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{item.nhanLucThiCong}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{calculateDays(plan.ngayBatDau, plan.ngayKetThuc)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(plan.ngayBatDau)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(plan.ngayKetThuc)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={closeContextMenu}
        onViewProgress={handleViewProgress}
        plan={contextMenu.selectedPlan}
      />

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
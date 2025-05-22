import React, { useState, useEffect } from 'react';
import downIcon from '../../assets/img/down.png';

const WorkTable = ({ projectId }) => {
  const [expandedItems, setExpandedItems] = useState({
    projects: {},
    packages: {},
    categories: {},
    items: {}
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log('Đây 0 là dự án thành phần');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/duAn/${projectId}/detail`);
        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

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

  return (
<div className="w-full overflow-x-auto p-2">
  <table className=" w-full divide-y divide-gray-200 border text-sm">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">STT</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Mã số</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Công việc</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">KL thực</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">KL KH</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ĐV</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ĐV thực hiện</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">TG (ngày)</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Bắt đầu</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Kết thúc</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {data.duAnThanhPhan.map((project, projectIndex) => (
        <React.Fragment key={`project-${project.duAnId}`}>
          {/* Level 1: Project (Blue) */}
          <tr className="bg-green-50 hover:bg-green-100">
            <td className="px-3 py-2 whitespace-nowrap">{projectIndex + 1}</td>
            <td className="px-3 py-2 whitespace-nowrap">DA-{project.duAnId}</td>
            <td className="px-3 py-2 whitespace-nowrap font-medium">
              <button 
                onClick={() => toggleItem('projects', project.duAnId)}
                className="flex items-center focus:outline-none"
              >
                <img 
                  src={downIcon} 
                  alt="Toggle" 
                  className={`w-3 h-3 mr-1 transform ${expandedItems.projects[project.duAnId] ? 'rotate-180' : ''}`}
                />
                <span className="truncate">{project.tenDuAn}</span>
              </button>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">{project.tongKhoiLuongThucHien?.toLocaleString()}</td>
            <td className="px-3 py-2 whitespace-nowrap">{project.tongKhoiLuongKeHoach?.toLocaleString()}</td>
            <td className="px-3 py-2 whitespace-nowrap"></td>
            <td className="px-3 py-2 whitespace-nowrap"></td>
            <td className="px-3 py-2 whitespace-nowrap"></td>
            <td className="px-3 py-2 whitespace-nowrap"></td>
            <td className="px-3 py-2 whitespace-nowrap"></td>
          </tr>

          {/* Level 2: Packages (Yellow) - Only show if expanded */}
          {expandedItems.projects[project.duAnId] && project.danhSachGoiThau?.map((packageItem, packageIndex) => (
            <React.Fragment key={`package-${packageItem.goiThauId}`}>
              <tr className="bg-yellow-50 hover:bg-yellow-100">
                <td className="px-3 py-2 whitespace-nowrap pl-8">{`${projectIndex + 1}.${packageIndex + 1}`}</td>
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
              </tr>

              {/* Level 3: Categories (Gray) - Only show if expanded */}
              {expandedItems.packages[packageItem.goiThauId] && packageItem.danhSachLoaiHangMuc?.map((category, categoryIndex) => (
                <React.Fragment key={`category-${category.loaiHangMuc}`}>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="px-3 py-2 whitespace-nowrap pl-12">{`${projectIndex + 1}.${packageIndex + 1}.${categoryIndex + 1}`}</td>
                    <td className="px-3 py-2 whitespace-nowrap">HM-{category.loaiHangMuc}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium">
                      <button 
                        onClick={() => toggleItem('categories', `${packageItem.goiThauId}-${category.loaiHangMuc}`)}
                        className="flex items-center focus:outline-none"
                      >
                        <img 
                          src={downIcon} 
                          alt="Toggle" 
                          className={`w-3 h-3 mr-1 transform ${expandedItems.categories[`${packageItem.goiThauId}-${category.loaiHangMuc}`] ? 'rotate-180' : ''}`}
                        />
                        <span className="truncate">{category.loaiHangMuc}</span>
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{category.tongKhoiLuongThucHien?.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{category.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                    <td className="px-3 py-2 whitespace-nowrap"></td>
                  </tr>

                  {/* Level 4: Items (White) - Only show if expanded */}
                  {expandedItems.categories[`${packageItem.goiThauId}-${category.loaiHangMuc}`] && category.danhSachHangMuc?.map((item, itemIndex) => (
                    <React.Fragment key={`item-${item.hangMucId}`}>
                      <tr className="bg-white hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap pl-16">{`${projectIndex + 1}.${packageIndex + 1}.${categoryIndex + 1}.${itemIndex + 1}`}</td>
                        <td className="px-3 py-2 whitespace-nowrap">CT-{item.hangMucId}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button 
                            onClick={() => toggleItem('items', item.hangMucId)}
                            className="flex items-center focus:outline-none"
                          >
                            <span className="truncate">{item.tenHangMuc}</span>
                          </button>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.tongKhoiLuongThucHien?.toLocaleString()}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.tongKhoiLuongKeHoach?.toLocaleString()}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {item.danhSachKeHoach?.[0]?.donViTinh || ''}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.nhanLucThiCong || ''}</td>
                        <td className="px-3 py-2 whitespace-nowrap"></td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(item.thoiGianHoanThanh)}</td>
                        <td className="px-3 py-2 whitespace-nowrap"></td>
                      </tr>

                      {/* Work Plans - Only show if expanded */}
                      {expandedItems.items[item.hangMucId] && item.danhSachKeHoach?.map((plan, planIndex) => (
                        <tr key={`plan-${plan.keHoachId}`} className="bg-white hover:bg-gray-50 border-t">
                          <td className="px-3 py-2 whitespace-nowrap pl-20">{`${projectIndex + 1}.${packageIndex + 1}.${categoryIndex + 1}.${itemIndex + 1}.${planIndex + 1}`}</td>
                          <td className="px-3 py-2 whitespace-nowrap">KH-{plan.keHoachId}</td>
                          <td className="px-3 py-2 whitespace-nowrap pl-4">{plan.tenCongTac}</td>
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
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default WorkTable;
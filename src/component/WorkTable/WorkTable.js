
import React, { useState, useEffect } from 'react';
import './WorkTable.css';
import downIcon from '../../assets/img/down.png';

const WorkTable = ({ projectId }) => {
  const [expandedItems, setExpandedItems] = useState({
    projects: {},
    packages: {},
    categories: {}
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

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

  const renderPlanRow = (plan, indexes) => {
    return (
      <tr key={`plan-${plan.keHoachId}`}>
        <td>{indexes.join('.')}</td>
        <td>{plan.keHoachId}</td>
        <td>
          <span style={{ paddingLeft: `${60 + (indexes.length - 1) * 20}px` }}>
            {plan.tenCongTac}
          </span>
        </td>
        <td>{plan.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
        <td>{plan.khoiLuongKeHoach?.toLocaleString() || '0'}</td>
        <td>{plan.donViTinh || '-'}</td>
        <td>-</td>
        <td>{calculateDays(plan.ngayBatDau, plan.ngayKetThuc)}</td>
        <td>{formatDate(plan.ngayBatDau)}</td>
        <td>{formatDate(plan.ngayKetThuc)}</td>
      </tr>
    );
  };

  return (
    <div className="table-container-sub">
      <table className="work-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã số</th>
            <th>Công việc</th>
            <th>Khối lượng thực hiện</th>
            <th>Khối lượng kế hoạch</th>
            <th>Đơn vị</th>
            <th>Đơn vị thực hiện</th>
            <th>Thời gian (ngày)</th>
            <th>Bắt đầu kế hoạch</th>
            <th>Kết thúc kế hoạch</th>
          </tr>
        </thead>
        <tbody>
          {data.duAnThanhPhan.map((project, projectIndex) => (
            <React.Fragment key={`project-${project.duAnId}`}>
              {/* Project row */}
              <tr 
                className="project-header" 
                onClick={() => toggleItem('projects', project.duAnId)}
              >
                <td>{projectIndex + 1}.</td>
                <td>{project.duAnId}</td>
                <td>
                  <img 
                    src={downIcon} 
                    alt="Toggle" 
                    className={`dropdown-icon ${expandedItems.projects[project.duAnId] ? '' : 'collapsed'}`}
                  />
                  {project.tenDuAn}
                </td>
                <td>{project.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
                <td>{project.tongKhoiLuongKeHoach?.toLocaleString() || '0'}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>

              {/* Package rows - only visible when project is expanded */}
              {expandedItems.projects[project.duAnId] && 
                project.danhSachGoiThau?.map((pkg, pkgIndex) => (
                  <React.Fragment key={`pkg-${pkg.goiThauId}`}>
                    <tr 
                      className="package-header"
                      onClick={() => toggleItem('packages', pkg.goiThauId)}
                    >
                      <td>{`${projectIndex + 1}.${pkgIndex + 1}`}</td>
                      <td>{pkg.goiThauId}</td>
                      <td>
                        <span style={{ paddingLeft: '20px' }}>
                          <img 
                            src={downIcon} 
                            alt="Toggle" 
                            className={`dropdown-icon ${expandedItems.packages[pkg.goiThauId] ? '' : 'collapsed'}`}
                          />
                          {pkg.tenGoiThau}
                        </span>
                      </td>
                      <td>{pkg.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
                      <td>{pkg.tongKhoiLuongKeHoach?.toLocaleString() || '0'}</td>
                      <td>-</td>
                      <td>{pkg.nhaThauID || '-'}</td>
                      <td>{calculateDays(pkg.ngayKhoiCong, pkg.ngayHoanThanh)}</td>
                      <td>{formatDate(pkg.ngayKhoiCong)}</td>
                      <td>{formatDate(pkg.ngayHoanThanh)}</td>
                    </tr>

                    {expandedItems.packages[pkg.goiThauId] && 
                      pkg.danhSachLoaiHangMuc?.map((category, categoryIndex) => (
                        <React.Fragment key={`category-${pkg.goiThauId}-${category.loaiHangMuc}`}>
                          <tr 
                            className="category-header"
                            onClick={() => toggleItem('categories', `${pkg.goiThauId}-${category.loaiHangMuc}`)}
                          >
                            <td>{`${projectIndex + 1}.${pkgIndex + 1}.${categoryIndex + 1}`}</td>
                            <td>{category.loaiHangMuc}</td>
                            <td>
                              <span style={{ paddingLeft: '40px' }}>
                                <img 
                                  src={downIcon} 
                                  alt="Toggle" 
                                  className={`dropdown-icon ${expandedItems.categories[`${pkg.goiThauId}-${category.loaiHangMuc}`] ? '' : 'collapsed'}`}
                                />
                                {category.loaiHangMuc}
                              </span>
                            </td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                          </tr>

                          {expandedItems.categories[`${pkg.goiThauId}-${category.loaiHangMuc}`] && 
                            category.danhSachHangMuc?.map((item, itemIndex) => (
                              <React.Fragment key={`item-${item.hangMucId}`}>
                                <tr className="work-item">
                                  <td>{`${projectIndex + 1}.${pkgIndex + 1}.${categoryIndex + 1}.${itemIndex + 1}`}</td>
                                  <td>{item.hangMucId}</td>
                                  <td>
                                    <span style={{ paddingLeft: '60px' }}>
                                      {item.tenHangMuc}
                                    </span>
                                  </td>
                                  <td>{item.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
                                  <td>{item.tongKhoiLuongKeHoach?.toLocaleString() || '0'}</td>
                                  <td>{item.danhSachKeHoach?.[0]?.donViTinh || '-'}</td>
                                  <td>-</td>
                                  <td>{calculateDays(item.danhSachKeHoach?.[0]?.ngayBatDau, item.danhSachKeHoach?.[0]?.ngayKetThuc)}</td>
                                  <td>{formatDate(item.danhSachKeHoach?.[0]?.ngayBatDau)}</td>
                                  <td>{formatDate(item.danhSachKeHoach?.[0]?.ngayKetThuc)}</td>
                                </tr>
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
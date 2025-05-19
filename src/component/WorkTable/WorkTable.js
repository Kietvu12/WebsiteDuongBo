// WorkTable.js
import React, { useState, useEffect } from 'react';
import './WorkTable.css';
import downIcon from '../../assets/img/down.png';

const WorkTable = ({ projectId }) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/duAnThanhPhan/${projectId}/detail`);
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

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
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
            <React.Fragment key={`project-${project.DuAnID}`}>
              {/* Project row */}
              <tr 
                className="project-header" 
                onClick={() => toggleGroup(`project-${project.DuAnID}`)}
              >
                <td>{projectIndex + 1}.</td>
                <td>{project.DuAnID}</td>
                <td>
                  <img 
                    src={downIcon} 
                    alt="Toggle" 
                    className={`dropdown-icon ${expandedGroups[`project-${project.DuAnID}`] ? '' : 'collapsed'}`}
                  />
                  {project.TenDuAn}
                </td>
                <td>{project.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
                <td>{project.tongKhoiLuongKeHoach?.toLocaleString() || '0'}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>

              {/* Package rows */}
              {project.goiThau?.map((pkg, pkgIndex) => (
                <React.Fragment key={`pkg-${pkg.GoiThau_ID}`}>
                  <tr 
                    className={`package-header ${expandedGroups[`project-${project.DuAnID}`] ? 'visible' : 'hidden'}`}
                    onClick={() => toggleGroup(`pkg-${pkg.GoiThau_ID}`)}
                  >
                    <td>{`${projectIndex + 1}.${pkgIndex + 1}`}</td>
                    <td>{pkg.GoiThau_ID}</td>
                    <td>
                      <span style={{paddingLeft: '20px'}}>
                        <img 
                          src={downIcon} 
                          alt="Toggle" 
                          className={`dropdown-icon ${expandedGroups[`pkg-${pkg.GoiThau_ID}`] ? '' : 'collapsed'}`}
                        />
                        {pkg.TenGoiThau}
                      </span>
                    </td>
                    <td>{pkg.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
                    <td>{pkg.tongKhoiLuongKeHoach?.toLocaleString() || '0'}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{calculateDays(pkg.NgayKhoiCong, pkg.NgayHoanThanh)}</td>
                    <td>{formatDate(pkg.NgayKhoiCong)}</td>
                    <td>{formatDate(pkg.NgayHoanThanh)}</td>
                  </tr>

                  {/* Work item rows */}
                  {pkg.hangMuc?.map((item, itemIndex) => (
                    <tr 
                      key={`item-${item.HangMucID}`} 
                      className={`work-item ${expandedGroups[`project-${project.DuAnID}`] && expandedGroups[`pkg-${pkg.GoiThau_ID}`] ? 'visible' : 'hidden'}`}
                    >
                      <td>{`${projectIndex + 1}.${pkgIndex + 1}.${itemIndex + 1}`}</td>
                      <td>{item.HangMucID}</td>
                      <td>
                        <span style={{paddingLeft: '40px'}}>
                          {item.TenHangMuc}
                        </span>
                      </td>
                      <td>{item.tongKhoiLuongThucHien?.toLocaleString() || '0'}</td>
                      <td>{item.tongKhoiLuongKeHoach?.toLocaleString() || '0'}</td>
                      <td>
                        {item.keHoach?.[0]?.DonViTinh || '-'}
                      </td>
                      <td>-</td>
                      <td>{calculateDays(item.keHoach?.[0]?.NgayBatDau, item.keHoach?.[0]?.NgayKetThuc)}</td>
                      <td>{formatDate(item.keHoach?.[0]?.NgayBatDau)}</td>
                      <td>{formatDate(item.keHoach?.[0]?.NgayKetThuc)}</td>
                    </tr>
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
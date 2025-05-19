import React, { useState, useEffect } from 'react';
import { 
  FaListOl,
  FaHashtag,
  FaBuilding, 
  FaProjectDiagram, 
  FaBoxOpen, 
  FaTasks,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import axios from 'axios';
import './ProjectMenu.css';

const ProjectMenu = ({ projectId, onItemSelect }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({
    projects: {},
    packages: {},
    workItems: {}
  });
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/duAnThanhPhan/${projectId}/detail`);
        setData(response.data.data);
        
        // Auto-expand the main project by default
        if (response.data.data?.duAnTong?.DuAnID) {
          setExpandedItems(prev => ({
            ...prev,
            projects: { [response.data.data.duAnTong.DuAnID]: true }
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Toggle expand/collapse
  const toggleExpand = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  // Handle item selection
  const handleSelect = (item, type) => {
    setSelectedItem({ ...item, type });
    if (onItemSelect) {
      onItemSelect({ ...item, type });
    }
  };

  if (loading) return <div className="loading-message">Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">Lỗi: {error}</div>;
  if (!data) return <div className="no-data">Không có dữ liệu dự án</div>;

  return (
    <div className="content-wrapper">
      <div className="column">
        <div className="card bid-package-card">
          <div className="bid-package-header">
            <FaListOl className="header-icon" />
            DANH SÁCH DỰ ÁN & GÓI THẦU
          </div>

          <div className="bid-list hierarchy-list">
            {/* Main Project */}
            <div 
              className={`bid-item main-project ${selectedItem?.type === 'main' ? 'selected' : ''}`}
              onClick={() => handleSelect(data.duAnTong, 'main')}
            >
              <div className="bid-code">
                <FaBuilding className="bid-icon" /> DA-{data.duAnTong.DuAnID}
              </div>
              <div className="bid-content">
                {data.duAnTong.TenDuAn}
                <div className="project-status">{data.duAnTong.TrangThai}</div>
              </div>
            </div>

            {/* Sub Projects */}
            {data.duAnThanhPhan.map(subProject => (
              <React.Fragment key={subProject.DuAnID}>
                <div 
                  className={`bid-item sub-project ${selectedItem?.type === 'sub' && selectedItem?.DuAnID === subProject.DuAnID ? 'selected' : ''}`}
                  onClick={() => {
                    toggleExpand('projects', subProject.DuAnID);
                    handleSelect(subProject, 'sub');
                  }}
                >
                  <div className="bid-code">
                    <FaProjectDiagram className="bid-icon" /> DA-{subProject.DuAnID}
                  </div>
                  <div className="bid-content">
                    {subProject.TenDuAn}
                    <div className="project-status">{subProject.TrangThai}</div>
                  </div>
                  <div className="toggle-icon">
                    {expandedItems.projects[subProject.DuAnID] ? 
                      <FaChevronDown /> : 
                      <FaChevronRight />
                    }
                  </div>
                </div>

                {/* Packages - only show if expanded */}
                {expandedItems.projects[subProject.DuAnID] && (
                  <div className="packages-container">
                    {subProject.goiThau.map(pkg => (
                      <React.Fragment key={pkg.GoiThau_ID}>
                        <div 
                          className={`bid-item package ${selectedItem?.type === 'package' && selectedItem?.GoiThau_ID === pkg.GoiThau_ID ? 'selected' : ''}`}
                          onClick={() => {
                            toggleExpand('packages', pkg.GoiThau_ID);
                            handleSelect(pkg, 'package');
                          }}
                        >
                          <div className="bid-code">
                            <FaBoxOpen className="bid-icon" /> GOI-{pkg.GoiThau_ID}
                          </div>
                          <div className="bid-content">
                            {pkg.TenGoiThau}
                            <div className="progress-status">{pkg.phanTramHoanThanh}% hoàn thành</div>
                          </div>
                          {pkg.hangMuc?.length > 0 && (
                            <div className="toggle-icon">
                              {expandedItems.packages[pkg.GoiThau_ID] ? 
                                <FaChevronDown /> : 
                                <FaChevronRight />
                              }
                            </div>
                          )}
                        </div>

                        {/* Work Items - only show if expanded */}
                        {expandedItems.packages[pkg.GoiThau_ID] && pkg.hangMuc?.length > 0 && (
                          <div className="work-items-container">
                            {pkg.hangMuc.map(workItem => (
                              <div 
                                key={workItem.HangMucID} 
                                className={`bid-item work-item ${selectedItem?.type === 'work' && selectedItem?.HangMucID === workItem.HangMucID ? 'selected' : ''}`}
                                onClick={() => handleSelect(workItem, 'work')}
                              >
                                <div className="bid-code">
                                  <FaTasks className="bid-icon" /> HM-{workItem.HangMucID}
                                </div>
                                <div className="bid-content">
                                  {workItem.TenHangMuc}
                                  <div className="progress-status">{workItem.phanTramHoanThanh}% hoàn thành</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMenu;
import React, { useState, useEffect } from 'react';
import { 
  FaListOl,
  FaProjectDiagram, 
  FaBoxOpen, 
  FaTasks,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaChevronUp
} from 'react-icons/fa';
import axios from 'axios';
import './ProjectMenu.css';
import { useProject } from '../../contexts/ProjectContext';

const ProjectMenu = ({ projectId, onItemSelect }) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedProjectId, selectedSubProjectId } = useProject();
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({
    packages: {},
    workItems: {},
    plans: {}
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/duAnThanhPhan/${selectedSubProjectId}/detail`);
        setProjectData(response.data.data);
        
        // Auto-expand the project by default
        setExpandedItems(prev => ({
          ...prev,
          project: true
        }));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching project data:', err);
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

  // Handle plan selection (will close menu on mobile)
  const handlePlanSelect = (plan) => {
    setSelectedItem({ ...plan, type: 'plan' });
    if (onItemSelect) {
      onItemSelect({ ...plan, type: 'plan' });
    }
    // Close menu on mobile when selecting a plan
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  // Handle other item selections (won't close menu)
  const handleItemSelect = (item, type) => {
    setSelectedItem({ ...item, type });
    if (onItemSelect) {
      onItemSelect({ ...item, type });
    }
  };

  if (loading) return <div className="loading-message">Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">Lỗi: {error}</div>;
  if (!projectData) return <div className="no-data">Không có dữ liệu dự án</div>;

  return (
    <div className="p-4">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-2">
        <button 
          className="w-full flex items-center justify-between bg-white border border-gray-300 rounded px-4 py-2 text-blue-700 font-semibold text-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="flex items-center gap-2">
            <FaListOl className="text-blue-600" />
            DANH SÁCH DỰ ÁN & GÓI THẦU
          </div>
          {mobileMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Menu Content */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="w-full">
          <div className="bg-white rounded shadow">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-3 text-blue-700 font-semibold text-sm">
              <FaListOl className="text-blue-600" />
              DANH SÁCH DỰ ÁN & GÓI THẦU
            </div>

            {/* Project Header */}
            <div
              className={`flex justify-between items-center px-4 py-3 border-b cursor-pointer transition hover:bg-gray-100 ${
                selectedItem?.type === 'project' ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
              onClick={() => handleItemSelect(projectData, 'project')}
            >
              <div className="flex gap-2 items-center text-sm text-gray-700">
                <FaProjectDiagram className="text-blue-600" />
                <span className="font-semibold">DA-{projectData.DuAnID}</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="text-gray-800 font-medium">{projectData.TenDuAn}</div>
                <div className="text-xs text-gray-500">{projectData.phanTramHoanThanh}% hoàn thành</div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedItems((prev) => ({ ...prev, project: !prev.project }));
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedItems.project ? <FaChevronDown /> : <FaChevronRight />}
              </div>
            </div>

            {/* Gói thầu */}
            {expandedItems.project && projectData.goiThau && (
              <div className="ml-4 border-l border-gray-200">
                {projectData.goiThau.map((pkg) => (
                  <div key={pkg.GoiThau_ID}>
                    <div
                      className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 ${
                        selectedItem?.type === 'package' && selectedItem?.GoiThau_ID === pkg.GoiThau_ID
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : ''
                      }`}
                      onClick={() => {
                        toggleExpand('packages', pkg.GoiThau_ID);
                        handleItemSelect(pkg, 'package');
                      }}
                    >
                      <div className="flex gap-2 items-center text-sm text-gray-700">
                        <FaBoxOpen className="text-green-600" />
                        <span className="font-semibold">GOI-{pkg.GoiThau_ID}</span>
                      </div>
                      <div className="flex-1 ml-4">
                        <div>{pkg.TenGoiThau}</div>
                        <div className="text-xs text-gray-500">{pkg.phanTramHoanThanh}% hoàn thành</div>
                      </div>
                      {pkg.hangMuc?.length > 0 && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedItems.packages[pkg.GoiThau_ID] ? <FaChevronDown /> : <FaChevronRight />}
                        </div>
                      )}
                    </div>

                    {/* Hạng mục */}
                    {expandedItems.packages[pkg.GoiThau_ID] && pkg.hangMuc && (
                      <div className="ml-4 border-l border-gray-200">
                        {pkg.hangMuc.map((workItem) => (
                          <div key={workItem.HangMucID}>
                            <div
                              className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 ${
                                selectedItem?.type === 'work' && selectedItem?.HangMucID === workItem.HangMucID
                                  ? 'bg-blue-50 border-l-4 border-blue-600'
                                  : ''
                              }`}
                              onClick={() => {
                                toggleExpand('workItems', workItem.HangMucID);
                                handleItemSelect(workItem, 'work');
                              }}
                            >
                              <div className="flex gap-2 items-center text-sm text-gray-700">
                                <FaTasks className="text-yellow-600" />
                                <span className="font-semibold">HM-{workItem.HangMucID}</span>
                              </div>
                              <div className="flex-1 ml-4">
                                <div>{workItem.TenHangMuc}</div>
                                <div className="text-xs text-gray-500">{workItem.phanTramHoanThanh}% hoàn thành</div>
                              </div>
                              {workItem.keHoach?.length > 0 && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {expandedItems.workItems[workItem.HangMucID] ? (
                                    <FaChevronDown />
                                  ) : (
                                    <FaChevronRight />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Kế hoạch */}
                            {expandedItems.workItems[workItem.HangMucID] && workItem.keHoach && (
                              <div className="ml-4 border-l border-gray-200">
                                {workItem.keHoach.map((plan) => (
                                  <div
                                    key={plan.KeHoachID}
                                    className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 ${
                                      selectedItem?.type === 'plan' && selectedItem?.KeHoachID === plan.KeHoachID
                                        ? 'bg-blue-50 border-l-4 border-blue-600'
                                        : ''
                                    }`}
                                    onClick={() => handlePlanSelect(plan)}
                                  >
                                    <div className="flex gap-2 items-center text-sm text-gray-700">
                                      <FaCalendarAlt className="text-purple-600" />
                                      <span className="font-semibold">KH-{plan.KeHoachID}</span>
                                    </div>
                                    <div className="flex-1 ml-4">
                                      <div>{plan.TenCongTac}</div>
                                      <div className="text-xs text-gray-500">
                                        {plan.phanTramHoanThanh}% hoàn thành
                                        <div className="text-xs text-gray-400">{plan.TenNhaThau}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMenu;
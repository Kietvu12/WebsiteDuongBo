import React, { useState, useEffect, useMemo, useRef } from 'react';

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

const ProjectMenu = ({ projectId, onItemSelect,onPlanSelect }) => {
  const restoredRef = useRef(false);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({
    project: true,
    packages: {},
    workItems: {},
    plans: {}
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/hangMuc/${projectId}/detail`);
        setProjectData(response.data.data);
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
  const combinedPackages = useMemo(() => {
    return [].concat(
      projectData?.duAnThanhPhan?.danhSachGoiThau || [],
      projectData?.duAnTong?.danhSachGoiThauTrucTiep || [],
      projectData?.duAnTong?.danhSachDuAnCon?.flatMap(duAnCon => duAnCon.danhSachGoiThau) || []
    );
  }, [projectData]);
  useEffect(() => {
    if (combinedPackages.length === 0 || Object.keys(expandedItems.packages).length > 0) return;

    const newPackages = {};
    const newWorkItems = {};

    combinedPackages.forEach((pkg) => {
      newPackages[pkg.goiThauId] = true;
      pkg.danhSachHangMuc?.forEach((workItem) => {
        newWorkItems[workItem.hangMucId] = true;
      });
    });

    setExpandedItems(prev => ({
      ...prev,
      packages: newPackages,
      workItems: newWorkItems
    }));
  }, [combinedPackages, expandedItems.packages]);
  useEffect(() => {
    if (!projectData || restoredRef.current) return;
  
    const last = localStorage.getItem('lastSelectedPlan');
    if (!last) return;
  
    const lastPlan = JSON.parse(last);
    const foundPlan = combinedPackages
      .flatMap(pkg =>
        (pkg.danhSachHangMuc || []).flatMap(workItem =>
          (workItem.danhSachKeHoach || []).map(plan => ({
            ...plan,
            parent: {
              packageId: pkg.goiThauId,
              workItemId: workItem.hangMucId,
              workItemName: workItem.tenHangMuc,
              projectName: projectData.tenDuAn || projectData.duAnTong?.tenDuAn
            }
          }))
        )
      )
      .find(plan => plan.keHoachId === lastPlan.keHoachId);
  
    if (foundPlan) {
      restoredRef.current = true;
  
      setExpandedItems(prev => ({
        ...prev,
        project: true,
        packages: {
          ...prev.packages,
          [foundPlan.parent.packageId]: true
        },
        workItems: {
          ...prev.workItems,
          [foundPlan.parent.workItemId]: true
        }
      }));
  
      setSelectedItem({ ...foundPlan, type: 'plan' });
      if (onItemSelect) {
        onItemSelect(
          { ...foundPlan, type: 'plan' },
          {
            tenDuAn: foundPlan.parent.projectName,
            tenHangMuc: foundPlan.parent.workItemName
          }
        );
      }
    }
  }, [projectData, combinedPackages, onItemSelect]);
  const toggleExpand = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };
  const handlePlanSelect = (plan) => {
    const selected = { ...plan, type: 'plan' };
    setSelectedItem(selected);
    localStorage.setItem('lastSelectedPlan', JSON.stringify(selected));

    if (onItemSelect) {
      onItemSelect(selected);
    }
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };
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
              className={`flex justify-between items-center px-4 py-3 border-b cursor-pointer transition hover:bg-gray-100 ${selectedItem?.type === 'project' ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              onClick={() => handleItemSelect(projectData, 'project')}
            >
              <div className="flex gap-2 items-center text-sm text-gray-700">
                <FaProjectDiagram className="text-blue-600" />
                <span className="font-semibold">DA-{projectData.duAnId || projectData.duAnTong?.duAnId}</span>
              </div>
              <div className="flex-1 ml-4">
                <div className="text-gray-800 font-medium">
                  {projectData.tenDuAn || projectData.duAnTong?.tenDuAn}
                </div>
                <div className="text-xs text-gray-500">
                  {projectData.phanTramHoanThanh || projectData.duAnTong?.phanTramHoanThanh}% hoàn thành
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedItems(prev => ({ ...prev, project: !prev.project }));
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedItems.project ? <FaChevronDown /> : <FaChevronRight />}
              </div>
            </div>

            {/* Gói thầu */}
            {expandedItems.project && combinedPackages.length > 0 && (
              <div className="ml-4 border-l border-gray-200">
                <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b">
                  <h3 className="text-xs font-bold text-gray-600">Danh sách gói thầu</h3>
                  <input
                    type="text"
                    placeholder="Tìm..."
                    className="w-24 px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-200"
                    disabled
                  />
                </div>
                {combinedPackages.map((pkg) => (
                  <div key={pkg.goiThauId}>
                    <div
                      className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 ${selectedItem?.type === 'package' && selectedItem?.goiThauId === pkg.goiThauId
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : ''
                        }`}
                      onClick={() => {
                        toggleExpand('packages', pkg.goiThauId);
                        handleItemSelect(pkg, 'package');
                      }}
                    >
                      <div className="flex gap-2 items-center text-sm text-gray-700">
                        <FaBoxOpen className="text-green-600" />
                        <span className="font-semibold">GOI-{pkg.goiThauId}</span>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="font-semibold text-xs">{pkg.tenGoiThau}</div>
                        <div className="text-xs text-gray-500">{pkg.phanTramHoanThanh}% hoàn thành</div>
                      </div>
                      {pkg.danhSachHangMuc?.length > 0 && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedItems.packages[pkg.goiThauId] ? <FaChevronDown /> : <FaChevronRight />}
                        </div>
                      )}
                    </div>

                    {/* Hạng mục */}
                    {expandedItems.packages[pkg.goiThauId] && pkg.danhSachHangMuc?.length > 0 && (
                      <div className="ml-4 border-l border-gray-200">
                        <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b">
                          <h3 className="text-xs font-bold text-gray-600">Hạng mục thực hiện</h3>
                          <input
                            type="text"
                            placeholder="Tìm..."
                            className="w-24 px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-200"
                            disabled
                          />
                        </div>
                        {pkg.danhSachHangMuc.map((workItem) => (
                          <div key={workItem.hangMucId}>
                            <div
                              className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 ${selectedItem?.type === 'work' && selectedItem?.hangMucId === workItem.hangMucId
                                ? 'bg-blue-50 border-l-4 border-blue-600'
                                : ''
                                }`}
                              onClick={() => {
                                toggleExpand('workItems', workItem.hangMucId);
                                handleItemSelect(workItem, 'work');
                              }}
                            >
                              <div className="flex gap-2 items-center text-sm text-gray-700">
                                <FaTasks className="text-yellow-600" />
                                <span className="font-semibold">HM-{workItem.hangMucId}</span>
                              </div>
                              <div className="flex-1 ml-4">
                                <div className="font-semibold text-xs">{workItem.tenHangMuc}</div>
                                <div className="text-xs text-gray-500">{workItem.phanTramHoanThanh}% hoàn thành</div>
                              </div>
                              {workItem.danhSachKeHoach?.length > 0 && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {expandedItems.workItems[workItem.hangMucId] ? (
                                    <FaChevronDown />
                                  ) : (
                                    <FaChevronRight />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Kế hoạch */}
                            {expandedItems.workItems[workItem.hangMucId] && workItem.danhSachKeHoach?.length > 0 && (
                              <div className="ml-4 border-l border-gray-200">
                                <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b">
                                  <h3 className="text-xs font-bold text-gray-600">Kế hoạch thực hiện</h3>
                                  <input
                                    type="text"
                                    placeholder="Tìm..."
                                    className="w-24 px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-200"
                                    disabled
                                  />
                                </div>
                                {workItem.danhSachKeHoach.map((plan) => (
                                  <div
                                    key={plan.keHoachId}
                                    className={`flex justify-between items-center px-4 py-2 cursor-pointer border-b hover:bg-gray-50 ${selectedItem?.type === 'plan' && selectedItem?.keHoachId === plan.keHoachId
                                      ? 'bg-blue-50 border-l-4 border-blue-600'
                                      : ''
                                      }`}
                                      onClick={() => {
                                        const context = {
                                          tenDuAn: projectData.tenDuAn || projectData.duAnTong?.tenDuAn,
                                          tenHangMuc: workItem.tenHangMuc
                                        };
                                        
                                        handlePlanSelect(plan);
                                        onPlanSelect( // Sử dụng trực tiếp prop đã destructure
                                          { ...plan, type: 'plan' },
                                          context
                                        );
                                      }}
                                  >
                                    <div className="flex gap-2 items-center text-sm text-gray-700">
                                      <FaCalendarAlt className="text-purple-600" />
                                      <span className="font-semibold">KH-{plan.keHoachId}</span>
                                    </div>
                                    <div className="flex-1 ml-4">
                                      <div className="font-semibold text-xs">{plan.tenCongTac}</div>
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
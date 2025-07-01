import './Detail.css';
import React, { useEffect, useState, useRef } from 'react';
import { FaExpand, FaCompress, FaFileWord, FaRegBell } from 'react-icons/fa';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import menuIcon from '../../assets/img/menu-icon.png';
import helpIcon from '../../assets/img/help-icon.png';
import userIcon from '../../assets/img/user-icon.png';
import List from '../../component/List/List';
import BasicInfo from '../../component/BasicInfo/BasicInfo';
import ProgressChart from '../../component/ProgressChart/ProgressChart';
import ConstructionProgress from '../../component/ConstructionProgress/ConstructionProgress';
import ContractorInfo from '../../component/ContractorInfo/ContractorInfo';
import ConstructionVolume from '../../component/ConstructionVolume/ConstructionVolume';
import MapView from '../../component/MapView/MapView';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProject } from '../../contexts/ProjectContext';
import AddNewPackage from '../AddNewPackage/AddNewPackage';

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

const Detail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);

  const { logout } = useProject();
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useClickOutside(menuRef, () => {
    setShowMenu(false);
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const fetchPackageDetails = async () => {
    if (!selectedPackageId) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/goiThau/chiTiet/${selectedPackageId}`);
      setPackageData(response.data.data);
      setSelectedProject(response.data.data);
    } catch (error) {
      console.error('Error fetching package details:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {


    fetchPackageDetails();
  }, [selectedPackageId]);

  if (!state) {
    return <div>Không có dữ liệu chi tiết</div>;
  }

  const { projectName, subProjectName, subProjectId, projectId } = state;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePackageSelect = (packageId) => {
    setSelectedPackageId(packageId);
  };
  const handleReport = () => navigate(`/project-report/${projectId}`)
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header giữ nguyên như cũ */}
<div className="bg-white shadow-sm">
  {/* Top Row - Navigation Icons */}
    <div className="bg-white px-6 py-1 shadow-sm flex justify-end items-center space-x-4 pt-3 md:pt-0 mt-12 md:mt-0">
        <div className="flex items-center space-x-4 pt-0 md:pt-1">
          <span className="text-gray-500">Thông báo</span>
          <FaRegBell />
          <span></span>
          <div className="inline-block" ref={menuRef}>
              <button className="bg-red-200 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center"
                onClick={() => setShowMenu(!showMenu)}
              >
                R
              </button>
              {showMenu && (
            <div className="absolute mt-2 right-0 bg-white border shadow rounded w-40 z-10">
              <button
                className="block w-full text-left px-4 py-2  text-red-600 hover:bg-gray-100"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Đăng xuất
                </button>
            </div>
          )}
          </div>
        </div>
      </div>

  {/* Bottom Row - Project Info and Create Button */}
  <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-start">
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 rounded hover:bg-gray-100"
        aria-label="Quay lại"
      >
        <FiArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-gray-800">{projectName}</h1>
        <p className="text-xm font-bold text-gray-500">{subProjectName}</p>
      </div>
    </div>
    
    <button
      onClick={() => setShowAddPackage(true)}
      className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white pl-10 pr-10 px-4 py-1 rounded font-bold text-sm"
    >
      <FiPlus className="w-6 h-6" />
      <span>Tạo gói thầu dự án mới</span>
    </button>
  </div>
</div>

      {/* Phần nội dung chính */}
      <div className="flex-1 mt-4 flex flex-col lg:flex-row overflow-hidden">
        {/* Cột List - giữ nguyên, luôn hiển thị */}
        <div className="w-full lg:w-[400px] flex-shrink-0 bg-white shadow">
          <List
            subProjectId={subProjectId}
            onPackageSelect={handlePackageSelect}
          />
        </div>

        {/* Phần content (hai cột thông tin) */}
        <div
          className="flex-1 flex flex-col lg:flex-row min-w-0 max-w-full lg:max-w-[1200px] mx-auto overflow-y-auto overflow-x-auto "
        >
          {/* Cột thông tin 1 (BasicInfo, ProgressChart, ConstructionProgress) */}
          {!isExpanded && (
            <div className="flex-1 flex flex-col min-w-0 p-2.5 gap-2.5">
              {packageData?.thongTinChung && (
                <div className="bg-white p-4">
                  <BasicInfo data={packageData.thongTinChung} />
                </div>
              )}
              {packageData?.tienDo.phanTram && (
                <div className="bg-white p-4">
                  <ProgressChart data={packageData.tienDo.phanTram} />
                </div>
              )}
              {packageData?.tienDo.chiTiet && (
                <div className="bg-white p-4">
                  <ConstructionProgress tasks={packageData.tienDo.chiTiet} projectId={subProjectId} packageId={selectedPackageId} />
                </div>
              )}
            </div>
          )}

          {/* Cột thông tin 2 (ContractorInfo, ConstructionVolume, Map) */}
          <div className={`flex-1 flex flex-col min-w-0 p-2.5 gap-2.5 ${isExpanded ? 'absolute inset-0 z-10' : ''}`}>
            {!isExpanded && packageData?.thongTinChung && (
              <>
                <div className="bg-white p-4">
                  <ContractorInfo data={packageData.thongTinChung} />
                </div>
                <div className="bg-white p-4">
                  <ConstructionVolume data={{ khoiLuongThiCong: packageData.thongTinChung.khoiLuongThiCong }}  packageId={selectedPackageId}/>
                </div>
              </>
            )}
            {packageData?.thongTinChung && (
              <div className={`bg-white flex-1 ${isExpanded ? 'h-full' : ''}`}>
                <div className="relative h-80">
                  <button
                    className="absolute bottom-5 right-5 z-[1000] bg-[#006591] hover:bg-[#004b73] text-white py-2 px-3 rounded flex items-center gap-1.5 transition-colors"
                    onClick={toggleExpand}
                  >
                    {isExpanded ? (
                      <>
                        <FaCompress className="text-sm" />
                        <span className="text-sm">Thu nhỏ</span>
                      </>
                    ) : (
                      <>
                        <FaExpand className="text-sm" />
                        <span className="text-sm">Phóng to</span>
                      </>
                    )}
                  </button>
                  <MapView
                    selectedProject={packageData.thongTinChung}
                    isExpanded={isExpanded}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showAddPackage && (
  <div className="fixed inset-0 z-50">
    {/* Lớp phủ nền mờ - xử lý đóng popup khi click */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50"
      onClick={() => setShowAddPackage(false)}
    />

    {/* Container popup */}
    <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
      <div
        className="
          relative 
          w-full 
          max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 
          bg-white 
          rounded-lg 
          shadow-xl 
          overflow-hidden 
          max-h-screen 
          overflow-y-auto 
          animate-fadeIn
        "
        onClick={(e) => e.stopPropagation()} 
      >
        <AddNewPackage
          projectId={subProjectId}
          onClose={() => setShowAddPackage(false)}
          onSuccess={() => {
            fetchPackageDetails();
            setShowAddPackage(false);
          }}
        />
      </div>
    </div>
  </div>
)}


    </div>

  );
};

export default Detail;
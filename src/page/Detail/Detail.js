import './Detail.css';
import React, { useEffect, useState, useRef } from 'react';
import { FaExpand, FaCompress, FaFileWord, FaRegBell, FaChevronLeft } from 'react-icons/fa';
import { FiPlus, FiChevronLeft } from 'react-icons/fi';
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
import { FaMap } from 'react-icons/fa';

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
  console.log("Dự án ID:", subProjectId);
  
  const handleReport = () => navigate(`/project-report/${projectId}`)
  return (
    <div className="flex flex-col h-screen bg-gray-300 z-0">
      {/* Header giữ nguyên như cũ */}
      <div className="bg-white shadow-sm pt-3 md:pt-0">
        {/* Top Row - Navigation Icons */}
        <div className="bg-white px-4 md:px-6 py-1 flex justify-between md:justify-end items-center pt-12 md:pt-1">
          {/* Nút back chỉ hiện trên mobile */}
          <button className="md:hidden p-2 text-gray-600">
            <FiChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 md:space-x-4">
            <span className="text-gray-500 hidden sm:inline">Thông báo</span>
            <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100">
              <FaRegBell className="w-5 h-5" />
            </button>

            {/* Giữ nguyên phần avatar */}
            <div className="relative" ref={menuRef}>
              <button
                className="bg-red-200 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-300"
                onClick={() => setShowMenu(!showMenu)}
              >
                <span className="font-medium">R</span>
              </button>

              {showMenu && (
                <div className="absolute mt-2 right-0 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
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
        <div className="px-4 md:px-6 py-3 border-t border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex items-center gap-3">
            {/* Ẩn nút back trên desktop vì đã có ở top row mobile */}
            <button
              onClick={() => navigate(-1)}
              className="hidden md:block p-2 rounded-md hover:bg-gray-100"
              aria-label="Quay lại"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-sm md:text-xl font-bold text-gray-800">{projectName}</h1>
              <p className="text-xs text-gray-500">{subProjectName}</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddPackage(true)}
            className="w-fit md:w-auto flex items-center justify-left gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tạo gói thầu mới</span>
          </button>
        </div>
      </div>
      <div className="flex-1 mt-2 flex flex-col lg:flex-row overflow-auto ml-3 mr-3 h-[calc(100vh-150px)]">
        <div className="w-full lg:w-[400px] flex-shrink-0 bg-white shadow">
          <List
            subProjectId={subProjectId}
            onPackageSelect={handlePackageSelect}
          />
        </div>
        <div className="flex-1 flex flex-col 3xl:flex-row min-w-0 max-w-full 3xl:max-w-[1200px] 3xl:overflow-auto mx-auto overflow-auto">
  {!isExpanded && (
    <div className="flex flex-col min-w-0 p-2 pt-0 gap-2.5 w-full 3xl:w-[50%]">
      {packageData?.thongTinChung && (
        <div className="bg-white flex pt-0">
          <BasicInfo data={packageData.thongTinChung} />
        </div>
      )}
      {packageData?.tienDo.phanTram && (
        <div className="bg-white items-center">
          <ProgressChart data={packageData.tienDo.phanTram} />
        </div>
      )}
      {packageData?.tienDo.chiTiet && (
        <div className="bg-white p-1 flex-1">
          <ConstructionProgress tasks={packageData.tienDo.chiTiet} projectId={subProjectId} packageId={selectedPackageId} />
        </div>
      )}
    </div>
  )}

  {/* Cột thông tin 2 - Luôn hiển thị nhưng thu gọn khi phóng to */}
  <div className={`${isExpanded ? 'w-full z-30' : 'z-20 flex-1 3xl:w-[50%]'} flex flex-col min-w-0 5xl:overflow-hidden 3xl:overflow-auto`}>
    {!isExpanded && packageData?.thongTinChung && (
      <>
        <div className="bg-white p-2 mb-2.5 h-[30%] min-h-[290px]">
          <ContractorInfo data={packageData.thongTinChung} />
        </div>
        <div className="bg-white p-2 mb-2.5 h-[30%] min-h-[248px]">
          <ConstructionVolume data={{ khoiLuongThiCong: packageData.thongTinChung.khoiLuongThiCong }} packageId={selectedPackageId} />
        </div>
      </>
    )}
    <div className={`bg-white ${isExpanded ? 'absolute inset-0 z-10' : 'h-[70%] min-h-[300px]'} relative flex flex-col`}>
      {/* Phần tiêu đề - thêm z-index để luôn hiển thị trên cùng */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between z-[25]">
        <div className=" sticky top-0 flex items-center">
          <FaMap className="text-gray-500 mr-2" size={14} />
          <h2 className="text-lg font-semibold text-gray-800">BẢN ĐỒ DỰ ÁN</h2>
        </div>
        <button
          className="z-[25] bg-[#006591] hover:bg-[#004b73] text-white py-1 px-2 rounded flex items-center gap-1.5 transition-colors text-sm"
          onClick={toggleExpand}
        >
          {isExpanded ? <FaCompress /> : <FaExpand />}
          <span>{isExpanded ? "Thu nhỏ" : "Phóng to"}</span>
        </button>
      </div>
      
      {/* Phần bản đồ - đảm bảo nằm dưới tiêu đề */}
      {packageData?.thongTinChung && (
        <div className={`relative ${isExpanded ? 'h-[calc(100%-44px)]' : 'h-[calc(100%)]'}`}>
          <MapView
            selectedProject={packageData.thongTinChung}
            isExpanded={isExpanded}
          />
        </div>
      )}
    </div>
  </div>
</div>
      </div>
      {showAddPackage && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddPackage(false)}
          >
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
        </div>
      )}
    </div>
  );
};

export default Detail;
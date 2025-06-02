import './Detail.css';
import React, { useEffect, useState } from 'react';
import { FaExpand, FaCompress, FaFileWord } from 'react-icons/fa';
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
const Detail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const projectId = state.projectId
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    useEffect(() => {
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

        fetchPackageDetails();
    }, [selectedPackageId]);

    if (!state) {
        return <div>Không có dữ liệu chi tiết</div>;
    }

    const { projectName, subProjectName, subProjectId } = state;

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-5 py-3 gap-3 sm:gap-0">
            <div className="sm:hidden">
                <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                    <img src={menuIcon} alt="Menu" className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-normal">
                <button
                    onClick={handleReport}
                    className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                >
                    <FaFileWord className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Xuất báo cáo Word</span>
                </button>
                <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                    <img src={helpIcon} alt="Help" className="w-5 h-5" />
                </button>
                <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                    <img src={userIcon} alt="User" className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{projectName}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{subProjectName}</p>
        </div>
    </div>

    {/* Phần nội dung chính - sửa lại phần mobile */}
    <div className={`flex-1 flex ${isExpanded ? 'flex-col' : 'flex-col lg:flex-row'} overflow-hidden`}>
        {/* List - giữ nguyên như cũ */}
        {!isExpanded && (
            <div className="w-full lg:w-[400px] flex-shrink-0 bg-white shadow">
                <List
                    subProjectId={subProjectId}
                    onPackageSelect={handlePackageSelect}
                />
            </div>
        )}

        {/* Phần content - sửa để có thể cuộn trên mobile */}
        <div
  className={`flex-1 flex flex-col lg:flex-row min-w-0 max-w-full lg:max-w-[1200px] mx-auto ${isExpanded ? 'w-full' : ''} overflow-y-auto overflow-x-auto`}
>
  {!isExpanded && (
    <div className="flex-1 flex flex-col min-w-0 p-2.5 gap-2.5">
      {packageData?.thongTinChung && (
        <div className="bg-white rounded-lg shadow p-4">
          <BasicInfo data={packageData.thongTinChung} />
        </div>
      )}

      {packageData?.tienDo.phanTram && (
        <div className="bg-white rounded-lg shadow p-4">
          <ProgressChart data={packageData.tienDo.phanTram} />
        </div>
      )}

      {packageData?.tienDo.chiTiet && (
        <div className="bg-white rounded-lg shadow p-4">
          <ConstructionProgress tasks={packageData.tienDo.chiTiet} projectId={projectId} />
        </div>
      )}
    </div>
  )}

  <div className={`flex-1 flex flex-col min-w-0 p-2.5 gap-2.5 ${isExpanded ? 'h-full' : ''}`}>
    {!isExpanded && packageData?.thongTinChung && (
      <>
        <div className="bg-white rounded-lg shadow p-4">
          <ContractorInfo data={packageData.thongTinChung} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <ConstructionVolume data={{ khoiLuongThiCong: packageData.thongTinChung.khoiLuongThiCong }} />
        </div>
      </>
    )}

    {packageData?.thongTinChung && (
      <div className={`bg-white rounded-lg shadow ${isExpanded ? 'h-full' : ''}`}>
        <div className="relative h-full">
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
</div>

    );
};

export default Detail;
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
    useEffect(() => {
        const fetchPackageDetails = async () => {
            if (!selectedPackageId) return;

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/goiThau/chiTiet/${selectedPackageId}`);
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
        <div className="detail">
            <div className="bg-white shadow-sm">
                {/* Top Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-5 py-3 gap-3 sm:gap-0">
                    {/* Left side - Menu Button (only show on mobile) */}
                    <div className="sm:hidden">
                        <button className="p-1 rounded-md hover:bg-gray-100">
                            <img src={menuIcon} alt="Menu" className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Right-side buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-normal">
                        {/* Export Report Button - Full text on desktop, icon only on mobile */}
                        <button
                            onClick={handleReport}
                            className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <FaFileWord className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Xuất báo cáo Word</span>
                        </button>

                        {/* Help Button */}
                        <button className="p-1 rounded-md hover:bg-gray-100">
                            <img src={helpIcon} alt="Help" className="w-5 h-5" />
                        </button>

                        {/* User Button */}
                        <button className="p-1 rounded-md hover:bg-gray-100">
                            <img src={userIcon} alt="User" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Title Section */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{projectName}</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{subProjectName}</p>
                </div>
            </div>

            <div className={`content ${isExpanded ? 'expanded' : ''}`}>
                <div className="list-wrapper">
                    <List
                        subProjectId={subProjectId}
                        onPackageSelect={handlePackageSelect}
                    />
                </div>

                <div className="right-columns">
                    {!isExpanded && (
                        <div className="column-chart">
                            {packageData?.thongTinChung && (
                                <div className="wrapper">
                                    <BasicInfo data={packageData.thongTinChung} />
                                </div>
                            )}


                            <>
                                {packageData?.tienDo.phanTram && (
                                    <div className="wrapper">
                                        <ProgressChart data={packageData.tienDo.phanTram} />
                                    </div>
                                )}
                                {packageData?.tienDo.chiTiet && (
                                    <div className="wrapper">
                                        <ConstructionProgress tasks={packageData.tienDo.chiTiet} projectId={projectId} />
                                    </div>
                                )}
                            </>

                        </div>
                    )}

                    <div className="column-map">
                        {!isExpanded && packageData?.thongTinChung && (
                            <>
                                <div className="wrapper">
                                    <ContractorInfo data={packageData.thongTinChung} />
                                </div>
                                <div className="wrapper">
                                    <ConstructionVolume data={{ khoiLuongThiCong: packageData.thongTinChung.khoiLuongThiCong }} />
                                </div>
                            </>
                        )}
                        {packageData?.thongTinChung && (
                            <div className="wrapper">
                                <button className="expand-map-btn" onClick={toggleExpand}>
                                    {isExpanded ? (
                                        <>
                                            <FaCompress /> Thu nhỏ
                                        </>
                                    ) : (
                                        <>
                                            <FaExpand /> Phóng to
                                        </>

                                    )}
                                </button>
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
    );
};

export default Detail;

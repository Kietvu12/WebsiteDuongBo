import './Detail.css';
import React, { useEffect, useState } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
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
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';

const Detail = () => {
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
                setSelectedProject(response.data.data); // Nếu muốn dùng cho các component khác
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

    return (
        <div className="detail">
            <div className="header">
                <div className="top-nav">
                    <button className="icon-btn">
                        <img src={menuIcon} alt="Menu" className="small-icon" />
                    </button>

                    <div className="nav-icons">
                        <button className="icon-btn">
                            <img src={helpIcon} alt="Help" className="small-icon" />
                        </button>
                        <button className="icon-btn">
                            <img src={userIcon} alt="User" className="small-icon" />
                        </button>
                    </div>
                </div>

                <div className="header-title">
                    <h1 className="main-title">{projectName}</h1>
                    <span className="sub-title">{subProjectName}</span>
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
                                        <ConstructionProgress tasks={packageData.tienDo.chiTiet} projectId={projectId}/>
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

                                <MapView
                                    selectedProject={packageData.thongTinChung}
                                    isExpanded={isExpanded}
                                />
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detail;

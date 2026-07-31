import './Detail.css';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiChevronLeft } from 'react-icons/fi';
import List from '../../component/List/List';
import ProgressChart from '../../component/ProgressChart/ProgressChart';
import ContractorInfo from '../../component/ContractorInfo/ContractorInfo';
import ConstructionVolume from '../../component/ConstructionVolume/ConstructionVolume';
import MapView from '../../component/MapView/MapView';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddNewPackage from '../AddNewPackage/AddNewPackage';

const Detail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchPackageDetails = async () => {
    if (!selectedPackageId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/goiThau/chiTiet/${selectedPackageId}`);
      setPackageData(response.data.data);
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
    return <div className="p-4">Không có dữ liệu chi tiết</div>;
  }

  const { projectName, subProjectName, subProjectId } = state;

  const handlePackageSelect = (packageId, listIndex = 0) => {
    setSelectedPackageId(packageId);
    if (typeof listIndex === 'number' && !Number.isNaN(listIndex)) {
      setSelectedPackageIndex(listIndex);
    }
  };

  const volumePayload = packageData?.thongTinChung
    ? { khoiLuongThiCong: packageData.thongTinChung.khoiLuongThiCong }
    : null;

  return (
    <div className="flex flex-1 min-h-0 flex-col w-full bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 md:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-0.5 p-1.5 rounded-md hover:bg-gray-100 text-gray-600 shrink-0"
              aria-label="Quay lại"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-gray-900 leading-snug">{projectName}</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">{subProjectName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPackage(true)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white font-semibold rounded-md shadow-sm w-full lg:w-auto"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tạo gói thầu mới</span>
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row xl:items-stretch gap-2 p-2 overflow-hidden">
        <aside className="w-full xl:w-[min(100%,380px)] xl:max-w-[380px] flex-shrink-0 flex flex-col gap-2 min-h-0 max-h-[45vh] xl:max-h-none xl:h-full xl:overflow-hidden">
          <div className="flex-1 min-h-[160px] xl:min-h-0 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
            <List
              subProjectId={subProjectId}
              onPackageSelect={handlePackageSelect}
              embeddedInDetail
            />
          </div>
          {packageData?.thongTinChung && (
            <>
              <div className="shrink-0 min-h-0 max-h-[200px] xl:max-h-[220px] flex flex-col overflow-hidden">
                <ConstructionVolume
                  variant="blue"
                  data={volumePayload}
                  packageId={selectedPackageId}
                />
              </div>
              <div className="shrink-0 min-h-0 max-h-[280px] xl:max-h-[300px] flex flex-col overflow-y-auto overflow-x-hidden">
                <ContractorInfo variant="blue" showSchedule={false} data={packageData.thongTinChung} />
              </div>
            </>
          )}
        </aside>

        <main className="relative flex-1 min-w-0 min-h-[280px] xl:min-h-0 xl:h-full flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden order-first xl:order-none">
          {packageData?.thongTinChung ? (
            <div className="flex-1 min-h-0 h-full relative">
              {loading && (
                <div className="absolute inset-0 z-[500] bg-white/70 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">Đang tải...</span>
                </div>
              )}
              <MapView
                selectedProject={packageData.thongTinChung}
                progressPhanTram={packageData?.tienDo?.phanTram}
                packageIndex={selectedPackageIndex}
                isExpanded={false}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6">
              Chọn một gói thầu để xem bản đồ
            </div>
          )}
        </main>

        <aside className="w-full xl:w-[min(100%,380px)] xl:max-w-[380px] flex-shrink-0 flex flex-col gap-2 min-h-0 max-h-[45vh] xl:max-h-none xl:h-full xl:overflow-hidden">
          {packageData?.thongTinChung && (
            <>
              <div className="shrink-0 min-h-0 max-h-[218px] xl:max-h-[238px] flex flex-col overflow-hidden">
                <ConstructionVolume
                  variant="orange"
                  data={volumePayload}
                  packageId={selectedPackageId}
                />
              </div>
              <div className="shrink-0 min-h-0 max-h-[392px] xl:max-h-[372px] flex flex-col overflow-y-auto overflow-x-hidden">
                <ContractorInfo variant="orange" showSchedule data={packageData.thongTinChung} />
              </div>
            </>
          )}
          {packageData?.tienDo?.phanTram ? (
            <div className="flex-1 min-h-[160px] xl:min-h-0 xl:max-h-[248px] flex flex-col overflow-hidden">
              <ProgressChart variant="orange" data={packageData.tienDo.phanTram} />
            </div>
          ) : (
            packageData?.thongTinChung && <div className="hidden xl:block flex-1 min-h-0" aria-hidden />
          )}
        </aside>
      </div>

      {showAddPackage && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddPackage(false)}>
            <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
              <div
                className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden max-h-screen overflow-y-auto animate-fadeIn"
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

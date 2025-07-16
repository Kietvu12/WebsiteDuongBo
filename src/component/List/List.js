import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { FaListOl, FaHashtag, FaChevronDown, FaChevronUp, FaEdit, FaTrash } from 'react-icons/fa';
import AddNewPackage from '../../page/AddNewPackage/AddNewPackage';
import Portal from '../Portal';

const List = ({ subProjectId, onPackageSelect, isMobileListExpanded, onMobileListToggle }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false); // State để hiển thị pop-up chỉnh sửa
  const [selectedPackage, setSelectedPackage] = useState(null); // State lưu gói thầu đang chỉnh sửa
  const [showDelete, setShowDelete] = useState(false);
  const contextMenuRef = useRef(null);

  const actionButtonStyle = "absolute top-1 right-1 bg-black bg-opacity-70 text-white p-1 rounded hover:bg-opacity-100 transition-all text-xs flex items-center justify-center h-5 w-7";

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/duAn/goiThau/${subProjectId}`);
      if (response.data && Array.isArray(response.data.data)) {
        const fetchedPackages = response.data.data;
        setPackages(fetchedPackages);

        if (fetchedPackages.length > 0 && !selectedProject) {
          handlePackageClick(fetchedPackages[0].GoiThau_ID);
        }
      } else {
        setPackages([]);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = (packageId) => {
    setShowDelete(true);
    setSelectedPackage(packages.find(p => p.GoiThau_ID === packageId));
  };

  const handleDeleteCancel = () => {
    setShowDelete(false);
    setSelectedPackage(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPackage) {
      await handleDeletePackage(selectedPackage.GoiThau_ID);
      setShowDelete(false);
      setSelectedPackage(null);
    }
  };

  const handlePackageClick = (packageId) => {
    const selected = packages.find(p => p.GoiThau_ID === packageId);
    setSelectedProject(selected);
    if (onPackageSelect) {
      onPackageSelect(packageId);
    }
    if (window.innerWidth < 1050) {
      setIsDropdownOpen(false);
      if (onMobileListToggle) onMobileListToggle(false);
    }
  };

  const handleContextMenu = (e, packageId) => {
    e.preventDefault();
    
    const itemRect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Tính toán vị trí để menu xuất hiện bên phải item
    setContextMenu({
      packageId,
      x: itemRect.left+40, 
      y: itemRect.top + scrollY,
      itemHeight: itemRect.height
    });
  };
  const handleClickOutside = (event) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
      setContextMenu(null);
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/goithau/xoa/${packageId}`);
      if (response.data.success) {
        setPackages(packages.filter(p => p.GoiThau_ID !== packageId));
        if (selectedProject?.GoiThau_ID === packageId) {
          setSelectedProject(null);
          if (packages.length > 1) {
            handlePackageClick(packages[0].GoiThau_ID);
          }
        }
        alert('Xóa gói thầu thành công');
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Lỗi khi xóa gói thầu: ' + (err.response?.data?.message || err.message));
    } finally {
      setContextMenu(null);
    }
  };

  const handleEditPackage = (packageId) => {
    const packageToEdit = packages.find(p => p.GoiThau_ID === packageId);
    setSelectedPackage(packageToEdit);
    setShowEditPopup(true);
    setContextMenu(null);
  };

  const handleEditSuccess = (updatedPackage) => {
    setPackages(packages.map(p => 
      p.GoiThau_ID === updatedPackage.GoiThau_ID ? { ...p, ...updatedPackage } : p
    ));
    setSelectedProject({ ...selectedProject, ...updatedPackage });
    setShowEditPopup(false);
    setSelectedPackage(null);
    alert('Cập nhật gói thầu thành công');
  };

  const handleEditClose = () => {
    setShowEditPopup(false);
    setSelectedPackage(null);
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [subProjectId]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col w-full h-full bg-white relative">
      {/* Desktop View */}
      <div className="ssm:flex flex-1 p-2.5 h-full hidden">
        <div className="flex flex-col h-full min-h-[300px] max-h-[840px] rounded shadow overflow-hidden w-full">
          <div className="flex items-center bg-[#006591] text-white p-3 text-base md:text-xl font-bold flex-shrink-0">
            <FaListOl className="mr-3 text-sm md:text-lg" />
            DANH SÁCH GÓI THẦU
          </div>
          <div className="p-2.5 overflow-y-auto flex-grow">
            {packages.map((item, index) => (
              <div 
                key={item.GoiThau_ID}
                className={`relative flex flex-col items-left gap-2 p-3 border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50 ${
                  selectedProject?.GoiThau_ID === item.GoiThau_ID 
                    ? 'bg-blue-50 border-l-4 border-l-[#006591]' 
                    : ''
                }`}
                onClick={() => handlePackageClick(item.GoiThau_ID)}
                onContextMenu={(e) => handleContextMenu(e, item.GoiThau_ID)}
              >
                <div className="absolute top-1 right-1 flex gap-1">
                  <button 
                    className={`${actionButtonStyle} relative bg-blue-700`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPackage(item.GoiThau_ID);
                    }}
                    title="Sửa"
                    style={{ right: '1rem' }} // Đẩy nút sửa sang trái
                  >
                    <FaEdit size={12}/>
                  </button>
                  <button 
                    className={`${actionButtonStyle} relative bg-red-700`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmDelete(item.GoiThau_ID);;
                    }}
                    title="Xóa"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                <div className='flex flex-row min-w-[80px]'>
                  <div className="flex items-center text-[#006591] font-bold text-sm md:text-base">
                    <FaHashtag className="mr-2 text-xs md:text-sm" />
                  </div>
                  <div className="flex flex-col items-center text-[#006591] font-bold text-sm md:text-base">
                    GT - {index + 1}
                  </div>
                </div>
                <div className="font-bold text-gray-600 text-xs md:text-sm flex-1">
                  {item.TenGoiThau}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Dropdown View */}
      <div className="ssm:hidden">
        <button 
          className="flex items-center justify-between w-full bg-[#006591] text-white p-3 text-base font-bold"
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            if (onMobileListToggle) onMobileListToggle(!isDropdownOpen);
          }}
        >
          <div className="flex items-center">
            <FaListOl className="mr-3" />
            DANH SÁCH GÓI THẦU
          </div>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        <div className={`absolute z-10 w-full bg-white shadow-lg max-h-60 overflow-y-auto transition-all duration-300 ${
          isDropdownOpen ? 'block' : 'hidden'
        }`}>
          {packages.map((item, index) => (
            <div 
              key={item.GoiThau_ID}
              className={`relative flex flex-col p-3 border-b border-gray-200 cursor-pointer hover:bg-blue-50 ${
                selectedProject?.GoiThau_ID === item.GoiThau_ID 
                  ? 'bg-blue-50 border-l-4 border-l-[#006591]' 
                  : ''
              }`}
              onClick={() => handlePackageClick(item.GoiThau_ID)}
              onContextMenu={(e) => handleContextMenu(e, item.GoiThau_ID)}
            >

              <div className="absolute top-1 right-1 flex gap-1">
                <button 
                  className={`${actionButtonStyle} relative bg-blue-700`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditPackage(item.GoiThau_ID);
                  }}
                  title="Sửa"
                  style={{ right: '1rem' }} // Đẩy nút sửa sang trái
                >
                  <FaEdit size={12} />
                </button>
                <button 
                  className={`${actionButtonStyle} relative bd-red-700`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmDelete(item.GoiThau_ID);;
                  }}
                  title="Xóa"
                >
                  <FaTrash size={12} />
                </button>
              </div>

              <div className="flex items-center text-[#006591] font-bold text-sm">
                <FaHashtag className="mr-2" />
                Gói thầu - {index + 1}
              </div>
              <div className="font-bold text-gray-800 text-xs mt-1">
                {item.TenGoiThau}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
  <div
    ref={contextMenuRef}
    className="absolute bg-white shadow-lg rounded-md border border-gray-200 z-50 w-32"
    style={{
      top: `${contextMenu.y}px`,
      left: `${contextMenu.x}px`,
      transform: 'translateY(-10%)' // Điều chỉnh để căn giữa theo chiều dọc
    }}
  >
    <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500">
      THAO TÁC
    </div>
    <div
      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center"
      onClick={() => handleEditPackage(contextMenu.packageId)}
    >
      <span>Sửa</span>
    </div>
    <div
      className="px-3 py-2 hover:bg-red-50 cursor-pointer text-sm flex items-center"
      onClick={() => handleDeletePackage(contextMenu.packageId)}
    >
      <span>Xóa</span>
    </div>
  </div>
)}

      {/* Pop-up chỉnh sửa */}
      {showEditPopup && selectedPackage && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              <AddNewPackage
                isEdit={true}
                projectId={subProjectId}
                goiThau={selectedPackage}
                onClose={handleEditClose}
                onSuccess={handleEditSuccess}
              />
            </div>
          </div>
        </Portal>
      )}

      {showDelete && selectedPackage && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
              <p className="mb-6">Bạn có chắc chắn muốn xóa gói thầu "{selectedPackage.TenGoiThau}"?</p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default List;
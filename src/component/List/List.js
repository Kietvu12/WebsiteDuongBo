
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { FaBars, FaChevronDown, FaChevronUp, FaEdit, FaTrash } from 'react-icons/fa';
import AddNewPackage from '../../page/AddNewPackage/AddNewPackage';
import Portal from '../Portal';

const List = ({ subProjectId, onPackageSelect, isMobileListExpanded, onMobileListToggle, embeddedInDetail = false }) => {
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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const NAVY = '#0B2144';

  const formatKmRange = (item) => {
    const a = item.Km_BatDau;
    const b = item.Km_KetThuc;
    if (a == null || b == null) return null;
    const sa = String(a).trim();
    const sb = String(b).trim();
    if (!sa || !sb) return null;
    const seg = (s) => (/^km/i.test(s) ? s : `Km${s}`);
    return `(${seg(sa)} - ${seg(sb)})`;
  };

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
      const idx = packages.findIndex((p) => p.GoiThau_ID === packageId);
      onPackageSelect(packageId, idx >= 0 ? idx : 0);
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
      <div className={`flex-1 p-2.5 h-full min-h-0 ${embeddedInDetail ? 'flex' : 'hidden ssm:flex'}`}>
        <div
          className={`flex flex-col h-full min-h-[300px] rounded shadow overflow-hidden w-full ${
            embeddedInDetail ? 'max-h-none' : 'max-h-[840px]'
          }`}
        >
          <div
            className="flex shrink-0 items-center gap-3 rounded-t-lg px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white md:text-base"
            style={{ backgroundColor: NAVY }}
          >
            <FaBars className="shrink-0 text-lg opacity-95" aria-hidden />
            <span>Tender package list</span>
          </div>
          <div className="flex flex-grow flex-col gap-2 overflow-y-auto bg-white p-3">
            {packages.map((item, index) => {
              const selected = selectedProject?.GoiThau_ID === item.GoiThau_ID;
              const km = formatKmRange(item);
              return (
                <div
                  key={item.GoiThau_ID}
                  className={`group relative cursor-pointer transition-all ${
                    selected ? 'rounded-lg px-4 py-4 shadow-sm' : 'rounded-lg px-3 py-3 hover:bg-slate-50'
                  }`}
                  style={selected ? { backgroundColor: NAVY } : undefined}
                  onClick={() => handlePackageClick(item.GoiThau_ID)}
                  onContextMenu={(e) => handleContextMenu(e, item.GoiThau_ID)}
                >
                  <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      className={`rounded-md p-1.5 transition-colors ${
                        selected
                          ? 'text-sky-200 hover:bg-white/10 hover:text-white'
                          : 'text-slate-500 hover:bg-slate-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPackage(item.GoiThau_ID);
                      }}
                      title="Sửa"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      type="button"
                      className={`rounded-md p-1.5 transition-colors ${
                        selected
                          ? 'text-sky-200 hover:bg-white/10 hover:text-white'
                          : 'text-slate-500 hover:bg-slate-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(item.GoiThau_ID);
                      }}
                      title="Xóa"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <div
                    className={`text-sm font-bold md:text-base ${selected ? 'text-white' : ''}`}
                    style={!selected ? { color: NAVY } : undefined}
                  >
                    # GT - {index + 1}
                  </div>
                  <div
                    className={`mt-1 text-xs font-semibold leading-snug md:text-sm ${
                      selected ? 'text-sky-200' : 'text-slate-500'
                    }`}
                  >
                    {item.TenGoiThau}
                  </div>
                  {km && (
                    <div
                      className={`mt-0.5 text-xs leading-snug md:text-sm ${
                        selected ? 'text-sky-200' : 'text-slate-500'
                      }`}
                    >
                      {km}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Dropdown View */}
      <div className={embeddedInDetail ? 'hidden' : 'ssm:hidden'}>
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3.5 text-left text-base font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: NAVY }}
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            if (onMobileListToggle) onMobileListToggle(!isDropdownOpen);
          }}
        >
          <div className="flex items-center gap-3">
            <FaBars className="text-lg" aria-hidden />
            <span>Tender package list</span>
          </div>
          {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        <div
          className={`absolute z-10 w-full max-h-60 overflow-y-auto bg-white shadow-lg transition-all duration-300 ${
            isDropdownOpen ? 'block' : 'hidden'
          }`}
        >
          {packages.map((item, index) => {
            const selected = selectedProject?.GoiThau_ID === item.GoiThau_ID;
            const km = formatKmRange(item);
            return (
              <div
                key={item.GoiThau_ID}
                className={`group relative cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  selected ? 'px-3 py-3' : 'px-3 py-3 hover:bg-slate-50'
                }`}
                style={selected ? { backgroundColor: NAVY } : undefined}
                onClick={() => handlePackageClick(item.GoiThau_ID)}
                onContextMenu={(e) => handleContextMenu(e, item.GoiThau_ID)}
              >
                <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className={`rounded p-1 ${selected ? 'text-sky-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-200'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPackage(item.GoiThau_ID);
                    }}
                    title="Sửa"
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    type="button"
                    className={`rounded p-1 ${selected ? 'text-sky-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-200'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmDelete(item.GoiThau_ID);
                    }}
                    title="Xóa"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
                <div
                  className={`text-sm font-bold ${selected ? 'text-white' : ''}`}
                  style={!selected ? { color: NAVY } : undefined}
                >
                  # GT - {index + 1}
                </div>
                <div className={`mt-1 text-xs font-semibold ${selected ? 'text-sky-200' : 'text-slate-500'}`}>
                  {item.TenGoiThau}
                </div>
                {km && (
                  <div className={`mt-0.5 text-xs ${selected ? 'text-sky-200' : 'text-slate-500'}`}>{km}</div>
                )}
              </div>
            );
          })}
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

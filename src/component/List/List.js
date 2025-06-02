import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaListOl, FaHashtag, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const List = ({ subProjectId, onPackageSelect, isMobileListExpanded, onMobileListToggle }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePackageClick = (packageId) => {
    const selected = packages.find(p => p.GoiThau_ID === packageId);
    setSelectedProject(selected);
    if (onPackageSelect) {
      onPackageSelect(packageId);
    }
    // Đóng dropdown khi chọn item trên mobile
    if (window.innerWidth < 768) {
      setIsDropdownOpen(false);
      if (onMobileListToggle) onMobileListToggle(false);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/duAn/goiThau/${subProjectId}`);
        if (response.data && Array.isArray(response.data.data)) {
          const fetchedPackages = response.data.data;
          setPackages(fetchedPackages);

          if (fetchedPackages.length > 0) {
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

    if (subProjectId !== null && subProjectId !== undefined) {
      fetchPackages();
    }
  }, [subProjectId]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Desktop View */}
      <div className="hidden md:flex flex-1 p-2.5 h-full">
        <div className="flex flex-col h-full min-h-[300px] max-h-[840px] rounded shadow overflow-hidden w-full">
          <div className="flex items-center bg-[#006591] text-white p-3 text-base md:text-xl font-bold flex-shrink-0">
            <FaListOl className="mr-3 text-sm md:text-lg" />
            DANH SÁCH GÓI THẦU
          </div>

          <div className="p-2.5 overflow-y-auto flex-grow">
            {packages.map((item) => (
              <div 
                key={item.GoiThau_ID}
                className={`flex items-center gap-4 p-3 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-200 ${
                  selectedProject?.GoiThau_ID === item.GoiThau_ID ? 'bg-gray-100' : ''
                }`}
                onClick={() => handlePackageClick(item.GoiThau_ID)}
              >
                <div className="flex items-center text-[#006591] font-bold text-sm md:text-base min-w-[80px]">
                  <FaHashtag className="mr-2 text-xs md:text-sm" />
                  {item.GoiThau_ID}
                </div>
                <div className="font-bold text-gray-800 text-xs md:text-sm flex-1">
                  {item.TenGoiThau}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown View */}
      <div className="md:hidden">
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
          {packages.map((item) => (
            <div 
              key={item.GoiThau_ID}
              className={`flex flex-col p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200 ${
                selectedProject?.GoiThau_ID === item.GoiThau_ID ? 'bg-gray-100' : ''
              }`}
              onClick={() => handlePackageClick(item.GoiThau_ID)}
            >
              <div className="flex items-center text-[#006591] font-bold text-sm">
                <FaHashtag className="mr-2" />
                {item.GoiThau_ID}
              </div>
              <div className="font-bold text-gray-800 text-xs mt-1">
                {item.TenGoiThau}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default List;
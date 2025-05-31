import React, { useEffect, useState } from 'react';
import { FaListOl, FaHashtag } from 'react-icons/fa';
import axios from 'axios';

const List = ({ subProjectId, onPackageSelect }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const handlePackageClick = (packageId) => {
    const selected = packages.find(p => p.GoiThau_ID === packageId);
    setSelectedProject(selected);
    if (onPackageSelect) {
      onPackageSelect(packageId); 
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-full bg-white flex flex-col md:flex-row">
      <div className="flex-1 p-2 md:p-3">
        <div className="h-full min-h-[300px] max-h-[840px] rounded shadow overflow-hidden flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-[#006591] text-white p-3 md:p-4 flex items-center shrink-0">
            <FaListOl className="mr-3 text-lg md:text-xl" />
            <span className="text-base md:text-lg lg:text-xl font-bold">DANH SÁCH GÓI THẦU</span>
          </div>

          {/* List */}
          <div className="p-2 overflow-y-auto flex-1">
            {packages.map((item) => (
              <div 
                key={item.GoiThau_ID}
                className={`p-3 border-b border-gray-200 cursor-pointer flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                  selectedProject?.GoiThau_ID === item.GoiThau_ID ? 'bg-blue-50' : ''
                }`}
                onClick={() => handlePackageClick(item.GoiThau_ID)}
              >
                <div className="font-bold text-[#006591] flex items-center text-sm md:text-base min-w-[80px]">
                  <FaHashtag className="mr-2 text-xs md:text-sm" /> 
                  {item.GoiThau_ID}
                </div>
                <div className="font-bold text-gray-800 flex-1 text-sm md:text-base">
                  {item.TenGoiThau}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
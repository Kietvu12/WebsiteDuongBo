import React, { useEffect, useState } from 'react';
import { FaListOl, FaHashtag } from 'react-icons/fa';
import './List.css';
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

          // ✅ Chọn phần tử đầu tiên nếu có
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="content-wrapper">
      <div className="column">
        <div className="card bid-package-card">
          <div className="bid-package-header">
            <FaListOl className="header-icon" />
            DANH SÁCH GÓI THẦU
          </div>

          <div className="bid-list">
            {packages.map((item) => (
              <div 
                key={item.GoiThau_ID}
                className={`bid-item ${selectedProject?.GoiThau_ID === item.GoiThau_ID ? 'selected' : ''}`}
                onClick={() => handlePackageClick(item.GoiThau_ID)}
              >
                <div className="bid-code">
                  <FaHashtag className="bid-icon" /> {item.GoiThau_ID}
                </div>
                <div className="bid-content">
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

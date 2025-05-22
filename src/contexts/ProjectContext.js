import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  // Lấy giá trị từ localStorage khi khởi tạo
  const getInitialState = (key) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : null;
    }
    return null;
  };

  const [selectedProjectId, setSelectedProjectId] = useState(() => 
    getInitialState('selectedProjectId')
  );
  const [selectedSubProjectId, setSelectedSubProjectId] = useState(() => 
    getInitialState('selectedSubProjectId')
  );

  // Lưu vào localStorage mỗi khi giá trị thay đổi
  useEffect(() => {
    localStorage.setItem('selectedProjectId', JSON.stringify(selectedProjectId));
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem('selectedSubProjectId', JSON.stringify(selectedSubProjectId));
  }, [selectedSubProjectId]);

  return (
    <ProjectContext.Provider 
      value={{ 
        selectedProjectId, 
        setSelectedProjectId, 
        selectedSubProjectId,
        setSelectedSubProjectId 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
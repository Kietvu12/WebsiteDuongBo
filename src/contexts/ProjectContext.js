import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
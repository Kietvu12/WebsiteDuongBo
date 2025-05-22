import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedSubProjectId, setSelectedSubProjectId] = useState(null)
  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId , selectedSubProjectId ,setSelectedSubProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
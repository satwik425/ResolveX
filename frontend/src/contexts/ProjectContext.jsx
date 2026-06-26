import { createContext, useContext, useState } from "react";
import projectApi from "../api/projectApi";

const ProjectContext=createContext();

export const ProjectProvider = ({ children }) => {           // lowercase children
  const [projects, setProjects] = useState([]); 
    const [currentProject,setCurrentProject]=useState(null);
    const [loading,setLoading]= useState(false);
    const [error,setError] = useState(null);

    

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.getAllProjects();
      setProjects(res.data.projects);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchProjectById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.getProjectById(id);
      setCurrentProject(res.data.project);
      return res.data.project;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  
  const createProject = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.createProject(data);
      setProjects((prev) => [...prev, res.data.project]);
      return res.data.project;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
  const updateProject = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.updateProject(id, data);
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? res.data.project : p))
      );
      setCurrentProject(res.data.project);
      return res.data.project;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
  const deleteProject = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await projectApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setCurrentProject(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
  const addMember = async (projectId, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.addProjectMember(projectId, data);
      setCurrentProject(res.data.project);
      return res.data.project;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  
  const removeMember = async (projectId, memberId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.removeProjectMember(projectId, memberId);
      setCurrentProject(res.data.project);
      return res.data.project;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      loading,
      error,
      fetchProjects,
      fetchProjectById,
      createProject,
      updateProject,
      deleteProject,
      addMember,
      removeMember
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);



import { createContext, useContext, useState } from "react";
import workspaceApi from "../api/workspaceApi";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspaces,       setWorkspaces]       = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.getAllWorkspaces();
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.getWorkspaceById(id);
      setCurrentWorkspace(res.data.workspace); // ✅ Bug 1 fixed
      return res.data.workspace;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch workspace");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.createWorkspace(data);
      setWorkspaces((prev) => [...prev, res.data.workspace]);
      return res.data.workspace;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create workspace");
      throw err; // ✅ Bug 3 fixed
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.updateWorkspace(id, data);
      setWorkspaces((prev) =>
        prev.map((w) => (w._id === id ? res.data.workspace : w))
      );
      setCurrentWorkspace(res.data.workspace);
      return res.data.workspace;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update workspace");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await workspaceApi.deleteWorkspace(id);
      setWorkspaces((prev) => prev.filter((w) => w._id !== id));
      setCurrentWorkspace(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete workspace");
      throw err;
    } finally {
      setLoading(false);
    }
  };

 const generateInviteLink = async (id) => {
  const res = await workspaceApi.generateInviteLink(id);
  setCurrentWorkspace((prev) => prev ? { ...prev, inviteCode: res.data.inviteCode } : prev);
  return res.data.inviteCode;
};

const joinByCode = async (inviteCode) => {
  const res = await workspaceApi.joinByCode(inviteCode);
  setWorkspaces((prev) => [...prev, res.data.workspace]);
  return res.data.workspace;
};


const changeMemberRole = async (id, memberId, role) => {
  const res = await workspaceApi.changeMemberRole(id, memberId, role);
  setCurrentWorkspace(res.data.workspace);
  return res.data.workspace;
};

// WorkspaceContext.jsx
const getInviteLink = async (id) => {
  const res = await workspaceApi.getInviteLink(id);
  return res.data.inviteCode;
};

  const removeMember = async (workspaceId, memberId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.removeWorkspaceMember(workspaceId, memberId);
      setCurrentWorkspace(res.data.workspace);
      return res.data.workspace;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceContext.Provider value={{   // ✅ Bug 4 fixed
      workspaces,
      currentWorkspace,
      loading,
      error,
      fetchWorkspaces,
      fetchWorkspaceById,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      generateInviteLink,
      changeMemberRole,
       joinByCode,
       getInviteLink,
      removeMember
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);




  

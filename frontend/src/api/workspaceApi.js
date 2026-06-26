import axiosInstance from "../utils/axiosInstance";

const workspaceApi = {
  createWorkspace: (data)       => axiosInstance.post("/api/workspaces/", data),
  updateWorkspace: (id, data)   => axiosInstance.put(`/api/workspaces/${id}`, data),
  deleteWorkspace: (id)         => axiosInstance.delete(`/api/workspaces/${id}`),
  getAllWorkspaces: ()           => axiosInstance.get(`/api/workspaces/`),
  getWorkspaceById:      (id)         => axiosInstance.get(`/api/workspaces/${id}`),
  removeWorkspaceMember: (id, memberId) => axiosInstance.delete(`/api/workspaces/${id}/members/${memberId}`),
  generateInviteLink:    (id)         => axiosInstance.post(`/api/workspaces/${id}/invite-link`),
  joinByCode:            (inviteCode) => axiosInstance.post(`/api/workspaces/join/${inviteCode}`),
  changeMemberRole:      (id, memberId, role) => axiosInstance.patch(`/api/workspaces/${id}/members/${memberId}/role`, { role }),
  getInviteLink:         (id)         => axiosInstance.get(`/api/workspaces/${id}/invite-link`),
};

export default workspaceApi;
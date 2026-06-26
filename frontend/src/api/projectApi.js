import axiosInstance from "../utils/axiosInstance";

const projectApi = {
  createProject:       (data)                    => axiosInstance.post("/api/projects", data),
  updateProject:       (id, data)                => axiosInstance.put(`/api/projects/${id}`, data),
  deleteProject:       (id)                      => axiosInstance.delete(`/api/projects/${id}`),
  getAllProjects:       ()                        => axiosInstance.get("/api/projects"),
  getProjectById:      (id)                      => axiosInstance.get(`/api/projects/${id}`),
  addProjectMember:    (id, data)                => axiosInstance.post(`/api/projects/${id}/members`, data),
  removeProjectMember: (projectId, memberId)     => axiosInstance.delete(`/api/projects/${projectId}/members/${memberId}`),
};

export default projectApi;
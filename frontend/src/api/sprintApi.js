import axiosInstance from "../utils/axiosInstance";

const sprintApi = {
  createSprint: (data) => axiosInstance.post("/api/sprints/", data),
  updateSprint: (id, data) => axiosInstance.put(`/api/sprints/${id}`, data),
  deleteSprint: (id) => axiosInstance.delete(`/api/sprints/${id}`),
  getSprintByProject: (id) => axiosInstance.get(`/api/sprints/project/${id}`),
  getSprintById: (id) => axiosInstance.get(`/api/sprints/${id}`),
  getAllSprints: () => axiosInstance.get(`/api/sprints/`)
};

export default sprintApi;

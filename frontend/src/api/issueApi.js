import axiosInstance from "../utils/axiosInstance";

const issueApi = {
  createIssue:         (data)            => axiosInstance.post("/api/issues", data),
  updateIssue:         (id, data)        => axiosInstance.put(`/api/issues/${id}`, data),
  deleteIssue:         (id)              => axiosInstance.delete(`/api/issues/${id}`),
  getIssueById:        (id)              => axiosInstance.get(`/api/issues/${id}`),
  getIssuesByProject:  (projectId)       => axiosInstance.get(`/api/issues/project/${projectId}`),
  getIssuesBySprint:   (sprintId)        => axiosInstance.get(`/api/issues/sprint/${sprintId}`),
  getAllIssues:        ()                => axiosInstance.get(`/api/issues`),
  updateIssueStatus:   (id, data)        => axiosInstance.put(`/api/issues/${id}/status`, data),
  commentOnIssue:      (id, data)        => axiosInstance.post(`/api/issues/${id}/comments`, data),
  getIssueComments:    (id)              => axiosInstance.get(`/api/issues/${id}/comments`),
  deleteComment:       (id, commentId)   => axiosInstance.delete(`/api/issues/${id}/comments/${commentId}`),
};

export default issueApi;
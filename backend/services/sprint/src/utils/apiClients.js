const axios = require("axios");

const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL || "http://127.0.0.1:3003";

const ProjectClient = {
  getProjectById: async (projectId, authHeader) => {
    try {
      const headers = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }
      const response = await axios.get(`${PROJECT_SERVICE_URL}/projects/internal/projects/${projectId}`, { headers });
      return response.data.project; // Expect { project: ... }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to communicate with Project Service: ${err.message}`);
    }
  },

  getUserProjects: async (authHeader) => {
    try {
      const headers = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }
      const response = await axios.get(`${PROJECT_SERVICE_URL}/projects`, { headers });
      return response.data.projects; // Expect { projects: ... }
    } catch (err) {
      throw new Error(`Failed to communicate with Project Service: ${err.message}`);
    }
  }
};

module.exports = { ProjectClient };

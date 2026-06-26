const axios = require("axios");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://127.0.0.1:3001";
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL || "http://127.0.0.1:3003";
const SPRINT_SERVICE_URL = process.env.SPRINT_SERVICE_URL || "http://127.0.0.1:3004";

const UserClient = {
  getUserById: async (userId, authHeader) => {
    try {
      const headers = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }
      const response = await axios.get(`${USER_SERVICE_URL}/users/internal/users/${userId}`, { headers });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to communicate with User Service: ${err.message}`);
    }
  }
};

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

const SprintClient = {
  getSprintById: async (sprintId, authHeader) => {
    try {
      const headers = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }
      const response = await axios.get(`${SPRINT_SERVICE_URL}/sprints/internal/sprints/${sprintId}`, { headers });
      return response.data.sprint; // Expect { sprint: ... }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw new Error(`Failed to communicate with Sprint Service: ${err.message}`);
    }
  }
};

module.exports = { UserClient, ProjectClient, SprintClient };

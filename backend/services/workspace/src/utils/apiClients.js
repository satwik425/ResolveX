const axios = require("axios");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://127.0.0.1:3001";

const UserClient = {
  /**
   * Verifies if a user exists in the User Service
   * @param {string} userId - User ID to verify
   * @param {string} authHeader 
   */
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

module.exports = { UserClient };

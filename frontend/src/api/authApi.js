import axiosInstance from "../utils/axiosInstance";

const authApi = {
  register: (data) => axiosInstance.post("/api/users/register", data),
  login:    (data) => axiosInstance.post("/api/users/login", data),
  profile:  ()     => axiosInstance.get("/api/users/profile"),
  logout:   ()     => axiosInstance.post("/api/users/logout"),
    allUsers: (search) => axiosInstance.get(`/api/users${search ? `?search=${encodeURIComponent(search)}` : ""}`)
};

export default authApi;
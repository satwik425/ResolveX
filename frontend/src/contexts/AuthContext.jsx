import { createContext, useContext, useState } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);



  const login = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login(data);
     
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.register(data);
      
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
   
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.profile();
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setUser(null);
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      fetchProfile,
      isAuthenticated: !!user  
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  const { user } = useAuth();

 
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

 
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };


  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };


  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };


  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };


  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

/*
example use:
{
  id: Date.now(),
  type: "MEMBER_ADDED",
  message: "You have been added to Project Alpha as admin",
  read: false,
  createdAt: new Date().toISOString()
}
  */
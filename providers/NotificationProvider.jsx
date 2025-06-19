"use client";
import { createContext, useContext, useState } from "react";
const NotificationContext = createContext();
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const notify = (msg, type = "info") =>
    setNotifications((n) => [...n, { msg, type, id: Date.now() }]);
  const remove = (id) =>
    setNotifications((n) => n.filter((noti) => noti.id !== id));
  return (
    <NotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}
      {/* Aquí puedes renderizar tus toasts/notificaciones */}
    </NotificationContext.Provider>
  );
}
export const useNotification = () => useContext(NotificationContext);

"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, "success", duration);
  const error = (message, duration) => addToast(message, "error", duration);
  const info = (message, duration) => addToast(message, "info", duration);
  const warning = (message, duration) => addToast(message, "warning", duration);

  return (
    <ToastContext.Provider
      value={{ success, error, info, warning, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function Toast({ toast, removeToast }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getToastStyles = () => {
    const baseStyles =
      "flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300";

    switch (toast.type) {
      case "success":
        return `${baseStyles} bg-green-500 text-white`;
      case "error":
        return `${baseStyles} bg-red-500 text-white`;
      case "warning":
        return `${baseStyles} bg-yellow-500 text-white`;
      case "info":
        return `${baseStyles} bg-blue-500 text-white`;
      default:
        return `${baseStyles} bg-gray-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "💬";
    }
  };

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
};

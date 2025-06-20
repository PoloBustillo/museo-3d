"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [sessionData, setSessionData] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("loading");
  const [lastActivity, setLastActivity] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Actualizar actividad del usuario
  const updateActivity = () => {
    setLastActivity(new Date());
  };

  // Calcular duración de la sesión
  useEffect(() => {
    if (sessionData) {
      const interval = setInterval(() => {
        if (sessionData?.expires) {
          const now = new Date();
          const expires = new Date(sessionData.expires);
          const duration = Math.max(0, expires.getTime() - now.getTime());
          setSessionDuration(duration);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionData]);

  // Escuchar eventos de actividad del usuario
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Formatear duración de sesión
  const formatSessionDuration = () => {
    if (sessionDuration <= 0) return "Sesión expirada";

    const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
    const minutes = Math.floor(
      (sessionDuration % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((sessionDuration % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Verificar si la sesión está por expirar
  const isSessionExpiringSoon = () => {
    return sessionDuration > 0 && sessionDuration < 5 * 60 * 1000; // 5 minutos
  };

  // Verificar si la sesión ha expirado
  const isSessionExpired = () => {
    return sessionDuration <= 0;
  };

  // Obtener tiempo restante en minutos
  const getSessionTimeRemaining = () => {
    return Math.max(0, Math.floor(sessionDuration / (1000 * 60)));
  };

  return (
    <NextAuthSessionProvider>
      <SessionContext.Provider
        value={{
          // Datos de sesión
          session: sessionData,
          status: sessionStatus,

          // Información de actividad
          lastActivity,
          sessionDuration: formatSessionDuration(),
          sessionTimeRemaining: getSessionTimeRemaining(),

          // Estados de sesión
          isSessionExpiringSoon: isSessionExpiringSoon(),
          isSessionExpired: isSessionExpired(),

          // Funciones
          updateActivity,
          formatSessionDuration,
        }}
      >
        <SessionDataUpdater
          onSessionChange={setSessionData}
          onStatusChange={setSessionStatus}
        />
        {children}
      </SessionContext.Provider>
    </NextAuthSessionProvider>
  );
}

// Componente interno para actualizar datos de sesión
function SessionDataUpdater({ onSessionChange, onStatusChange }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    onSessionChange(session);
  }, [session, onSessionChange]);

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  return null;
}

export const useSessionData = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSessionData debe ser usado dentro de un SessionProvider"
    );
  }
  return context;
};

"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userName, setUserName] = useState("");

  // Cargar perfil del usuario cuando la sesión esté disponible
  useEffect(() => {
    if (session?.user?.email && status === "authenticated") {
      loadUserProfile(session.user.email);
    } else {
      setUserProfile(null);
    }
  }, [session?.user?.email, status]);

  useEffect(() => {
    if (userProfile?.name) {
      setUserName(userProfile.name);
    } else if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [userProfile?.name, session?.user?.name]);

  const loadUserProfile = async (email) => {
    if (!email) return;

    setUserProfile(null); // Limpiar antes de cargar
    setIsLoadingProfile(true);
    try {
      const response = await fetch(
        `/api/usuarios/email/${encodeURIComponent(email)}?t=${Date.now()}` // Forzar no-cache
      );
      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData.user); // Solo guardar el objeto user
      } else {
        console.error("Error loading user profile:", response.statusText);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUserProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch(`/api/usuarios/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadUserProfile(session.user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  };

  const getUserRole = () => {
    return userProfile?.roles?.[0] || "user";
  };

  const hasRole = (role) => {
    return userProfile?.roles?.includes(role) || false;
  };

  const getUserSetting = (key) => {
    return userProfile?.settings?.[key];
  };

  const updateUserSetting = async (key, value) => {
    return await updateUserProfile({
      settings: { [key]: value },
    });
  };

  const isAdmin = () => hasRole("admin");
  const isModerator = () => hasRole("moderator") || hasRole("admin");
  const isAuthenticated = () => status === "authenticated";

  return (
    <UserContext.Provider
      value={{
        // Datos básicos
        user: session?.user,
        userProfile,
        userName,
        status,

        // Estados de carga
        isLoadingProfile,
        isLoading: status === "loading",

        // Funciones de autenticación
        isAuthenticated: isAuthenticated(),
        isAdmin: isAdmin(),
        isModerator: isModerator(),

        // Funciones de roles
        getUserRole,
        hasRole,

        // Funciones de perfil
        loadUserProfile,
        updateUserProfile,

        // Funciones de configuración
        getUserSetting,
        updateUserSetting,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};

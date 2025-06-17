"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireRole = null,
  redirectTo = "/no-autorizado",
  fallback = null 
}) {
  const { data: session, status } = useSession();

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Si no se requiere autenticación, mostrar contenido
  if (!requireAuth) {
    return children;
  }

  // Si se requiere autenticación y hay sesión
  if (session) {
    // Si se requiere un rol específico, verificar
    if (requireRole && !session.user?.role?.includes(requireRole)) {
      // El middleware ya debe haber manejado esto, pero por si acaso
      return null;
    }
    return children;
  }

  // Si se requiere autenticación pero no hay sesión
  // El middleware debe haber redirigido, pero mostramos loading por si acaso
  return fallback || (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}

// Hook personalizado para verificar permisos
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    hasRole: (role) => session?.user?.role?.includes(role) || false,
    isAdmin: session?.user?.role?.includes("admin") || false,
    isCurator: session?.user?.role?.includes("curator") || false,
  };
}

// Componente para mostrar contenido solo si el usuario tiene permisos
export function ConditionalRender({ 
  requireAuth = false, 
  requireRole = null, 
  children, 
  fallback = null 
}) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return fallback;
  }

  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  if (requireRole && !hasRole(requireRole)) {
    return fallback;
  }

  return children;
}

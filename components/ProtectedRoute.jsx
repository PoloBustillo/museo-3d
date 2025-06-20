"use client";
import { useUser } from "../providers/UserProvider";
import { useModal } from "../providers/ModalProvider";
import { ModalWrapper } from "./ui/Modal";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  fallback = null,
  showLoginModal = true,
}) {
  const { isAuthenticated, isAdmin, isModerator, hasRole, isLoading } =
    useUser();
  const { openModal } = useModal();

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    if (showLoginModal) {
      // Abrir modal de login automáticamente
      setTimeout(() => {
        openModal("auth-modal", { mode: "login" });
      }, 100);
    }

    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6 opacity-20">🔒</div>
            <h2 className="text-2xl font-light text-gray-600 mb-4">
              Acceso Requerido
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Necesitas iniciar sesión para acceder a esta página.
            </p>
            <button
              onClick={() => openModal("auth-modal", { mode: "login" })}
              className="bg-slate-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300"
            >
              🔑 Iniciar Sesión
            </button>
          </div>
        </div>
      )
    );
  }

  // Si requiere un rol específico
  if (requiredRole) {
    const hasRequiredRole = hasRole(requiredRole);

    if (!hasRequiredRole) {
      return (
        fallback || (
          <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-6 opacity-20">🚫</div>
              <h2 className="text-2xl font-light text-gray-600 mb-4">
                Acceso Denegado
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                No tienes los permisos necesarios para acceder a esta página.
                <br />
                <span className="font-medium">
                  Rol requerido: {requiredRole}
                </span>
              </p>
              <button
                onClick={() =>
                  openModal("user-info-modal", {
                    showRequiredRole: requiredRole,
                  })
                }
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300"
              >
                👤 Ver Mi Perfil
              </button>
            </div>
          </div>
        )
      );
    }
  }

  // Si todo está bien, mostrar el contenido
  return children;
}

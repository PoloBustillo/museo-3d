"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useUser } from "../../../providers/UserProvider";
import { useModal } from "../../../providers/ModalProvider";

export default function AdminUsuariosPage() {
  const { user, userProfile, isAdmin, isModerator, getUserRole } = useUser();
  const { openModal } = useModal();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 mt-2">
                  Panel de administración para gestionar usuarios del sistema
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">
                    Administrador: {user?.name || user?.email}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                    {getUserRole()}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  openModal("user-info-modal", {
                    user,
                    userProfile,
                    role: getUserRole(),
                    isAdmin,
                    isModerator,
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                👤 Mi Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">👑</div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Panel de Administración de Usuarios
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Esta página solo es accesible para usuarios con rol de
                administrador. Aquí puedes gestionar todos los usuarios del
                sistema, asignar roles, moderar contenido y configurar el
                sistema.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-medium text-blue-900 mb-3">
                  Funcionalidades del UserProvider en acción:
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>
                    • ✅ <strong>ProtectedRoute</strong> verifica
                    automáticamente el rol requerido
                  </li>
                  <li>
                    • ✅ <strong>useUser</strong> proporciona acceso a datos del
                    usuario
                  </li>
                  <li>
                    • ✅ <strong>hasRole()</strong> verifica permisos
                    específicos
                  </li>
                  <li>
                    • ✅ <strong>isAdmin/isModerator</strong> para
                    verificaciones rápidas
                  </li>
                  <li>
                    • ✅ <strong>getUserRole()</strong> obtiene el rol principal
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    👥 Usuarios
                  </h4>
                  <p className="text-sm text-green-800">
                    Gestionar usuarios, roles y permisos
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    📝 Contenido
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Moderar y revisar contenido del museo
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">
                    ⚙️ Sistema
                  </h4>
                  <p className="text-sm text-purple-800">
                    Configurar parámetros del sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

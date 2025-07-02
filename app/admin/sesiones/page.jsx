"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useUser } from "../../../providers/UserProvider";
import { useSessionData } from "../../../providers/SessionProvider";
import { useModal } from "../../../providers/ModalProvider";

export default function AdminSesionesPage() {
  const { user, userProfile, isAdmin, isModerator, getUserRole } = useUser();
  const {
    session,
    sessionDuration,
    sessionTimeRemaining,
    isSessionExpiringSoon,
    isSessionExpired,
    lastActivity,
    updateActivity,
  } = useSessionData();
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
                  <span className="text-2xl">⏱️</span>
                  Administración de Sesiones
                </h1>
                <p className="text-gray-600 mt-2">
                  Panel de administración para gestionar sesiones del sistema
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">
                    Administrador:{" "}
                    {userProfile?.name || user?.name || user?.email}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                    {getUserRole()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información de Sesión Actual */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔄 Sesión Actual
              </h2>

              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isSessionExpired
                          ? "bg-red-100 text-red-800"
                          : isSessionExpiringSoon
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {isSessionExpired
                        ? "Expirada"
                        : isSessionExpiringSoon
                        ? "Por expirar"
                        : "Activa"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{sessionDuration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tiempo restante:</span>
                    <span className="font-medium">
                      {sessionTimeRemaining} minutos
                    </span>
                  </div>

                  {lastActivity && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Última actividad:</span>
                      <span className="font-medium">
                        {new Date(lastActivity).toLocaleTimeString("es-ES")}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Progreso de Sesión
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isSessionExpired
                            ? "bg-red-500"
                            : isSessionExpiringSoon
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (sessionTimeRemaining / 60) * 100)
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={updateActivity}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔄 Actualizar Actividad
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔒</div>
                  <p className="text-gray-600">No hay sesión activa</p>
                </div>
              )}
            </div>

            {/* Estadísticas del Sistema */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Estadísticas del Sistema
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {session ? "1" : "0"}
                    </div>
                    <div className="text-sm text-blue-800">
                      Sesiones Activas
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {sessionTimeRemaining}
                    </div>
                    <div className="text-sm text-green-800">
                      Minutos Restantes
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">
                    Alertas de Seguridad
                  </h3>
                  <div className="space-y-2 text-sm">
                    {isSessionExpired && (
                      <div className="flex items-center gap-2 text-red-600">
                        <span>⚠️</span>
                        <span>Sesión expirada - Se requiere renovación</span>
                      </div>
                    )}
                    {isSessionExpiringSoon && (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <span>⚠️</span>
                        <span>Sesión por expirar en menos de 5 minutos</span>
                      </div>
                    )}
                    {!isSessionExpired && !isSessionExpiringSoon && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span>✅</span>
                        <span>Sesión segura y activa</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del SessionProvider */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔧 Funcionalidades del SessionProvider
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Gestión de Sesiones
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ✅ Seguimiento de duración</li>
                  <li>• ✅ Cálculo de tiempo restante</li>
                  <li>• ✅ Detección de expiración</li>
                  <li>• ✅ Alertas automáticas</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  Actividad del Usuario
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• ✅ Monitoreo de actividad</li>
                  <li>• ✅ Última interacción</li>
                  <li>• ✅ Eventos de mouse/keyboard</li>
                  <li>• ✅ Actualización automática</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Seguridad</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• ✅ Verificación de estado</li>
                  <li>• ✅ Alertas de seguridad</li>
                  <li>• ✅ Gestión de expiración</li>
                  <li>• ✅ Protección automática</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

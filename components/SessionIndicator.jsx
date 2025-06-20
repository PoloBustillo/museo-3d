"use client";
import { useSessionData } from "../providers/SessionProvider";
import { useModal } from "../providers/ModalProvider";

export default function SessionIndicator() {
  const {
    session,
    sessionDuration,
    sessionTimeRemaining,
    isSessionExpiringSoon,
    isSessionExpired,
    lastActivity,
  } = useSessionData();
  const { openModal } = useModal();

  if (!session) {
    return null;
  }

  const getStatusColor = () => {
    if (isSessionExpired) return "bg-red-500";
    if (isSessionExpiringSoon) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (isSessionExpired) return "Sesión expirada";
    if (isSessionExpiringSoon) return "Por expirar";
    return "Activa";
  };

  const handleClick = () => {
    openModal("session-info-modal", {
      session,
      showDetails: true,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleClick}
        className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 hover:bg-white transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          {/* Indicador de estado */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </span>
          </div>

          {/* Información de tiempo */}
          <div className="text-right">
            <div className="text-xs text-gray-500">Sesión</div>
            <div className="text-sm font-semibold text-gray-900">
              {sessionDuration}
            </div>
          </div>

          {/* Icono */}
          <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
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
      </button>
    </div>
  );
}

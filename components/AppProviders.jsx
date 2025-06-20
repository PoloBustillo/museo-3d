"use client";
import { SessionProvider } from "../providers/SessionProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import { UserProvider } from "../providers/UserProvider";
import { ModalProvider } from "../providers/ModalProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import { SoundProvider } from "../providers/SoundProvider";
import { GalleryProvider } from "../providers/GalleryProvider";
import { DeviceProvider } from "../providers/DeviceProvider";
import { CollectionProvider } from "../providers/CollectionProvider";
import AuthModal from "./AuthModal";
import { ModalWrapper } from "./ui/Modal";
import SessionIndicator from "./SessionIndicator";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from "./ui/toast";

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <UserProvider>
          <ModalProvider>
            <NotificationProvider>
              <SoundProvider>
                <GalleryProvider>
                  <DeviceProvider>
                    <CollectionProvider>
                      <ToastProvider>
                        {children}
                        <AuthModal />
                        <ModalWrapper
                          modalName="info-modal"
                          title="Información"
                          size="md"
                        >
                          {(data) => (
                            <div className="space-y-4">
                              <div className="text-center">
                                <div className="text-4xl mb-4">ℹ️</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {data?.title || "Información"}
                                </h3>
                                <p className="text-gray-600">
                                  {data?.content ||
                                    "Este es un modal de ejemplo usando el ModalProvider."}
                                </p>
                              </div>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">
                                  Características del ModalProvider:
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                  <li>• ✅ Gestión centralizada de modales</li>
                                  <li>
                                    • ✅ Fácil de usar en cualquier componente
                                  </li>
                                  <li>• ✅ Soporte para datos dinámicos</li>
                                  <li>• ✅ Cierre con ESC y click fuera</li>
                                  <li>• ✅ Diferentes tamaños disponibles</li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </ModalWrapper>

                        {/* Modal de información del usuario */}
                        <ModalWrapper
                          modalName="user-info-modal"
                          title="Información del Usuario"
                          size="lg"
                        >
                          {(data) => (
                            <div className="space-y-6">
                              {data?.user && (
                                <>
                                  <div className="flex items-center gap-4">
                                    <img
                                      src={
                                        data.user.image ||
                                        "/assets/default-avatar.svg"
                                      }
                                      alt={data.user.name || "Usuario"}
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                      <h3 className="text-xl font-semibold text-gray-900">
                                        {data.user.name || "Usuario"}
                                      </h3>
                                      <p className="text-gray-600">
                                        {data.user.email}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Rol:{" "}
                                        <span className="font-medium">
                                          {data.role}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  {data?.userProfile && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-3">
                                        Perfil Completo
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            ID:
                                          </span>{" "}
                                          {data.userProfile.id}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Email verificado:
                                          </span>{" "}
                                          {data.userProfile.emailVerified
                                            ? "Sí"
                                            : "No"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Proveedor:
                                          </span>{" "}
                                          {data.userProfile.provider || "N/A"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Creado:
                                          </span>{" "}
                                          {new Date(
                                            data.userProfile.creadoEn
                                          ).toLocaleDateString("es-ES")}
                                        </p>

                                        {data.userProfile.roles && (
                                          <div>
                                            <span className="font-medium">
                                              Roles:
                                            </span>
                                            <div className="flex gap-1 mt-1">
                                              {data.userProfile.roles.map(
                                                (role, index) => (
                                                  <span
                                                    key={index}
                                                    className={`text-xs px-2 py-1 rounded-full ${
                                                      role === "admin"
                                                        ? "bg-red-100 text-red-800"
                                                        : role === "moderator"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-blue-100 text-blue-800"
                                                    }`}
                                                  >
                                                    {role}
                                                  </span>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {data.userProfile.settings &&
                                          Object.keys(data.userProfile.settings)
                                            .length > 0 && (
                                            <div>
                                              <span className="font-medium">
                                                Configuraciones:
                                              </span>
                                              <div className="mt-1 space-y-1">
                                                {Object.entries(
                                                  data.userProfile.settings
                                                ).map(([key, value]) => (
                                                  <p
                                                    key={key}
                                                    className="text-xs"
                                                  >
                                                    {key}: {value}
                                                  </p>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  )}

                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                      Características del UserProvider:
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                      <li>
                                        • ✅ Gestión centralizada del usuario
                                      </li>
                                      <li>• ✅ Carga automática del perfil</li>
                                      <li>• ✅ Sistema de roles y permisos</li>
                                      <li>
                                        • ✅ Configuraciones personalizadas
                                      </li>
                                      <li>• ✅ Funciones de actualización</li>
                                    </ul>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </ModalWrapper>

                        {/* Modal de éxito */}
                        <ModalWrapper
                          modalName="success-modal"
                          title="Éxito"
                          size="sm"
                        >
                          {(data) => (
                            <div className="text-center space-y-4">
                              <div className="text-6xl">✅</div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {data?.title || "Operación Exitosa"}
                              </h3>
                              <p className="text-gray-600">
                                {data?.content ||
                                  "La operación se completó correctamente."}
                              </p>
                            </div>
                          )}
                        </ModalWrapper>

                        {/* Modal de error */}
                        <ModalWrapper
                          modalName="error-modal"
                          title="Error"
                          size="sm"
                        >
                          {(data) => (
                            <div className="text-center space-y-4">
                              <div className="text-6xl">❌</div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {data?.title || "Error"}
                              </h3>
                              <p className="text-gray-600">
                                {data?.content ||
                                  "Ha ocurrido un error. Inténtalo de nuevo."}
                              </p>
                            </div>
                          )}
                        </ModalWrapper>

                        {/* Modal de información de sesión */}
                        <ModalWrapper
                          modalName="session-info-modal"
                          title="Información de Sesión"
                          size="lg"
                        >
                          {(data) => (
                            <div className="space-y-6">
                              {data?.session && (
                                <>
                                  <div className="flex items-center gap-4">
                                    <div className="text-4xl">⏱️</div>
                                    <div>
                                      <h3 className="text-xl font-semibold text-gray-900">
                                        Información de Sesión
                                      </h3>
                                      <p className="text-gray-600">
                                        Detalles de tu sesión actual
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                      Datos de Sesión
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <span className="font-medium">
                                          Proveedor:
                                        </span>{" "}
                                        {data.session.user?.provider || "N/A"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Tipo:
                                        </span>{" "}
                                        {data.session.user?.accountType ||
                                          "N/A"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Creada:
                                        </span>{" "}
                                        {data.session.created
                                          ? new Date(
                                              data.session.created
                                            ).toLocaleString("es-ES")
                                          : "N/A"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Expira:
                                        </span>{" "}
                                        {data.session.expires
                                          ? new Date(
                                              data.session.expires
                                            ).toLocaleString("es-ES")
                                          : "N/A"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Actualizada:
                                        </span>{" "}
                                        {data.session.updatedAt
                                          ? new Date(
                                              data.session.updatedAt
                                            ).toLocaleString("es-ES")
                                          : "N/A"}
                                      </p>
                                    </div>
                                  </div>

                                  {data?.user && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-blue-900 mb-3">
                                        Usuario de Sesión
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Nombre:
                                          </span>{" "}
                                          {data.user.name || "N/A"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Email:
                                          </span>{" "}
                                          {data.user.email || "N/A"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Imagen:
                                          </span>{" "}
                                          {data.user.image ? "Sí" : "No"}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Rol:
                                          </span>{" "}
                                          {data.user.role || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </ModalWrapper>
                      </ToastProvider>
                    </CollectionProvider>
                    {/* Indicador de sesión global */}
                    <SessionIndicator />
                  </DeviceProvider>
                </GalleryProvider>
              </SoundProvider>
            </NotificationProvider>
          </ModalProvider>
        </UserProvider>
      </ThemeProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          position: "fixed",
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            maxWidth: "400px",
            minWidth: "300px",
            position: "fixed",
            zIndex: 9999,
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid #10b981",
              borderLeft: "4px solid #10b981",
              position: "fixed",
              zIndex: 9999,
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid #ef4444",
              borderLeft: "4px solid #ef4444",
              position: "fixed",
              zIndex: 9999,
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid #3b82f6",
              borderLeft: "4px solid #3b82f6",
              position: "fixed",
              zIndex: 9999,
            },
          },
        }}
      />
      {typeof window !== "undefined" &&
        (window.testToast = () => {
          import("react-hot-toast").then(({ toast }) =>
            toast.success("Toast global de prueba")
          );
        })}
    </SessionProvider>
  );
}

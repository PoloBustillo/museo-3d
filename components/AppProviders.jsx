"use client";
import { SessionProvider } from "next-auth/react";
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
                                        <span className="font-medium">ID:</span>{" "}
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
                                    <li>• ✅ Configuraciones personalizadas</li>
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
                    </CollectionProvider>
                  </DeviceProvider>
                </GalleryProvider>
              </SoundProvider>
            </NotificationProvider>
          </ModalProvider>
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

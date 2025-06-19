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

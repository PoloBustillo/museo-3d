"use client";
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "../providers/UserProvider";
import { ModalProvider } from "../providers/ModalProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import { SoundProvider } from "../providers/SoundProvider";
import { GalleryProvider } from "../providers/GalleryProvider";
import { DeviceProvider } from "../providers/DeviceProvider";
import { CollectionProvider } from "../providers/CollectionProvider";
import { ThemeProvider } from "../providers/ThemeProvider";
import ClientLayout from "../components/ClientLayout";
import ColorCursorEffect from "./components/ColorCursorEffect";
import MouseTrail from "./components/MouseTrail";
import GalleryImageModal from "../components/GalleryImageModal";
import { ModalWrapper } from "../components/ui/Modal";

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <ColorCursorEffect />
      <MouseTrail />
      <DeviceProvider>
        <UserProvider>
          <ModalProvider>
            <NotificationProvider>
              <SoundProvider>
                <GalleryProvider>
                  <CollectionProvider>
                    <ThemeProvider>
                      <ClientLayout>{children}</ClientLayout>
                      <GalleryImageModal />

                      {/* Modal de información */}
                      <ModalWrapper
                        modalName="info-modal"
                        title="Información"
                        size="md"
                      >
                        {(data) => (
                          <div className="space-y-4">
                            <p className="text-gray-700">
                              {data?.content || "Información del modal"}
                            </p>
                            {data?.title && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Título:</strong> {data.title}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </ModalWrapper>
                    </ThemeProvider>
                  </CollectionProvider>
                </GalleryProvider>
              </SoundProvider>
            </NotificationProvider>
          </ModalProvider>
        </UserProvider>
      </DeviceProvider>
    </SessionProvider>
  );
}

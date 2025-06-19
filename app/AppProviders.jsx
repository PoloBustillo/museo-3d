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

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

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <UserProvider>
          <DeviceProvider>
            <GalleryProvider>
              <CollectionProvider>
                <ModalProvider>
                  <NotificationProvider>
                    <SoundProvider>{children}</SoundProvider>
                  </NotificationProvider>
                </ModalProvider>
              </CollectionProvider>
            </GalleryProvider>
          </DeviceProvider>
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

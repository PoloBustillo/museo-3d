'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { ParallaxProvider } from 'react-scroll-parallax';
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <ParallaxProvider>
        <AuthProvider> 
        <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        </ParallaxProvider>
      </body>
    </html>
  );
}
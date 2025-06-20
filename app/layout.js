import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import AppProviders from "../components/AppProviders";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Museo 3D - Arte Urbano",
  description: "Explora el arte urbano en una experiencia inmersiva 3D",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} antialiased`}
      >
        <AppProviders>
          <ClientLayout>{children}</ClientLayout>
        </AppProviders>
        <Toaster
          position="top-center"
          reverseOrder={true}
          limit={1}
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.95)",
              color: "#1e293b",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              maxWidth: "400px",
              minWidth: "300px",
              backdropFilter: "blur(4px)",
            },
            success: {
              style: {
                background: "rgba(34,197,94,0.95)",
                color: "#fff",
                border: "1px solid #22c55e",
              },
            },
            error: {
              style: {
                background: "rgba(239,68,68,0.95)",
                color: "#fff",
                border: "1px solid #ef4444",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

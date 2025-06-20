import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import AppProviders from "../components/AppProviders";
import { Toaster } from "react-hot-toast";

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
  if (typeof window !== "undefined") {
    window.testToast = () => {
      import("react-hot-toast").then(({ toast }) =>
        toast.success("Toast global de prueba")
      );
    };
  }
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
          reverseOrder={false}
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
                "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
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
      </body>
    </html>
  );
}

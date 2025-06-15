import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Museo 3D - Arte Urbano",
  description: "Explora el arte urbano en una experiencia inmersiva 3D",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}

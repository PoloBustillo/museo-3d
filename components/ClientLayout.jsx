"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ParallaxProvider } from "react-scroll-parallax";
import AuthProvider from "../providers/AuthProvider";
import MainMenu from "./MainMenu";
import Footer from "./Footer";

// Para usar el nuevo menú elegante, descomenta la siguiente línea e importa ElegantMenu
// import ElegantMenu from "./ElegantMenu";

// Luego reemplaza <MainMenu /> con <ElegantMenu /> en la línea correspondiente
// <MainMenu
//   onSubirArchivo={(e) => handleRouteTransition(e, "/crear-sala")}
//   onNavigate={handleRouteTransition}
// />

const FRASES_MURALISTAS = [
  "Pinto lo que veo, lo que pienso y lo que siento. - Diego Rivera",
  "El arte debe servir como arma en la lucha por la liberación. - Diego Rivera",
  "Mi pincel es mi arma y mi arte es mi revolución. - Diego Rivera",
  "La pintura debe gritar, debe ser una alarma. - José Clemente Orozco",
  "El arte supremo es el que educa y eleva el espíritu. - José Clemente Orozco",
  "Mi obra es mi biografía. - José Clemente Orozco",
  "No hay más ruta que la nuestra. - David Alfaro Siqueiros",
  "Arte para todos, no para unos cuantos. - David Alfaro Siqueiros",
  "El arte debe transformar la sociedad. - David Alfaro Siqueiros",
  "El muralismo es un arte para el pueblo. - Diego Rivera",
];

const BANKSY_IMAGES = [
  "/assets/bansky.webp",
  "/assets/bansky1.webp",
  "/assets/bansky2.webp",
  "/assets/bansky3.webp",
  "/assets/bansky4.webp",
];

export default function ClientLayout({ children }) {
  const [hoveringBottom, setHoveringBottom] = useState(false);
  const [frase, setFrase] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const mainRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Páginas que no necesitan padding-top (manejan su propio espaciado)
  const noTopPaddingPages = ["/", "/museo", "/perfil"];
  const needsTopPadding = !noTopPaddingPages.includes(pathname);
  const isMainOrMuseo = noTopPaddingPages.includes(pathname);

  // Detectar si es mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Inicializar imagen y frase al montar el componente
  useEffect(() => {
    setFrase(
      FRASES_MURALISTAS[Math.floor(Math.random() * FRASES_MURALISTAS.length)]
    );
    setCurrentImage(
      BANKSY_IMAGES[Math.floor(Math.random() * BANKSY_IMAGES.length)]
    );
  }, []);

  return (
    <ParallaxProvider>
      <AuthProvider>
        <div className="bg-white dark:bg-black text-black dark:text-white flex flex-col relative transition-colors duration-300">
          <header className="sticky top-0 z-[60]">
            <MainMenu />
          </header>
          <main
            ref={mainRef}
            className={`flex-1 relative ${
              needsTopPadding ? "pt-16 md:pt-20" : ""
            } ${pathname === "/" && isMobile ? "overflow-y-auto" : ""}`}
          >
            {children}
            {isMainOrMuseo && (
              <div
                className="absolute bottom-0 left-0 w-full h-[100px]"
                onMouseEnter={() => setHoveringBottom(true)}
                onMouseLeave={() => setHoveringBottom(false)}
              />
            )}
          </main>
          {isMainOrMuseo ? (
            <footer
              onMouseEnter={() => setHoveringBottom(true)}
              onMouseLeave={() => setHoveringBottom(false)}
              className={`
                  hidden md:block
                  fixed bottom-0 left-0 w-full z-[15] transition-all duration-500
                  ${
                    hoveringBottom
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-full pointer-events-none"
                  }
                `}
            >
              <Footer />
            </footer>
          ) : (
            <footer className="block w-full z-[15]">
              <Footer />
            </footer>
          )}
        </div>
      </AuthProvider>
    </ParallaxProvider>
  );
}

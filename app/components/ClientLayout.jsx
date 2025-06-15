"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ParallaxProvider } from 'react-scroll-parallax';
import AuthProvider from "./AuthProvider";
import MainMenu from "./MainMenu";
import Footer from "./Footer";

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
  "/assets/bansky.png",
  "/assets/bansky1.png",
  "/assets/bansky2.png",
  "/assets/bansky3.png",
  "/assets/bansky4.png",
];

export default function ClientLayout({ children }) {
  const [transitioning, setTransitioning] = useState(false);
  const [hoveringBottom, setHoveringBottom] = useState(false);
  const [frase, setFrase] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const mainRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Páginas que no necesitan padding-top (manejan su propio espaciado)
  const noTopPaddingPages = ['/', '/museo'];
  const needsTopPadding = !noTopPaddingPages.includes(pathname);

  // Inicializar imagen y frase al montar el componente
  useEffect(() => {
    setFrase(FRASES_MURALISTAS[Math.floor(Math.random() * FRASES_MURALISTAS.length)]);
    setCurrentImage(BANKSY_IMAGES[Math.floor(Math.random() * BANKSY_IMAGES.length)]);
  }, []);

  useEffect(() => {
    setFrase(FRASES_MURALISTAS[Math.floor(Math.random() * FRASES_MURALISTAS.length)]);
    setCurrentImage(BANKSY_IMAGES[Math.floor(Math.random() * BANKSY_IMAGES.length)]);
  }, [transitioning]);

  const handleRouteTransition = (e, path) => {
    e.preventDefault();
    console.log('Starting transition to:', path);
    setTransitioning(true);
    
    setTimeout(() => {
      console.log('Navigating to:', path);
      router.push(path);
      // Resetear el estado después de la navegación
      setTimeout(() => {
        console.log('Resetting transition state');
        setTransitioning(false);
      }, 500);
    }, 900);
  };

  // Resetear transición cuando cambie la ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setTransitioning(false);
    };

    // Escuchar cambios de ruta para resetear el estado
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <ParallaxProvider>
      <AuthProvider>
        <div className="min-h-screen bg-black text-white flex flex-col relative">
          <header className="sticky top-0 z-[60]">
            <MainMenu
              onSubirArchivo={(e) => handleRouteTransition(e, "/crear-sala")}
              onNavigate={handleRouteTransition}
            />
          </header>

            <AnimatePresence mode="wait">
              {transitioning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed inset-0 z-[3000] flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    background: `
                      radial-gradient(ellipse 70% 40% at 50% -10%, rgba(147, 51, 234, 0.4), transparent),
                      radial-gradient(ellipse 90% 70% at 80% 20%, rgba(244, 114, 182, 0.3), transparent),
                      radial-gradient(ellipse 90% 70% at 20% 80%, rgba(34, 197, 94, 0.25), transparent),
                      radial-gradient(ellipse 100% 60% at 50% 50%, rgba(59, 130, 246, 0.2), transparent),
                      linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(51, 65, 85, 0.95) 100%)
                    `,
                    backdropFilter: 'blur(24px) saturate(1.8)',
                  }}
                >
                  {/* Efectos de luz animados */}
                  <motion.div
                    className="absolute inset-0 opacity-40"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: `
                        conic-gradient(from 0deg at 30% 30%, transparent 0deg, rgba(147, 51, 234, 0.3) 45deg, rgba(244, 114, 182, 0.2) 90deg, transparent 135deg),
                        conic-gradient(from 180deg at 70% 70%, transparent 0deg, rgba(59, 130, 246, 0.25) 45deg, rgba(34, 197, 94, 0.2) 90deg, transparent 135deg)
                      `
                    }}
                  />

                  {/* Segunda capa de efectos rotatorios en dirección opuesta */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: `
                        conic-gradient(from 90deg at 20% 80%, transparent 0deg, rgba(168, 85, 247, 0.15) 60deg, transparent 120deg),
                        conic-gradient(from 270deg at 80% 20%, transparent 0deg, rgba(14, 165, 233, 0.15) 60deg, transparent 120deg)
                      `
                    }}
                  />

                  {/* Partículas de luz */}
                  <motion.div
                    className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.6, 1, 0.6],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                    style={{
                      boxShadow: '0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(244, 114, 182, 0.3)'
                    }}
                  />
                  <motion.div
                    className="absolute top-3/4 right-1/4 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    style={{
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(14, 165, 233, 0.4)'
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 right-1/3 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                    animate={{
                      y: [0, -25, 0],
                      opacity: [0.5, 0.9, 0.5],
                      scale: [1, 1.4, 1]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                    style={{
                      boxShadow: '0 0 18px rgba(34, 197, 94, 0.5), 0 0 35px rgba(16, 185, 129, 0.3)'
                    }}
                  />
                  <motion.div
                    className="absolute top-1/6 right-1/2 w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    animate={{
                      y: [0, -12, 0],
                      opacity: [0.6, 1, 0.6],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
                    style={{
                      boxShadow: '0 0 12px rgba(251, 191, 36, 0.6), 0 0 25px rgba(249, 115, 22, 0.4)'
                    }}
                  />
                  <motion.div
                    className="absolute top-5/6 left-1/3 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                    animate={{
                      y: [0, -18, 0],
                      opacity: [0.5, 0.9, 0.5],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: 2 }}
                    style={{
                      boxShadow: '0 0 16px rgba(99, 102, 241, 0.5), 0 0 32px rgba(139, 92, 246, 0.3)'
                    }}
                  />

                  <motion.img
                    src={currentImage}
                    alt="Banksy pintando"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="relative z-10"
                    style={{
                      maxWidth: 320,
                      width: "40vw",
                      height: "auto",
                      filter: "brightness(1.1) contrast(1.1) drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4)) drop-shadow(0 8px 10px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.2))",
                    }}
                  />
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="relative z-10 text-xl md:text-2xl font-bold text-white mt-6 text-center max-w-2xl px-4"
                    style={{
                      textShadow: '0 4px 8px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4), 0 0 20px rgba(147, 51, 234, 0.3)',
                      filter: 'brightness(1.1)'
                    }}
                  >
                    {frase}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <main ref={mainRef} className={`flex-1 overflow-hidden relative ${needsTopPadding ? 'pt-16 md:pt-20' : ''}`}>
              {children}
              <div
                className="absolute bottom-0 left-0 w-full h-[64px]"
                onMouseEnter={() => setHoveringBottom(true)}
                onMouseLeave={() => setHoveringBottom(false)}
              />
            </main>
            
            <footer
              onMouseEnter={() => setHoveringBottom(true)}
              onMouseLeave={() => setHoveringBottom(false)}
              className={`
                fixed bottom-0 left-0 w-full z-[60] bg-black transition-all duration-500
                ${hoveringBottom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
              `}
            >
              <Footer />
            </footer>
          </div>
      </AuthProvider>
    </ParallaxProvider>
  );
}

"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "./AuthModal";
import ThemeSwitch from "./ThemeSwitch";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./ui/navigation-menu";
import Footer from "./Footer";

// Componente de efecto máquina de escribir
function TypewriterText({ text, speed = 100, delay = 0, repeat = false, repeatDelay = 3000 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    const timer = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          
          // Si repeat está habilitado, reiniciar después del delay
          if (repeat) {
            setTimeout(() => {
              setCycle(prev => prev + 1);
            }, repeatDelay);
          }
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay, repeat, repeatDelay, cycle]);

  return (
    <span className="text-xl font-semibold tracking-wide text-primary inline-block min-w-[120px]">
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-5 bg-primary ml-1"
        />
      )}
    </span>
  );
}

export default function MainMenu({ onSubirArchivo, onNavigate }) {
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Estado para menú móvil
  const fileInputRef = useRef();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('nav') && !event.target.closest('[data-mobile-menu]')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevenir scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Control de visibilidad del navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Siempre visible en el top
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - mostrar navbar
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - ocultar navbar
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);



   const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleSubirArchivo = (e) => {
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => {
      router.push("/crear-sala");
    }, 900);
  };

  return (
    <>
        {/* Navigation Menu with auto-hide on scroll */}
       <motion.nav 
         initial={{ y: 0 }}
         animate={{ y: isVisible ? 0 : -100 }}
         transition={{ duration: 0.3, ease: "easeInOut" }}
         className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-white shadow-sm transition-colors duration-300"
       >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 min-w-fit">
          <img
            src="/assets/nav/logo.svg"
            alt="Logo"
            className="h-8 w-auto flex-shrink-0 dark:hidden"
          />
          <img
            src="/assets/nav/logo-white.svg"
            alt="Logo"
            className="h-8 w-auto flex-shrink-0 hidden dark:block"
          />
          <TypewriterText 
            text="Mural ARPA" 
            speed={120} 
            delay={300} 
            repeat={true} 
            repeatDelay={5000} 
          />
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="text-sm font-medium">
      
            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all">
                Archivo
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-card p-6 rounded-lg shadow-lg border min-w-[200px]">
                <div className="flex flex-col gap-2">
                  <NavigationMenuLink asChild>
                    <Link
                     href="/crear-sala"
                     onClick={onSubirArchivo}
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all"
                    >
                      Crear Sala
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/archivo"
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all"
                      onClick={onNavigate ? (e) => onNavigate(e, "/archivo") : undefined}
                    >
                      Ver archivo
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/museo"
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all"
                      onClick={onNavigate ? (e) => onNavigate(e, "/museo") : undefined}
                    >
                      Explorar mural
                    </Link>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>


            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/acerca-de"
                  className="hover:text-primary transition-all px-3 py-2 rounded-lg"
                   onClick={onNavigate ? (e) => onNavigate(e, "/acerca-de") : undefined}
                >
                  Acerca de
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/museo"
                  className="hover:text-primary transition-all px-3 py-2 rounded-lg"
                 // onClick={onNavigate ? (e) => onNavigate(e, "/museo") : undefined}
                >
                  Museo Virtual
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Usuario autenticado o botón de login */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
          ) : session ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all">
                    <img
                      src={session.user?.image || "/assets/default-avatar.svg"}
                      alt={session.user?.name || "Usuario"}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                      onError={(e) => {
                        e.target.src = "/assets/default-avatar.svg";
                      }}
                    />
                    <span className="hidden md:inline text-sm font-medium">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-card p-4 rounded-lg shadow-lg border min-w-[180px]">
                    <div className="flex flex-col gap-2">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {session.user?.name || "Usuario"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/perfil"
                          className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                        >
                          Mi perfil
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/mis-documentos"
                          className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                        >
                          Mis documentos
                        </Link>
                      </NavigationMenuLink>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <button
              onClick={() => setAuthModal("login")}
              className="hidden md:inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Iniciar sesión
            </button>
          )}
          
          {/* Theme Switch */}
          <ThemeSwitch />
          
          {/* Botón hamburguesa al final con efecto especial */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-3 rounded-lg hover:bg-muted/50 transition-all duration-300 relative overflow-hidden group hamburger-button ${
              mobileMenuOpen ? 'hamburger-special-open' : ''
            }`}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              {/* Línea superior */}
              <div 
                className={`hamburger-line-top absolute w-5 h-0.5 bg-current transition-all duration-500 ease-out ${
                  mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`}
              />
              
              {/* Línea media con efecto especial de desaparición de izq a der */}
              <div 
                className={`hamburger-line-middle absolute h-0.5 bg-current ${
                  mobileMenuOpen ? 'w-0 opacity-0' : 'w-5 opacity-100'
                }`}
                style={{
                  transformOrigin: 'left center',
                  transition: mobileMenuOpen 
                    ? 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out 0.2s'
                    : 'width 0.3s ease-out 0.1s, opacity 0.2s ease-out'
                }}
              />
              
              {/* Línea inferior */}
              <div 
                className={`hamburger-line-bottom absolute w-5 h-0.5 bg-current transition-all duration-500 ease-out ${
                  mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                }`}
              />
            </div>
            
            {/* SVG para el efecto de borde que se completa */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 48 48"
              style={{ transform: 'scale(0.8)' }}
            >
              <rect
                x="6"
                y="6"
                width="36"
                height="36"
                rx="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-all duration-1000 ease-out"
                style={{
                  strokeDasharray: '144',
                  strokeDashoffset: mobileMenuOpen ? '0' : '144',
                  opacity: mobileMenuOpen ? '0.6' : '0',
                  transitionDelay: mobileMenuOpen ? '400ms' : '0ms'
                }}
              />
            </svg>
            
            {/* Efecto de resplandor suave */}
            <div 
              className={`absolute inset-0 rounded-lg bg-primary/15 transition-all duration-700 ${
                mobileMenuOpen ? 'opacity-100 scale-110 blur-sm' : 'opacity-0 scale-100'
              }`}
              style={{
                transitionDelay: mobileMenuOpen ? '500ms' : '0ms'
              }}
            />
          </button>
        </div>
      </div>
    </motion.nav>

    {/* Menú móvil */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed top-[73px] left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg"
          data-mobile-menu
        >
          <div className="max-w-screen-xl mx-auto px-4 py-4 space-y-3">
            {/* Enlaces principales */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/museo"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
            >
              Museo Virtual
            </Link>
            <Link
              href="/archivo"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
            >
              Archivo
            </Link>
            <Link
              href="/acerca-de"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
            >
              Acerca de
            </Link>

            {/* Separador */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            {/* Área de usuario */}
            {session ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                  <img
                    src={session.user?.image || "/assets/default-avatar.svg"}
                    alt={session.user?.name || "Usuario"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                    onError={(e) => {
                      e.target.src = "/assets/default-avatar.svg";
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {session.user?.name || "Usuario"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base hover:text-primary transition-colors"
                >
                  Mi perfil
                </Link>
                <Link
                  href="/mis-documentos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base hover:text-primary transition-colors"
                >
                  Mis documentos
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setAuthModal("login");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setAuthModal("register");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-base font-medium hover:text-primary transition-colors"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AuthModal
        open={!!authModal}
        mode={authModal}
        onClose={() => setAuthModal(null)}
      />

  
</>
  
    );

  }
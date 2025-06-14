"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "./AuthModal";

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

export default function MainMenu({ onSubirArchivo, onNavigate }) {
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
  const fileInputRef = useRef();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
         className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md text-foreground shadow-sm"
       >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/assets/nav/logo.svg"
            alt="Logo"
            className="h-8 w-auto"

          />
          <span className="text-xl font-semibold tracking-wide text-primary">
            Mural ARPA
          </span>
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex text-sm font-medium">
      
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
        <div className="flex items-center gap-3">
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
                        className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-all text-sm text-red-600 hover:text-red-700"
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
        </div>
      </div>
    </motion.nav>
     <AuthModal
        open={!!authModal}
        mode={authModal}
        onClose={() => setAuthModal(null)}
      />

  
</>
  
    );

  }
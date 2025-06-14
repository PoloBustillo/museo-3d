"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
      router.push("/subir-archivo");
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
                     href="/subir-archivo"
                     onClick={onSubirArchivo}
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all"
                    >
                      Subir documento
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
                  href="#about"
                  className="hover:text-primary transition-all px-3 py-2 rounded-lg"
                   onClick={onNavigate ? (e) => onNavigate(e, "#about") : undefined}
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

        {/* Botón (ej. iniciar sesión) */}
        <div className="flex items-center gap-3">
           <button
            onClick={() => setAuthModal("login")}
            className="hidden md:inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            
          >
            Iniciar sesión
          </button>
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
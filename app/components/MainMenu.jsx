"use client";
import Link from "next/link";
import { useState, useRef } from "react";
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
        {/* Navigation Menu */}
       <nav className="sticky top-0 z-50 w-full border-b border-border bg-background text-foreground shadow-sm">
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
          <NavigationMenuList className="hidden md:flex gap-6 text-sm font-medium">
      
            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition">
                Archivo
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-card p-4 rounded-lg shadow-lg">
                <NavigationMenuLink asChild>
                  <Link
                   href="/subir-archivo"
                   onClick={onSubirArchivo}
                    className="block px-2 py-1 rounded-md hover:bg-muted hover:text-primary transition"
                  >
                    Subir documento
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link
                    href="/museo"
                    className="block px-2 py-1 rounded-md hover:bg-muted hover:text-primary transition"
                    onClick={onNavigate ? (e) => onNavigate(e, "/museo") : undefined}
                  >
                    Explorar mural
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>


            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="#about"
                  className="hover:text-primary transition"
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
                  className="hover:text-primary transition"
                 // onClick={onNavigate ? (e) => onNavigate(e, "/museo") : undefined}
                >
                  Museo Virtual
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Botón (ej. iniciar sesión) */}
        <div className="flex items-center gap-2">
           <button
            onClick={() => setAuthModal("login")}
            className="hidden md:inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-secondary transition"
            
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </nav>
     <AuthModal
        open={!!authModal}
        mode={authModal}
        onClose={() => setAuthModal(null)}
      />

  
</>
  
    );

  }
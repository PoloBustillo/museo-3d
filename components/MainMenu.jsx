"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import ThemeSwitch from "./ThemeSwitch";
import { UserRoundCog } from "lucide-react";
import { useModal } from "../providers/ModalProvider";
import { useUser } from "../providers/UserProvider";
import { useSessionData } from "../providers/SessionProvider";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

import useIsMobile from "../app/hooks/useIsMobile";
import TypewriterText from "./shared/TypewriterText";

export default function MainMenu({ onSubirArchivo }) {
  // Estado para controlar la animación del dot
  const [dotAnimating, setDotAnimating] = useState(false);
  const dotTimeoutRef = useRef();
  const { openModal } = useModal();
  const {
    user,
    userProfile,
    status,
    isAuthenticated,
    isAdmin,
    isModerator,
    isLoading,
  } = useUser();
  const {
    session,
    sessionDuration,
    sessionTimeRemaining,
    isSessionExpiringSoon,
    isSessionExpired,
  } = useSessionData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Estado para menú móvil
  const [mobileArchivoOpen, setMobileArchivoOpen] = useState(false); // Estado para dropdown de Archivo
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || pathname;
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lastHideY = useRef(0);
  const threshold = 30;
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        !event.target.closest("nav") &&
        !event.target.closest("[data-mobile-menu]")
      ) {
        setMobileMenuOpen(false);
        setMobileArchivoOpen(false); // Cerrar también el dropdown
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevenir scroll
    } else {
      document.body.style.overflow = "unset";
      setMobileArchivoOpen(false); // Cerrar dropdown cuando se cierra el menú
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Control de visibilidad del navbar (detecta el contenedor que realmente tiene scroll)
  useEffect(() => {
    if (typeof window === "undefined") return;

    function getScrollableContainer() {
      let el = document.querySelector("[data-scrollable-container]");
      if (el) return el;
      let nodes = document.querySelectorAll(
        "main, [class*='scroll'], [class*='overflow'], [class*='container'], [class*='content']"
      );
      for (let node of nodes) {
        const style = window.getComputedStyle(node);
        if (
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight
        ) {
          return node;
        }
      }
      return null;
    }

    const scrollable = getScrollableContainer();

    function getAllScrollY() {
      let values = [window.scrollY];
      if (document.body) values.push(document.body.scrollTop);
      if (document.documentElement)
        values.push(document.documentElement.scrollTop);
      if (scrollable) values.push(scrollable.scrollTop);
      return Math.max(...values);
    }

    const handleScroll = () => {
      const currentScrollY = getAllScrollY();
      setIsScrolled(currentScrollY > 10);
      if (currentScrollY < 10) {
        setIsVisible(true);
        lastHideY.current = 0;
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
        lastHideY.current = currentScrollY;
      } else if (
        currentScrollY < lastScrollY.current &&
        lastHideY.current - currentScrollY > threshold
      ) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (document.body)
      document.body.addEventListener("scroll", handleScroll, { passive: true });
    if (document.documentElement)
      document.documentElement.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    if (scrollable)
      scrollable.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (document.body)
        document.body.removeEventListener("scroll", handleScroll);
      if (document.documentElement)
        document.documentElement.removeEventListener("scroll", handleScroll);
      if (scrollable) scrollable.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // Lanzar animación del dot cada vez que la navbar aparece
  useEffect(() => {
    if (isVisible) {
      setDotAnimating(true);
      if (dotTimeoutRef.current) clearTimeout(dotTimeoutRef.current);
      dotTimeoutRef.current = setTimeout(() => {
        setDotAnimating(false);
      }, 4400); // 4.4 segundos de animación
    } else {
      setDotAnimating(false);
      if (dotTimeoutRef.current) clearTimeout(dotTimeoutRef.current);
    }
    return () => {
      if (dotTimeoutRef.current) clearTimeout(dotTimeoutRef.current);
    };
  }, [isVisible]);

  // Cerrar menú móvil automáticamente al cambiar de página
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      setMobileArchivoOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleAuthClick = (mode) => {
    openModal(mode === "register" ? "auth-register" : "auth-login", {
      redirectTo: callbackUrl,
    });
  };

  const menuLinks = [
    { href: "/", label: "Inicio" },
    { href: "/galeria", label: "Galería" },
    { href: "/acerca-de", label: "Acerca de" },
    { href: "/museo", label: "Museo Virtual" },
  ];

  return (
    <>
      {/* Navigation Menu with auto-hide on scroll */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 z-50 w-full navbar-main navbar-enter ${
          mobileMenuOpen ? "" : "border-b border-gray-200 dark:border-gray-700"
        } ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
        } text-gray-900 dark:text-white transition-all duration-300`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-2 md:py-4">
          {/* Logo a la izquierda siempre */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex flex-col items-center justify-center navbar-link"
            >
              <img
                src="/assets/nav/logo.svg"
                alt="Logo"
                className="h-10 md:h-14 w-auto flex-shrink-0 dark:hidden mx-auto"
              />
              <img
                src="/assets/nav/logo-white.svg"
                alt="Logo"
                className="h-10 md:h-14 w-auto flex-shrink-0 hidden dark:block mx-auto"
              />
              {/* Título visible en móvil y desktop */}

              <div className="block w-full text-center">
                <TypewriterText
                  text="MURAL ARPA"
                  speed={120}
                  delay={300}
                  repeat={true}
                  repeatDelay={5000}
                  className="block w-full text-center"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    fontSize: "1rem",
                    height: "22px",
                    lineHeight: "22px",
                  }}
                />
              </div>
            </Link>
          </div>
          {/* Links centrados en md+ */}
          <div className="flex-1 justify-center items-center md:flex hidden md:block">
            <NavigationMenu className="align-middle">
              <NavigationMenuList className="text-sm font-medium relative items-center flex h-full">
                {menuLinks.map((link) => {
                  let isActive;
                  if (link.href === "/") {
                    isActive = pathname === "/";
                  } else {
                    isActive = pathname.startsWith(link.href);
                  }
                  // Dot logic: always render, but animate only if active and navbar visible
                  return (
                    <NavigationMenuItem key={link.href} className="relative">
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href}
                          className={`navbar-link hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all px-3 py-2 rounded-lg flex flex-col items-center ${isActive ? "text-primary font-bold" : ""}`}
                          style={{ position: "relative", zIndex: 1 }}
                          aria-current={isActive ? "page" : undefined}
                          onClick={
                            isActive ? (e) => e.preventDefault() : undefined
                          }
                        >
                          <span className="h-3 mb-1 w-full flex items-center justify-center">
                            <motion.span
                              layoutId="menu-dot-global"
                              className={
                                isActive
                                  ? `inline-block ${dotAnimating ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full shadow`
                                  : "inline-block w-1.5 h-1.5 rounded-full bg-gray-400/60"
                              }
                              initial={
                                isActive
                                  ? { scale: 0.5, opacity: 0, x: 0, y: 0 }
                                  : false
                              }
                              animate={
                                !isVisible
                                  ? {
                                      opacity: 0,
                                      scale: 0.7,
                                      x: 0,
                                      y: 0,
                                      background: isActive
                                        ? "#6366f1"
                                        : "#a1a1aa",
                                    }
                                  : isActive && dotAnimating
                                    ? {
                                        scale: [1, 1.18, 1],
                                        opacity: [0.85, 0.6, 0.85],
                                        boxShadow: [
                                          "0 0 0px 0px #6366f1",
                                          "0 0 3px 0.5px #6366f1aa",
                                          "0 0 0px 0px #6366f1",
                                        ],
                                        x: [0, 2, 3, 2, 0, -2, -3, -2, 0],
                                        y: [0, 2, 0, -2, -3, -2, 0, 2, 0],
                                        background: [
                                          "#6366f1",
                                          "#a5b4fc",
                                          "#fef08a",
                                          "#f472b6",
                                          "#38bdf8",
                                          "#6366f1",
                                        ],
                                      }
                                    : {
                                        scale: 1,
                                        opacity: 0.85,
                                        x: 0,
                                        y: 0,
                                        background: isActive
                                          ? "linear-gradient(135deg, #6366f1 0%, #a5b4fc 40%, #fef08a 70%, #f472b6 90%, #38bdf8 100%)"
                                          : "#a1a1aa",
                                      }
                              }
                              transition={
                                !isVisible
                                  ? { duration: 0.3 }
                                  : isActive && dotAnimating
                                    ? {
                                        duration: 1.1,
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        ease: "easeInOut",
                                      }
                                    : {
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 18,
                                        mass: 0.7,
                                        duration: 0.45,
                                      }
                              }
                              whileFocus={{
                                scale: 1.2,
                                boxShadow: "0 0 8px 2px #818cf8",
                              }}
                              whileTap={{ scale: 1.1 }}
                              style={{
                                display: "inline-block",
                                background:
                                  !dotAnimating && isActive
                                    ? "linear-gradient(135deg, #6366f1 0%, #a5b4fc 40%, #fef08a 70%, #f472b6 90%, #38bdf8 100%)"
                                    : undefined,
                                backgroundSize:
                                  !dotAnimating && isActive
                                    ? "200% 200%"
                                    : undefined,
                                backgroundPosition:
                                  !dotAnimating && isActive
                                    ? "50% 50%"
                                    : undefined,
                                boxShadow: isActive
                                  ? "0 0 2px 0.5px #818cf822"
                                  : undefined,
                              }}
                            />
                          </span>
                          <span className="relative z-10">
                            <motion.span
                              initial={false}
                              animate={
                                isActive && isVisible
                                  ? {
                                      backgroundPosition: [
                                        "40% 50%",
                                        "60% 50%",
                                        "50% 50%",
                                      ],
                                      opacity: [0.7, 1, 0.7],
                                    }
                                  : { opacity: 0 }
                              }
                              transition={
                                isActive && isVisible
                                  ? {
                                      duration: 1.2,
                                      repeat: Infinity,
                                      repeatType: "loop",
                                      ease: "easeInOut",
                                    }
                                  : { duration: 0.3 }
                              }
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "100%",
                                height: "100%",
                                background:
                                  "linear-gradient(90deg, transparent 0%, #818cf8 45%, #fbbf24 50%, #818cf8 55%, transparent 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                WebkitTextFillColor: "transparent",
                                pointerEvents: "none",
                                zIndex: 2,
                                filter: "blur(0.5px)",
                              }}
                              aria-hidden="true"
                            >
                              {link.label}
                            </motion.span>
                            <span
                              style={{
                                opacity: 1,
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              {link.label}
                            </span>
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* ThemeSwitch y botón hamburguesa a la derecha */}
          <div className="flex items-center flex-shrink-0 ml-auto gap-3">
            {/* Botón hamburguesa solo en mobile */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-3 rounded-lg transition-all duration-300 relative overflow-hidden hamburger-button ${
                  mobileMenuOpen ? "hamburger-special-open" : ""
                } ${isAuthenticated ? "max-[1100px]:order-2" : ""}`}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                  {/* Línea superior */}{" "}
                  <div
                    className={`hamburger-line-top absolute w-6 h-px bg-current transition-all duration-500 ease-out ${
                      mobileMenuOpen
                        ? "rotate-45 translate-y-0"
                        : "-translate-y-1.5"
                    }`}
                  />
                  {/* Línea media con efecto especial de desplazamiento a la derecha */}{" "}
                  <div
                    className={`hamburger-line-middle absolute h-px bg-current ${
                      mobileMenuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
                    }`}
                    style={{
                      transformOrigin: "left center",
                      transition: mobileMenuOpen
                        ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s ease-out 0.1s, opacity 0.3s ease-out 0.2s"
                        : "transform 0.3s ease-out, width 0.3s ease-out, opacity 0.2s ease-out",
                      transform: mobileMenuOpen
                        ? "translateX(12px) scaleX(0.2)"
                        : "translateX(0) scaleX(1)",
                    }}
                  />
                  {/* Línea inferior */}{" "}
                  <div
                    className={`hamburger-line-bottom absolute w-6 h-px bg-current transition-all duration-500 ease-out ${
                      mobileMenuOpen
                        ? "-rotate-45 translate-y-0"
                        : "translate-y-1.5"
                    }`}
                  />
                </div>

                {/* SVG para el efecto de borde que se completa alrededor del margen */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 48 48"
                >
                  <rect
                    x="2"
                    y="2"
                    width="44"
                    height="44"
                    rx="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      strokeDasharray: "176",
                      strokeDashoffset: mobileMenuOpen ? "0" : "176",
                      opacity: mobileMenuOpen ? "0.7" : "0",
                      transitionDelay: mobileMenuOpen ? "0.4s" : "0s",
                    }}
                  />
                </svg>
              </button>
            )}
            {/* Usuario solo en md+ */}
            {!isMobile &&
              (status === "loading" ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                  <span className="hidden md:inline text-sm text-muted-foreground">
                    Cargando...
                  </span>
                </div>
              ) : isAuthenticated ? (
                <div className="relative max-w-[200px]">
                  <div className="relative max-w-[200px]">
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem className="relative">
                          <NavigationMenuTrigger className="flex items-center gap-2 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all">
                            <img
                              src={
                                userProfile?.image ||
                                user?.image ||
                                "/assets/default-avatar.svg"
                              }
                              alt={userProfile?.name || user?.name || "Usuario"}
                              className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                              onError={(e) => {
                                e.target.src = "/assets/default-avatar.svg";
                              }}
                            />
                            <span className="hidden md:inline text-sm font-medium">
                              {userProfile?.name ||
                                user?.name ||
                                user?.email?.split("@")[0]}
                            </span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="bg-card p-4 rounded-lg shadow-lg border min-w-[180px]">
                            <div className="flex flex-col gap-2">
                              <div className="px-3 py-2 border-b border-border">
                                <p className="text-sm font-medium text-foreground">
                                  {userProfile?.name || user?.name || "Usuario"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user?.email}
                                </p>
                                {userProfile?.roles && (
                                  <div className="flex gap-1 mt-1">
                                    {userProfile.roles.map((role, index) => (
                                      <span
                                        key={index}
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          role === "admin"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                            : role === "moderator"
                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                        }`}
                                      >
                                        {role}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {/* Información de la sesión */}
                                {session && (
                                  <div className="mt-2 pt-2 border-t border-border">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        Sesión:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          isSessionExpiringSoon
                                            ? "text-yellow-600 dark:text-yellow-400"
                                            : isSessionExpired
                                              ? "text-red-600 dark:text-red-400"
                                              : "text-green-600 dark:text-green-400"
                                        }`}
                                      >
                                        {sessionDuration}
                                      </span>
                                    </div>
                                    {isSessionExpiringSoon && (
                                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                        ⚠️ Sesión por expirar
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* En el dropdown del usuario: */}
                              <div className="flex flex-col gap-2">
                                {/* Links principales del usuario */}
                                {[
                                  { href: "/perfil", label: "Mi perfil" },
                                  { href: "/mis-obras", label: "Mis Obras" },
                                  { href: "/mis-salas", label: "Mis Salas" },
                                  {
                                    href: "/admin/usuarios",
                                    label: "Gestionar Usuarios",
                                    admin: true,
                                  },
                                  {
                                    href: "/admin/logs",
                                    label: "Ver Logs",
                                    admin: true,
                                  },
                                  {
                                    href: "/admin/healthcheck",
                                    label: "Estado del sistema",
                                    admin: true,
                                  },
                                ]
                                  .filter(
                                    (link) =>
                                      !link.admin || isModerator || isAdmin
                                  )
                                  .map((link) => {
                                    const isActive = pathname.startsWith(
                                      link.href
                                    );
                                    return (
                                      <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                                        aria-current={
                                          isActive ? "page" : undefined
                                        }
                                        onClick={
                                          isActive
                                            ? (e) => e.preventDefault()
                                            : undefined
                                        }
                                      >
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                                          <motion.span
                                            layoutId="menu-dot-global"
                                            className={
                                              isActive
                                                ? "inline-block w-2 h-2 rounded-full bg-primary"
                                                : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                                            }
                                            initial={false}
                                            animate={
                                              isActive
                                                ? { scale: 1, opacity: 1 }
                                                : { scale: 0.7, opacity: 0.5 }
                                            }
                                            transition={{
                                              type: "spring",
                                              stiffness: 120,
                                              damping: 18,
                                              mass: 0.7,
                                              duration: 0.45,
                                            }}
                                            style={{ display: "inline-block" }}
                                          />
                                        </span>
                                        {link.label}
                                      </Link>
                                    );
                                  })}
                                {/* Panel de Gestión solo como título, sin punto ni indicador */}
                                {(isModerator || isAdmin) && (
                                  <div className="px-3 py-1 border-t border-border">
                                    <p className="text-xs text-muted-foreground font-medium">
                                      Panel de Gestión
                                    </p>
                                  </div>
                                )}
                              </div>
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
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleAuthClick("login")}
                  className="hidden md:inline-flex items-center justify-center rounded-full w-12 h-12 p-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 border-2 border-transparent shadow-xl transition-all duration-200 hover:scale-110"
                  title="Iniciar sesión"
                  aria-label="Iniciar sesión"
                  style={{
                    position: "relative",
                    overflow: "visible",
                    background:
                      "radial-gradient(circle at 60% 40%, rgba(236,72,153,0.18) 0%, rgba(99,102,241,0.13) 100%)",
                    backdropFilter: "blur(16px) brightness(1.15)",
                    WebkitBackdropFilter: "blur(16px) brightness(1.15)",
                    boxShadow:
                      "0 4px 24px 0 rgba(99,102,241,0.10), 0 1.5px 8px 0 rgba(236,72,153,0.10)",
                    borderRadius: "9999px",
                  }}
                >
                  <span className="relative flex items-center justify-center w-7 h-7">
                    {/* Lucide UserRoundCog icon */}
                    <UserRoundCog
                      className="w-6 h-6 text-primary group-hover:text-pink-500 group-hover:drop-shadow-lg transition-all duration-200"
                      strokeWidth={2}
                    />
                    <span
                      className="absolute left-0 top-0 w-full h-full pointer-events-none animate-glass-shine"
                      style={{ zIndex: 2 }}
                    />
                  </span>
                </button>
              ))}
            <ThemeSwitch />
          </div>
        </div>
      </motion.nav>

      {/* Menú móvil con backdrop tipo modal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-start justify-start min-h-screen md:hidden bg-black/50 backdrop-blur-sm pt-[88px] px-4"
            aria-hidden="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileMenuOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xs rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl p-2 z-50 mt-2 ml-4"
              data-mobile-menu
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo centrado arriba en el menú móvil */}
              <div className="flex flex-col items-center justify-center mt-2 mb-2">
                <img
                  src="/assets/nav/logo.svg"
                  alt="Logo"
                  className="h-10 w-auto flex-shrink-0 dark:hidden"
                />
                <img
                  src="/assets/nav/logo-white.svg"
                  alt="Logo"
                  className="h-10 w-auto flex-shrink-0 hidden dark:block"
                />
              </div>
              {/* ThemeSwitch debajo del logo */}
              <div className="flex justify-center mb-4">
                <ThemeSwitch />
              </div>
              <div className="px-1 py-1 space-y-1 overflow-y-auto max-h-[60vh]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-1 text-sm font-medium hover:text-primary transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  href="/galeria"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-1 text-sm font-medium hover:text-primary transition-colors"
                >
                  Galería
                </Link>
                <Link
                  href="/acerca-de"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-1 text-sm font-medium hover:text-primary transition-colors"
                >
                  Acerca de
                </Link>
                <Link
                  href="/museo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-1 text-sm font-medium hover:text-primary transition-colors"
                >
                  Museo Virtual
                </Link>

                {/* Si el usuario NO está autenticado, mostrar botones de autenticación */}
                {!isAuthenticated && (
                  <>
                    <div className="px-3 py-1 border-t border-border mt-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Cuenta
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleAuthClick("login");
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm font-medium"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleAuthClick("register");
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm font-medium"
                    >
                      Crear sesión
                    </button>
                  </>
                )}

                {/* Si el usuario está autenticado, mostrar opciones de perfil */}
                {isAuthenticated && (
                  <>
                    <div className="px-3 py-1 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium">
                        Mi Cuenta
                      </p>
                    </div>
                    <Link
                      href="/perfil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                    >
                      Mi perfil
                    </Link>
                    <Link
                      href="/mis-obras"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                    >
                      Mis Obras
                    </Link>
                    <Link
                      href="/mis-salas"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                    >
                      Mis Salas
                    </Link>
                  </>
                )}

                {/* Si el usuario es moderador o administrador, mostrar opciones de gestión */}
                {(isModerator || isAdmin) && (
                  <>
                    <div className="px-3 py-1 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium">
                        Panel de Gestión
                      </p>
                    </div>
                    <Link
                      href="/admin/usuarios"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                    >
                      Gestionar Usuarios
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/logs"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                        >
                          Ver Logs
                        </Link>
                        <Link
                          href="/admin/healthcheck"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm"
                        >
                          Estado del sistema
                        </Link>
                      </>
                    )}
                  </>
                )}

                {/* Botón de cierre de sesión solo si está autenticado */}
                {isAuthenticated && (
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>
              {/* Avatar y nombre de usuario al final del menú móvil */}
              {isAuthenticated && (
                <div className="flex flex-col items-center mt-6 mb-2 border-t border-border pt-4">
                  <img
                    src={
                      userProfile?.image ||
                      user?.image ||
                      "/assets/default-avatar.svg"
                    }
                    alt={userProfile?.name || user?.name || "Usuario"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 mb-2"
                    onError={(e) => {
                      e.target.src = "/assets/default-avatar.svg";
                    }}
                  />
                  <span className="text-base font-medium text-foreground">
                    {userProfile?.name ||
                      user?.name ||
                      user?.email?.split("@")[0]}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

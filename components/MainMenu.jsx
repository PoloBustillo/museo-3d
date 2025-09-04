"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import ThemeSwitch from "./ThemeSwitch";
import UserMenu from "./UserMenu";
import { useModal } from "../providers/ModalProvider";
import { useUser } from "../providers/UserProvider";
import { useSessionData } from "../providers/SessionProvider";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuItem,
} from "./ui/navigation-menu";

import useIsMobile from "../app/hooks/useIsMobile";
import TypewriterText from "./shared/TypewriterText";

export default function MainMenu({ onSubirArchivo }) {
  const { openModal } = useModal();
  const {
    user,
    userProfile,
    status,
    isAuthenticated,
    isAdmin,
    isModerator,
  } = useUser();
  const {
    session,
    sessionDuration,
    isSessionExpiringSoon,
    isSessionExpired,
  } = useSessionData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || pathname;
  const isMobile = useIsMobile();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        !event.target.closest("nav") &&
        !event.target.closest("[data-mobile-menu]")
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
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
      {/* Navigation Menu with fixed positioning */}
      <nav
        className="fixed top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md 
        border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg
        text-gray-900 dark:text-white transition-all duration-300"
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-2 md:py-4">
          {/* Logo on the left */}
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

          {/* Centered links for desktop */}
          <div className="flex-1 justify-center items-center md:flex hidden md:block">
            <NavigationMenu className="align-middle">
              <NavigationMenuList className="text-sm font-medium relative items-center flex h-full">
                {menuLinks.map((link) => {
                  const isActive =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <NavigationMenuItem key={link.href} className="relative">
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href}
                          className={`navbar-link hover:text-primary transition-all px-3 py-2 rounded-lg flex flex-col items-center ${
                            isActive ? "text-primary font-bold" : ""
                          }`}
                        >
                          <span className="h-3 mb-1 w-full flex items-center justify-center">
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-primary" : "bg-gray-400/60"
                              }`}
                            ></span>
                          </span>
                          <span>{link.label}</span>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* ThemeSwitch and hamburger button on the right */}
          <div className="flex items-center flex-shrink-0 ml-auto gap-3">
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-lg transition-all duration-300 relative overflow-hidden hamburger-button"
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                  <div
                    className={`hamburger-line-top absolute w-6 h-px bg-current transition-all duration-500 ease-out ${
                      mobileMenuOpen
                        ? "rotate-45 translate-y-0"
                        : "-translate-y-1.5"
                    }`}
                  />
                  <div
                    className={`hamburger-line-middle absolute h-px bg-current transition-all duration-300 ease-out ${
                      mobileMenuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
                    }`}
                  />
                  <div
                    className={`hamburger-line-bottom absolute w-6 h-px bg-current transition-all duration-500 ease-out ${
                      mobileMenuOpen
                        ? "-rotate-45 translate-y-0"
                        : "translate-y-1.5"
                    }`}
                  />
                </div>
              </button>
            )}
            <UserMenu
              isMobile={isMobile}
              status={status}
              isAuthenticated={isAuthenticated}
              user={user}
              userProfile={userProfile}
              isAdmin={isAdmin}
              isModerator={isModerator}
              session={session}
              sessionDuration={sessionDuration}
              isSessionExpiringSoon={isSessionExpiringSoon}
              isSessionExpired={isSessionExpired}
              pathname={pathname}
              handleAuthClick={handleAuthClick}
              signOut={signOut}
            />
            <ThemeSwitch />
          </div>
        </div>
      </nav>

      {/* Mobile menu with modal backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex items-center justify-center min-h-screen md:hidden bg-black/50 backdrop-blur-sm px-4"
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xs rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl p-2 z-50"
              data-mobile-menu
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo centered at the top of the mobile menu */}
              <div className="flex flex-col items-center justify-center mt-2 mb-4">
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

              {/* Mobile menu links */}
              <div className="px-1 py-1 space-y-1 overflow-y-auto max-h-[60vh]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  href="/galeria"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Galería
                </Link>
                <Link
                  href="/acerca-de"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Acerca de
                </Link>
                <Link
                  href="/museo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="navbar-link block py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Museo Virtual
                </Link>

                {/* Authentication buttons if not authenticated */}
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

                {/* Profile options if authenticated */}
                {isAuthenticated && (
                  <>
                    <div className="px-3 py-1 border-t border-border mt-2">
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

                {/* Management options for moderator/admin */}
                {(isModerator || isAdmin) && (
                  <>
                    <div className="px-3 py-1 border-t border-border mt-2">
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

                {/* Logout button */}
                {isAuthenticated && (
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                  >
                    Cerrar sesión
                  </button>
                )}
              </div>

              {/* User avatar and name at the end of the mobile menu */}
              {isAuthenticated && (
                <div className="flex flex-col items-center mt-6 mb-2 border-t border-border pt-4">
                  <img
                    src={userProfile?.image || user?.image || "/assets/default-avatar.svg"}
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
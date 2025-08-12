import React from "react";
import Link from "next/link";
import { UserRoundCog } from "lucide-react";
import { motion } from "framer-motion";
import ThemeSwitch from "./ThemeSwitch";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

export default function UserMenu({
  isMobile,
  status,
  isAuthenticated,
  user,
  userProfile,
  isAdmin,
  isModerator,
  session,
  sessionDuration,
  isSessionExpiringSoon,
  isSessionExpired,
  pathname,
  handleAuthClick,
  signOut,
}) {
  const audioRef = React.useRef(null);
  const hasUserInteracted = React.useRef(false);

  // Mark that user has interacted when they click anywhere
  React.useEffect(() => {
    const handleUserInteraction = () => {
      hasUserInteracted.current = true;
    };

    // Listen for any user interaction
    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("keydown", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  const playMenuSound = () => {
    // Only play sound if user has interacted with the page
    if (audioRef.current && hasUserInteracted.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          // Silently handle audio play errors
          console.debug("Audio play failed:", error.message);
        });
      } catch (error) {
        // Silently handle any other audio errors
        console.debug("Audio error:", error.message);
      }
    }
  };
  if (isMobile) return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
        <span className="hidden md:inline text-sm text-muted-foreground">
          Cargando...
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="relative max-w-[200px]">
        {/* Elemento de audio oculto */}
        <audio
          ref={audioRef}
          src="/menu.mp3"
          preload="auto"
          style={{ display: "none" }}
        />
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="relative">
              <NavigationMenuTrigger
                className="flex items-center gap-2 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                onMouseEnter={playMenuSound}
              >
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
                <span
                  className="hidden md:inline text-sm font-medium truncate max-w-[120px]"
                  title={
                    userProfile?.name ||
                    user?.name ||
                    user?.email?.split("@")[0]
                  }
                >
                  {userProfile?.name ||
                    user?.name ||
                    user?.email?.split("@")[0]}
                </span>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-card p-4 rounded-lg shadow-lg border min-w-[200px] max-w-[280px]">
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p
                      className="text-sm font-medium text-foreground truncate"
                      title={userProfile?.name || user?.name || "Usuario"}
                    >
                      {userProfile?.name || user?.name || "Usuario"}
                    </p>
                    <p
                      className="text-xs text-muted-foreground truncate"
                      title={user?.email}
                    >
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
                    {session && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Sesión:</span>
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
                  <div className="flex flex-col gap-2">
                    {/* ...enlaces y panel de gestión... */}
                    <Link
                      href="/perfil"
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                      aria-current={
                        pathname.startsWith("/perfil") ? "page" : undefined
                      }
                      onClick={
                        pathname.startsWith("/perfil")
                          ? (e) => e.preventDefault()
                          : undefined
                      }
                      onMouseEnter={playMenuSound}
                    >
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                        <motion.span
                          layoutId="menu-dot-global"
                          className={
                            pathname.startsWith("/perfil")
                              ? "inline-block w-2 h-2 rounded-full bg-primary"
                              : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                          }
                          initial={false}
                          animate={
                            pathname.startsWith("/perfil")
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
                      Mi perfil
                    </Link>
                    <Link
                      href="/mis-obras"
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                      aria-current={
                        pathname.startsWith("/mis-obras") ? "page" : undefined
                      }
                      onClick={
                        pathname.startsWith("/mis-obras")
                          ? (e) => e.preventDefault()
                          : undefined
                      }
                      onMouseEnter={playMenuSound}
                    >
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                        <motion.span
                          layoutId="menu-dot-global"
                          className={
                            pathname.startsWith("/mis-obras")
                              ? "inline-block w-2 h-2 rounded-full bg-primary"
                              : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                          }
                          initial={false}
                          animate={
                            pathname.startsWith("/mis-obras")
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
                      Mis Obras
                    </Link>
                    <Link
                      href="/mis-salas"
                      className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                      aria-current={
                        pathname.startsWith("/mis-salas") ? "page" : undefined
                      }
                      onClick={
                        pathname.startsWith("/mis-salas")
                          ? (e) => e.preventDefault()
                          : undefined
                      }
                      onMouseEnter={playMenuSound}
                    >
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                        <motion.span
                          layoutId="menu-dot-global"
                          className={
                            pathname.startsWith("/mis-salas")
                              ? "inline-block w-2 h-2 rounded-full bg-primary"
                              : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                          }
                          initial={false}
                          animate={
                            pathname.startsWith("/mis-salas")
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
                      Mis Salas
                    </Link>
                    {(isModerator || isAdmin) && (
                      <div className="px-3 py-1 border-t border-border">
                        <p className="text-xs text-muted-foreground font-medium mb-1">
                          Panel de Gestión
                        </p>
                        <Link
                          href="/admin/usuarios"
                          className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                          aria-current={
                            pathname.startsWith("/admin/usuarios")
                              ? "page"
                              : undefined
                          }
                          onClick={
                            pathname.startsWith("/admin/usuarios")
                              ? (e) => e.preventDefault()
                              : undefined
                          }
                          onMouseEnter={playMenuSound}
                        >
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                            <motion.span
                              layoutId="menu-dot-global"
                              className={
                                pathname.startsWith("/admin/usuarios")
                                  ? "inline-block w-2 h-2 rounded-full bg-primary"
                                  : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                              }
                              initial={false}
                              animate={
                                pathname.startsWith("/admin/usuarios")
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
                          Gestionar Usuarios
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/logs"
                              className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                              aria-current={
                                pathname.startsWith("/admin/logs")
                                  ? "page"
                                  : undefined
                              }
                              onClick={
                                pathname.startsWith("/admin/logs")
                                  ? (e) => e.preventDefault()
                                  : undefined
                              }
                              onMouseEnter={playMenuSound}
                            >
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                                <motion.span
                                  layoutId="menu-dot-global"
                                  className={
                                    pathname.startsWith("/admin/logs")
                                      ? "inline-block w-2 h-2 rounded-full bg-primary"
                                      : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                                  }
                                  initial={false}
                                  animate={
                                    pathname.startsWith("/admin/logs")
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
                              Ver Logs
                            </Link>
                            <Link
                              href="/admin/healthcheck"
                              className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                              aria-current={
                                pathname.startsWith("/admin/healthcheck")
                                  ? "page"
                                  : undefined
                              }
                              onClick={
                                pathname.startsWith("/admin/healthcheck")
                                  ? (e) => e.preventDefault()
                                  : undefined
                              }
                              onMouseEnter={playMenuSound}
                            >
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                                <motion.span
                                  layoutId="menu-dot-global"
                                  className={
                                    pathname.startsWith("/admin/healthcheck")
                                      ? "inline-block w-2 h-2 rounded-full bg-primary"
                                      : "inline-block w-2 h-2 rounded-full bg-gray-400/70"
                                  }
                                  initial={false}
                                  animate={
                                    pathname.startsWith("/admin/healthcheck")
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
                              Estado del sistema
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      onClick={signOut}
                      onMouseEnter={playMenuSound}
                      className="block w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    );
  }

  // Login button
  return (
    <button
      onClick={() => handleAuthClick("login")}
      onMouseEnter={playMenuSound}
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
  );
}

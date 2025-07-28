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
                  {userProfile?.name || user?.name || user?.email?.split("@")[0]}
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
                  {/* En el dropdown del usuario: */}
                  <div className="flex flex-col gap-2">
                    {/* Links principales del usuario */}
                    {[
                      { href: "/perfil", label: "Mi perfil" },
                      { href: "/mis-obras", label: "Mis Obras" },
                      { href: "/mis-salas", label: "Mis Salas" },
                      { href: "/admin/usuarios", label: "Gestionar Usuarios", admin: true },
                      { href: "/admin/logs", label: "Ver Logs", admin: true },
                      { href: "/admin/healthcheck", label: "Estado del sistema", admin: true },
                    ]
                      .filter((link) => !link.admin || isModerator || isAdmin)
                      .map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-all text-sm relative pl-6"
                            aria-current={isActive ? "page" : undefined}
                            onClick={isActive ? (e) => e.preventDefault() : undefined}
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
                    onClick={signOut}
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
    );
  }

  // Login button
  return (
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

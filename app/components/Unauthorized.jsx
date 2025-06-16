"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ShieldX, 
  Lock, 
  Home, 
  ArrowLeft, 
  User,
  LogIn,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function Unauthorized({ 
  title = "Acceso no autorizado",
  message = "No tienes permisos para acceder a esta sección del museo",
  showLogin = true,
  redirectPath = "/",
  error = "401",
  callbackUrl = null
}) {
  const [mounted, setMounted] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Si el usuario se autentica y hay un callbackUrl, redirigir
    if (session && callbackUrl) {
      router.push(callbackUrl);
    }
  }, [session, callbackUrl, router]);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthModalClose = (success) => {
    setShowAuthModal(false);
    if (success === "success" && callbackUrl) {
      router.push(callbackUrl);
    }
  };

  const handleEasterEgg = () => {
    setShowEasterEgg(!showEasterEgg);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 dark:from-red-950 dark:via-orange-950 dark:to-red-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-300 dark:bg-red-700 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-orange-300 dark:bg-orange-700 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 dark:bg-yellow-700 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg mx-auto"
      >
        {/* Icono principal y código de error */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative mb-8"
        >
          {/* Icono de escudo con candado */}
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <ShieldX className="w-24 h-24 text-red-500 dark:text-red-400" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Lock className="w-8 h-8 text-orange-500 dark:text-orange-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Código de error */}
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error}
          </h1>
          
          {/* Iconos decorativos */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -left-4"
          >
            <AlertTriangle className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Eye className="w-5 h-5 text-red-400 dark:text-red-300" />
          </motion.div>
        </motion.div>

        {/* Mensaje principal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-red-700 dark:text-red-300 mb-4">
            {title}
          </h2>
          <p className="text-lg text-red-600 dark:text-red-400 mb-2">
            {message}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contacta al curador del museo si crees que esto es un error
          </p>
        </motion.div>

        {/* Botones de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Link href={redirectPath} className="group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </motion.button>
          </Link>

          <Link href="/" className="group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Home className="w-5 h-5" />
              Inicio
            </motion.button>
          </Link>

          {showLogin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </motion.button>
          )}
        </motion.div>

        {/* Easter egg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center"
        >
          <button
            onClick={handleEasterEgg}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer text-sm"
          >
            {showEasterEgg ? (
              <div className="flex items-center gap-2 justify-center">
                <EyeOff className="w-4 h-4" />
                Ocultar consejo
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Eye className="w-4 h-4" />
                ¿Consejo del curador?
              </div>
            )}
          </button>
          
          {showEasterEgg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-red-200 dark:border-red-800"
            >
              <p className="text-sm text-red-700 dark:text-red-300 italic">
                "El acceso a las mejores obras requiere los permisos correctos"
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">- Curador del Museo</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-400 dark:bg-red-600 rounded-full opacity-30 dark:opacity-20"
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      {/* Modal de autenticación */}
      {showAuthModal && (
        <AuthModal
          open={showAuthModal}
          mode="login"
          onClose={handleAuthModalClose}
        />
      )}
    </div>
  );
}

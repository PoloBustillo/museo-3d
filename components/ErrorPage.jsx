"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home,  
  Wifi,
  WifiOff,
  Server,
  Eye,
  EyeOff
} from "lucide-react";

export default function ErrorPage({ 
  title = "¡Oops! Algo salió mal",
  message = "Ocurrió un error inesperado en el museo digital",
  error = "500",
  showRefresh = true,
  showHome = true,
  onRetry = null,
  type = "server" // server, network, client
}) {
  const [mounted, setMounted] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      window.location.reload();
    }
  };

  const handleEasterEgg = () => {
    setShowEasterEgg(!showEasterEgg);
  };

  const getIcon = () => {
    switch (type) {
      case "network":
        return <WifiOff className="w-24 h-24 text-orange-500 dark:text-orange-400" />;
      case "server":
        return <Server className="w-24 h-24 text-red-500 dark:text-red-400" />;
      default:
        return <AlertTriangle className="w-24 h-24 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  const getColorScheme = () => {
    switch (type) {
      case "network":
        return {
          bg: "from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-950 dark:via-yellow-950 dark:to-orange-950",
          blobs: "bg-orange-300 dark:bg-orange-700",
          text: "text-orange-700 dark:text-orange-300",
          subtext: "text-orange-600 dark:text-orange-400"
        };
      case "server":
        return {
          bg: "from-red-50 via-pink-50 to-red-50 dark:from-red-950 dark:via-pink-950 dark:to-red-950",
          blobs: "bg-red-300 dark:bg-red-700",
          text: "text-red-700 dark:text-red-300",
          subtext: "text-red-600 dark:text-red-400"
        };
      default:
        return {
          bg: "from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-950 dark:via-orange-950 dark:to-yellow-950",
          blobs: "bg-yellow-300 dark:bg-yellow-700",
          text: "text-yellow-700 dark:text-yellow-300",
          subtext: "text-yellow-600 dark:text-yellow-400"
        };
    }
  };

  const colors = getColorScheme();

  if (!mounted) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} flex items-center justify-center px-4 relative overflow-hidden`}>
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className={`absolute top-10 left-10 w-72 h-72 ${colors.blobs} rounded-full mix-blend-multiply filter blur-xl animate-blob`}></div>
        <div className={`absolute top-0 right-4 w-72 h-72 ${colors.blobs} rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 ${colors.blobs} rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000`}></div>
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
          {/* Icono principal */}
          <motion.div
            animate={{ 
              rotate: type === "network" ? [0, -5, 5, 0] : [0, 0, 0, 0],
              y: type === "server" ? [0, -5, 5, 0] : [0, 0, 0, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            {getIcon()}
          </motion.div>

          {/* Código de error */}
          <h1 className={`text-6xl font-bold ${colors.text} mb-4`}>
            {error}
          </h1>
          
          {/* Iconos decorativos */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -left-4"
          >
            {type === "network" ? (
              <Wifi className="w-6 h-6 text-orange-400 dark:text-orange-500" />
            ) : (
              <RefreshCw className="w-6 h-6 text-yellow-400 dark:text-yellow-500" />
            )}
          </motion.div>
        </motion.div>

        {/* Mensaje principal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className={`text-3xl font-bold ${colors.text} mb-4`}>
            {title}
          </h2>
          <p className={`text-lg ${colors.subtext} mb-2`}>
            {message}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {type === "network" 
              ? "Verifica tu conexión a internet" 
              : "Estamos trabajando para solucionarlo"}
          </p>
        </motion.div>

        {/* Botones de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          {showRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Reintentando...' : 'Reintentar'}
            </motion.button>
          )}

          {showHome && (
            <Link href="/" className="group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <Home className="w-5 h-5" />
                Ir al Inicio
              </motion.button>
            </Link>
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
                Ocultar mensaje
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Eye className="w-4 h-4" />
                ¿Mensaje del sistema?
              </div>
            )}
          </button>
          
          {showEasterEgg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700`}
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {type === "network" 
                  ? "La conexión es el puente entre el arte y el espectador"
                  : "Incluso las mejores galerías necesitan mantenimiento"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">- Administrador del Sistema</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

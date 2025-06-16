"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Building2, 
  Image,
  Palette,
  Eye,
  EyeOff
} from "lucide-react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEasterEgg = () => {
    setShowEasterEgg(!showEasterEgg);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 dark:bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-yellow-400 dark:bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 dark:bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg mx-auto"
      >
        {/* Número 404 con arte */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative mb-8"
        >
          <h1 className="text-9xl font-bold text-gray-800 dark:text-white mb-4 relative">
            4
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-purple-600 dark:text-purple-400"
            >
              0
            </motion.span>
            4
          </h1>
          
          {/* Iconos decorativos alrededor del 404 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -left-4"
          >
            <Palette className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Image className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </motion.div>
          
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
          >
            <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-300" />
          </motion.div>
        </motion.div>

        {/* Mensaje principal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            ¡Obra no encontrada!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Parece que esta pieza se ha perdido en el museo digital
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No te preocupes, hay muchas otras obras esperándote
          </p>
        </motion.div>

        {/* Botones de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Link href="/" className="group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </motion.button>
          </Link>

          <Link href="/archivo" className="group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              Explorar Archivo
            </motion.button>
          </Link>

          <Link href="/museo" className="group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Building2 className="w-5 h-5" />
              Visitar Museo
            </motion.button>
          </Link>
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
                Ocultar secreto
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Eye className="w-4 h-4" />
                ¿Secreto del curador?
              </div>
            )}
          </button>
          
          {showEasterEgg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "El arte no es lo que ves, sino lo que haces ver a otros"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">- Edgar Degas</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gray-800 dark:bg-white rounded-full opacity-30 dark:opacity-20"
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
    </div>
  );
}

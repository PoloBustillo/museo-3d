"use client";

import { motion } from "framer-motion";

const LoadingSpinner = ({
  size = "md",
  text = "Cargando...",
  variant = "default",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const variants = {
    default: {
      spinner: "border-primary",
      text: "text-muted-foreground",
    },
    primary: {
      spinner: "border-primary",
      text: "text-primary",
    },
    secondary: {
      spinner: "border-secondary",
      text: "text-secondary",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      {/* Spinner principal */}
      <div className="relative">
        {/* Spinner exterior con gradiente mejorado */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-transparent loading-spinner-gradient`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Spinner interior con blur */}
        <div className={`absolute inset-1 rounded-full bg-background`} />

        {/* Punto central animado */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Texto de carga */}
      {text && (
        <motion.div
          className={`${textSizes[size]} ${currentVariant.text} font-medium`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {text}
        </motion.div>
      )}

      {/* Puntos animados mejorados */}
      <motion.div
        className="flex gap-1 loading-dots"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full" />
        ))}
      </motion.div>
    </div>
  );
};

// Componente de loading para páginas completas
export const PageLoader = ({ text = "Cargando página..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center loading-overlay">
      <motion.div
        className="bg-card/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-border/50 loading-fade-in"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <LoadingSpinner size="lg" text={text} variant="primary" />
      </motion.div>
    </div>
  );
};

// Componente de loading para secciones
export const SectionLoader = ({ text = "Cargando...", className = "" }) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingSpinner size="md" text={text} />
      </motion.div>
    </div>
  );
};

// Componente de loading para cards
export const CardLoader = ({ className = "" }) => {
  return (
    <div
      className={`bg-card rounded-lg p-6 shadow-sm border border-border ${className}`}
    >
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" text="Cargando contenido..." />
      </div>
    </div>
  );
};

// Componente de loading para botones
export const ButtonLoader = ({ size = "sm" }) => {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} text="" />
      <span className="text-sm">Procesando...</span>
    </div>
  );
};

// Componente de loading skeleton para contenido
export const SkeletonLoader = ({ className = "", lines = 3 }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded loading-skeleton ${
            i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;

"use client";

import { motion } from "framer-motion";
import React from "react"; // Added missing import for React

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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Fondo sutil */}
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Contenedor principal elegante */}
      <motion.div
        className="relative flex flex-col items-center gap-8 page-loader-elegant"
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: 0.1,
        }}
      >
        {/* Spinner elegante */}
        <div className="relative page-loader-spinner-elegant">
          {/* Círculo principal */}
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Círculo interno */}
          <motion.div
            className="absolute inset-2 rounded-full border border-primary/60"
            animate={{ rotate: -360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Punto central */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transform: "translate(-50%, -50%)" }}
          />
        </div>

        {/* Texto elegante */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <motion.h3
            className="text-lg font-medium text-foreground mb-3"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {text}
          </motion.h3>

          {/* Puntos elegantes */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
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

// Componente de loading con progreso
export const ProgressLoader = ({
  text = "Cargando...",
  progress = 0,
  showPercentage = true,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Spinner con progreso */}
      <div className="relative">
        {/* Círculo de progreso */}
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Círculo de fondo */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="hsl(var(--border))"
            strokeWidth="4"
            fill="none"
            className="opacity-30"
          />
          {/* Círculo de progreso */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: "0 251.2" }}
            animate={{
              strokeDasharray: `${(progress / 100) * 251.2} 251.2`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>

        {/* Texto de porcentaje */}
        {showPercentage && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="text-lg font-bold text-primary">
              {Math.round(progress)}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Texto */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-foreground font-medium">{text}</p>
      </motion.div>
    </div>
  );
};

// Componente de loading con etapas
export const StageLoader = ({
  stages = [],
  currentStage = 0,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {stages.map((stage, index) => (
        <motion.div
          key={index}
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
            index < currentStage
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              : index === currentStage
                ? "bg-primary/10 border border-primary/30"
                : "bg-muted/50 border border-border"
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          {/* Icono de estado */}
          <div className="flex-shrink-0">
            {index < currentStage ? (
              <motion.div
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            ) : index === currentStage ? (
              <motion.div
                className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            ) : (
              <div className="w-6 h-6 bg-muted rounded-full" />
            )}
          </div>

          {/* Texto de la etapa */}
          <span
            className={`text-sm font-medium ${
              index < currentStage
                ? "text-green-700 dark:text-green-300"
                : index === currentStage
                  ? "text-primary"
                  : "text-muted-foreground"
            }`}
          >
            {stage}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// Componente de ejemplo que muestra todos los tipos de loaders
export const LoadingExamples = () => {
  const [progress, setProgress] = React.useState(0);
  const [currentStage, setCurrentStage] = React.useState(0);

  React.useEffect(() => {
    // Simular progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // Simular etapas
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= 3) {
          clearInterval(stageInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(stageInterval);
  }, []);

  const stages = [
    "Inicializando aplicación",
    "Cargando recursos",
    "Conectando servicios",
    "Listo",
  ];

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold text-center mb-8">
        Ejemplos de Loaders
      </h2>

      {/* PageLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">PageLoader</h3>
        <PageLoader text="Cargando página..." />
      </div>

      {/* ProgressLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">ProgressLoader</h3>
        <ProgressLoader text="Descargando archivos..." progress={progress} />
      </div>

      {/* StageLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">StageLoader</h3>
        <StageLoader stages={stages} currentStage={currentStage} />
      </div>

      {/* SectionLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">SectionLoader</h3>
        <SectionLoader text="Cargando contenido..." />
      </div>

      {/* CardLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">CardLoader</h3>
        <CardLoader />
      </div>

      {/* ButtonLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">ButtonLoader</h3>
        <ButtonLoader />
      </div>

      {/* SkeletonLoader */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">SkeletonLoader</h3>
        <SkeletonLoader lines={5} />
      </div>
    </div>
  );
};

export default LoadingSpinner;

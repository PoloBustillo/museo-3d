"use client";
import { useTheme } from "../providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const rippleRef = useRef(null);
  const audioRef = useRef(null);
  const [particles, setParticles] = useState([]);

  // Paleta wow
  const palette = isDark
    ? ['#818cf8', '#a5b4fc', '#f472b6', '#facc15', '#fef9c3', '#fff', '#6366f1', '#38bdf8', '#f472b6', '#e0e7ff']
    : ['#fde68a', '#fbbf24', '#f472b6', '#facc15', '#fff', '#fcd34d', '#f59e42', '#38bdf8', '#f472b6', '#fef9c3'];

  // Partículas wow
  const triggerParticles = () => {
    const newParticles = Array.from({ length: 18 }).map((_, i) => {
      const angle = (i * (360 / 18)) + Math.random() * 10;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const size = 6 + Math.random() * 8;
      const duration = 0.5 + Math.random() * 0.5;
      return {
        id: Math.random() + i,
        angle,
        color,
        size,
        duration,
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 900);
  };

  // Sonido wow
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  };

  // Animación de ripple, partículas y sonido al cambiar
  const handleClick = (e) => {
    const ripple = rippleRef.current;
    if (ripple) {
      ripple.classList.remove("animate-ping");
      void ripple.offsetWidth;
      ripple.classList.add("animate-ping");
    }
    triggerParticles();
    playSound();
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-16 h-8 rounded-full border-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        ${isDark ? "bg-gradient-to-r from-indigo-800 via-purple-800 to-gray-900 border-indigo-500" : "bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-300 border-yellow-400"}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {/* Sonido wow */}
      <audio ref={audioRef} src="/theme-switch-pop.mp3" preload="auto" />
      {/* Partículas wow */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            background: p.color,
            zIndex: 30,
            opacity: 0.7,
            filter: 'blur(1.5px)',
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: 32 * Math.cos((p.angle * Math.PI) / 180),
            y: 32 * Math.sin((p.angle * Math.PI) / 180),
            scale: 1.5,
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
        />
      ))}
      {/* Ripple animado */}
      <span
        ref={rippleRef}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none z-0 opacity-0 ${isDark ? "bg-indigo-400/0" : "bg-yellow-300/0"}`}
        style={{ zIndex: 1 }}
      />
      {/* Thumb animado */}
      <motion.div
        className={`absolute top-1/2 left-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center z-10 transform -translate-y-1/2
          ${isDark ? "bg-gray-900 border-2 border-indigo-400" : "bg-white border-2 border-yellow-300"}
        `}
        animate={{
          x: isDark ? 32 : 0,
          scale: 1,
          boxShadow: isDark
            ? "0 0 12px 2px #6366f1, 0 2px 8px 0 #0004"
            : "0 0 8px 2px #fde68a, 0 2px 8px 0 #0002",
        }}
        whileHover={{
          scale: 1.08,
          boxShadow: isDark ? "0 0 16px 4px #818cf8" : "0 0 16px 4px #fde68a",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              className="w-4 h-4 text-indigo-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0.7, rotate: -180 }}
              transition={{ duration: 0.4 }}
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0.7, rotate: -180 }}
              transition={{ duration: 0.4 }}
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Borde animado */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none z-0"
        animate={{
          boxShadow: isDark
            ? "0 0 0 3px #6366f1, 0 0 16px 2px #6366f1aa"
            : "0 0 0 3px #fde68a, 0 0 16px 2px #fde68aaa",
        }}
        transition={{ duration: 0.5 }}
      />
    </button>
  );
}

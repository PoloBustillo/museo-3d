"use client";
import { useTheme } from "../providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cubicBezier } from "framer-motion";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const rippleRef = useRef(null);
  const audioRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [flash, setFlash] = useState(false);
  const [thumbShake, setThumbShake] = useState(false);

  // Paleta pro
  // Paleta invertida: colores claros en light, oscuros en dark
  const palette = isDark
    ? [
        "#18181b",
        "#312e81",
        "#1e293b",
        "#6366f1",
        "#7c3aed",
        "#0ea5e9",
        "#334155",
        "#000",
        "#0f172a",
        "#1e1b4b",
      ]
    : [
        "#fbbf24",
        "#fde68a",
        "#fff",
        "#f472b6",
        "#facc15",
        "#a5b4fc",
        "#818cf8",
        "#fef9c3",
        "#38bdf8",
        "#e0e7ff",
        "rgba(250,204,21,0.7)",
        "rgba(253,230,138,0.7)",
        "rgba(245,114,182,0.7)",
        "rgba(129,140,248,0.7)",
      ];

  // Partículas pro: trayectorias curvas, persistentes, algunas glowing, más naturales y visibles en light
  const triggerParticles = () => {
    const count = 22;
    const newParticles = Array.from({ length: count }).map((_, i) => {
      const angle = i * (360 / count) + Math.random() * 16;
      const baseColor = palette[Math.floor(Math.random() * palette.length)];
      const alpha = isDark
        ? 0.5 + Math.random() * 0.4
        : 0.7 + Math.random() * 0.25;
      const color = baseColor.includes("rgba")
        ? baseColor.replace(
            /\d?\.\d+\)$/g,
            (alpha + 0.18 > 1 ? 1 : alpha + 0.18) + ")"
          )
        : baseColor;
      const size = 8 + Math.random() * 12;
      // Duración extendida para mayor apreciación
      const duration = 1.8 + Math.random() * 1.6;
      const curve = Math.random() > 0.5 ? 1 : -1;
      const glow = Math.random() > 0.6;
      const persistent = Math.random() > 0.7;
      const floater = Math.random() > 0.85; // algunos flotan lento
      return {
        id: Math.random() + i,
        angle,
        color,
        size,
        duration: floater ? 3.5 + Math.random() * 2.2 : duration,
        curve,
        glow,
        persistent: floater ? true : persistent,
        floater,
      };
    });
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(
      () => setParticles((prev) => prev.filter((p) => p.persistent)),
      2100
    );
    setTimeout(() => setParticles([]), 5200);
  };

  // Sonido pro: eco sutil (simulado)
  const playSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.6;
        audioRef.current.play().catch((error) => {
          // Silently handle audio play errors
          console.debug("Theme switch audio play failed:", error.message);
        });
        // Eco simulado: repite bajito tras 120ms
        setTimeout(() => {
          if (audioRef.current) {
            try {
              audioRef.current.currentTime = 0;
              audioRef.current.volume = 0.18;
              audioRef.current.play().catch((error) => {
                // Silently handle audio play errors
                console.debug(
                  "Theme switch echo audio play failed:",
                  error.message
                );
              });
            } catch (error) {
              // Silently handle any other audio errors
              console.debug("Theme switch echo audio error:", error.message);
            }
          }
        }, 120);
      } catch (error) {
        // Silently handle any other audio errors
        console.debug("Theme switch audio error:", error.message);
      }
    }
  };

  // Animación de ripple, partículas, sonido, flash, shake, morph
  const handleClick = (e) => {
    const ripple = rippleRef.current;
    if (ripple) {
      ripple.classList.remove("animate-ping");
      void ripple.offsetWidth;
      ripple.classList.add("animate-ping");
    }
    triggerParticles();
    playSound();
    setFlash(true);
    setThumbShake(true);
    setTimeout(() => setFlash(false), 220);
    setTimeout(() => setThumbShake(false), 400);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-16 h-8 rounded-full border-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 overflow-visible
        ${isDark ? "bg-gradient-to-r from-indigo-800 via-purple-800 to-gray-900 border-indigo-500" : "bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-300 border-yellow-400"}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {/* Sonido pro */}
      <audio ref={audioRef} src="/theme-switch-pop.mp3" preload="auto" />
      {/* Flash global pro */}
      {flash && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: isDark
              ? "rgba(129,140,248,0.18)"
              : "rgba(253,230,138,0.18)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        />
      )}
      {/* Partículas pro */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={
            isDark
              ? "pointer-events-none absolute rounded-full"
              : "pointer-events-none absolute"
          }
          style={
            isDark
              ? {
                  left: "50%",
                  top: "50%",
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  zIndex: 99999,
                  opacity: p.glow ? 0.99 : 0.8,
                  borderRadius: "9999px",
                  filter: p.glow ? "blur(2.5px) brightness(2)" : "blur(0.8px)",
                  boxShadow: p.glow ? `0 0 20px 8px ${p.color}` : undefined,
                  mixBlendMode: p.glow ? "screen" : "plus-lighter",
                  border: undefined,
                  transition: "none",
                }
              : {
                  left: "50%",
                  top: "50%",
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  zIndex: 99999,
                  opacity: 0.85,
                  borderRadius: "9999px",
                  filter: p.glow ? "blur(2.5px) brightness(2)" : "blur(0.8px)",
                  boxShadow: p.glow ? `0 0 20px 8px ${p.color}` : undefined,
                  mixBlendMode: p.glow ? "screen" : "plus-lighter",
                  border: undefined,
                  transition: "none",
                }
          }
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x:
              (p.floater ? 16 : 32) * Math.cos((p.angle * Math.PI) / 180) +
              p.curve * (p.floater ? 24 : 8),
            y:
              (p.floater ? 16 : 32) * Math.sin((p.angle * Math.PI) / 180) +
              p.curve * (p.floater ? 24 : 12),
            scale: p.glow ? 2.2 : p.floater ? 1.2 : 1.5,
          }}
          transition={{
            duration: p.duration,
            ease: cubicBezier(0.22, 1, 0.36, 1),
          }}
        />
      ))}
      {/* Ripple pro */}
      <span
        ref={rippleRef}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full pointer-events-none z-0 opacity-0 ${isDark ? "bg-indigo-400/30" : "bg-yellow-300/30"}`}
        style={{ zIndex: 1, filter: "blur(2.5px)" }}
      />
      {/* Thumb pro: shake visual, morph, shadow animada */}
      <motion.div
        className={`absolute top-1/2 left-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center z-10 transform -translate-y-1/2
          ${isDark ? "bg-gray-900 border-2 border-indigo-400" : "bg-white border-2 border-yellow-300"}
        `}
        animate={{
          x: isDark ? 32 : 0,
          scale: thumbShake ? 1.1 : 1,
          rotate: thumbShake ? [0, 8] : 0,
          boxShadow: isDark
            ? "0 0 10px 2px #6366f1, 0 2px 8px 0 #0003"
            : "0 0 8px 2px #fde68a, 0 2px 8px 0 #0002",
        }}
        whileHover={{
          scale: 1.08,
          boxShadow: isDark ? "0 0 16px 4px #818cf8" : "0 0 16px 4px #fde68a",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              className="w-5 h-5 text-indigo-300 drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 360,
                filter: flash ? "drop-shadow(0 0 8px #818cf8)" : "none",
              }}
              exit={{ opacity: 0, scale: 0.7, rotate: 0 }}
              transition={{ duration: 0.45, type: "tween", ease: "easeInOut" }}
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              className="w-5 h-5 text-yellow-500 drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 360,
                filter: flash ? "drop-shadow(0 0 8px #fde68a)" : "none",
              }}
              exit={{ opacity: 0, scale: 0.7, rotate: 0 }}
              transition={{ duration: 0.45, type: "tween", ease: "easeInOut" }}
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
      {/* Borde animado pro: glow sutil */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none z-0"
        animate={{
          boxShadow: isDark
            ? "0 0 0 2px #6366f1, 0 0 8px 2px #6366f1aa"
            : "0 0 0 2.5px #fbbf24, 0 0 16px 4px #fbbf24cc, 0 0 32px 8px #fde68a99",
        }}
        style={{ border: isDark ? undefined : "2.5px solid #fbbf24" }}
        transition={{ duration: 0.5 }}
      />
    </button>
  );
}

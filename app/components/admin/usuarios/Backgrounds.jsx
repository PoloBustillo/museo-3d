import React from "react";

/**
 * Fondo animado de blobs para light/dark mode.
 */
export function AnimatedBlobsBackground() {
  return (
    <>
      {/* Light mode blobs: azulados/violetas */}
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-blue-200/60 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe block dark:hidden" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-violet-200/60 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed block dark:hidden" />
      <div className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe block dark:hidden" style={{ transform: "translate(-50%,-50%) scale(1.2)" }} />
      {/* Dark mode blobs: igual que antes */}
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-orange-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-pink-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed hidden dark:block" />
      <div className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-fuchsia-800/20 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe hidden dark:block" style={{ transform: "translate(-50%,-50%) scale(1.2)" }} />
    </>
  );
}

/**
 * Patrón de puntos para fondo en dark mode.
 */
export function DotsPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden dark:block"
      width="100%"
      height="100%"
      style={{ opacity: 0.13 }}
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
} 
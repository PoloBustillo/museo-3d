import React, { useState, useEffect } from "react";

export default function RainbowBackground() {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Detectar dispositivos con rendimiento limitado
  useEffect(() => {
    const checkPerformance = () => {
      const isMobile = window.innerWidth < 768;
      const isLowEnd = navigator.hardwareConcurrency <= 4;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      setIsLowPerformance(isMobile || isLowEnd || prefersReducedMotion);
    };

    checkPerformance();
    window.addEventListener("resize", checkPerformance);
    return () => window.removeEventListener("resize", checkPerformance);
  }, []);

  // Versión simplificada para dispositivos con rendimiento limitado
  if (isLowPerformance) {
    return (
      <div
        className="rainbow-background-simple"
        style={{
          position: "absolute",
          inset: 0,
          minHeight: "100%",
          height: "100%",
          width: "100%",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />
    );
  }

  // Versión optimizada con CSS puro
  return (
    <div
      className="rainbow-background"
      style={{
        position: "absolute",
        inset: 0,
        minHeight: "100%",
        height: "100%",
        width: "100%",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        .rainbow-background {
          background: linear-gradient(135deg, 
            rgba(232,121,249,0.1) 0%, 
            rgba(96,165,250,0.1) 25%, 
            rgba(94,234,212,0.1) 50%, 
            rgba(232,121,249,0.1) 75%, 
            rgba(96,165,250,0.1) 100%
          );
          background-size: 400% 400%;
          animation: gradient-shift 20s ease infinite;
        }

        .rainbow-background::before,
        .rainbow-background::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, 
            rgba(232,121,249,0.05) 0%, 
            transparent 50%, 
            rgba(94,234,212,0.05) 100%
          );
          animation: subtle-move 15s ease-in-out infinite;
        }

        .rainbow-background::after {
          background: linear-gradient(-45deg, 
            rgba(96,165,250,0.05) 0%, 
            transparent 50%, 
            rgba(232,121,249,0.05) 100%
          );
          animation: subtle-move 12s ease-in-out infinite reverse;
        }

        .rainbow-background-simple {
          background: linear-gradient(135deg, 
            rgba(232,121,249,0.08) 0%, 
            rgba(96,165,250,0.08) 50%, 
            rgba(94,234,212,0.08) 100%
          );
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes subtle-move {
          0%, 100% { 
            transform: translateX(0) translateY(0) scale(1);
            opacity: 0.3;
          }
          25% { 
            transform: translateX(2%) translateY(-1%) scale(1.02);
            opacity: 0.4;
          }
          50% { 
            transform: translateX(-1%) translateY(2%) scale(0.98);
            opacity: 0.3;
          }
          75% { 
            transform: translateX(1%) translateY(-2%) scale(1.01);
            opacity: 0.4;
          }
        }

        /* Optimización para dispositivos con preferencia de movimiento reducido */
        @media (prefers-reduced-motion: reduce) {
          .rainbow-background,
          .rainbow-background::before,
          .rainbow-background::after {
            animation: none !important;
          }
          
          .rainbow-background {
            background: linear-gradient(135deg, 
              rgba(232,121,249,0.08) 0%, 
              rgba(96,165,250,0.08) 50%, 
              rgba(94,234,212,0.08) 100%
            );
          }
        }

        /* Optimización para dispositivos móviles */
        @media (max-width: 768px) {
          .rainbow-background {
            animation-duration: 30s;
          }
          
          .rainbow-background::before,
          .rainbow-background::after {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
}

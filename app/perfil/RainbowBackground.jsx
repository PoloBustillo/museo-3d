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

  // Versión con divs para los blobs
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
        overflow: "hidden", // Crucial for containing the blobs
      }}
    >
      <div className="blob1" />
      <div className="blob2" />
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

        .blob1, .blob2 {
          content: '';
          position: absolute;
          top: -20%; 
          left: -20%;
          width: 140%;
          height: 140%;
          animation: subtle-move 15s ease-in-out infinite;
          will-change: transform;
        }

        .blob1 {
          background: linear-gradient(45deg, 
            rgba(232,121,249,0.05) 0%, 
            transparent 50%, 
            rgba(94,234,212,0.05) 100%
          );
        }

        .blob2 {
          background: linear-gradient(-45deg, 
            rgba(96,165,250,0.05) 0%, 
            transparent 50%, 
            rgba(232,121,249,0.05) 100%
          );
          animation-direction: reverse;
          animation-duration: 12s;
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
            transform: translateX(0) translateY(0);
            opacity: 0.3;
          }
          25% { 
            transform: translateX(5%) translateY(-2%);
            opacity: 0.4;
          }
          50% { 
            transform: translateX(-2%) translateY(5%);
            opacity: 0.3;
          }
          75% { 
            transform: translateX(2%) translateY(-5%);
            opacity: 0.4;
          }
        }

        /* Optimización para dispositivos con preferencia de movimiento reducido */
        @media (prefers-reduced-motion: reduce) {
          .rainbow-background,
          .blob1,
          .blob2 {
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
          
          .blob1,
          .blob2 {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
}

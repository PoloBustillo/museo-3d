"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import AnimatedTriangleOverlay from "../components/TriangleOverlay";
import LandingMobile from "./landing-mobile";
import useIsMobile from "./hooks/useIsMobile";
import AnimatedBackground from "../components/shared/AnimatedBackground";

const steps = [
  {
    img: "/images/Origen.webp",
    text: "Bienvenido a la experiencia del Mural Arpa, explora y descubre su historia.",
  },
  {
    img: "/images/Impulso_Humano_Creador.webp",
    text: "Visita múltiples galerías de arte y conoce a los artistas detrás de cada obras.",
  },
  {
    img: "/images/CCU_15_años_de_Arte_y_Cultura.webp",
    text: "Inicia sesión para subir tus propias obras de arte y ser parte de nuestra comunidad.",
  },
];

function HomeContent() {
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);
    if (isMobile) return;
    if (!isMobile) {
      document.body.classList.add("home-active");
      document.documentElement.classList.add("home-page");
    } else {
      document.body.classList.remove("home-active");
      document.documentElement.classList.remove("home-page");
    }
    // Detectar interacción del usuario para ocultar hints
    const handleUserInteraction = () => {
      document.documentElement.classList.add("user-interacted");
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
    window.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    });
    window.addEventListener("scroll", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction);
    return () => {
      document.body.classList.remove("home-active");
      document.documentElement.classList.remove("home-page");
      document.documentElement.classList.remove("user-interacted");
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("scroll", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isClient) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const container = containerRef.current;
          const scrollTop = container.scrollTop;
          const sectionHeight = container.clientHeight;
          // Actualizar posición de scroll para parallax
          setScrollY(scrollTop);
          // Calcular sección actual basada en el scroll
          const newCurrent = Math.floor(
            (scrollTop + sectionHeight * 0.5) / sectionHeight
          );
          const clampedCurrent = Math.max(
            0,
            Math.min(newCurrent, steps.length - 1)
          );
          if (clampedCurrent !== current) {
            setCurrent(clampedCurrent);
          }
          // Opacidad del triángulo basada en la proximidad a la sección actual
          const currentSectionStart = current * sectionHeight;
          const sectionCenter = currentSectionStart + sectionHeight / 2;
          const distanceFromCenter = Math.abs(
            scrollTop + sectionHeight / 2 - sectionCenter
          );
          const maxDistance = sectionHeight / 2;
          let opacity;
          if (distanceFromCenter <= maxDistance * 0.3) {
            opacity = 1;
          } else if (distanceFromCenter <= maxDistance) {
            const fadeProgress =
              (distanceFromCenter - maxDistance * 0.3) / (maxDistance * 0.7);
            opacity = 1 - fadeProgress * fadeProgress;
          } else {
            opacity = 0;
          }
          setScrollOpacity(opacity);
          ticking = false;
        });
        ticking = true;
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isClient, current]);

  // Navegación con flechas del teclado
  useEffect(() => {
    if (!isClient) return;
    const handleKeyPress = (e) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        const nextIndex = Math.min(current + 1, steps.length - 1);
        if (nextIndex !== current) {
          scrollToSection(nextIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = Math.max(current - 1, 0);
        if (prevIndex !== current) {
          scrollToSection(prevIndex);
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isClient, current]);

  const side = current % 2 === 0 ? "left" : "right";

  const scrollToSection = (index) => {
    if (!containerRef.current) return;
    const sectionHeight = containerRef.current.clientHeight;
    const targetScrollTop = index * sectionHeight;
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  };

  // Evitar renderizado hasta que el cliente esté listo
  if (!isClient) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center">
        <div className="flex space-x-2 mb-4">
          <span className="block w-3 h-3 rounded-full bg-white animate-bounce [animation-delay:0s]"></span>
          <span className="block w-3 h-3 rounded-full bg-white animate-bounce [animation-delay:0.15s]"></span>
          <span className="block w-3 h-3 rounded-full bg-white animate-bounce [animation-delay:0.3s]"></span>
        </div>
        <div className="text-white text-lg font-medium tracking-wide">
          Cargando
        </div>
      </div>
    );
  }

  // Mostrar landing mobile si no es desktop
  if (isMobile) {
    return <LandingMobile />;
  }

  return (
    <div className="relative w-full min-h-screen">
      {isMobile && <AnimatedBackground />}
      <div
        ref={containerRef}
        className={`home-scroll-container w-full h-screen overflow-y-auto transition-all duration-300 ${isMobile ? "bg-transparent z-10" : ""}`}
      >
        {/* Fondos con parallax absolutos */}
        {steps.map((step, index) => {
          const sectionHeight = containerRef.current?.clientHeight || 800;
          const sectionOffset = index * sectionHeight;
          const scrollFromSectionStart = scrollY - sectionOffset;
          const parallaxOffset = isMobile ? 0 : scrollFromSectionStart * 0.1;
          const distanceFromSection = Math.abs(scrollY - sectionOffset);
          const normalizedDistance = distanceFromSection / sectionHeight;
          let opacity = 1;
          if (normalizedDistance > 1.2) {
            opacity = Math.max(0.1, 1 - (normalizedDistance - 1.2) * 0.5);
          } else if (normalizedDistance > 0.8) {
            opacity = 1 - (normalizedDistance - 0.8) * 0.5;
          }
          const scrollProgress = Math.max(
            0,
            Math.min(
              1,
              (scrollY - sectionOffset + sectionHeight) / (sectionHeight * 2)
            )
          );
          let scale = 1;
          let blur = 0;
          if (!isMobile) {
            if (scrollProgress < 0.3) {
              scale = 1.05 - scrollProgress * 0.17;
              blur = (0.3 - scrollProgress) * 3;
            } else if (scrollProgress > 0.7) {
              scale = 1.0 - (scrollProgress - 0.7) * 0.17;
              blur = (scrollProgress - 0.7) * 4;
            }
          }
          const rotation = isMobile ? 0 : (scrollProgress - 0.5) * 0.5;
          return (
            <div
              key={`bg-${index}`}
              className="absolute w-full h-full pointer-events-none overflow-hidden"
              style={{
                top: `${index * 100}vh`,
                opacity: opacity,
                zIndex: Math.floor(opacity * 10),
                willChange: "transform, opacity, filter",
              }}
            >
              <div
                className="absolute inset-0 w-full h-[130vh]"
                style={{
                  top: "-15vh",
                  backgroundImage: `url(${step.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                  transform: `
                    translate3d(0, ${parallaxOffset}px, 0) 
                    scale(${scale}) 
                    rotate(${rotation}deg)
                  `,
                  filter: `blur(${blur}px) brightness(${1 + (scrollProgress - 0.5) * 0.1})`,
                  transition: "filter 0.2s ease-out",
                }}
              />
              {/* Overlay de gradiente más sutil */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at center, 
                      transparent ${70 + scrollProgress * 15}%, 
                      rgba(0,0,0,${scrollProgress * 0.15}) 100%
                    )
                  `,
                  opacity:
                    scrollProgress > 0.8 ? (scrollProgress - 0.8) * 2.5 : 0,
                }}
              />
            </div>
          );
        })}
        {/* Secciones de contenido (transparentes para scroll) */}
        {steps.map((_, index) => (
          <div
            key={`section-${index}`}
            data-index={index}
            className="section h-screen w-full relative"
            style={{
              backgroundColor: "transparent",
              height: "100vh",
              maxHeight: "100vh",
              minHeight: "100vh",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
      {/* Overlay triangular fuera del contenedor de scroll */}
      <AnimatePresence mode="wait" initial={false}>
        <AnimatedTriangleOverlay
          key={`triangle-${side}-${current + 1}`}
          step={current + 1}
          text={steps[current] ? steps[current].text : ""}
          side={side}
          isFinalStep={current === steps.length - 1}
          scrollOpacity={scrollOpacity}
        />
      </AnimatePresence>
      {/* Indicador de posición */}
      <div
        className={`fixed z-[50] space-y-3 scroll-indicators-desktop
          md:top-1/2 md:transform md:-translate-y-1/2 md:space-y-6 md:space-x-0
          bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3 space-y-0
          md:flex-col md:space-x-0 md:space-y-6 md:bottom-auto
        `}
        style={{
          opacity: scrollOpacity > 0.3 ? 1 : 0.3,
          left: !isMobile ? (side === "left" ? "0rem" : "auto") : "50%",
          right: !isMobile ? (side === "right" ? "-2.5rem" : "auto") : "auto",
          transform: !isMobile ? "translateY(-50%)" : "translateX(-50%)",
          transition:
            "left 0.8s ease-in-out, right 0.8s ease-in-out, opacity 0.3s ease",
        }}
      >
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`rounded-full transition-all duration-300
              w-3 h-3 
              md:w-12 md:h-12
              ${
                index === current
                  ? "bg-white scale-125 shadow-lg md:shadow-xl"
                  : "bg-white/50 hover:bg-white/75 hover:scale-110"
              }`}
            aria-label={`Ir a sección ${index + 1}`}
          />
        ))}
      </div>
      {/* Contador de progreso - Solo visible en desktop */}
      <div
        className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[40] bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 transition-all duration-500"
        style={{
          opacity: scrollOpacity > 0.3 ? 1 : 0.3,
        }}
      >
        <span className="text-white font-medium">
          {current + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}

export default HomeContent;

"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "./components/AuthModal";
import AnimatedTriangleOverlay from "./components/TriangleOverlay";

const steps = [
  {
    img: "/images/Origen.webp",
    text: "Bienvenido a la experiencia del Mural Arpa, explora y descubre su historia.",
  },
  {
    img: "/images/Impulso_Humano_Creador.webp",
    text: "Visita nuestra galería de arte y conoce a los artistas detrás de las obras.",
  },
  {
    img: "/images/CCU_15_años_de_Arte_y_Cultura.webp",
    text: "Inicia sesión para subir tus propias obras de arte y ser parte de nuestra comunidad.",
  },
];

export default function Home() {
  const [authModal, setAuthModal] = useState(null);
  const [current, setCurrent] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);

    // Agregar clase para prevenir scroll del body
    document.body.classList.add("home-active");
    document.documentElement.classList.add("home-page");

    return () => {
      document.body.classList.remove("home-active");
      document.documentElement.classList.remove("home-page");
    };
  }, []);

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
          const totalHeight = sectionHeight * steps.length;

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

          // Calcular qué tan cerca estamos del centro de la sección actual
          const sectionCenter = currentSectionStart + sectionHeight / 2;
          const distanceFromCenter = Math.abs(
            scrollTop + sectionHeight / 2 - sectionCenter
          );
          const maxDistance = sectionHeight / 2;

          // Opacidad basada en proximidad al centro de la sección
          let opacity;
          if (distanceFromCenter <= maxDistance * 0.3) {
            // En el centro de la sección: totalmente visible
            opacity = 1;
          } else if (distanceFromCenter <= maxDistance) {
            // Transición suave hacia los bordes
            const fadeProgress =
              (distanceFromCenter - maxDistance * 0.3) / (maxDistance * 0.7);
            opacity = 1 - fadeProgress * fadeProgress; // Curva cuadrática para transición más suave
          } else {
            // Fuera de la sección: invisible
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
      handleScroll(); // Llamar una vez al inicio
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isClient, current]); // Agregamos current como dependencia

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
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll parallax-container relative"
        style={{
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden auto", // Solo scroll vertical
        }}
      >
        {/* Fondos con parallax absolutos */}
        {steps.map((step, index) => {
          const sectionHeight = containerRef.current?.clientHeight || 800;
          const sectionOffset = index * sectionHeight;

          // Calcular el parallax de manera que la imagen se mantenga centrada en su sección
          const scrollFromSectionStart = scrollY - sectionOffset;
          const parallaxOffset = scrollFromSectionStart * 0.1; // Parallax positivo más sutil

          // Calcular opacidad basada en la proximidad a la sección
          const distanceFromSection = Math.abs(scrollY - sectionOffset);
          const normalizedDistance = distanceFromSection / sectionHeight;

          // Opacidad más gradual y suave
          let opacity = 1;
          if (normalizedDistance > 1.2) {
            opacity = Math.max(0.1, 1 - (normalizedDistance - 1.2) * 0.5);
          } else if (normalizedDistance > 0.8) {
            opacity = 1 - (normalizedDistance - 0.8) * 0.5;
          }

          // Efectos de zoom más suaves y graduales
          const scrollProgress = Math.max(
            0,
            Math.min(
              1,
              (scrollY - sectionOffset + sectionHeight) / (sectionHeight * 2)
            )
          );

          // Zoom más sutil y gradual
          let scale = 1;
          let blur = 0;

          if (scrollProgress < 0.3) {
            // Entrando: zoom muy sutil desde 1.05 a 1.0
            scale = 1.05 - scrollProgress * 0.17; // Reducido de 0.4 a 0.17
            blur = (0.3 - scrollProgress) * 3; // Reducido de 8 a 3
          } else if (scrollProgress > 0.7) {
            // Saliendo: zoom sutil desde 1.0 a 0.95
            scale = 1.0 - (scrollProgress - 0.7) * 0.17; // Reducido de 0.4 a 0.17
            blur = (scrollProgress - 0.7) * 4; // Reducido de 12 a 4
          }

          // Rotación más sutil
          const rotation = (scrollProgress - 0.5) * 0.5; // Reducido de 2 a 0.5 grados

          return (
            <div
              key={`bg-${index}`}
              className="absolute w-full h-full pointer-events-none overflow-hidden"
              style={{
                top: `${index * 100}vh`, // Posicionar cada imagen en su sección
                opacity: opacity,
                zIndex: Math.floor(opacity * 10), // Z-index basado en opacidad
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
                  filter: `blur(${blur}px) brightness(${
                    1 + (scrollProgress - 0.5) * 0.1
                  })`, // Brillo más sutil
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
                    scrollProgress > 0.8 ? (scrollProgress - 0.8) * 2.5 : 0, // Más gradual
                }}
              />
            </div>
          );
        })}

        {/* Secciones de contenido (transparentes para scroll) */}
        {steps.map((step, index) => (
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
        className={`fixed top-1/2 transform -translate-y-1/2 z-[40] space-y-3 transition-all duration-500 ${
          side === "left" ? "right-8" : "left-8"
        }`}
        style={{
          opacity: scrollOpacity > 0.3 ? 1 : 0.3, // Se desvanece junto con el triángulo
        }}
      >
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir a sección ${index + 1}`}
          />
        ))}
      </div>

      {/* Contador de progreso */}
      <div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[40] bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 transition-all duration-500"
        style={{
          opacity: scrollOpacity > 0.3 ? 1 : 0.3, // Se desvanece junto con el triángulo
        }}
      >
        <span className="text-white font-medium">
          {current + 1} / {steps.length}
        </span>
      </div>

      {authModal && (
        <AuthModal
          open={!!authModal}
          mode={authModal}
          onClose={(mode) => setAuthModal(mode || null)}
        />
      )}
    </div>
  );
}

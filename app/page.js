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
  const containerRef = useRef(null);

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const newCurrent = Math.round(scrollTop / sectionHeight);

      const clampedCurrent = Math.max(
        0,
        Math.min(newCurrent, steps.length - 1)
      );

      if (clampedCurrent !== current) {
        setCurrent(clampedCurrent);
      }

      // Calcular opacidad basada en el scroll
      const totalScrollHeight = container.scrollHeight - container.clientHeight;
      const scrollProgress = Math.min(scrollTop / totalScrollHeight, 1);

      // Opacidad suave: empieza en 1, baja gradualmente hasta 0.2
      const opacity = Math.max(0.2, 1 - scrollProgress * 0.8);
      setScrollOpacity(opacity);
    };

    const container = containerRef.current;
    if (container) {
      // Agregar listener de scroll con passive: false para mejor control
      container.addEventListener("scroll", handleScroll, { passive: false });

      // Llamar una vez al inicio para establecer el estado inicial
      handleScroll();
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
    const section = containerRef.current?.children[index];
    section?.scrollIntoView({ behavior: "smooth" });
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
    <>
      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory"
        style={{ height: "100vh" }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            data-index={index}
            className="section snap-center h-screen w-full"
            style={{
              backgroundImage: `url(${step.img})`,
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
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[40] bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
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
    </>
  );
}

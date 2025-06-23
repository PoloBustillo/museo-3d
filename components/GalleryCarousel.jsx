"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Info } from "lucide-react";

export default function GalleryCarousel({ items, title = "Galería de Obras" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    resetAutoPlay();
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    resetAutoPlay();
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    // Reiniciar auto-play después de 5 segundos de inactividad
    setTimeout(() => {
      startAutoPlay();
    }, 5000);
  };

  const startAutoPlay = () => {
    autoPlayRef.current = setInterval(() => {
      if (!isTransitioning) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
    }, 20000); // 20 segundos para más tiempo de apreciación
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  // Auto-play
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [items.length]);

  // Reset transition state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // Duración de la transición aumentada

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning]);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground">No hay obras disponibles</p>
      </div>
    );
  }

  // Función para animar texto letra por letra
  const AnimatedText = ({ text, className = "", delay = 0 }) => {
    // Asegurar que text sea siempre una cadena
    const safeText = String(text || "");

    return (
      <div className={className}>
        {safeText.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.8,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            transition={{
              delay: delay + index * 0.03, // 30ms entre letras
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {/* Carrusel principal */}
      <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 rounded-2xl overflow-hidden border border-border">
        <div className="relative w-full h-full">
          {/* Imagen principal */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{
                opacity: 0,
                scale: 1.15,
                filter: "blur(8px)",
                x: 60,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                x: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.85,
                filter: "blur(12px)",
                x: -60,
              }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94], // Curva de easing más suave
                type: "spring",
                stiffness: 80,
                damping: 25,
              }}
              className="absolute inset-0"
            >
              {/* Esqueleto de carga */}
              {!loadedImages.has(currentIndex) && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse">
                  <div className="flex items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              )}

              <img
                src={items[currentIndex]?.url_imagen}
                alt={items[currentIndex]?.titulo || "Obra de arte"}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  loadedImages.has(currentIndex) ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleImageLoad(currentIndex)}
                onError={(e) => {
                  e.target.src = "/assets/artworks/cuadro1.webp";
                  handleImageLoad(currentIndex);
                }}
              />

              {/* Gradiente sutil solo en la parte inferior para el texto */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Información de la obra con animaciones de texto */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <motion.div
              key={`info-${currentIndex}`}
              initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.4,
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {/* Título animado */}
              <div className="mb-2">
                <AnimatedText
                  text={items[currentIndex]?.titulo || "Sin título"}
                  className="text-2xl md:text-3xl font-bold"
                  delay={1.0}
                />
              </div>

              {/* Artista animado */}
              <div className="mb-1">
                <AnimatedText
                  text={items[currentIndex]?.autor || "Artista desconocido"}
                  className="text-lg"
                  delay={1.3}
                />
              </div>

              {/* Técnica animada */}
              {items[currentIndex]?.tecnica && (
                <div className="mb-2">
                  <AnimatedText
                    text={items[currentIndex].tecnica}
                    className="text-sm opacity-90"
                    delay={1.6}
                  />
                </div>
              )}

              {/* Año animado */}
              {items[currentIndex]?.anio && (
                <div>
                  <AnimatedText
                    text={items[currentIndex].anio}
                    className="text-sm opacity-90"
                    delay={1.9}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Botones de navegación */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-20 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Botón de información */}
          <button
            onClick={() => openModal(items[currentIndex])}
            className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-20 backdrop-blur-sm"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "bg-white scale-150 shadow-lg"
                    : "bg-white/50 hover:bg-white/75 hover:scale-110"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Miniaturas con mejor posicionamiento */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-4 pt-2">
        {items.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-500 relative ${
              index === currentIndex
                ? "border-primary shadow-lg shadow-primary/25"
                : "border-border hover:border-primary/50 hover:shadow-md"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{
              scale: 1.08,
              y: -2,
              transition: { duration: 0.3 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 },
            }}
            layout
          >
            {/* Esqueleto para miniatura */}
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}

            <motion.img
              src={item?.url_imagen}
              alt={item?.titulo || `Obra ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                loadedImages.has(index) ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => {
                e.target.src = "/assets/artworks/cuadro1.webp";
                handleImageLoad(index);
              }}
              layoutId={`thumbnail-${index}`}
              initial={{ scale: 1, filter: "blur(0px)" }}
              animate={{
                scale: index === currentIndex ? 1.15 : 1,
                filter: index === currentIndex ? "blur(0px)" : "blur(0px)",
                opacity: index === currentIndex ? 0.95 : 1,
              }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />

            {/* Overlay elegante para la miniatura activa */}
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Indicador de estado activo */}
            {index === currentIndex && (
              <motion.div
                className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full shadow-sm"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Modal de información detallada */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagen */}
                <div className="md:w-2/3 relative">
                  <img
                    src={selectedItem?.url_imagen}
                    alt={selectedItem?.titulo || "Obra de arte"}
                    className="w-full h-64 md:h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/assets/artworks/cuadro1.webp";
                    }}
                  />
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground p-2 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Información */}
                <div className="md:w-1/3 p-6 overflow-y-auto">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {selectedItem?.titulo || "Sin título"}
                  </h2>

                  <div className="space-y-3 text-sm">
                    {selectedItem?.autor && (
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Artista:
                        </span>
                        <p className="text-foreground">{selectedItem.autor}</p>
                      </div>
                    )}

                    {selectedItem?.tecnica && (
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Técnica:
                        </span>
                        <p className="text-foreground">
                          {selectedItem.tecnica}
                        </p>
                      </div>
                    )}

                    {selectedItem?.anio && (
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Año:
                        </span>
                        <p className="text-foreground">{selectedItem.anio}</p>
                      </div>
                    )}

                    {selectedItem?.ubicacion && (
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Ubicación:
                        </span>
                        <p className="text-foreground">
                          {selectedItem.ubicacion}
                        </p>
                      </div>
                    )}

                    {selectedItem?.descripcion && (
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Descripción:
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {selectedItem.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

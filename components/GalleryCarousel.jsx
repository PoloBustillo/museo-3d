"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Info } from "lucide-react";

export default function GalleryCarousel({ items, title = "Galería de Obras" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const carouselRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
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
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground">No hay obras disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carrusel principal */}
      <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 rounded-2xl overflow-hidden border border-border">
        <div className="relative w-full h-full">
          {/* Imagen principal */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
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
              className={`w-full h-full object-cover transition-opacity duration-300 ${
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

          {/* Información de la obra */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                {items[currentIndex]?.titulo || "Sin título"}
              </h3>
              <p className="text-lg mb-1">
                {items[currentIndex]?.autor || "Artista desconocido"}
              </p>
              {items[currentIndex]?.tecnica && (
                <p className="text-sm opacity-90 mb-2">
                  {items[currentIndex].tecnica}
                </p>
              )}
              {items[currentIndex]?.anio && (
                <p className="text-sm opacity-90">{items[currentIndex].anio}</p>
              )}
            </motion.div>
          </div>

          {/* Botones de navegación */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Botón de información */}
          <button
            onClick={() => openModal(items[currentIndex])}
            className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Miniaturas */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
              index === currentIndex
                ? "border-primary scale-110"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Esqueleto para miniatura */}
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}

            <img
              src={item?.url_imagen}
              alt={item?.titulo || `Obra ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loadedImages.has(index) ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => handleImageLoad(index)}
              onError={(e) => {
                e.target.src = "/assets/artworks/cuadro1.webp";
                handleImageLoad(index);
              }}
            />
          </button>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
                    className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground p-2 rounded-full shadow-lg transition-all duration-200"
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

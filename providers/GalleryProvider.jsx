"use client";
import { createContext, useContext, useState, useCallback } from "react";

const GalleryContext = createContext();

export function GalleryProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalPosition, setImageModalPosition] = useState({ x: 0, y: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryView, setGalleryView] = useState("grid"); // 'grid', 'list', 'carousel'

  // Abrir modal de imagen
  const openImageModal = useCallback((artwork, index = 0, position = null) => {
    console.log("GalleryProvider: Abriendo modal", {
      artwork,
      index,
      position,
    });
    setSelectedArtwork(artwork);
    setCurrentImageIndex(index);
    if (position) {
      setImageModalPosition(position);
    } else {
      // Centrar en la pantalla
      setImageModalPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
    setIsImageModalOpen(true);
    // Bloquear scroll del body
    document.body.style.overflow = "hidden";
  }, []);

  // Cerrar modal de imagen
  const closeImageModal = useCallback(() => {
    console.log("GalleryProvider: Cerrando modal");
    setIsImageModalOpen(false);
    setSelectedArtwork(null);
    setCurrentImageIndex(0);
    // Restaurar scroll del body
    document.body.style.overflow = "unset";
  }, []);

  // Navegar entre imágenes
  const navigateImage = useCallback(
    (direction) => {
      if (!artworks.length) return;

      let newIndex;
      if (direction === "next") {
        newIndex = (currentImageIndex + 1) % artworks.length;
      } else {
        newIndex =
          currentImageIndex === 0 ? artworks.length - 1 : currentImageIndex - 1;
      }

      setCurrentImageIndex(newIndex);
      setSelectedArtwork(artworks[newIndex]);
    },
    [artworks, currentImageIndex]
  );

  // Cargar obras de arte para una sala
  const loadArtworksForRoom = useCallback(async (roomId) => {
    try {
      const response = await fetch(`/api/salas/${roomId}/murales`);
      if (response.ok) {
        const data = await response.json();
        setArtworks(data);
        setRoom({ id: roomId, artworks: data });
      }
    } catch (error) {
      console.error("Error loading artworks for room:", error);
    }
  }, []);

  // Filtrar obras de arte
  const filterArtworks = useCallback(
    (filters) => {
      let filtered = [...artworks];

      if (filters.artist) {
        filtered = filtered.filter((artwork) =>
          artwork.artista?.toLowerCase().includes(filters.artist.toLowerCase())
        );
      }

      if (filters.technique) {
        filtered = filtered.filter((artwork) =>
          artwork.tecnica
            ?.toLowerCase()
            .includes(filters.technique.toLowerCase())
        );
      }

      if (filters.year) {
        filtered = filtered.filter((artwork) =>
          artwork.año?.toString().includes(filters.year)
        );
      }

      return filtered;
    },
    [artworks]
  );

  // Obtener estadísticas de la galería
  const getGalleryStats = useCallback(() => {
    const totalArtworks = artworks.length;
    const artists = [...new Set(artworks.map((artwork) => artwork.artista))];
    const techniques = [...new Set(artworks.map((artwork) => artwork.tecnica))];
    const years = artworks.map((artwork) => artwork.año).filter((year) => year);

    return {
      totalArtworks,
      uniqueArtists: artists.length,
      uniqueTechniques: techniques.length,
      oldestYear: years.length > 0 ? Math.min(...years) : null,
      newestYear: years.length > 0 ? Math.max(...years) : null,
    };
  }, [artworks]);

  return (
    <GalleryContext.Provider
      value={{
        // Estado básico
        room,
        artworks,
        selectedArtwork,
        isImageModalOpen,
        imageModalPosition,
        currentImageIndex,
        galleryView,

        // Setters
        setRoom,
        setArtworks,
        setGalleryView,

        // Funciones de modal
        openImageModal,
        closeImageModal,
        navigateImage,

        // Funciones de galería
        loadArtworksForRoom,
        filterArtworks,
        getGalleryStats,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery debe ser usado dentro de un GalleryProvider");
  }
  return context;
};

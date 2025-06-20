"use client";
import { useState, useEffect } from "react";
import { useGallery } from "../../providers/GalleryProvider";
import GalleryGrid from "../../components/GalleryGrid";
import { useModal } from "../../providers/ModalProvider";
import { Plus, Settings, Info } from "lucide-react";

export default function GaleriaPage() {
  const { artworks, loadArtworksForRoom, getGalleryStats } = useGallery();
  const { openModal } = useModal();
  const [selectedRoom, setSelectedRoom] = useState("1"); // Sala por defecto
  const [rooms, setRooms] = useState([]);

  // Cargar salas disponibles
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await fetch("/api/salas");
        if (response.ok) {
          const data = await response.json();
          // La API devuelve { salas: [...], estadisticas: {...} }
          const salas = data.salas || data;
          // Asegurar que salas sea un array
          if (Array.isArray(salas)) {
            setRooms(salas);
          } else {
            console.error("API returned non-array data:", data);
            setRooms([]);
          }
        } else {
          console.error("Failed to load rooms:", response.status);
          setRooms([]);
        }
      } catch (error) {
        console.error("Error loading rooms:", error);
        setRooms([]);
      }
    };

    loadRooms();
  }, []);

  // Cargar obras cuando cambie la sala seleccionada
  useEffect(() => {
    if (selectedRoom) {
      loadArtworksForRoom(selectedRoom);
    }
  }, [selectedRoom, loadArtworksForRoom]);

  // Mostrar información de la galería
  const showGalleryInfo = () => {
    const stats = getGalleryStats();
    openModal("info", {
      title: "Información de la Galería",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {stats.totalArtworks}
              </div>
              <div className="text-sm text-gray-600">Obras totales</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {stats.uniqueArtists}
              </div>
              <div className="text-sm text-gray-600">Artistas únicos</div>
            </div>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Técnicas representadas:</strong> {stats.uniqueTechniques}
            </p>
            {stats.oldestYear && (
              <p>
                <strong>Rango temporal:</strong> {stats.oldestYear} -{" "}
                {stats.newestYear}
              </p>
            )}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Galería de Arte
              </h1>
              <p className="text-gray-600">
                Explora nuestra colección de obras de arte digital
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={showGalleryInfo}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <Info size={16} />
                Información
              </button>
            </div>
          </div>

          {/* Selector de sala */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label
                htmlFor="room-select"
                className="font-medium text-gray-700"
              >
                Sala:
              </label>
              <select
                id="room-select"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {Array.isArray(rooms) && rooms.length > 0 ? (
                  rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.nombre || `Sala ${room.id}`}
                    </option>
                  ))
                ) : (
                  <option value="">Cargando salas...</option>
                )}
              </select>
            </div>

            <div className="text-sm text-gray-500">
              {artworks.length} obras en esta sala
            </div>
          </div>
        </div>

        {/* Galería */}
        <GalleryGrid roomId={selectedRoom} showFilters={true} />
      </div>
    </div>
  );
}

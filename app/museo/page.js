"use client";
import { useState, useEffect } from "react";
import GalleryRoom from "../../components/GalleryRoom.jsx";

export default function MuseoPage() {
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar salas desde la API
  useEffect(() => {
    const cargarSalas = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/salas");

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        const salasFormateadas = data.salas.map((sala) => ({
          id: sala.id,
          nombre: sala.nombre,
          descripcion: `Sala del Museo Virtual con ${sala._count.murales} murales`,
          imagen:
            sala.murales[0]?.mural?.imagenUrl ||
            "/assets/artworks/cuadro1.webp",
          color: getColorBySalaId(sala.id),
          cantidadMurales: sala._count.murales,
          propietario: sala.creador?.email || "Sin propietario",
          murales: sala.murales.map((salaMural) => salaMural.mural) || [],
        }));

        setSalas(salasFormateadas);
        setError(null);
      } catch (err) {
        console.error("Error al cargar salas:", err);
        setError(err.message);
        // Fallback a salas estáticas en caso de error
        setSalas(getSalasFallback());
      } finally {
        setLoading(false);
      }
    };

    cargarSalas();
  }, []);

  // Función auxiliar para asignar colores por ID de sala
  const getColorBySalaId = (salaId) => {
    const colores = {
      1: "#e3f2fd",
      2: "#f3e5f5",
      3: "#e8f5e8",
      4: "#fff3e0",
    };
    return colores[salaId] || "#f5f5f5";
  };

  // Función auxiliar para asignar íconos por ID de sala
  const getIconBySalaId = (salaId) => {
    const iconos = {
      1: "🎨",
      2: "🖼️",
      3: "💻",
      4: "🎭",
    };
    return iconos[salaId] || "🏛️";
  };

  // Salas de fallback en caso de error de API
  const getSalasFallback = () => [
    {
      id: 1,
      nombre: "Sala Principal",
      descripcion: "Exposición permanente con obras clásicas y contemporáneas",
      imagen: "/assets/artworks/cuadro1.webp",
      color: "#e3f2fd",
      cantidadMurales: 6,
      propietario: "Sistema",
      murales: [],
    },
    {
      id: 2,
      nombre: "Sala ARPA",
      descripcion: "Murales y obras del programa ARPA",
      imagen: "/assets/artworks/cuadro2.webp",
      color: "#fff3e0",
      cantidadMurales: 3,
      propietario: "ARPA",
      murales: [],
    },
  ];

  if (salaSeleccionada) {
    return (
      <div className="fixed top-16 md:top-20 left-0 right-0 bottom-0 z-[1]">
        <button
          onClick={() => setSalaSeleccionada(null)}
          className="absolute top-5 left-5 z-[1000] bg-white/90 border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer font-bold text-sm hover:bg-white transition-colors"
        >
          ← Volver a salas
        </button>
        <GalleryRoom
          salaId={salaSeleccionada}
          murales={
            salas.find((sala) => sala.id === salaSeleccionada)?.murales || []
          }
          onRoomChange={(newSalaId) => setSalaSeleccionada(newSalaId)}
          availableRooms={salas.map((sala) => ({
            id: sala.id,
            name: sala.nombre,
            description: sala.descripcion,
            icon: getIconBySalaId(sala.id),
            cantidadMurales: sala.cantidadMurales,
            color: sala.color,
          }))}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando salas del museo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error al cargar las salas</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Museo Virtual 3D
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora las salas del museo y descubre obras de arte únicas en un
            entorno virtual inmersivo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {salas.map((sala) => (
            <div
              key={sala.id}
              onClick={() => setSalaSeleccionada(sala.id)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              style={{ backgroundColor: sala.color }}
            >
              <div className="relative h-48 rounded-t-2xl overflow-hidden">
                <img
                  src={sala.imagen}
                  alt={sala.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-bold">
                  {sala.cantidadMurales} obras
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">
                    {getIconBySalaId(sala.id)}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {sala.nombre}
                  </h3>
                </div>
                <p className="text-gray-700 mb-4">{sala.descripcion}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Propietario: {sala.propietario}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Entrar →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {salas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No hay salas disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

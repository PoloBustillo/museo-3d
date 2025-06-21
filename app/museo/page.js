"use client";
import { useState, useEffect } from "react";
import GalleryRoom from "../../components/GalleryRoom.jsx";

/**
 * La prueba más simple posible. Si esto no se ve, el problema está
 * en un nivel superior (ClientLayout.jsx o globals.css).
 */
export default function MuseoPage() {
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarSalas = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/salas");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        const salasFormateadas = data.salas.map((sala) => ({
          id: sala.id,
          nombre: sala.nombre,
          descripcion: `Sala con ${sala._count.murales} murales`,
          imagen:
            sala.murales[0]?.mural?.url_imagen ||
            "/assets/artworks/cuadro1.webp",
          color: getColorBySalaId(sala.id),
          cantidadMurales: sala._count.murales,
          propietario: sala.creador?.name || "Museo",
          murales:
            sala.murales.map((salaMural) => salaMural.mural).filter(Boolean) ||
            [],
        }));
        setSalas(salasFormateadas);
        setError(null);
      } catch (err) {
        console.error("Error al cargar salas:", err);
        setError(err.message);
        setSalas(getSalasFallback());
      } finally {
        setLoading(false);
      }
    };
    cargarSalas();
  }, []);

  const getColorBySalaId = (id) =>
    ({ 1: "#e3f2fd", 2: "#f3e5f5", 3: "#e8f5e8", 4: "#fff3e0" }[id] ||
    "#f5f5f5");
  const getIconBySalaId = (id) =>
    ({ 1: "🎨", 2: "🖼️", 3: "💻", 4: "🎭" }[id] || "🏛️");

  const getSalasFallback = () => [
    {
      id: 1,
      nombre: "Sala Principal",
      descripcion: "Exposición permanente",
      imagen: "/assets/artworks/cuadro1.webp",
      color: "#e3f2fd",
      cantidadMurales: 0,
      propietario: "Sistema",
      murales: [],
    },
    {
      id: 2,
      nombre: "Sala ARPA",
      descripcion: "Murales del programa ARPA",
      imagen: "/assets/artworks/cuadro2.webp",
      color: "#fff3e0",
      cantidadMurales: 0,
      propietario: "ARPA",
      murales: [],
    },
  ];

  if (salaSeleccionada) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 z-[100]">
        <button
          onClick={() => setSalaSeleccionada(null)}
          className="absolute top-5 left-5 z-[1000] bg-white/90 border-2 border-gray-800 rounded-lg px-4 py-2 cursor-pointer font-bold text-sm hover:bg-white transition-colors"
        >
          ← Volver a salas
        </button>
        <GalleryRoom
          salaId={salaSeleccionada}
          murales={salas.find((s) => s.id === salaSeleccionada)?.murales || []}
          onRoomChange={setSalaSeleccionada}
          availableRooms={salas.map((s) => ({
            id: s.id,
            name: s.nombre,
            icon: getIconBySalaId(s.id),
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
            Explora las salas y descubre obras en un entorno inmersivo
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
        {salas.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay salas disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}

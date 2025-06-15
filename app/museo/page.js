"use client";
import { useState, useEffect } from "react";
import GalleryRoom from "../components/GalleryRoom.jsx";

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
          imagen: sala.murales[0]?.url_imagen || "/assets/artworks/cuadro1.jpg",
          color: getColorBySalaId(sala.id),
          cantidadMurales: sala._count.murales,
          propietario: sala.owner?.email || "Sin propietario",
          murales: sala.murales || [],
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
      imagen: "/assets/artworks/cuadro1.jpg",
      color: "#e3f2fd",
      cantidadMurales: 6,
      propietario: "Sistema",
      murales: [],
    },
    {
      id: 2,
      nombre: "Sala ARPA",
      descripcion: "Murales y obras del programa ARPA",
      imagen: "/assets/artworks/cuadro2.jpg",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-pulse">🎨</div>
          <h2>Cargando salas del museo...</h2>
          <p>Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 flex items-center justify-center">
        <div className="text-center text-white bg-white/10 p-8 rounded-2xl max-w-lg backdrop-blur-lg border border-white/20">
          <div className="text-5xl mb-4">⚠️</div>
          <h2>Error al cargar las salas</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm opacity-80">
            Mostrando salas de ejemplo. Verifica que el servidor esté
            ejecutándose.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500 p-10 relative">
      {/* Efectos de fondo refinados */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 55%, rgba(90, 90, 120, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(160, 120, 200, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 45% 85%, rgba(100, 160, 220, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      <div className="pt-15 max-w-6xl mx-auto relative z-10">
        <h1
          className="text-center text-white text-5xl mb-4 font-bold"
          style={{ textShadow: "0 6px 12px rgba(0,0,0,0.7)" }}
        >
          Museo Virtual 3D
        </h1>
        <p
          className="text-center text-white/95 text-xl mb-4"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          Explora nuestras salas virtuales y sumérgete en el arte
        </p>

        {/* Estadísticas del museo */}
        <div
          className="text-center text-white/95 text-base mb-12 flex justify-center gap-8 flex-wrap rounded-3xl p-5 max-w-4xl mx-auto shadow-2xl border border-white/20"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(15px)",
          }}
        >
          <span className="font-semibold">
            🏛️ {salas.length} salas disponibles
          </span>
          <span className="font-semibold">
            🎨 {salas.reduce((total, sala) => total + sala.cantidadMurales, 0)}{" "}
            murales totales
          </span>
          <span className="font-semibold">
            👥 {new Set(salas.map((sala) => sala.propietario)).size} curadores
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {salas.map((sala) => (
            <div
              key={sala.id}
              onClick={() => setSalaSeleccionada(sala.id)}
              className="bg-white/95 backdrop-blur-xl rounded-3xl cursor-pointer shadow-2xl overflow-hidden relative border border-white/30 transition-all duration-300 hover:transform hover:-translate-y-2 hover:scale-105 hover:shadow-3xl"
            >
              {/* Imagen de preview de la sala */}
              <div
                style={{
                  height: 200,
                  background:
                    sala.murales.length > 0
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${sala.imagen}) center/cover`
                      : `linear-gradient(45deg, ${sala.color}, rgba(255,255,255,0.1))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "4rem",
                  color: sala.murales.length > 0 ? "white" : "#666",
                  position: "relative",
                }}
              >
                {sala.murales.length > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(255,255,255,0.9)",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {sala.cantidadMurales} murales
                  </div>
                ) : (
                  <>
                    🎨
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "rgba(255,255,255,0.8)",
                        padding: "4px 8px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        color: "#666",
                      }}
                    >
                      Sala vacía
                    </div>
                  </>
                )}
              </div>

              <div style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "#333",
                    fontSize: "1.5rem",
                  }}
                >
                  {sala.nombre}
                </h3>
                <p
                  style={{
                    margin: "0 0 0.8rem 0",
                    color: "#666",
                    lineHeight: 1.5,
                  }}
                >
                  {sala.descripcion}
                </p>

                {/* Información adicional */}
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                      color: "#888",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>🎨</span>
                    <span>
                      {sala.cantidadMurales}{" "}
                      {sala.cantidadMurales === 1 ? "pieza" : "piezas"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#888",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>👤</span>
                    <span>Curador: {sala.propietario}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    background:
                      sala.cantidadMurales > 0 ? sala.color : "#f5f5f5",
                    borderRadius: 8,
                    display: "inline-block",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#555",
                    border:
                      sala.cantidadMurales === 0 ? "2px dashed #ccc" : "none",
                  }}
                >
                  {sala.cantidadMurales > 0
                    ? "Explorar sala →"
                    : "Sala en construcción"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div
          style={{
            marginTop: "3rem",
            textAlign: "center",
            color: "rgb(255, 255, 255)",
            fontSize: "1rem",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "20px",
            padding: "1.5rem 2rem",
            maxWidth: "650px",
            margin: "3rem auto 0 auto",
            boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <p style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
            🔄 Las salas se actualizan automáticamente desde la base de datos
          </p>
          <p style={{ opacity: 0.7 }}>
            Última actualización: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

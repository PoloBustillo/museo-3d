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

        // Mapear las salas de la API al formato necesario para la UI
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
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => setSalaSeleccionada(null)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            zIndex: 1000,
            background: "rgba(255,255,255,0.9)",
            border: "2px solid #333",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          ← Volver a salas
        </button>
        <GalleryRoom
          salaId={salaSeleccionada}
          murales={
            salas.find((sala) => sala.id === salaSeleccionada)?.murales || []
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              animation: "pulse 2s infinite",
            }}
          >
            🎨
          </div>
          <h2>Cargando salas del museo...</h2>
          <p>Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "white",
            background: "rgba(255,255,255,0.1)",
            padding: "2rem",
            borderRadius: "16px",
            maxWidth: "500px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2>Error al cargar las salas</h2>
          <p style={{ marginBottom: "1rem" }}>{error}</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            Mostrando salas de ejemplo. Verifica que el servidor esté
            ejecutándose.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      {/* Efectos de fondo adicionales */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.3) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "white",
            fontSize: "3rem",
            marginBottom: "1rem",
            textShadow: "0 4px 8px rgba(0,0,0,0.5)",
            fontWeight: "700",
            background: "linear-gradient(45deg, #ffffff, #e3f2fd, #f3e5f5)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🏛️ Museo Virtual 3D
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.95)",
            fontSize: "1.2rem",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Explora nuestras salas virtuales y sumérgete en el arte
        </p>

        {/* Estadísticas del museo */}
        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.9)",
            fontSize: "1rem",
            marginBottom: "3rem",
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "20px",
            padding: "1rem 2rem",
            maxWidth: "800px",
            margin: "0 auto 3rem auto",
          }}
        >
          <span style={{ fontWeight: "600" }}>
            🏛️ {salas.length} salas disponibles
          </span>
          <span style={{ fontWeight: "600" }}>
            🎨 {salas.reduce((total, sala) => total + sala.cantidadMurales, 0)}{" "}
            murales totales
          </span>
          <span style={{ fontWeight: "600" }}>
            👥 {new Set(salas.map((sala) => sala.propietario)).size} curadores
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          {salas.map((sala) => (
            <div
              key={sala.id}
              onClick={() => setSalaSeleccionada(sala.id)}
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 20,
                padding: 0,
                cursor: "pointer",
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                overflow: "hidden",
                transform: "translateY(0)",
                border: "1px solid rgba(255,255,255,0.3)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-12px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 20px 60px rgba(0,0,0,0.25)";
                e.currentTarget.style.background = "rgba(255,255,255,0.98)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(0,0,0,0.15)";
                e.currentTarget.style.background = "rgba(255,255,255,0.95)";
              }}
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
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.9rem",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            maxWidth: "600px",
            margin: "3rem auto 0 auto",
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

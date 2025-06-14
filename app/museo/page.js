"use client";
import { useState } from "react";
import GalleryRoom from "../components/GalleryRoom.jsx";

// Definición de colecciones de obras por sala (replicada desde GalleryRoom)
const artworkSalas = {
  1: [
    // Sala Principal
    {
      src: "/assets/artworks/cuadro1.jpg",
      title: "Abstract Composition I",
      artist: "Maria Rodriguez",
      year: "2023",
      description:
        "Composición abstracta con formas geométricas y colores vibrantes.",
      technique: "Óleo sobre lienzo",
      dimensions: "120 x 90 cm",
    },
    {
      src: "/assets/artworks/cuadro2.jpg",
      title: "Urban Landscape",
      artist: "John Smith",
      year: "2022",
      description: "Paisaje urbano contemporáneo con perspectiva dinámica.",
      technique: "Acrílico sobre madera",
      dimensions: "100 x 80 cm",
    },
  ],
  2: [
    // Sala Contemporánea
    {
      src: "/assets/artworks/cuadro3.jpg",
      title: "Portrait in Blue",
      artist: "Anna Chen",
      year: "2024",
      description: "Retrato expresivo en tonos azules.",
      technique: "Mixta sobre papel",
      dimensions: "70 x 100 cm",
    },
    {
      src: "/assets/artworks/cuadro4.jpg",
      title: "Nature Study",
      artist: "Carlos Rivera",
      year: "2023",
      description: "Estudio detallado de elementos naturales.",
      technique: "Acuarela sobre papel",
      dimensions: "60 x 80 cm",
    },
  ],
  3: [
    // Sala Digital
    {
      src: "/assets/artworks/cuadro5.jpg",
      title: "Digital Dreams",
      artist: "Sarah Johnson",
      year: "2024",
      description: "Obra digital que explora el subconsciente.",
      technique: "Arte digital",
      dimensions: "90 x 90 cm",
    },
  ],
  4: [
    // Sala ARPA
    {
      src: "/assets/artworks/cuadro1.jpg",
      title: "Saturnino-Moon",
      artist: "Miguel Fernando Lima Rodríguez, Pamela Sánchez Hernández",
      year: "2024",
      description: "Mural colaborativo con temática lunar y saturnina.",
      technique: "Acrílico sobre muro",
      dimensions: "2.46 x 3.8m",
    },
    {
      src: "/assets/artworks/cuadro2.jpg",
      title: "Metamorfosis Marina",
      artist: 'Vanessa Flores "Flores en el Mar"',
      year: "2024",
      description: "Transformación marina en el arte mural.",
      technique: "Pintura vinílica sobre muro",
      dimensions: "5 m x 4.30 m",
    },
  ],
};

const salas = [
  {
    id: 1,
    nombre: "Sala Principal",
    descripcion: "Exposición permanente con obras clásicas y contemporáneas",
    imagen: "/assets/artworks/cuadro1.jpg",
    color: "#e3f2fd",
  },
  {
    id: 2,
    nombre: "Sala Contemporánea",
    descripcion: "Arte moderno y expresiones actuales",
    imagen: "/assets/artworks/cuadro3.jpg",
    color: "#f3e5f5",
  },
  {
    id: 3,
    nombre: "Sala Digital",
    descripcion: "Experiencias digitales y arte interactivo",
    imagen: "/assets/artworks/cuadro5.jpg",
    color: "#e8f5e8",
  },
  {
    id: 4,
    nombre: "Sala ARPA",
    descripcion: "Murales y obras del programa ARPA",
    imagen: "/assets/artworks/cuadro2.jpg",
    color: "#fff3e0",
  },
];

export default function MuseoPage() {
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);

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
        <GalleryRoom salaId={salaSeleccionada} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            color: "white",
            fontSize: "3rem",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          🏛️ Museo Virtual 3D
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.9)",
            fontSize: "1.2rem",
            marginBottom: "3rem",
          }}
        >
          Explora nuestras salas virtuales y sumérgete en el arte
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          {salas.map((sala) => (
            <div
              key={sala.id}
              onClick={() => setSalaSeleccionada(sala.id)}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 0,
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                overflow: "hidden",
                transform: "translateY(0)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.boxShadow = "0 16px 48px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  height: 200,
                  background: `linear-gradient(45deg, ${sala.color}, rgba(255,255,255,0.1))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "4rem",
                  color: "#666",
                }}
              >
                🎨
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    color: "#888",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>🎨</span>
                  <span>{artworkSalas[sala.id]?.length || 0} piezas</span>
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: sala.color,
                    borderRadius: 8,
                    display: "inline-block",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#555",
                  }}
                >
                  Entrar a la sala →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

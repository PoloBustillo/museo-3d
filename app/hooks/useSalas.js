import { useState, useEffect } from "react";

export default function useSalas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const cargarSalas = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/salas");
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        const getColorBySalaId = (id) =>
          ({ 1: "#e3f2fd", 2: "#f3e5f5", 3: "#e8f5e8", 4: "#fff3e0" })[
            id
          ] || "#f5f5f5";
        const salasFormateadas = (data.salas || []).map((sala) => {
          const murales = (sala.murales || [])
            .map((sm) => sm.mural)
            .filter(Boolean);
          // Buscar mural portada por ID si imagenPortada es Int
          const portadaMural = murales.find(
            (m) => sala.imagenPortada && m.id === sala.imagenPortada
          );
          const imagen =
            portadaMural?.imagenUrlWebp ||
            portadaMural?.url_imagen ||
            murales[0]?.imagenUrlWebp ||
            murales[0]?.url_imagen ||
            "/assets/artworks/cuadro1.webp";
          return {
            id: sala.id,
            nombre: sala.nombre,
            descripcion:
              `Sala con ${sala._count?.murales ?? 0} murales` ||
              sala.descripcion ||
              "Sin descripción",
            imagen,
            color: getColorBySalaId(sala.id),
            cantidadMurales: sala._count?.murales ?? murales.length ?? 0,
            propietario: sala.creador?.name || sala.creador?.id || "Museo",
            murales,
          };
        });
        setSalas(salasFormateadas);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSalas(getSalasFallback());
      } finally {
        setLoading(false);
      }
    };
    cargarSalas();
  }, []);

  return { salas, loading, error };
}

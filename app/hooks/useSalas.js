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
        const salasFormateadas = (data.salas || []).map((sala) => ({
          id: sala.id,
          nombre: sala.nombre,
          descripcion: `Sala con ${sala._count?.murales ?? 0} murales`,
          imagen:
            sala.imagenPortada ||
            sala.murales?.[0]?.mural?.url_imagen ||
            "/assets/artworks/cuadro1.webp",
          color: getColorBySalaId(sala.id),
          cantidadMurales: sala._count?.murales ?? 0,
          propietario: sala.creador?.name || sala.creador?.id || "Museo",
          murales:
            (sala.murales || [])
              .map((salaMural) => salaMural.mural)
              .filter(Boolean) || [],
        }));
        setSalas(salasFormateadas);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSalas(getSalasFallback());
      } finally {
        setLoading(false);
      }
    };
    const getColorBySalaId = (id) =>
      ({ 1: "#e3f2fd", 2: "#f3e5f5", 3: "#e8f5e8", 4: "#fff3e0" })[id] ||
      "#f5f5f5";
    cargarSalas();
  }, []);

  return { salas, loading, error };
}

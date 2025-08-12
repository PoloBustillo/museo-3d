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
      layout: [],
      scene: {
        lightingPreset: null,
        ambientIntensity: 0.8,
        fog: null,
        audioZones: null,
        navigationMeshId: null,
        layoutVersion: 1,
      },
      layoutVersion: 1,
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
      layout: [],
      scene: {
        lightingPreset: null,
        ambientIntensity: 0.8,
        fog: null,
        audioZones: null,
        navigationMeshId: null,
        layoutVersion: 1,
      },
      layoutVersion: 1,
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
          // Murales planos (para compatibilidad existente)
          const murales = (sala.murales || [])
            .map((sm) => sm.mural)
            .filter(Boolean);

          // Portada basada en imagenPortada (ID) o fallback
          const portadaMural = murales.find(
            (m) => sala.imagenPortada && m.id === sala.imagenPortada
          );
          const imagen =
            portadaMural?.imagenUrlWebp ||
            portadaMural?.url_imagen ||
            murales[0]?.imagenUrlWebp ||
            murales[0]?.url_imagen ||
            "/assets/artworks/cuadro1.webp";

          // Layout enriquecido: usar sala.layout si viene del API (nuevo formato)
          const layoutApi = sala.layout || [];
          let layout;
          if (layoutApi.length > 0) {
            layout = layoutApi.map((item) => ({
              ...item,
              mural: murales.find((m) => m.id === item.muralId) || null,
            }));
          } else {
            // Si aún no hay layout (salas antiguas), construir uno básico a partir de la lista de murales
            layout = murales.map((m, idx) => ({
              muralId: m.id,
              pos: { x: idx * 2, y: 0, z: 0 },
              rot: { x: 0, y: 0, z: 0 },
              scale: 1,
              wallId: null,
              frameStyle: null,
              spotlightIntensity: 1,
              metadata: null,
              mural: m,
            }));
          }

          // Scene (con defaults para asegurar estructura estable)
          const scene = sala.scene || {};
          const sceneStruct = {
            lightingPreset: scene.lightingPreset || null,
            ambientIntensity: scene.ambientIntensity ?? 0.8,
            fog: scene.fog || null, // {color, near, far} o null
            audioZones: scene.audioZones || null,
            navigationMeshId: scene.navigationMeshId || null,
            layoutVersion: scene.layoutVersion ?? sala.layoutVersion ?? 1,
          };

          return {
            id: sala.id,
            nombre: sala.nombre,
            // Preferir descripción original; si no existe, fallback informativo
            descripcion:
              sala.descripcion ||
              `Sala con ${sala._count?.murales ?? murales.length ?? 0} murales`,
            imagen,
            color: getColorBySalaId(sala.id),
            cantidadMurales: sala._count?.murales ?? murales.length ?? 0,
            propietario: sala.creador?.name || sala.creador?.id || "Museo",
            murales, // arreglo plano de murales (legacy)
            layout, // nuevo: arreglo de transformaciones con mural embebido
            scene: sceneStruct, // nuevo: configuración de escena
            layoutVersion: sceneStruct.layoutVersion,
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

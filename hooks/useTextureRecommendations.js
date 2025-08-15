import { useState, useEffect } from "react";

/**
 * Hook para obtener recomendaciones de texturas para una sala
 * @param {number} salaId - ID de la sala
 * @param {string} type - Tipo de texturas: "wall", "floor", "all"
 * @returns {Object} Estado con recomendaciones, loading, error y funciones
 */
export function useTextureRecommendations(salaId, type = "all") {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar recomendaciones
   */
  const loadRecommendations = async (forceReload = false) => {
    if (!salaId) return;

    if (recommendations && !forceReload) return; // Ya cargado

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ salaId: salaId.toString() });
      if (type !== "all") {
        params.append("type", type);
      }

      const response = await fetch(`/api/texturas-recomendadas?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error("Error loading texture recommendations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplicar texturas recomendadas a la sala
   */
  const applyTextures = async (texturaPared, texturaPiso) => {
    if (!salaId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/texturas-recomendadas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salaId,
          texturaPared,
          texturaPiso,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const result = await response.json();

      // Actualizar recommendations con nuevos datos
      if (recommendations) {
        setRecommendations((prev) => ({
          ...prev,
          sala: {
            ...prev.sala,
            currentTextures: {
              pared: texturaPared,
              piso: texturaPiso,
            },
          },
        }));
      }

      return result;
    } catch (err) {
      console.error("Error applying textures:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener URL completa de textura
   */
  const getTextureUrl = (textureName, mapType = "albedo") => {
    if (!textureName) return null;

    // Si ya es una URL completa, devolverla
    if (textureName.startsWith("http") || textureName.startsWith("/")) {
      return textureName;
    }

    // Construir URL desde el catálogo local
    const baseUrl = `/assets/textures/${textureName}`;

    if (mapType === "albedo") {
      return `${baseUrl}/${textureName}_Color.jpg`;
    } else if (mapType === "normal") {
      return `${baseUrl}/${textureName}_Normal.jpg`;
    } else if (mapType === "roughness") {
      return `${baseUrl}/${textureName}_Roughness.jpg`;
    }

    return baseUrl;
  };

  /**
   * Obtener textura por puntuación más alta
   */
  const getBestTexture = (type) => {
    if (!recommendations?.recommendations) return null;

    if (
      type === "wall" &&
      recommendations.recommendations.paredes?.length > 0
    ) {
      return recommendations.recommendations.paredes[0];
    }

    if (type === "floor" && recommendations.recommendations.pisos?.length > 0) {
      return recommendations.recommendations.pisos[0];
    }

    return null;
  };

  /**
   * Aplicar mejores recomendaciones automáticamente
   */
  const applyBestRecommendations = async () => {
    const bestWall = getBestTexture("wall");
    const bestFloor = getBestTexture("floor");

    if (bestWall || bestFloor) {
      return await applyTextures(
        bestWall?.name || null,
        bestFloor?.name || null
      );
    }
  };

  // Cargar automáticamente cuando cambie salaId
  useEffect(() => {
    loadRecommendations();
  }, [salaId, type]);

  return {
    // Estado
    recommendations,
    loading,
    error,

    // Datos derivados
    wallRecommendations: recommendations?.recommendations?.paredes || [],
    floorRecommendations: recommendations?.recommendations?.pisos || [],
    currentTextures: recommendations?.sala?.currentTextures || {},
    salaInfo: recommendations?.sala || null,
    analysis: recommendations?.analysis || null,

    // Funciones
    loadRecommendations,
    applyTextures,
    applyBestRecommendations,
    getTextureUrl,
    getBestTexture,

    // Estado helpers
    hasRecommendations: !!recommendations?.recommendations,
    isEmpty:
      recommendations &&
      !recommendations.recommendations?.paredes?.length &&
      !recommendations.recommendations?.pisos?.length,
  };
}

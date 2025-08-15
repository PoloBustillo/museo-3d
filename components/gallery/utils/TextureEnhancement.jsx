/**
 * Utilidad para integrar recomendaciones de texturas en la galería
 */
import { useTextureRecommendations } from "../hooks/useTextureRecommendations";
import { useEffect, useState } from "react";

/**
 * Hook para auto-aplicar texturas recomendadas en la galería
 */
export function useGalleryTextureEnhancement(salaId, autoApply = false) {
  const {
    recommendations,
    loading,
    error,
    getBestTexture,
    applyBestRecommendations,
    currentTextures,
    getTextureUrl,
  } = useTextureRecommendations(salaId);

  const [hasAutoApplied, setHasAutoApplied] = useState(false);

  // Auto-aplicar mejores recomendaciones si está habilitado
  useEffect(() => {
    if (autoApply && recommendations && !hasAutoApplied && !loading) {
      const bestWall = getBestTexture("wall");
      const bestFloor = getBestTexture("floor");

      // Solo aplicar si hay mejores opciones que las actuales
      if (bestWall?.score > 80 || bestFloor?.score > 80) {
        applyBestRecommendations()
          .then(() => {
            setHasAutoApplied(true);
          })
          .catch(console.error);
      }
    }
  }, [recommendations, autoApply, hasAutoApplied, loading]);

  /**
   * Obtener URLs de texturas mejoradas para la galería
   */
  const getEnhancedTextures = () => {
    const bestWall = getBestTexture("wall");
    const bestFloor = getBestTexture("floor");

    return {
      wallTexture: currentTextures.pared || bestWall?.name,
      floorTexture: currentTextures.piso || bestFloor?.name,
      wallTextureUrl: getTextureUrl(currentTextures.pared || bestWall?.name),
      floorTextureUrl: getTextureUrl(currentTextures.piso || bestFloor?.name),
      wallScore: bestWall?.score || 0,
      floorScore: bestFloor?.score || 0,
      hasRecommendations: !!recommendations,
    };
  };

  return {
    // Estado
    loading,
    error,
    recommendations,

    // Texturas mejoradas
    enhancedTextures: getEnhancedTextures(),

    // Funciones
    applyBestRecommendations,
    getBestTexture,
    getTextureUrl,

    // Estado
    hasAutoApplied,
    canAutoApply: recommendations && !hasAutoApplied,
  };
}

/**
 * Componente para mostrar notificación de texturas mejoradas
 */
export function TextureEnhancementNotification({ salaId, onApply, onDismiss }) {
  const { enhancedTextures, loading, applyBestRecommendations } =
    useGalleryTextureEnhancement(salaId);
  const [isApplying, setIsApplying] = useState(false);

  if (loading || !enhancedTextures.hasRecommendations) {
    return null;
  }

  const hasHighScoreRecommendations =
    enhancedTextures.wallScore > 80 || enhancedTextures.floorScore > 80;

  if (!hasHighScoreRecommendations) {
    return null;
  }

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyBestRecommendations();
      onApply?.();
    } catch (error) {
      console.error("Error applying recommendations:", error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            Texturas Mejoradas Disponibles
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Hemos encontrado texturas que mejorarían la calidad visual de esta
            sala.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isApplying ? "Aplicando..." : "Aplicar"}
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
            >
              Omitir
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

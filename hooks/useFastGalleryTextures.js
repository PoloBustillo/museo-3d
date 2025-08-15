/**
 * HOOK ULTRALIGERO para reemplazar useGalleryTextures problemático
 * SIN CARGA DE TEXTURAS - Solo colores
 */

export function useFastGalleryTextures(textureUrl, fallbackType = "WALL", repeat = [2, 2]) {
  // BYPASS COMPLETO: No cargar texturas, solo retornar configuración por colores
  const FAST_CONFIGS = {
    WALL: {
      color: "#f0f0f0",
      roughness: 0.9,
      metalness: 0.0
    },
    FLOOR: {
      color: "#e0e0e0",
      roughness: 0.8,
      metalness: 0.1
    },
    CEILING: {
      color: "#f8f8f8",
      roughness: 0.3,
      metalness: 0.0
    }
  };

  const config = FAST_CONFIGS[fallbackType] || FAST_CONFIGS.WALL;

  return {
    maps: {}, // Sin mapas de texturas
    fallbackTexture: null, // Sin texturas de fallback
    hasTexture: false, // Sin texturas
    ...config // Solo configuración de colores
  };
}

export default useFastGalleryTextures;

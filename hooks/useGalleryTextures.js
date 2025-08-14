import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { GALLERY_CONFIG } from "../components/gallery/core/config.js";

// Mapeo centralizado de texturas
const TEXTURE_MAP = {
  Tiles002: "/assets/textures/Tiles002_1K-JPG/Tiles002_1K-JPG",
  Rock050: "/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG",
  WoodFloor003: "/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG",
  DiamondPlate:
    "/assets/textures/DiamondPlate001_1K-JPG/DiamondPlate001_1K-JPG",
  DiamondPlate002:
    "/assets/textures/DiamondPlate002_1K-JPG/DiamondPlate002_1K-JPG",
  MetalPlates: "/assets/textures/MetalPlates006_1K-JPG/MetalPlates006_1K-JPG",
  MetalPlates003:
    "/assets/textures/MetalPlates003_1K-JPG/MetalPlates003_1K-JPG",
  MetalPlates004:
    "/assets/textures/MetalPlates004_1K-JPG/MetalPlates004_1K-JPG",
  MetalPlates005:
    "/assets/textures/MetalPlates005_1K-JPG/MetalPlates005_1K-JPG",
};

// Configuración estándar para texturas
const configureTexture = (texture, repeat = [2, 2]) => {
  if (!texture) return;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 16;
};

// Hook para cargar texturas PBR de manera optimizada
export function useGalleryTextures(textureUrl, fallbackType = "WALL", repeat = [2, 2]) {
  // Resolver URL de textura
  const fallback = GALLERY_CONFIG.TEXTURES[fallbackType];
  const extraFallbacks = GALLERY_CONFIG.TEXTURES.FALLBACKS || [];

  const resolvedPath =
    textureUrl && !textureUrl.includes("/")
      ? TEXTURE_MAP[textureUrl]
      : textureUrl;

  const finalPath = resolvedPath || fallback || extraFallbacks[0];

  // Intentar cargar mapas PBR
  const maps = {};
  const mapTypes = [
    { key: "color", file: "Color" },
    { key: "normal", file: "NormalGL" }, // Usar NormalGL en lugar de Normal
    { key: "roughness", file: "Roughness" },
    { key: "ao", file: "AmbientOcclusion" },
  ];

  mapTypes.forEach(({ key, file }) => {
    try {
      if (finalPath) {
        maps[key] = useTexture(`${finalPath}_${file}.jpg`);
      }
    } catch (e) {
      // Mapa no disponible - silencioso
      console.warn(`Texture not found: ${finalPath}_${file}.jpg`);
    }
  });

  // Cargar textura de fallback
  let fallbackTexture;
  try {
    if (fallback) {
      fallbackTexture = useTexture(`${fallback}_Color.jpg`);
    }
  } catch (e) {
    // Fallback no disponible
    console.warn(`Fallback texture not found: ${fallback}_Color.jpg`);
  }

  // Configurar todas las texturas
  Object.values(maps).forEach((texture) => configureTexture(texture, repeat));
  configureTexture(fallbackTexture, repeat);

  return {
    maps,
    fallbackTexture,
    hasTexture: Boolean(maps.color),
  };
}

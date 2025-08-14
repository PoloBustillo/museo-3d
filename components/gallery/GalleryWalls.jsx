import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./config.js";

const { HALL_WIDTH, CEILING_HEIGHT } = GALLERY_CONFIG;

// Mapeo de texturas de pared (sincronizado con GalleryEnvironment.jsx)
const WALL_TEXTURE_MAP = {
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

// Función para construir mapas PBR existentes (copiada de GalleryEnvironment.jsx)
function buildExistingPBRSet(basePath) {
  const maps = {};
  const mapTypes = [
    "Color",
    "Normal",
    "Roughness",
    "Metalness",
    "AmbientOcclusion",
  ];

  mapTypes.forEach((type) => {
    try {
      const mapPath = `${basePath}_${type}.jpg`;
      maps[
        type.toLowerCase() === "ambientocclusion" ? "ao" : type.toLowerCase()
      ] = mapPath;
    } catch (error) {
      // Mapa no disponible - se omite silenciosamente
    }
  });

  return maps;
}

/**
 * Componente para las paredes de límite de la galería
 * @param {Object} props - Propiedades del componente
 * @param {number} props.firstX - Posición X inicial
 * @param {number} props.lastX - Posición X final
 * @param {number} props.wallMarginInitial - Margen inicial de la pared
 * @param {number} props.wallMarginFinal - Margen final de la pared
 * @param {string} props.wallTextureUrl - URL de la textura de pared
 * @param {string} props.wallColor - Color de la pared
 */
export function GalleryWalls({
  firstX,
  lastX,
  wallMarginInitial,
  wallMarginFinal,
  wallTextureUrl,
  wallColor = "#ffffff",
}) {
  const fallbackWall = GALLERY_CONFIG.TEXTURES.WALL;
  const extraFallbacks = GALLERY_CONFIG.TEXTURES.FALLBACKS || [];

  const resolvedWall =
    wallTextureUrl && !wallTextureUrl.includes("/")
      ? WALL_TEXTURE_MAP[wallTextureUrl]
      : wallTextureUrl;

  let wallPath = resolvedWall || fallbackWall;
  if (!wallPath && extraFallbacks[0]) wallPath = extraFallbacks[0];

  // Construir mapas PBR para la pared de entrada
  const pbrMaps = buildExistingPBRSet(wallPath);

  // Cargar texturas PBR de manera consistente
  const wallMaps = {};
  try {
    if (pbrMaps.color) wallMaps.color = useTexture(pbrMaps.color);
  } catch (e) {
    /* Textura no encontrada */
  }

  try {
    if (pbrMaps.normal) wallMaps.normal = useTexture(pbrMaps.normal);
  } catch (e) {
    /* Textura no encontrada */
  }

  try {
    if (pbrMaps.roughness) wallMaps.roughness = useTexture(pbrMaps.roughness);
  } catch (e) {
    /* Textura no encontrada */
  }

  try {
    if (pbrMaps.metalness) wallMaps.metalness = useTexture(pbrMaps.metalness);
  } catch (e) {
    /* Textura no encontrada */
  }

  try {
    if (pbrMaps.ao) wallMaps.ao = useTexture(pbrMaps.ao);
  } catch (e) {
    /* Textura no encontrada */
  }

  // Cargar textura de pared (mantenida para compatibilidad)
  const wallTexture = useTexture(GALLERY_CONFIG.TEXTURES.WALL);

  // Configurar texturas
  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    wallTexture.anisotropy = 16;
  }

  // Configurar mapas PBR para la pared de entrada
  Object.values(wallMaps).forEach((texture) => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      texture.anisotropy = 16;
    }
  });

  const wallHeight = CEILING_HEIGHT;
  const wallWidth = HALL_WIDTH + 2; // Un poco más ancha para evitar gaps

  return (
    <>
      {/* Pared inicial (entrada) - Con textura seleccionada */}
      <mesh position={[firstX - wallMarginInitial * 0.8, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, wallWidth]} />
        {wallMaps.color ? (
          <meshStandardMaterial
            map={wallMaps.color}
            normalMap={wallMaps.normal || null}
            roughnessMap={wallMaps.roughness || null}
            metalnessMap={wallMaps.metalness || null}
            aoMap={wallMaps.ao || null}
            color={wallColor}
            metalness={wallMaps.metalness ? 0.3 : 0.1}
            roughness={wallMaps.roughness ? 0.85 : 0.9}
            side={THREE.DoubleSide}
            transparent={false}
            opacity={1.0}
          />
        ) : (
          <meshStandardMaterial
            map={wallTexture}
            color={wallColor}
            side={THREE.DoubleSide}
            transparent={false}
            opacity={1.0}
          />
        )}
      </mesh>

      {/* Pared final (con modal) - Lisa y semi-transparente */}
      <mesh position={[lastX + wallMarginFinal, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, wallWidth]} />
        <meshStandardMaterial
          color="#f0f0f0"
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

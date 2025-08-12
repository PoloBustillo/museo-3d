import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GALLERY_CONFIG } from './config.js';

const { HALL_WIDTH, CEILING_HEIGHT, FLOOR_EXTRA } = GALLERY_CONFIG;

// Mapeo de alias de texturas a rutas reales
const WALL_TEXTURE_MAP = {
  brick: '/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG_Color.jpg',
  concrete: '/assets/textures/DiamondPlate006C_1K-JPG/DiamondPlate006C_1K-JPG_Color.jpg',
  stone: '/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG_Color.jpg',
};
const FLOOR_TEXTURE_MAP = {
  wood: '/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG_Color.jpg',
  marble: '/assets/textures/MarbleTiles099_1K-JPG/MarbleTiles099_1K-JPG_Color.jpg',
  parquet: '/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG_Color.jpg',
};

/**
 * Entorno de galería con soporte para texturas personalizadas
 */
export function GalleryEnvironment({ dynamicLength, dynamicCenterX, wallTextureUrl, floorTextureUrl, wallColor = '#ffffff', floorColor = '#e0e0e0' }) {
  const fallbackWall = GALLERY_CONFIG.TEXTURES.WALL;
  const fallbackFloor = GALLERY_CONFIG.TEXTURES.FLOOR;
  const extraFallbacks = GALLERY_CONFIG.TEXTURES.FALLBACKS || [];
  // Resolver alias si sólo viene nombre lógico
  const resolvedWall = wallTextureUrl && !wallTextureUrl.includes('/') ? WALL_TEXTURE_MAP[wallTextureUrl] : wallTextureUrl;
  const resolvedFloor = floorTextureUrl && !floorTextureUrl.includes('/') ? FLOOR_TEXTURE_MAP[floorTextureUrl] : floorTextureUrl;
  let wallPath = resolvedWall || fallbackWall;
  let floorPath = resolvedFloor || fallbackFloor;
  const textures = useTexture.useLoader ? null : null; // placeholder
  let loadedTextures;
  try {
    loadedTextures = useTexture(useMemo(() => [floorPath, wallPath], [floorPath, wallPath]));
  } catch (e) {
    // Intentar fallback alterno si existe
    if (extraFallbacks.length) {
      wallPath = extraFallbacks[0];
      floorPath = extraFallbacks[0];
      loadedTextures = useTexture(useMemo(() => [floorPath, wallPath], [floorPath, wallPath]));
    } else {
      loadedTextures = [];
    }
  }
  const [floorTexture, wallTexture] = loadedTextures || [];

  // Intentar cargar normal y roughness si comparten prefijo
  let normalMap, roughnessMap;
  if (wallPath && wallPath.includes('_Color')) {
    const base = wallPath.replace('_Color', '');
    try { normalMap = useTexture(base + '_NormalGL.jpg'); } catch {}
    try { roughnessMap = useTexture(base + '_Roughness.jpg'); } catch {}
  }
  if (floorPath && floorPath.includes('_Color')) {
    const baseF = floorPath.replace('_Color', '');
    try { if (!normalMap) normalMap = useTexture(baseF + '_NormalGL.jpg'); } catch {}
    try { if (!roughnessMap) roughnessMap = useTexture(baseF + '_Roughness.jpg'); } catch {}
  }

  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(Math.ceil(dynamicLength / 4), 2);
    wallTexture.anisotropy = 16;
  }
  if (floorTexture) {
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(Math.ceil(dynamicLength / 4), Math.ceil(HALL_WIDTH / 2));
    floorTexture.anisotropy = 16;
  }

  return (
    <>
      {/* Piso principal (texturizado) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[dynamicCenterX, 0, 0]}>
        <planeGeometry args={[dynamicLength, HALL_WIDTH]} />
        {floorTexture ? (
          <meshStandardMaterial map={floorTexture} />
        ) : (
          <meshStandardMaterial color={floorColor} />
        )}
      </mesh>

      {/* Piso extendido de borde */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[dynamicCenterX, -0.01, 0]}>
        <planeGeometry args={[dynamicLength, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Techo */}
      <mesh position={[dynamicCenterX, CEILING_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dynamicLength, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Paredes laterales */}
      <mesh position={[dynamicCenterX, 2.5, HALL_WIDTH/2]}>
        <boxGeometry args={[dynamicLength, 5, 0.1]} />
        {wallTexture ? (
          <meshStandardMaterial map={wallTexture} normalMap={normalMap} roughnessMap={roughnessMap} color={wallColor} />
        ) : (
          <meshStandardMaterial color={wallColor} />
        )}
      </mesh>
      <mesh position={[dynamicCenterX, 2.5, -HALL_WIDTH/2]}>
        <boxGeometry args={[dynamicLength, 5, 0.1]} />
        {wallTexture ? (
          <meshStandardMaterial map={wallTexture} normalMap={normalMap} roughnessMap={roughnessMap} color={wallColor} />
        ) : (
          <meshStandardMaterial color={wallColor} />
        )}
      </mesh>

      {/* Molduras */}
      <mesh position={[dynamicCenterX, CEILING_HEIGHT-0.02, HALL_WIDTH/2 - 0.13]}>
        <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[dynamicCenterX, CEILING_HEIGHT-0.02, -HALL_WIDTH/2 + 0.13]}>
        <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
    </>
  );
}

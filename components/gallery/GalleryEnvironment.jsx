import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
// BYPASS: Import Fast version for performance
import { useFastGalleryTextures as useGalleryTextures } from "../../hooks/useFastGalleryTextures.js";
import { FloorMesh, ExtendedFloorMesh } from "./structure/FloorMesh.jsx";
import { SideWalls } from "./structure/WallMesh.jsx";
import { GalleryWalls } from "./GalleryWalls.jsx";
import { CeilingLamps } from "./CeilingLamps.jsx";
import { WallLamps } from "./furniture/WallLamps.jsx";
import { CeilingMesh } from "./structure/CeilingMesh.jsx";
import { CinematicLighting } from "./lighting/CinematicLighting.jsx";

const { HALL_WIDTH, CEILING_HEIGHT, FLOOR_EXTRA } = GALLERY_CONFIG;

/**
 * Entorno de galería optimizado con texturas PBR y mejoras visuales avanzadas
 */
export function GalleryEnvironment({
  dynamicLength,
  dynamicCenterX,
  wallTextureUrl,
  floorTextureUrl,
  wallColor = "#ffffff",
  floorColor = "#e0e0e0",
  // Nuevas propiedades para mejoras visuales
  lightingPreset = "museum", // "museum", "dramatic", "golden"
  premiumMode = true, // Activar materiales y muebles premium
  showFurniture = false, // Mesa quitada
  environmentQuality = "high", // "basic", "high", "ultra"
}) {
  // Usar hook optimizado para texturas de pared y piso
  const wallTextures = useGalleryTextures(wallTextureUrl, "WALL", [
    Math.ceil(dynamicLength / 4),
    2,
  ]);
  const floorTextures = useGalleryTextures(floorTextureUrl, "FLOOR", [
    Math.ceil(dynamicLength / 4),
    Math.ceil(HALL_WIDTH / 2),
  ]);

  return (
    <>
      {/* Iluminación */}
      <CinematicLighting
        preset={lightingPreset}
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        hallWidth={HALL_WIDTH}
        ceilingHeight={CEILING_HEIGHT}
        quality={environmentQuality}
      />

      {/* Piso principal */}
      <FloorMesh
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        floorMaps={floorTextures.maps}
        floorColor={floorColor}
        hallWidth={HALL_WIDTH}
        premiumMode={premiumMode}
        quality={environmentQuality}
        textureOptimization="minimal"
      />

      {/* Techo */}
      <CeilingMesh
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
        floorExtra={FLOOR_EXTRA}
        premiumMode={premiumMode}
        quality={environmentQuality}
        textureOptimization="none"
      />

      {/* Lámparas de techo - SINCRONIZADAS con GalleryLighting */}
      <CeilingLamps
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
        lampCount={Math.max(4, Math.floor(dynamicLength / 4))}
      />

      {/* Lámparas de pared para obras - iluminación tenue */}
      <WallLamps
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        wallHeight={CEILING_HEIGHT}
      />

      {/* Paredes laterales */}
      <SideWalls
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        wallMaps={wallTextures.maps}
        wallColor={wallColor}
        hallWidth={HALL_WIDTH}
        premiumMode={premiumMode}
        quality={environmentQuality}
        textureOptimization="minimal"
      />

      {/* Paredes de límite */}
      <GalleryWalls
        firstX={dynamicCenterX - dynamicLength / 2}
        lastX={dynamicCenterX + dynamicLength / 2}
        wallMarginInitial={0.1}
        wallMarginFinal={0.1}
        wallTextureUrl={wallTextureUrl}
        wallColor={wallColor}
      />
    </>
  );
}

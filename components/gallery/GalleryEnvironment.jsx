import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";
import { FloorMesh, ExtendedFloorMesh } from "./structure/FloorMesh.jsx";
import { SideWalls } from "./structure/WallMesh.jsx";
import { GalleryWalls } from "./GalleryWalls.jsx";
import { CeilingLamps } from "./CeilingLamps.jsx";
import { CeilingMesh } from "./structure/CeilingMesh.jsx";
import { GalleryMoldings } from "./structure/MoldingMesh.jsx";
import { CinematicLighting } from "./lighting/CinematicLighting.jsx";
import { IndustrialCoffeeTable } from "./furniture/IndustrialCoffeeTable.jsx";

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
      {/* Sistema de iluminación cinematográfica */}
      <CinematicLighting
        preset={lightingPreset}
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        hallWidth={HALL_WIDTH}
        ceilingHeight={CEILING_HEIGHT}
        quality={environmentQuality}
      />

      {/* Piso principal con texturas */}
      <FloorMesh
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        floorMaps={floorTextures.maps}
        floorColor={floorColor}
        hallWidth={HALL_WIDTH}
        premiumMode={premiumMode}
        quality={environmentQuality}
        textureOptimization="minimal" // OPTIMIZACIÓN: Reducir texturas
      />

      {/* Piso extendido sin texturas */}
      <ExtendedFloorMesh
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        floorColor={floorColor}
        hallWidth={HALL_WIDTH}
        floorExtra={FLOOR_EXTRA}
        premiumMode={premiumMode}
        textureOptimization="none" // Sin texturas para mejor rendimiento
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
        textureOptimization="none" // Sin texturas en techo
      />
      {/* Lámparas de techo alineadas con los focos */}
      <CeilingLamps
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
        lampCount={4}
      />


      {/* Paredes laterales (2) y paredes de límite (2) con alturas uniformes */}
      <SideWalls
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        wallMaps={wallTextures.maps}
        wallColor={wallColor}
        hallWidth={HALL_WIDTH}
        premiumMode={premiumMode}
        quality={environmentQuality}
        textureOptimization="minimal" // Solo textura principal
      />
      {/* Paredes de límite: una al inicio (entrada), otra al final (salida) */}
      <GalleryWalls
        firstX={dynamicCenterX - dynamicLength / 2}
        lastX={dynamicCenterX + dynamicLength / 2}
        wallMarginInitial={0.1}
        wallMarginFinal={0.1}
        wallTextureUrl={wallTextureUrl}
        wallColor={wallColor}
      />

      {/* Molduras decorativas */}
      <GalleryMoldings
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
        premiumMode={premiumMode}
      />

      {/* Mobiliario simplificado: solo mesa de café industrial del modelo GLB */}
      {showFurniture && (
        <>
          {/* Mesa de café industrial en el centro de la sala */}
          <IndustrialCoffeeTable
            position={[dynamicCenterX, 0, 0]}
            scale={1.2}
          />
        </>
      )}
    </>
  );
}

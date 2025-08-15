import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";
import { FloorMesh, ExtendedFloorMesh } from "./structure/FloorMesh.jsx";
import { SideWalls } from "./structure/WallMesh.jsx";
import { CeilingMesh } from "./structure/CeilingMesh.jsx";
import { GalleryMoldings } from "./structure/MoldingMesh.jsx";
import { CinematicLighting } from "./lighting/CinematicLighting.jsx";
import {
  PremiumMuseumBench,
  ElegantPedestal,
  PremiumShowcase,
  SecurityBarrier,
} from "./furniture/PremiumFurniture.jsx";
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
  showFurniture = true, // Mostrar muebles de museo
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

      {/* Paredes laterales con texturas limitadas */}
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

      {/* Molduras decorativas */}
      <GalleryMoldings
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
        premiumMode={premiumMode}
      />

      {/* Muebles premium de museo */}
      {showFurniture && premiumMode && (
        <>
          {/* Bancos distribuidos por la sala */}
          <PremiumMuseumBench
            position={[dynamicCenterX - dynamicLength / 4, 0, 0]}
          />
          <PremiumMuseumBench
            position={[dynamicCenterX + dynamicLength / 4, 0, 0]}
          />

          {/* Pedestales en los extremos */}
          <ElegantPedestal
            position={[
              dynamicCenterX - dynamicLength / 2 + 2,
              0,
              HALL_WIDTH / 4,
            ]}
          />
          <ElegantPedestal
            position={[
              dynamicCenterX + dynamicLength / 2 - 2,
              0,
              HALL_WIDTH / 4,
            ]}
          />

          {/* Vitrinas laterales */}
          <PremiumShowcase
            position={[dynamicCenterX - dynamicLength / 3, 0, -HALL_WIDTH / 3]}
          />
          <PremiumShowcase
            position={[dynamicCenterX + dynamicLength / 3, 0, -HALL_WIDTH / 3]}
          />

          {/* Mesa de café industrial en el centro de la sala */}
          <IndustrialCoffeeTable
            position={[dynamicCenterX, 0, 0]}
            scale={1.2}
          />

          {/* Barreras de seguridad */}
          <SecurityBarrier
            position={[dynamicCenterX, 0, HALL_WIDTH / 2 - 1]}
            length={dynamicLength * 0.6}
          />
        </>
      )}
    </>
  );
}

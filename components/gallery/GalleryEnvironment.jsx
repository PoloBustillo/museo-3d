import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";
import { FloorMesh, ExtendedFloorMesh } from "./structure/FloorMesh.jsx";
import { SideWalls } from "./structure/WallMesh.jsx";
import { CeilingMesh } from "./structure/CeilingMesh.jsx";
import { GalleryMoldings } from "./structure/MoldingMesh.jsx";

const { HALL_WIDTH, CEILING_HEIGHT, FLOOR_EXTRA } = GALLERY_CONFIG;

/**
 * Entorno de galería optimizado con texturas PBR
 */
export function GalleryEnvironment({
  dynamicLength,
  dynamicCenterX,
  wallTextureUrl,
  floorTextureUrl,
  wallColor = "#ffffff",
  floorColor = "#e0e0e0",
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
      {/* Piso principal con texturas */}
      <FloorMesh 
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        floorMaps={floorTextures.maps}
        floorColor={floorColor}
        hallWidth={HALL_WIDTH}
      />

      {/* Piso extendido sin texturas */}
      <ExtendedFloorMesh 
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        floorColor={floorColor}
        hallWidth={HALL_WIDTH}
        floorExtra={FLOOR_EXTRA}
      />

      {/* Techo */}
      <CeilingMesh 
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
        floorExtra={FLOOR_EXTRA}
      />

      {/* Paredes laterales con texturas */}
      <SideWalls 
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        wallMaps={wallTextures.maps}
        wallColor={wallColor}
        hallWidth={HALL_WIDTH}
      />

      {/* Molduras decorativas */}
      <GalleryMoldings 
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        ceilingHeight={CEILING_HEIGHT}
        hallWidth={HALL_WIDTH}
      />
    </>
  );
}

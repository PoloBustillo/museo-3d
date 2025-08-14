import React, { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./config.js";
import { FloorMesh, ExtendedFloorMesh } from "./FloorMesh.jsx";
import { SideWalls } from "./WallMesh.jsx";
import { CeilingMesh } from "./CeilingMesh.jsx";
import { GalleryMoldings } from "./MoldingMesh.jsx";

const { HALL_WIDTH, CEILING_HEIGHT, FLOOR_EXTRA } = GALLERY_CONFIG;

// Mapeo de alias de texturas a rutas reales
const WALL_TEXTURE_MAP = {
  brick: "/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG_Color.jpg",
  concrete:
    "/assets/textures/DiamondPlate006C_1K-JPG/DiamondPlate006C_1K-JPG_Color.jpg",
  stone: "/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG_Color.jpg",
};
const FLOOR_TEXTURE_MAP = {
  wood: "/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG_Color.jpg",
  marble: "/assets/textures/Tiles002_1K-JPG/Tiles002_1K-JPG_Color.jpg",
  parquet: "/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG_Color.jpg",
};

/**
 * Entorno de galería con soporte para texturas personalizadas
 */
export function GalleryEnvironment({
  dynamicLength,
  dynamicCenterX,
  wallTextureUrl,
  floorTextureUrl,
  wallColor = "#ffffff",
  floorColor = "#e0e0e0",
}) {
  const fallbackWall = GALLERY_CONFIG.TEXTURES.WALL;
  const fallbackFloor = GALLERY_CONFIG.TEXTURES.FLOOR;
  const extraFallbacks = GALLERY_CONFIG.TEXTURES.FALLBACKS || [];
  // Resolver alias si sólo viene nombre lógico
  const resolvedWall =
    wallTextureUrl && !wallTextureUrl.includes("/")
      ? WALL_TEXTURE_MAP[wallTextureUrl]
      : wallTextureUrl;
  const resolvedFloor =
    floorTextureUrl && !floorTextureUrl.includes("/")
      ? FLOOR_TEXTURE_MAP[floorTextureUrl]
      : floorTextureUrl;
  let wallPath = resolvedWall || fallbackWall;
  let floorPath = resolvedFloor || fallbackFloor;
  if (!wallPath && extraFallbacks[0]) wallPath = extraFallbacks[0];
  if (!floorPath && extraFallbacks[0]) floorPath = extraFallbacks[0];

  const buildExistingPBRSet = (colorPath) => {
    if (!colorPath) return [];
    const dir = colorPath.substring(0, colorPath.lastIndexOf("/") + 1);
    const file = colorPath.substring(colorPath.lastIndexOf("/") + 1); // e.g. WoodFloor003_1K-JPG_Color.jpg
    const base = file.replace("_Color.jpg", "");

    // Secuencia básica: Color, NormalGL, Roughness
    const paths = [
      dir + base + "_Color.jpg",
      dir + base + "_NormalGL.jpg",
      dir + base + "_Roughness.jpg",
    ];

    // Metalness solo para materiales metálicos
    if (
      base.startsWith("DiamondPlate006C") ||
      base.startsWith("DiamondPlate008C") ||
      base.startsWith("MetalPlates006") ||
      base.startsWith("MetalPlates014")
    ) {
      paths.push(dir + base + "_Metalness.jpg");
    }

    // AmbientOcclusion solo para materiales que lo tienen
    // Tiles002 NO tiene AO, pero WoodFloor003, Rock050, DiamondPlate006C, etc. sí
    if (!base.startsWith("Tiles002") && !base.startsWith("MetalPlates006")) {
      paths.push(dir + base + "_AmbientOcclusion.jpg");
    }

    return paths;
  };
  const wallSet = buildExistingPBRSet(wallPath);
  const floorSet = buildExistingPBRSet(floorPath);
  const allTexturesPaths = useMemo(
    () => [...floorSet, ...wallSet],
    [floorSet, wallSet]
  );
  const allTextures = useTexture(allTexturesPaths);

  // Mapear dinámicamente según longitudes
  const getMaps = (set, offset) => {
    if (!set.length) return {};

    const maps = {
      color: allTextures[offset], // 0: siempre presente
      normal: allTextures[offset + 1], // 1: siempre presente
      roughness: allTextures[offset + 2], // 2: siempre presente
    };

    let currentIndex = offset + 3;

    // Detectar si tiene metalness (conjuntos de 5 o 6 elementos con metalness)
    // Si el conjunto tiene más de 4 elementos, puede tener metalness
    if (set.length >= 5) {
      // Verificar si es un material metálico por el path
      const firstPath = set[0] || "";
      if (
        firstPath.includes("DiamondPlate") ||
        firstPath.includes("MetalPlates")
      ) {
        maps.metalness = allTextures[currentIndex];
        currentIndex++;
      }
    }

    // AO es el último elemento si existe (solo si el conjunto lo incluye)
    if (currentIndex < offset + set.length) {
      maps.ao = allTextures[currentIndex];
    }

    return maps;
  };
  const floorMaps = floorSet.length ? getMaps(floorSet, 0) : {};
  const wallMaps = wallSet.length ? getMaps(wallSet, floorSet.length) : {};

  if (wallMaps.color) {
    wallMaps.color.wrapS = wallMaps.color.wrapT = THREE.RepeatWrapping;
    wallMaps.color.repeat.set(Math.ceil(dynamicLength / 4), 2);
    wallMaps.color.anisotropy = 16;
  }

  // Configurar textura Normal de pared si existe
  if (wallMaps.normal) {
    wallMaps.normal.wrapS = wallMaps.normal.wrapT = THREE.RepeatWrapping;
    wallMaps.normal.repeat.set(Math.ceil(dynamicLength / 4), 2);
    wallMaps.normal.anisotropy = 16;
  }
  if (floorMaps.color) {
    floorMaps.color.wrapS = floorMaps.color.wrapT = THREE.RepeatWrapping;
    floorMaps.color.repeat.set(
      Math.ceil(dynamicLength / 4),
      Math.ceil(HALL_WIDTH / 2)
    );
    floorMaps.color.anisotropy = 16;
  }

  // Configurar textura Normal del piso si existe
  if (floorMaps.normal) {
    floorMaps.normal.wrapS = floorMaps.normal.wrapT = THREE.RepeatWrapping;
    floorMaps.normal.repeat.set(
      Math.ceil(dynamicLength / 4),
      Math.ceil(HALL_WIDTH / 2)
    );
    floorMaps.normal.anisotropy = 16;
  }

  return (
    <>
      {/* Piso principal con texturas */}
      <FloorMesh
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        floorMaps={floorMaps}
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
        wallMaps={wallMaps}
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

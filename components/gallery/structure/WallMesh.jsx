import React from "react";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import {
  LuxuryFabricMaterial,
  PremiumWoodMaterial,
} from "../core/AdvancedMaterials.jsx";

/**
 * Componente especializado para renderizar una pared lateral
 */
export function WallMesh({
  position,
  dynamicLength,
  wallMaps,
  wallColor = "#ffffff",
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto", // Nueva prop para optimización
}) {
  // Material premium para paredes de lujo - sin texturas para optimización
  const wallMaterial =
    premiumMode && quality === "ultra" ? (
      <LuxuryFabricMaterial
        type="silk"
        color={wallColor}
        // Sin maps para optimización GPU
      />
    ) : (
      <PBRMaterial
        maps={wallMaps}
        color={wallColor}
        metalness={premiumMode ? 0.1 : 0.3}
        roughness={premiumMode ? 0.7 : 0.85}
        physical={premiumMode}
        clearcoat={premiumMode ? 0.1 : 0}
        clearcoatRoughness={premiumMode ? 0.3 : 0}
        sheen={premiumMode ? 0.2 : 0}
        sheenRoughness={premiumMode ? 0.8 : 0}
        sheenColor={premiumMode ? wallColor : undefined}
        reflectivity={premiumMode ? 0.6 : 0.5}
        textureOptimization={textureOptimization} // Pasar optimización
      />
    );

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[dynamicLength, 5, 0.1]} />
      {wallMaterial}
    </mesh>
  );
}

/**
 * Componente para renderizar ambas paredes laterales
 */
export function SideWalls({
  dynamicLength,
  dynamicCenterX,
  wallMaps,
  wallColor = "#ffffff",
  hallWidth,
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto", // Nueva prop para optimización
}) {
  return (
    <>
      {/* Pared derecha */}
      <WallMesh
        position={[dynamicCenterX, 2.5, hallWidth / 2]}
        dynamicLength={dynamicLength}
        wallMaps={wallMaps}
        wallColor={wallColor}
        premiumMode={premiumMode}
        quality={quality}
        textureOptimization={textureOptimization}
      />

      {/* Pared izquierda */}
      <WallMesh
        position={[dynamicCenterX, 2.5, -hallWidth / 2]}
        dynamicLength={dynamicLength}
        wallMaps={wallMaps}
        wallColor={wallColor}
        premiumMode={premiumMode}
        quality={quality}
        textureOptimization={textureOptimization}
      />
    </>
  );
}

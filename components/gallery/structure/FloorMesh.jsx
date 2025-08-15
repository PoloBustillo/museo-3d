import React from "react";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import { MarbleMaterial } from "../core/AdvancedMaterials.jsx";

/**
 * Componente especializado para renderizar el piso de la galería
 */
export function FloorMesh({
  dynamicLength,
  dynamicCenterX,
  floorMaps,
  floorColor = "#e0e0e0",
  hallWidth,
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto", // Nueva prop para optimización
}) {
  // Material premium para pisos de lujo
  const floorMaterial =
    premiumMode && quality === "ultra" ? (
      <MarbleMaterial
        type="carrara"
        color={floorColor}
        // Sin maps para optimización
      />
    ) : (
      <PBRMaterial
        maps={floorMaps}
        color={floorColor}
        metalness={premiumMode ? 0.1 : 0.2}
        roughness={premiumMode ? 0.6 : 0.8}
        physical={premiumMode}
        clearcoat={premiumMode ? 0.3 : 0}
        clearcoatRoughness={premiumMode ? 0.1 : 0}
        reflectivity={premiumMode ? 0.8 : 0.5}
        textureOptimization={textureOptimization} // Pasar optimización
      />
    );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[dynamicCenterX, 0, 0]}
    >
      <planeGeometry args={[dynamicLength, hallWidth]} />
      {floorMaterial}
    </mesh>
  );
}

/**
 * Componente para el piso extendido (sin texturas)
 */
export function ExtendedFloorMesh({
  dynamicLength,
  dynamicCenterX,
  floorColor = "#e0e0e0",
  hallWidth,
  floorExtra,
  premiumMode = false,
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[dynamicCenterX, -0.01, 0]}
    >
      <planeGeometry args={[dynamicLength, hallWidth + floorExtra]} />
      <PBRMaterial
        color={floorColor}
        metalness={premiumMode ? 0.05 : 0.1}
        roughness={premiumMode ? 0.7 : 0.9}
        physical={premiumMode}
        clearcoat={premiumMode ? 0.2 : 0}
      />
    </mesh>
  );
}

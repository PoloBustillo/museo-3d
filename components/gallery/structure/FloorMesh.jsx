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
  floorColor = "#f5f5f5", // Color más claro para mejor visibilidad con luz tenue
  hallWidth,
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto",
}) {
  // Material optimizado para iluminación tenue
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
        metalness={premiumMode ? 0.05 : 0.1} // Menos metálico para mejor reflectancia
        roughness={premiumMode ? 0.4 : 0.6} // Menos rugoso para mejor luz
        physical={premiumMode}
        clearcoat={premiumMode ? 0.2 : 0}
        clearcoatRoughness={premiumMode ? 0.05 : 0}
        reflectivity={premiumMode ? 0.9 : 0.7} // Más reflectivo
        envMapIntensity={1.2} // Mejor reflejo del ambiente
        textureOptimization={textureOptimization}
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

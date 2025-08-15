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
  // Material optimizado para estabilidad y rendimiento
  const floorMaterial = floorMaps?.color ? (
    <PBRMaterial
      maps={floorMaps}
      color={floorColor}
      metalness={0.02} // Muy poco metálico para estabilidad
      roughness={0.8} // Más rugoso para menos reflejos dinámicos
      physical={false} // Desactivar física avanzada para estabilidad
      clearcoat={0}
      clearcoatRoughness={0}
      reflectivity={0.1} // Muy baja reflectividad
      envMapIntensity={0.3} // Reducir intensidad de environment map
      textureOptimization="auto" // Usar modo auto para texturas
    />
  ) : (
    // Fallback a material básico si no hay texturas
    <meshStandardMaterial
      color={floorColor}
      metalness={0.02}
      roughness={0.8}
      envMapIntensity={0.3}
    />
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[dynamicCenterX, 0, 0]}
      frustumCulled={false} // Evitar culling que puede causar parpadeos
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

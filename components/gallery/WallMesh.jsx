import React from "react";
import { PBRMaterial } from "./PBRMaterial.jsx";

/**
 * Componente especializado para renderizar una pared lateral
 */
export function WallMesh({
  position,
  dynamicLength,
  wallMaps,
  wallColor = "#ffffff",
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[dynamicLength, 5, 0.1]} />
      <PBRMaterial
        maps={wallMaps}
        color={wallColor}
        metalness={0.3}
        roughness={0.85}
      />
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
}) {
  return (
    <>
      {/* Pared derecha */}
      <WallMesh
        position={[dynamicCenterX, 2.5, hallWidth / 2]}
        dynamicLength={dynamicLength}
        wallMaps={wallMaps}
        wallColor={wallColor}
      />

      {/* Pared izquierda */}
      <WallMesh
        position={[dynamicCenterX, 2.5, -hallWidth / 2]}
        dynamicLength={dynamicLength}
        wallMaps={wallMaps}
        wallColor={wallColor}
      />
    </>
  );
}

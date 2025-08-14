import React from "react";
import { PBRMaterial } from "../core/PBRMaterial.jsx";

/**
 * Componente especializado para renderizar el piso de la galería
 */
export function FloorMesh({
  dynamicLength,
  dynamicCenterX,
  floorMaps,
  floorColor = "#e0e0e0",
  hallWidth,
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[dynamicCenterX, 0, 0]}
    >
      <planeGeometry args={[dynamicLength, hallWidth]} />
      <PBRMaterial 
        maps={floorMaps} 
        color={floorColor}
        metalness={0.2}
        roughness={0.8}
      />
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
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      position={[dynamicCenterX, -0.01, 0]}
    >
      <planeGeometry args={[dynamicLength, hallWidth + floorExtra]} />
      <meshStandardMaterial color={floorColor} />
    </mesh>
  );
}

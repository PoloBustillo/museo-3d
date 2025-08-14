import React from "react";
import * as THREE from "three";

/**
 * Componente especializado para renderizar el techo de la galería
 */
export function CeilingMesh({
  dynamicLength,
  dynamicCenterX,
  ceilingHeight,
  hallWidth,
  floorExtra,
  color = "#f5f5f5",
}) {
  return (
    <mesh
      position={[dynamicCenterX, ceilingHeight, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[dynamicLength, hallWidth + floorExtra]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

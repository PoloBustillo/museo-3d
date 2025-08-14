import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

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
      {floorMaps.color ? (
        <meshStandardMaterial
          map={floorMaps.color}
          normalMap={floorMaps.normal || null}
          roughnessMap={floorMaps.roughness || null}
          metalnessMap={floorMaps.metalness || null}
          aoMap={floorMaps.ao || null}
          metalness={floorMaps.metalness ? 0.4 : 0.1}
          roughness={floorMaps.roughness ? 0.8 : 0.9}
        />
      ) : (
        <meshStandardMaterial color={floorColor} />
      )}
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

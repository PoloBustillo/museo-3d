import React from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

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
      {wallMaps.color ? (
        <meshStandardMaterial
          map={wallMaps.color}
          normalMap={wallMaps.normal || null}
          roughnessMap={wallMaps.roughness || null}
          metalnessMap={wallMaps.metalness || null}
          aoMap={wallMaps.ao || null}
          color={wallColor}
          metalness={wallMaps.metalness ? 0.3 : 0.1}
          roughness={wallMaps.roughness ? 0.85 : 0.9}
        />
      ) : (
        <meshStandardMaterial color={wallColor} />
      )}
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

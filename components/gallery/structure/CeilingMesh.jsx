import React from "react";
import * as THREE from "three";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import {
  PremiumWoodMaterial,
  BrushedMetalMaterial,
} from "../core/AdvancedMaterials.jsx";

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
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto", // Nueva prop para optimización
}) {
  // Material premium para techos de lujo - sin texturas para optimización
  const ceilingMaterial =
    premiumMode && quality === "ultra" ? (
      <PremiumWoodMaterial
        type="walnut"
        color={color}
        // Sin baseColor/maps para optimización GPU
      />
    ) : premiumMode ? (
      <PBRMaterial
        color={color}
        metalness={0.05}
        roughness={0.6}
        physical={true}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
        reflectivity={0.7}
        side={THREE.DoubleSide}
        textureOptimization={textureOptimization}
      />
    ) : (
      <PBRMaterial
        color={color}
        metalness={0.1}
        roughness={0.8}
        textureOptimization={textureOptimization}
        side={THREE.DoubleSide}
      />
    );

  return (
    <mesh
      position={[dynamicCenterX, ceilingHeight, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[dynamicLength, hallWidth + floorExtra]} />
      {ceilingMaterial}
    </mesh>
  );
}

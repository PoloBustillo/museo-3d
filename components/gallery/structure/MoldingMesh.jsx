import React from "react";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import {
  BrushedMetalMaterial,
  PremiumWoodMaterial,
} from "../core/AdvancedMaterials.jsx";

/**
 * Componente especializado para renderizar las molduras decorativas
 */
export function MoldingMesh({
  position,
  dynamicLength,
  color = "#FFF",
  premiumMode = false,
}) {
  // Material premium para molduras elegantes
  const moldingMaterial = premiumMode ? (
    <BrushedMetalMaterial type="gold" baseColor={color} />
  ) : (
    <PBRMaterial
      color={color}
      metalness={premiumMode ? 0.8 : 0.1}
      roughness={premiumMode ? 0.2 : 0.7}
      physical={premiumMode}
      clearcoat={premiumMode ? 0.6 : 0}
      clearcoatRoughness={premiumMode ? 0.1 : 0}
      reflectivity={premiumMode ? 0.9 : 0.5}
    />
  );

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
      {moldingMaterial}
    </mesh>
  );
}

/**
 * Componente para renderizar ambas molduras
 */
export function GalleryMoldings({
  dynamicLength,
  dynamicCenterX,
  ceilingHeight,
  hallWidth,
  color = "#FFF",
  premiumMode = false,
}) {
  return (
    <>
      {/* Moldura derecha */}
      <MoldingMesh
        position={[dynamicCenterX, ceilingHeight - 0.02, hallWidth / 2 - 0.13]}
        dynamicLength={dynamicLength}
        color={color}
        premiumMode={premiumMode}
      />

      {/* Moldura izquierda */}
      <MoldingMesh
        position={[dynamicCenterX, ceilingHeight - 0.02, -hallWidth / 2 + 0.13]}
        dynamicLength={dynamicLength}
        color={color}
        premiumMode={premiumMode}
      />
    </>
  );
}

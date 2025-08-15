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
  color = "#f8f8f8", // Color más claro por defecto
  premiumMode = false,
}) {
  // Material simplificado pero elegante
  const moldingMaterial = premiumMode ? (
    <BrushedMetalMaterial type="gold" color={color} />
  ) : (
    <PBRMaterial
      color={color}
      metalness={0.1} // Menos metálico para simplicidad
      roughness={0.3} // Menos rugoso para mejor brillo
      clearcoat={0.4} // Clearcoat moderado
      clearcoatRoughness={0.1}
      envMapIntensity={1.2} // Mejor reflejo ambiental
      textureOptimization="none" // Sin texturas para optimización
    />
  );

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[dynamicLength, 0.06, 0.06]} />{" "}
      {/* Molduras más finas */}
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

import React from "react";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import {
  LuxuryFabricMaterial,
  PremiumWoodMaterial,
} from "../core/AdvancedMaterials.jsx";

/**
 * Componente especializado para renderizar una pared lateral
 */
export function WallMesh({
  position,
  dynamicLength,
  wallMaps,
  wallColor = "#fafafa", // Color más cálido y claro para mejor visibilidad
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto",
}) {
  // Material optimizado para iluminación tenue
  const wallMaterial =
    premiumMode && quality === "ultra" ? (
      <LuxuryFabricMaterial
        type="silk"
        color={wallColor}
        // Sin maps para optimización GPU
      />
    ) : (
      <PBRMaterial
        maps={wallMaps}
        color={wallColor}
        metalness={premiumMode ? 0.02 : 0.05} // Muy poco metálico
        roughness={premiumMode ? 0.8 : 0.9} // Más rugoso para difundir luz
        physical={premiumMode}
        clearcoat={premiumMode ? 0.05 : 0}
        clearcoatRoughness={premiumMode ? 0.4 : 0}
        sheen={premiumMode ? 0.1 : 0}
        sheenRoughness={premiumMode ? 0.9 : 0}
        sheenColor={premiumMode ? wallColor : undefined}
        reflectivity={premiumMode ? 0.4 : 0.3} // Menos reflectivo para no competir con obras
        envMapIntensity={0.8} // Reducido para mejor contraste
        textureOptimization={textureOptimization}
      />
    );

  // Renderizar solo la caja de la pared y su material, sin adornos ni geometría extra
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[dynamicLength, 5.5, 0.15]} />
      {wallMaterial}
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
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto", // Nueva prop para optimización
}) {
  return (
    <>
      {/* Pared derecha */}
      <WallMesh
        position={[dynamicCenterX, 2.5, hallWidth / 2]}
        dynamicLength={dynamicLength}
        wallMaps={wallMaps}
        wallColor={wallColor}
        premiumMode={premiumMode}
        quality={quality}
        textureOptimization={textureOptimization}
      />

      {/* Pared izquierda */}
      <WallMesh
        position={[dynamicCenterX, 2.5, -hallWidth / 2]}
        dynamicLength={dynamicLength}
        wallMaps={wallMaps}
        wallColor={wallColor}
        premiumMode={premiumMode}
        quality={quality}
        textureOptimization={textureOptimization}
      />
    </>
  );
}

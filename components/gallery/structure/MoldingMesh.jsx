import React from "react";

/**
 * Componente especializado para renderizar las molduras decorativas
 */
export function MoldingMesh({ position, dynamicLength, color = "#FFF" }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
      <meshStandardMaterial color={color} />
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
}) {
  return (
    <>
      {/* Moldura derecha */}
      <MoldingMesh
        position={[dynamicCenterX, ceilingHeight - 0.02, hallWidth / 2 - 0.13]}
        dynamicLength={dynamicLength}
        color={color}
      />

      {/* Moldura izquierda */}
      <MoldingMesh
        position={[dynamicCenterX, ceilingHeight - 0.02, -hallWidth / 2 + 0.13]}
        dynamicLength={dynamicLength}
        color={color}
      />
    </>
  );
}

import React from "react";

/**
 * Componente reutilizable para materiales PBR
 */
export function PBRMaterial({
  maps,
  color,
  metalness = 0.1,
  roughness = 0.9,
  side = null,
}) {
  if (maps?.color) {
    return (
      <meshStandardMaterial
        map={maps.color}
        normalMap={maps.normal || null}
        roughnessMap={maps.roughness || null}
        metalnessMap={maps.metalness || null}
        aoMap={maps.ao || null}
        color={color}
        metalness={maps.metalness ? metalness : 0.1}
        roughness={maps.roughness ? roughness : 0.9}
        side={side}
      />
    );
  }

  return <meshStandardMaterial color={color} side={side} />;
}

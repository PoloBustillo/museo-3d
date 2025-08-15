import React from "react";
import * as THREE from "three";

/**
 * Modelos de lámparas de techo para galería profesional
 * Se colocan alineadas con los focos de luz
 */
export function CeilingLamps({
  dynamicLength,
  dynamicCenterX,
  ceilingHeight,
  hallWidth,
  lampCount, // Ahora será calculado dinámicamente desde el padre
}) {
  // Usar el mismo cálculo que GalleryLighting para sincronización
  const actualLampCount =
    lampCount || Math.max(4, Math.floor(dynamicLength / 4));

  // Distribuir lámparas a lo largo del techo - SINCRONIZADO con luces
  const lampPositions = [];
  for (let i = 0; i < actualLampCount; i++) {
    const x =
      dynamicCenterX -
      dynamicLength / 2 +
      2 +
      i * (dynamicLength / (actualLampCount - 1));
    lampPositions.push(x);
  }

  return (
    <>
      {lampPositions.map((x, i) => (
        <group
          key={`ceiling-lamp-${i}`}
          position={[x, ceilingHeight - 0.08, 0]}
        >
          {/* Cuerpo principal: lámpara profesional tipo panel LED cuadrado, negro metálico */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.06, 0.62]} />
            <meshPhysicalMaterial
              color="#18191a"
              metalness={0.82}
              roughness={0.18}
              clearcoat={0.7}
              clearcoatRoughness={0.08}
            />
          </mesh>
          {/* Difusor de luz: panel LED con emisión reducida */}
          <mesh position={[0, -0.032, 0]}>
            <boxGeometry args={[0.56, 0.012, 0.56]} />
            <meshPhysicalMaterial
              color="#fffbe6"
              emissive="#fffbe6"
              emissiveIntensity={0.2} // Reducido de 0.7 a 0.2
              roughness={0.08}
              transmission={0.98}
              opacity={0.93}
              transparent
            />
          </mesh>
          {/* Detalle metálico superior (oscuro) */}
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.018, 32]} />
            <meshStandardMaterial
              color="#232325"
              metalness={0.9}
              roughness={0.13}
            />
          </mesh>
          {/* Soporte profesional cuadrado, negro metálico */}
          <mesh position={[0, 0.09, 0]}>
            <boxGeometry args={[0.06, 0.18, 0.06]} />
            <meshStandardMaterial
              color="#18191a"
              metalness={0.82}
              roughness={0.18}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

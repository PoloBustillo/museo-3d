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
  lampCount = 4,
}) {
  // Distribuir lámparas a lo largo del techo
  const lampPositions = [];
  for (let i = 0; i < lampCount; i++) {
    const x =
      dynamicCenterX -
      dynamicLength / 2 +
      (i + 1) * (dynamicLength / (lampCount + 1));
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
          {/* Difusor de luz: panel LED cuadrado */}
          <mesh position={[0, -0.032, 0]}>
            <boxGeometry args={[0.56, 0.012, 0.56]} />
            <meshPhysicalMaterial
              color="#fffbe6"
              emissive="#fffbe6"
              emissiveIntensity={0.7}
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

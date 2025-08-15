import React from "react";
import { GALLERY_CONFIG } from "../core/config.js";

const { HALL_WIDTH, HALL_LENGTH } = GALLERY_CONFIG;

/**
 * Componente individual de banco
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.position - Posición del banco [x, y, z]
 */
function Bench({ position }) {
  return (
    <group position={position}>
      {/* Asiento del banco - madera simple pero profesional */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 0.4]} />
        <meshStandardMaterial 
          color="#8d6e63"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Pata izquierda */}
      <mesh position={[-0.8, 0.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial 
          color="#5d4037"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* Pata derecha */}
      <mesh position={[0.8, 0.15, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial 
          color="#5d4037"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

/**
 * Componente que renderiza todos los bancos de la galería
 * @param {Object} props - Propiedades del componente
 * @param {number} props.dynamicLength - Longitud dinámica de la galería (para posicionamiento futuro)
 */
export function GalleryBenches({ dynamicLength }) {
  // Usar la longitud dinámica en lugar de la fija
  const benchSpacing = Math.min(dynamicLength / 3, 12); // Espaciado adaptativo
  const benchPositions = [
    // Bancos en la pared superior
    [-benchSpacing, 0, HALL_WIDTH / 2 - 1.2],
    [0, 0, HALL_WIDTH / 2 - 1.2],
    [benchSpacing, 0, HALL_WIDTH / 2 - 1.2],
    // Bancos en la pared inferior
    [-benchSpacing, 0, -HALL_WIDTH / 2 + 1.2],
    [0, 0, -HALL_WIDTH / 2 + 1.2],
    [benchSpacing, 0, -HALL_WIDTH / 2 + 1.2],
  ];

  return (
    <>
      {benchPositions.map((position, index) => (
        <Bench key={`bench-${index}`} position={position} />
      ))}
    </>
  );
}

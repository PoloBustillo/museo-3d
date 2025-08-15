import React from "react";
import { GALLERY_CONFIG } from "../core/config.js";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import { PremiumWoodMaterial } from "../core/AdvancedMaterials.jsx";

const { HALL_WIDTH, HALL_LENGTH } = GALLERY_CONFIG;

/**
 * Componente individual de banco
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.position - Posición del banco [x, y, z]
 */
function Bench({ position }) {
  return (
    <group position={position}>
      {/* Asiento del banco - madera premium walnut */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.12, 0.45]} />
        <PremiumWoodMaterial 
          type="walnut"
          color="#6d4c41"
        />
      </mesh>
      
      {/* Respaldo del banco */}
      <mesh position={[0, 0.7, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 0.08]} />
        <PremiumWoodMaterial 
          type="walnut"
          color="#5d4037"
        />
      </mesh>
      
      {/* Pata izquierda - madera oscura */}
      <mesh position={[-0.8, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.45, 0.12]} />
        <PBRMaterial 
          color="#3e2723"
          metalness={0.1}
          roughness={0.8}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
        />
      </mesh>
      
      {/* Pata derecha - madera oscura */}
      <mesh position={[0.8, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.45, 0.12]} />
        <PBRMaterial 
          color="#3e2723"
          metalness={0.1}
          roughness={0.8}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
        />
      </mesh>
      
      {/* Soporte central para estabilidad */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.08, 0.08]} />
        <PBRMaterial 
          color="#3e2723"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Detalles metálicos en las esquinas */}
      <mesh position={[-0.9, 0.4, 0.2]} receiveShadow>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial 
          color="#8d6e63"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.9, 0.4, 0.2]} receiveShadow>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial 
          color="#8d6e63"
          metalness={0.9}
          roughness={0.2}
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

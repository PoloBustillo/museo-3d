/**
 * Componente de lámparas modernas para el techo
 * Lámparas colgantes con focos dirigidos hacia abajo
 */
import React from 'react';
import * as THREE from 'three';

const CeilingLamp = React.memo(function CeilingLamp({ position, intensity = 0.8, color = "#ffffff", distance = 6 }) {
  return (
    <group position={position}>
      {/* Cable/soporte de la lámpara */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Cuerpo principal de la lámpara */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#f5f5f5" metalness={0.1} roughness={0.2} />
      </mesh>
      
      {/* Reflector interior */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.22, 0.05, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Anillo decorativo */}
      <mesh position={[0, -0.35, 0]}>
        <torusGeometry args={[0.26, 0.02, 8, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Punto de luz principal */}
      <spotLight
        position={[0, -0.65, 0]}
        target-position={[0, -10, 0]}
        intensity={intensity}
        color={color}
        distance={distance}
        angle={Math.PI / 6}
        penumbra={0.3}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Luz ambiental suave */}
      <pointLight
        position={[0, -0.4, 0]}
        intensity={intensity * 0.3}
        color={color}
        distance={distance * 0.7}
        decay={2}
      />
    </group>
  );
});

const CeilingLamps = React.memo(function CeilingLamps({ hallDimensions, exploring = false }) {
  const { width, height, length } = hallDimensions;
  
  // Configuración de lámparas - distribución uniforme
  const lampPositions = [
    // Fila frontal
    [-width * 0.25, height - 0.1, length * 0.25],
    [width * 0.25, height - 0.1, length * 0.25],
    
    // Fila central
    [-width * 0.25, height - 0.1, 0],
    [width * 0.25, height - 0.1, 0],
    
    // Fila trasera
    [-width * 0.25, height - 0.1, -length * 0.25],
    [width * 0.25, height - 0.1, -length * 0.25],
  ];
  
  return (
    <group>
      {lampPositions.map((position, index) => (
        <CeilingLamp
          key={`ceiling-lamp-${index}`}
          position={position}
          intensity={exploring ? 0.9 : 0.6}
          distance={exploring ? 8 : 6}
        />
      ))}
    </group>
  );
});

export { CeilingLamp, CeilingLamps };

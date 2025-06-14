import React from 'react';
import { GALLERY_CONFIG } from './config.js';

const { CEILING_HEIGHT } = GALLERY_CONFIG;

/**
 * Componente de iluminación para la galería
 * @param {Object} props - Propiedades del componente
 * @param {number} props.dynamicLength - Longitud dinámica de la galería
 * @param {number} props.dynamicCenterX - Centro X dinámico de la galería
 */
export function GalleryLighting({ dynamicLength, dynamicCenterX }) {
  const numPointLights = Math.max(2, Math.floor(dynamicLength / 6));
  const numLamps = Math.floor(dynamicLength / 8);

  return (
    <>
      {/* Iluminación ambiental y direccional */}
      <ambientLight intensity={1.1} />
      <directionalLight 
        position={[10, 12, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      {/* Luces puntuales distribuidas */}
      {Array.from({ length: numPointLights }).map((_, i) => (
        <pointLight
          key={`point-light-${i}`}
          position={[
            dynamicCenterX - dynamicLength/2 + 3 + i*6, 
            CEILING_HEIGHT - 0.7, 
            0
          ]}
          intensity={1.5}
          distance={8}
          color="#ffe6b2"
          castShadow
        />
      ))}
      
      {/* Lámparas decorativas */}
      {Array.from({ length: numLamps }).map((_, i) => (
        <React.Fragment key={`lamp-group-${i}`}>
          <mesh position={[
            dynamicCenterX - dynamicLength/2 + 4 + i*8, 
            CEILING_HEIGHT - 0.2, 
            0
          ]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 24]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          
          <pointLight 
            position={[
              dynamicCenterX - dynamicLength/2 + 4 + i*8, 
              CEILING_HEIGHT - 0.5, 
              0
            ]} 
            intensity={1.2} 
            distance={6} 
            color="#fffbe6" 
          />
          
          <mesh position={[
            dynamicCenterX - dynamicLength/2 + 4 + i*8, 
            CEILING_HEIGHT - 0.19, 
            0
          ]} rotation={[-Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.45, 0.035, 16, 32]} />
            <meshStandardMaterial color="#f8bbd0" />
          </mesh>
        </React.Fragment>
      ))}
    </>
  );
}

import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GALLERY_CONFIG } from './config.js';

const { HALL_WIDTH, CEILING_HEIGHT } = GALLERY_CONFIG;

/**
 * Componente para las paredes de límite de la galería
 * @param {Object} props - Propiedades del componente
 * @param {number} props.firstX - Posición X inicial
 * @param {number} props.lastX - Posición X final
 * @param {number} props.wallMarginInitial - Margen inicial de la pared
 * @param {number} props.wallMarginFinal - Margen final de la pared
 */
export function GalleryWalls({ firstX, lastX, wallMarginInitial, wallMarginFinal }) {
  // Cargar textura de pared
  const wallTexture = useTexture(GALLERY_CONFIG.TEXTURES.WALL);

  // Configurar textura
  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    wallTexture.anisotropy = 16;
  }

  const wallHeight = CEILING_HEIGHT;
  const wallWidth = HALL_WIDTH + 2; // Un poco más ancha para evitar gaps

  return (
    <>
      {/* Pared inicial (entrada) - Posición balanceada */}
      <mesh position={[firstX - wallMarginInitial * 0.8, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, wallWidth]} />
        <meshStandardMaterial 
          map={wallTexture} 
          color="#f8f8f8"
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      
      {/* Pared final (con modal) - Lisa y semi-transparente */}
      <mesh position={[lastX + wallMarginFinal, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, wallWidth]} />
        <meshStandardMaterial 
          color="#f0f0f0"
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

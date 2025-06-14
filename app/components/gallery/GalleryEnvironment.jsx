import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GALLERY_CONFIG } from './config.js';

const { HALL_WIDTH, CEILING_HEIGHT, FLOOR_EXTRA } = GALLERY_CONFIG;

/**
 * Componente del entorno de la galería (piso, paredes, techo)
 * @param {Object} props - Propiedades del componente
 * @param {number} props.dynamicLength - Longitud dinámica de la galería
 * @param {number} props.dynamicCenterX - Centro X dinámico de la galería
 */
export function GalleryEnvironment({ dynamicLength, dynamicCenterX }) {
  // Cargar texturas
  const floorTexture = useTexture(GALLERY_CONFIG.TEXTURES.FLOOR);
  const wallTexture = useTexture(GALLERY_CONFIG.TEXTURES.WALL);

  // Configurar repetición de texturas
  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(Math.ceil(dynamicLength / 4), 2);
    wallTexture.anisotropy = 16;
  }

  if (floorTexture) {
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(Math.ceil(dynamicLength / 4), Math.ceil(HALL_WIDTH / 2));
    floorTexture.anisotropy = 16;
  }

  return (
    <>
      {/* Piso principal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[dynamicCenterX, 0, 0]}>
        <planeGeometry args={[dynamicLength, HALL_WIDTH]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>

      {/* Piso extendido */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[dynamicCenterX, -0.01, 0]}>
        <planeGeometry args={[dynamicLength, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Techo */}
      <mesh position={[dynamicCenterX, CEILING_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dynamicLength, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Paredes laterales - usando boxGeometry como en el original */}
      <mesh position={[dynamicCenterX, 2.5, HALL_WIDTH/2]}>
        <boxGeometry args={[dynamicLength, 5, 0.1]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" />
      </mesh>
      
      <mesh position={[dynamicCenterX, 2.5, -HALL_WIDTH/2]}>
        <boxGeometry args={[dynamicLength, 5, 0.1]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" />
      </mesh>

      {/* Molduras del techo */}
      <mesh position={[dynamicCenterX, CEILING_HEIGHT-0.02, HALL_WIDTH/2 - 0.13]}>
        <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      
      <mesh position={[dynamicCenterX, CEILING_HEIGHT-0.02, -HALL_WIDTH/2 + 0.13]}>
        <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
    </>
  );
}

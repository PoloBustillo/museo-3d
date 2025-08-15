import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";
import { WallMesh } from "./structure/WallMesh.jsx";
import { PBRMaterial } from "./core/PBRMaterial.jsx";

const { HALL_WIDTH, CEILING_HEIGHT } = GALLERY_CONFIG;

/**
 * Componente para las paredes de límite de la galería
 * @param {Object} props - Propiedades del componente
 * @param {number} props.firstX - Posición X inicial
 * @param {number} props.lastX - Posición X final
 * @param {number} props.wallMarginInitial - Margen inicial de la pared
 * @param {number} props.wallMarginFinal - Margen final de la pared
 * @param {string} props.wallTextureUrl - URL de la textura de pared
 * @param {string} props.wallColor - Color de la pared
 */
export function GalleryWalls({
  firstX,
  lastX,
  wallMarginInitial,
  wallMarginFinal,
  wallTextureUrl,
  wallColor = "#ffffff",
}) {
  const { maps, fallbackTexture, hasTexture } =
    useGalleryTextures(wallTextureUrl);

  // Usar altura de techo para todas las paredes
  const wallHeight = CEILING_HEIGHT;
  const wallWidth = HALL_WIDTH + 2;

  return (
    <>
      {/* Pared inicial (entrada) - Con mismas texturas PBR que paredes laterales */}
      <mesh position={[firstX - wallMarginInitial, CEILING_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, CEILING_HEIGHT, wallWidth]} />
        <PBRMaterial
          maps={hasTexture ? maps : {}}
          color={wallColor}
          metalness={0.05}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pared final (salida) - Con texturas PBR y color más oscuro */}
      <mesh position={[lastX + wallMarginFinal, CEILING_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, CEILING_HEIGHT, wallWidth]} />
        <PBRMaterial
          maps={hasTexture ? maps : {}}
          color="#b8b8b8"
          metalness={0.1}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Marco dorado alrededor de la salida - más visible */}
      <mesh position={[lastX + wallMarginFinal + 0.08, CEILING_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[0.02, CEILING_HEIGHT - 0.5, wallWidth - 1]} />
        <meshStandardMaterial 
          color="#d4af37" 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Indicador superior "SALIDA" - más prominente */}
      <mesh position={[lastX + wallMarginFinal + 0.1, CEILING_HEIGHT - 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.01, 0.4, 3]} />
        <meshStandardMaterial 
          color="#ff2222" 
          roughness={0.3} 
          metalness={0.7} 
          emissive="#660000"
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  );
}

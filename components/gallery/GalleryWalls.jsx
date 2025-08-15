import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
// BYPASS: Import Fast version for performance  
import { useFastGalleryTextures as useGalleryTextures } from "../../hooks/useFastGalleryTextures.js";
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
      <mesh
        position={[firstX - wallMarginInitial, CEILING_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.15, CEILING_HEIGHT, wallWidth]} />
        <PBRMaterial
          maps={hasTexture ? maps : {}}
          color={wallColor}
          metalness={0.05}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pared final (salida) - Más clara para mejor visibilidad */}
      <mesh
        position={[lastX + wallMarginFinal, CEILING_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.15, CEILING_HEIGHT, wallWidth]} />
        <PBRMaterial
          maps={hasTexture ? maps : {}}
          color="#e8e8e8"
          metalness={0.1}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Marco dorado alrededor de la salida - más prominente */}
      <mesh
        position={[lastX + wallMarginFinal + 0.08, CEILING_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.03, CEILING_HEIGHT - 0.3, wallWidth - 0.8]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.2}
          metalness={0.8}
          emissive="#332200"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Letrero "EXIT" más visible y prominente */}
      <mesh
        position={[lastX + wallMarginFinal + 0.12, CEILING_HEIGHT - 0.8, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.02, 0.6, 4]} />
        <meshStandardMaterial
          color="#ff1111"
          roughness={0.2}
          metalness={0.3}
          emissive="#ff0000"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Texto "EXIT" en blanco luminoso */}
      <mesh
        position={[lastX + wallMarginFinal + 0.13, CEILING_HEIGHT - 0.8, -1.2]}
        receiveShadow
      >
        <boxGeometry args={[0.005, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          emissive="#ffffff"
          emissiveIntensity={1.0}
        />
      </mesh>
      <mesh
        position={[lastX + wallMarginFinal + 0.13, CEILING_HEIGHT - 0.8, -0.4]}
        receiveShadow
      >
        <boxGeometry args={[0.005, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          emissive="#ffffff"
          emissiveIntensity={1.0}
        />
      </mesh>
      <mesh
        position={[lastX + wallMarginFinal + 0.13, CEILING_HEIGHT - 0.8, 0.4]}
        receiveShadow
      >
        <boxGeometry args={[0.005, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          emissive="#ffffff"
          emissiveIntensity={1.0}
        />
      </mesh>
      <mesh
        position={[lastX + wallMarginFinal + 0.13, CEILING_HEIGHT - 0.8, 1.2]}
        receiveShadow
      >
        <boxGeometry args={[0.005, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          emissive="#ffffff"
          emissiveIntensity={1.0}
        />
      </mesh>
    </>
  );
}

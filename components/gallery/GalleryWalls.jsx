import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";

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

  const wallHeight = CEILING_HEIGHT;
  const wallWidth = HALL_WIDTH + 2;

  return (
    <>
      {/* Pared inicial (entrada) - Con textura seleccionada */}
      <mesh position={[firstX - wallMarginInitial * 0.8, wallHeight / 2, 0]}>
        <boxGeometry args={[0.2, wallHeight, wallWidth]} />
        {hasTexture ? (
          <meshStandardMaterial
            map={maps.color}
            normalMap={maps.normal || null}
            roughnessMap={maps.roughness || null}
            metalnessMap={maps.metalness || null}
            aoMap={maps.ao || null}
            color={wallColor}
            metalness={maps.metalness ? 0.3 : 0.1}
            roughness={maps.roughness ? 0.85 : 0.9}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            map={fallbackTexture}
            color={wallColor}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Pared final (salida) - Lisa y semi-transparente */}
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

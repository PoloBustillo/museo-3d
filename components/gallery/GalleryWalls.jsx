import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./core/config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";
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
      {/* Pared inicial (entrada) - Con textura seleccionada */}
      <mesh position={[firstX - wallMarginInitial * 0.8, CEILING_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.2, CEILING_HEIGHT, wallWidth]} />
        <PBRMaterial
          maps={hasTexture ? maps : { color: fallbackTexture }}
          color={wallColor}
          metalness={hasTexture && maps.metalness ? 0.3 : 0.1}
          roughness={hasTexture && maps.roughness ? 0.85 : 0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pared final (salida) - Lisa y semi-transparente */}
      <mesh position={[lastX + wallMarginFinal, CEILING_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.2, CEILING_HEIGHT, wallWidth]} />
        <PBRMaterial
          color="#f0f0f0"
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.7}
        />
      </mesh>
    </>
  );
}

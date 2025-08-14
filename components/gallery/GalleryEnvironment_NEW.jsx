import React from "react";
import * as THREE from "three";
import { GALLERY_CONFIG } from "./config.js";
import { useGalleryTextures } from "../../hooks/useGalleryTextures.js";

const { HALL_WIDTH, CEILING_HEIGHT, FLOOR_EXTRA } = GALLERY_CONFIG;

/**
 * Entorno de galería optimizado con texturas PBR
 */
export function GalleryEnvironment({
  dynamicLength,
  dynamicCenterX,
  wallTextureUrl,
  floorTextureUrl,
  wallColor = "#ffffff",
  floorColor = "#e0e0e0",
}) {
  // Usar hook optimizado para texturas de pared y piso
  const wallTextures = useGalleryTextures(wallTextureUrl, "WALL", [
    Math.ceil(dynamicLength / 4),
    2,
  ]);

  const floorTextures = useGalleryTextures(floorTextureUrl, "FLOOR", [
    Math.ceil(dynamicLength / 4),
    Math.ceil(HALL_WIDTH / 2),
  ]);

  return (
    <>
      {/* Piso principal */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[dynamicCenterX, 0, 0]}
      >
        <planeGeometry args={[dynamicLength, HALL_WIDTH]} />
        {floorTextures.hasTexture ? (
          <meshStandardMaterial
            map={floorTextures.maps.color}
            normalMap={floorTextures.maps.normal || null}
            roughnessMap={floorTextures.maps.roughness || null}
            metalnessMap={floorTextures.maps.metalness || null}
            aoMap={floorTextures.maps.ao || null}
            color={floorColor}
            metalness={floorTextures.maps.metalness ? 0.2 : 0.0}
            roughness={floorTextures.maps.roughness ? 0.8 : 0.9}
          />
        ) : (
          <meshStandardMaterial color={floorColor} />
        )}
      </mesh>

      {/* Piso extendido */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[dynamicCenterX, -0.01, 0]}
      >
        <planeGeometry args={[dynamicLength, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Techo */}
      <mesh
        position={[dynamicCenterX, CEILING_HEIGHT, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[dynamicLength, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Paredes laterales */}
      <mesh position={[dynamicCenterX, 2.5, HALL_WIDTH / 2]}>
        <boxGeometry args={[dynamicLength, 5, 0.1]} />
        {wallTextures.hasTexture ? (
          <meshStandardMaterial
            map={wallTextures.maps.color}
            normalMap={wallTextures.maps.normal || null}
            roughnessMap={wallTextures.maps.roughness || null}
            metalnessMap={wallTextures.maps.metalness || null}
            aoMap={wallTextures.maps.ao || null}
            color={wallColor}
            metalness={wallTextures.maps.metalness ? 0.3 : 0.1}
            roughness={wallTextures.maps.roughness ? 0.85 : 0.9}
          />
        ) : (
          <meshStandardMaterial color={wallColor} />
        )}
      </mesh>

      <mesh position={[dynamicCenterX, 2.5, -HALL_WIDTH / 2]}>
        <boxGeometry args={[dynamicLength, 5, 0.1]} />
        {wallTextures.hasTexture ? (
          <meshStandardMaterial
            map={wallTextures.maps.color}
            normalMap={wallTextures.maps.normal || null}
            roughnessMap={wallTextures.maps.roughness || null}
            metalnessMap={wallTextures.maps.metalness || null}
            aoMap={wallTextures.maps.ao || null}
            color={wallColor}
            metalness={wallTextures.maps.metalness ? 0.3 : 0.1}
            roughness={wallTextures.maps.roughness ? 0.85 : 0.9}
          />
        ) : (
          <meshStandardMaterial color={wallColor} />
        )}
      </mesh>

      {/* Molduras */}
      <mesh
        position={[
          dynamicCenterX,
          CEILING_HEIGHT - 0.02,
          HALL_WIDTH / 2 - 0.13,
        ]}
      >
        <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh
        position={[
          dynamicCenterX,
          CEILING_HEIGHT - 0.02,
          -HALL_WIDTH / 2 + 0.13,
        ]}
      >
        <boxGeometry args={[dynamicLength, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
    </>
  );
}

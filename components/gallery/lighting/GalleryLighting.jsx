import React from "react";
import { GALLERY_CONFIG } from "../core/config.js";

const { CEILING_HEIGHT } = GALLERY_CONFIG;

/**
 * Sistema de iluminación profesional del techo para galería
 * SOLO LUCES DEL TECHO - Sistema de museo profesional
 * @param {Object} props
 * @param {number} props.dynamicLength
 * @param {number} props.dynamicCenterX
 * @param {string} [props.lightingPreset]
 * @param {number} [props.ambientIntensity]
 */
export function GalleryLighting({
  dynamicLength,
  dynamicCenterX,
  lightingPreset = "neutral",
  ambientIntensity = 0.3,
}) {
  // Calcular número de focos del techo basado en la longitud
  const numCeilingLights = Math.max(4, Math.floor(dynamicLength / 4));

  return (
    <>
      {/* LUCES DEL TECHO PROFESIONALES - ILUMINAN TODA LA SALA */}
      
      {/* Iluminación ambiental para ver toda la sala */}
      <ambientLight intensity={ambientIntensity + 0.5} color="#f8f8f8" />

      {/* Luz hemisférica para distribución uniforme */}
      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#e8e8e8"
        intensity={0.4}
      />

      {/* Focos principales del techo distribuidos uniformemente */}
      {Array.from({ length: numCeilingLights }).map((_, i) => (
        <spotLight
          key={`ceiling-spot-${i}`}
          position={[
            dynamicCenterX - dynamicLength / 2 + 2 + i * (dynamicLength / (numCeilingLights - 1)),
            CEILING_HEIGHT - 0.1,
            0,
          ]}
          target-position={[
            dynamicCenterX - dynamicLength / 2 + 2 + i * (dynamicLength / (numCeilingLights - 1)),
            0,
            0,
          ]}
          intensity={10.0}
          angle={0.7}
          penumbra={0.3}
          distance={CEILING_HEIGHT + 3}
          color="#ffffff"
          castShadow={i < 2} // Solo primeros 2 focos con sombras
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
      ))}

      {/* Focos específicos para iluminar las paredes de obras */}
      <spotLight
        position={[dynamicCenterX, CEILING_HEIGHT - 0.1, -1]}
        target-position={[dynamicCenterX, 2, -6.5]}
        intensity={12.0}
        angle={0.4}
        penumbra={0.3}
        distance={12}
        color="#fff9f0"
        castShadow={true}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight
        position={[dynamicCenterX, CEILING_HEIGHT - 0.1, 1]}
        target-position={[dynamicCenterX, 2, 6.5]}
        intensity={12.0}
        angle={0.4}
        penumbra={0.3}
        distance={12}
        color="#fff9f0"
        castShadow={false} // Solo uno con sombras para optimizar
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Focos de cobertura lateral para esquinas */}
      <spotLight
        position={[dynamicCenterX - dynamicLength/4, CEILING_HEIGHT - 0.1, 0]}
        target-position={[dynamicCenterX - dynamicLength/4, 0, 0]}
        intensity={8.0}
        angle={0.6}
        penumbra={0.4}
        distance={CEILING_HEIGHT + 2}
        color="#ffffff"
        castShadow={false}
      />

      <spotLight
        position={[dynamicCenterX + dynamicLength/4, CEILING_HEIGHT - 0.1, 0]}
        target-position={[dynamicCenterX + dynamicLength/4, 0, 0]}
        intensity={8.0}
        angle={0.6}
        penumbra={0.4}
        distance={CEILING_HEIGHT + 2}
        color="#ffffff"
        castShadow={false}
      />
    </>
  );
}

import React from "react";
import { GALLERY_CONFIG } from "./config.js";

const { CEILING_HEIGHT } = GALLERY_CONFIG;

// Nuevos presets de iluminación
const LIGHTING_PRESETS = {
  neutral: (ambientOverride) => ({
    ambient: ambientOverride ?? 0.8,
    directional: { intensity: 1.1, color: "#ffffff", position: [10, 12, 10] },
    point: { intensity: 1.3, color: "#ffe6b2" },
    lamp: { intensity: 1.0, color: "#fffbe6" },
  }),
  warm: (ambientOverride) => ({
    ambient: ambientOverride ?? 0.9,
    directional: { intensity: 1.3, color: "#ffd7a0", position: [8, 11, 6] },
    point: { intensity: 1.4, color: "#ffdeb4" },
    lamp: { intensity: 1.1, color: "#ffe9cc" },
  }),
  dramatic: (ambientOverride) => ({
    ambient: ambientOverride ?? 0.45,
    directional: { intensity: 1.9, color: "#ffffff", position: [14, 14, 4] },
    point: { intensity: 1.6, color: "#fff7d1" },
    lamp: { intensity: 1.2, color: "#ffe9c4" },
  }),
  cool: (ambientOverride) => ({
    ambient: ambientOverride ?? 0.75,
    directional: { intensity: 1.2, color: "#cfe8ff", position: [9, 13, 9] },
    point: { intensity: 1.25, color: "#d6f0ff" },
    lamp: { intensity: 1.05, color: "#e3f6ff" },
  }),
};

/**
 * Componente de iluminación para la galería con soporte de presets
 * @param {Object} props
 * @param {number} props.dynamicLength
 * @param {number} props.dynamicCenterX
 * @param {string} [props.lightingPreset]
 * @param {number} [props.ambientIntensity]
 */
export function GalleryLighting({
  dynamicLength,
  dynamicCenterX,
  lightingPreset,
  ambientIntensity,
}) {
  const numPointLights = Math.max(2, Math.floor(dynamicLength / 6));
  const numLamps = Math.floor(dynamicLength / 8);

  const presetFactory =
    LIGHTING_PRESETS[lightingPreset] || LIGHTING_PRESETS.neutral;
  const preset = presetFactory(ambientIntensity);

  return (
    <>
      {/* Iluminación ambiental y direccional según preset */}
      <ambientLight intensity={preset.ambient} />
      <directionalLight
        position={preset.directional.position}
        intensity={preset.directional.intensity}
        color={preset.directional.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Luces puntuales distribuidas */}
      {Array.from({ length: numPointLights }).map((_, i) => (
        <pointLight
          key={`point-light-${i}`}
          position={[
            dynamicCenterX - dynamicLength / 2 + 3 + i * 6,
            CEILING_HEIGHT - 0.7,
            0,
          ]}
          intensity={preset.point.intensity}
          distance={8}
          color={preset.point.color}
          castShadow
        />
      ))}

      {/* Lámparas decorativas */}
      {Array.from({ length: numLamps }).map((_, i) => (
        <React.Fragment key={`lamp-group-${i}`}>
          <mesh
            position={[
              dynamicCenterX - dynamicLength / 2 + 4 + i * 8,
              CEILING_HEIGHT - 0.2,
              0,
            ]}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.1, 24]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>

          <pointLight
            position={[
              dynamicCenterX - dynamicLength / 2 + 4 + i * 8,
              CEILING_HEIGHT - 0.5,
              0,
            ]}
            intensity={preset.lamp.intensity}
            distance={6}
            color={preset.lamp.color}
          />

          <mesh
            position={[
              dynamicCenterX - dynamicLength / 2 + 4 + i * 8,
              CEILING_HEIGHT - 0.19,
              0,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.45, 0.035, 16, 32]} />
            <meshStandardMaterial
              color={lightingPreset === "dramatic" ? "#444" : "#f8bbd0"}
            />
          </mesh>
        </React.Fragment>
      ))}
    </>
  );
}

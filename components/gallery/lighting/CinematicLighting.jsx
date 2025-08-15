import React from "react";
import { GALLERY_CONFIG } from "../core/config.js";

const { CEILING_HEIGHT } = GALLERY_CONFIG;

/**
 * Sistema de iluminación cinematográfica avanzada
 */
export function CinematicLighting({
  dynamicLength,
  dynamicCenterX,
  lightingPreset = "museum",
  ambientOverride = null,
}) {
  // Configuraciones de iluminación optimizadas - Más tenues pero con obras destacadas
  const LIGHTING_PRESETS = {
    museum: {
      ambient: { intensity: 0.15, color: "#f0f0f0" }, // Más tenue
      key: { intensity: 1.8, color: "#fff8e1", distance: 12 }, // Reducido
      spots: { intensity: 5.5, angle: 0.25, penumbra: 0.6 }, // Más intensos para obras
    },
    dramatic: {
      ambient: { intensity: 0.05, color: "#1a1a1a" }, // Muy tenue
      key: { intensity: 2.2, color: "#ffebee", distance: 10 }, // Reducido
      spots: { intensity: 7.0, angle: 0.2, penumbra: 0.8 }, // Muy intensos para contraste
    },
    golden: {
      ambient: { intensity: 0.2, color: "#ffd54f" }, // Más suave
      key: { intensity: 2.0, color: "#fff8e1", distance: 11 }, // Reducido
      spots: { intensity: 6.0, angle: 0.22, penumbra: 0.5 }, // Intensos pero cálidos
    },
  };

  const preset = LIGHTING_PRESETS[lightingPreset] || LIGHTING_PRESETS.museum;

  // Calcular posiciones dinámicas
  const lightPositions = [];
  const spotCount = Math.max(3, Math.floor(dynamicLength / 6));

  for (let i = 0; i < spotCount; i++) {
    const x =
      dynamicCenterX -
      dynamicLength / 2 +
      (i + 1) * (dynamicLength / (spotCount + 1));
    lightPositions.push(x);
  }

  return (
    <>
      {/* Iluminación ambiental base - MÁS TENUE */}
      <ambientLight
        intensity={ambientOverride ?? preset.ambient.intensity}
        color={preset.ambient.color}
      />

      {/* Hemisphere light más suave */}
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#8b7355"
        intensity={0.15} // Reducido de 0.3 a 0.15
      />

      {/* Key lights - Iluminación principal simplificada */}
      {lightPositions.map((x, i) => (
        <React.Fragment key={`key-${i}`}>
          <directionalLight
            position={[x, CEILING_HEIGHT - 0.5, 2]}
            intensity={preset.key.intensity}
            color={preset.key.color}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={20}
            shadow-camera-near={0.1}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-bias={-0.0001}
          />

          {/* Spot lights para obras - mantenidos */}
          <spotLight
            position={[x, CEILING_HEIGHT - 0.3, 0]}
            target-position={[x, 1.8, -6.5]}
            intensity={preset.spots.intensity}
            angle={preset.spots.angle}
            penumbra={preset.spots.penumbra}
            distance={8}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        </React.Fragment>
      ))}

      {/* Luces de ambiente laterales - MÁS TENUES */}
      <pointLight
        position={[dynamicCenterX, CEILING_HEIGHT - 2, 6]}
        intensity={0.8} // Reducido de 1.2 a 0.8
        distance={12}
        color="#f8f8ff"
        decay={2}
      />

      <pointLight
        position={[dynamicCenterX, CEILING_HEIGHT - 2, -6]}
        intensity={0.8} // Reducido de 1.2 a 0.8
        distance={12}
        color="#f8f8ff"
        decay={2}
      />
    </>
  );
}

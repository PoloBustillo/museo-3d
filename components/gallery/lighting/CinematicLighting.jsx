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
  // Configuraciones de iluminación más sofisticadas
  const LIGHTING_PRESETS = {
    museum: {
      ambient: { intensity: 0.3, color: "#f5f5dc" },
      key: { intensity: 2.5, color: "#fff8e1", distance: 12 },
      fill: { intensity: 1.2, color: "#e3f2fd", distance: 8 },
      rim: { intensity: 1.8, color: "#fff3e0", distance: 6 },
      accent: { intensity: 3.0, color: "#ffffff", distance: 4 },
      spots: { intensity: 4.0, angle: 0.3, penumbra: 0.5 },
    },
    dramatic: {
      ambient: { intensity: 0.1, color: "#1a1a1a" },
      key: { intensity: 4.0, color: "#ffebee", distance: 10 },
      fill: { intensity: 0.8, color: "#e8eaf6", distance: 6 },
      rim: { intensity: 2.5, color: "#fff9c4", distance: 5 },
      accent: { intensity: 5.0, color: "#ffffff", distance: 3 },
      spots: { intensity: 6.0, angle: 0.2, penumbra: 0.7 },
    },
    golden: {
      ambient: { intensity: 0.4, color: "#ffd54f" },
      key: { intensity: 2.8, color: "#fff8e1", distance: 11 },
      fill: { intensity: 1.5, color: "#ffecb3", distance: 9 },
      rim: { intensity: 2.0, color: "#ffe082", distance: 7 },
      accent: { intensity: 3.5, color: "#ffff8d", distance: 5 },
      spots: { intensity: 4.5, angle: 0.25, penumbra: 0.4 },
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
      {/* Iluminación ambiental base */}
      <ambientLight
        intensity={ambientOverride ?? preset.ambient.intensity}
        color={preset.ambient.color}
      />

      {/* Hemisphere light para simular luz del cielo */}
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#8b7355"
        intensity={0.3}
      />

      {/* Key lights - Iluminación principal */}
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

          {/* Fill lights - Iluminación de relleno */}
          <pointLight
            position={[x - 2, CEILING_HEIGHT - 1, -1]}
            intensity={preset.fill.intensity}
            distance={preset.fill.distance}
            color={preset.fill.color}
            decay={2}
          />

          {/* Rim lights - Iluminación de contorno */}
          <pointLight
            position={[x + 2, CEILING_HEIGHT - 1.5, 1]}
            intensity={preset.rim.intensity}
            distance={preset.rim.distance}
            color={preset.rim.color}
            decay={2}
          />

          {/* Accent lights - Luces de acento para obras */}
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

      {/* Luces de ambiente para paredes laterales */}
      <pointLight
        position={[dynamicCenterX, CEILING_HEIGHT - 2, 6]}
        intensity={1.5}
        distance={12}
        color="#f8f8ff"
        decay={2}
      />

      <pointLight
        position={[dynamicCenterX, CEILING_HEIGHT - 2, -6]}
        intensity={1.5}
        distance={12}
        color="#f8f8ff"
        decay={2}
      />

      {/* Luces decorativas para el techo */}
      {lightPositions.map((x, i) => (
        <React.Fragment key={`ceiling-${i}`}>
          {/* Fixture visual */}
          <mesh position={[x, CEILING_HEIGHT - 0.2, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
            <meshPhysicalMaterial
              color="#2c2c2c"
              roughness={0.2}
              metalness={0.8}
              clearcoat={0.9}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Ring decorativo */}
          <mesh
            position={[x, CEILING_HEIGHT - 0.19, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.45, 0.035, 12, 24]} />
            <meshPhysicalMaterial
              color={lightingPreset === "dramatic" ? "#b8860b" : "#daa520"}
              roughness={0.3}
              metalness={0.7}
              clearcoat={0.8}
            />
          </mesh>
        </React.Fragment>
      ))}
    </>
  );
}

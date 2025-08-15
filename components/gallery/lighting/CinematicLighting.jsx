import React from "react";
import { GALLERY_CONFIG } from "../core/config.js";

const { CEILING_HEIGHT } = GALLERY_CONFIG;

/**
 * Sistema de iluminación profesional del techo para museo
 * SOLO LUCES DEL TECHO - Sistema profesional optimizado
 */
export function CinematicLighting({
  dynamicLength,
  dynamicCenterX,
  lightingPreset = "museum",
  ambientOverride = null,
}) {
  // Calcular posiciones dinámicas de focos del techo
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
      {/* LUCES DEL TECHO - SISTEMA PROFESIONAL QUE ILUMINA TODA LA SALA */}

      {/* Iluminación ambiental suficiente para ver toda la sala */}

      <ambientLight intensity={0.45} color="#f7f7f7" />

      {/* Luz hemisférica para iluminación aún más suave y difusa */}
      <hemisphereLight
        skyColor="#f9f9f9"
        groundColor="#ededed"
        intensity={0.38}
      />

      {/* Sistema de focos profesionales del techo */}
      {lightPositions.map((x, i) => (
        <React.Fragment key={`ceiling-light-${i}`}>
          {/* Foco principal del techo - iluminación profesional */}

          <spotLight
            position={[x, CEILING_HEIGHT - 0.1, 0]}
            target-position={[x, 0, 0]}
            intensity={6.5}
            angle={0.7}
            penumbra={0.55}
            distance={CEILING_HEIGHT + 3}
            color="#f8f8f8"
            castShadow={i < 2}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={CEILING_HEIGHT + 5}
            shadow-bias={-0.0001}
          />

          {/* Foco adicional para obras de arte */}

          <spotLight
            position={[x, CEILING_HEIGHT - 0.05, -2]}
            target-position={[x, 1.8, -6.8]}
            intensity={4.2}
            angle={0.32}
            penumbra={0.6}
            distance={12}
            color="#fffbe6"
            castShadow={i === 0}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />

          {/* Foco para iluminar el piso y paredes */}

          <spotLight
            position={[x, CEILING_HEIGHT - 0.1, 2]}
            target-position={[x, 0, 3]}
            intensity={3.2}
            angle={0.6}
            penumbra={0.7}
            distance={CEILING_HEIGHT + 2}
            color="#f8f8f8"
            castShadow={false}
          />
        </React.Fragment>
      ))}

      {/* Focos centrales del techo para cobertura completa */}

      <spotLight
        position={[dynamicCenterX, CEILING_HEIGHT - 0.1, 0]}
        target-position={[dynamicCenterX, 0, 0]}
        intensity={5.5}
        angle={0.9}
        penumbra={0.7}
        distance={CEILING_HEIGHT + 3}
        color="#f8f8f8"
        castShadow={true}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Focos laterales del techo para iluminar esquinas */}

      <spotLight
        position={[dynamicCenterX - dynamicLength / 3, CEILING_HEIGHT - 0.1, 0]}
        target-position={[dynamicCenterX - dynamicLength / 3, 0, 0]}
        intensity={4.2}
        angle={0.8}
        penumbra={0.7}
        distance={CEILING_HEIGHT + 2}
        color="#f8f8f8"
        castShadow={false}
      />

      <spotLight
        position={[dynamicCenterX + dynamicLength / 3, CEILING_HEIGHT - 0.1, 0]}
        target-position={[dynamicCenterX + dynamicLength / 3, 0, 0]}
        intensity={4.2}
        angle={0.8}
        penumbra={0.7}
        distance={CEILING_HEIGHT + 2}
        color="#f8f8f8"
        castShadow={false}
      />
    </>
  );
}

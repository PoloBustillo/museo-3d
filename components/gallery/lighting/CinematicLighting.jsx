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
      {/* LUCES DEL TECHO - SISTEMA PROFESIONAL CON DECAY REALISTA */}

      {/* Iluminación ambiental MUY REDUCIDA para permitir contraste */}
      <ambientLight intensity={0.15} color="#f0f0f0" />

      {/* Luz hemisférica mínima */}
      <hemisphereLight
        skyColor="#f5f5f5"
        groundColor="#e0e0e0"
        intensity={0.12}
      />

      {/* Sistema de focos profesionales del techo */}
      {lightPositions.map((x, i) => (
        <React.Fragment key={`ceiling-light-${i}`}>
          {/* Foco principal del techo - EXACTAMENTE desde lámparas */}
          <spotLight
            position={[x, CEILING_HEIGHT - 0.08, 0]}
            target-position={[x, 0, 0]}
            intensity={8.0} // Aumentado para compensar decay
            angle={0.5} // Ángulo más cerrado
            penumbra={0.7} // Mayor penumbra
            distance={CEILING_HEIGHT + 1} // Distancia más corta
            decay={2} // Decay físicamente correcto
            color="#f8f8f8"
            castShadow={i < 2}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={CEILING_HEIGHT + 5}
            shadow-bias={-0.0001}
          />

          {/* Foco adicional para obras - desde lámparas del techo */}
          <spotLight
            position={[x, CEILING_HEIGHT - 0.08, -2]}
            target-position={[x, 1.8, -6.8]}
            intensity={6.0} // Aumentado para compensar decay
            angle={0.25} // Ángulo más cerrado
            penumbra={0.5}
            distance={10} // Distancia más corta
            decay={2}
            color="#fffbe6"
            castShadow={i === 0}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />

          {/* Foco para iluminar el piso y paredes */}

          {/* Foco para piso - desde lámparas del techo */}
          <spotLight
            position={[x, CEILING_HEIGHT - 0.08, 2]}
            target-position={[x, 0, 3]}
            intensity={4.0} // Reducido
            angle={0.4} // Más cerrado
            penumbra={0.8}
            distance={CEILING_HEIGHT} // Distancia más corta
            decay={2}
            color="#f8f8f8"
            castShadow={false}
          />
        </React.Fragment>
      ))}

      {/* Foco central - desde lámpara central del techo */}
      <spotLight
        position={[dynamicCenterX, CEILING_HEIGHT - 0.08, 0]}
        target-position={[dynamicCenterX, 0, 0]}
        intensity={7.0} // Reducido pero compensado por decay
        angle={0.6} // Más cerrado
        penumbra={0.8}
        distance={CEILING_HEIGHT + 1} // Distancia más corta
        decay={2}
        color="#f8f8f8"
        castShadow={true}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Focos laterales - desde lámparas laterales del techo */}
      <spotLight
        position={[
          dynamicCenterX - dynamicLength / 3,
          CEILING_HEIGHT - 0.08,
          0,
        ]}
        target-position={[dynamicCenterX - dynamicLength / 3, 0, 0]}
        intensity={3.0} // Muy reducido
        angle={0.5} // Más cerrado
        penumbra={0.9} // Máxima penumbra
        distance={CEILING_HEIGHT - 1} // Distancia muy corta
        decay={2}
        color="#f8f8f8"
        castShadow={false}
      />

      <spotLight
        position={[
          dynamicCenterX + dynamicLength / 3,
          CEILING_HEIGHT - 0.08,
          0,
        ]}
        target-position={[dynamicCenterX + dynamicLength / 3, 0, 0]}
        intensity={3.0} // Muy reducido
        angle={0.5}
        penumbra={0.9}
        distance={CEILING_HEIGHT - 1}
        decay={2}
        color="#f8f8f8"
        castShadow={false}
      />
    </>
  );
}

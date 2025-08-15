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
      {/* LUCES DEL TECHO PROFESIONALES - CON FALLOFF REALISTA */}

      {/* Iluminación ambiental MUY REDUCIDA para crear contraste */}
      <ambientLight intensity={ambientIntensity * 0.3} color="#f0f0f0" />

      {/* Luz hemisférica mínima solo para evitar negro total */}
      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#cccccc"
        intensity={0.15}
      />

      {/* Focos principales del techo - EXACTAMENTE desde las lámparas */}
      {Array.from({ length: numCeilingLights }).map((_, i) => (
        <spotLight
          key={`ceiling-spot-${i}`}
          position={[
            dynamicCenterX -
              dynamicLength / 2 +
              2 +
              i * (dynamicLength / (numCeilingLights - 1)),
            CEILING_HEIGHT - 0.08, // Misma altura que las lámparas
            0,
          ]}
          target-position={[
            dynamicCenterX -
              dynamicLength / 2 +
              2 +
              i * (dynamicLength / (numCeilingLights - 1)),
            0,
            0,
          ]}
          intensity={15.0}
          angle={0.5} // Ángulo más cerrado para focos concentrados
          penumbra={0.6} // Mayor penumbra para transición suave
          distance={CEILING_HEIGHT + 1} // Distancia más corta para decay
          decay={2} // Decay físicamente correcto
          color="#ffffff"
          castShadow={i < 2} // Solo primeros 2 focos con sombras
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
      ))}

      {/* Focos específicos para obras - desde lámparas del techo */}
      <spotLight
        position={[dynamicCenterX, CEILING_HEIGHT - 0.08, -1]}
        target-position={[dynamicCenterX, 2, -6.5]}
        intensity={18.0}
        angle={0.3} // Ángulo muy cerrado para iluminar solo las obras
        penumbra={0.5}
        distance={10} // Distancia más corta para mayor contraste
        decay={2}
        color="#fff9f0"
        castShadow={true}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight
        position={[dynamicCenterX, CEILING_HEIGHT - 0.08, 1]}
        target-position={[dynamicCenterX, 2, 6.5]}
        intensity={18.0}
        angle={0.3}
        penumbra={0.5}
        distance={10}
        decay={2}
        color="#fff9f0"
        castShadow={false} // Solo uno con sombras para optimizar
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Focos laterales desde lámparas del techo */}
      <spotLight
        position={[
          dynamicCenterX - dynamicLength / 4,
          CEILING_HEIGHT - 0.08,
          0,
        ]}
        target-position={[dynamicCenterX - dynamicLength / 4, 0, 0]}
        intensity={6.0} // Reducida para crear zonas más oscuras
        angle={0.4} // Ángulo más cerrado
        penumbra={0.7} // Mayor penumbra para transición suave
        distance={CEILING_HEIGHT} // Distancia más corta
        decay={2}
        color="#ffffff"
        castShadow={false}
      />

      <spotLight
        position={[
          dynamicCenterX + dynamicLength / 4,
          CEILING_HEIGHT - 0.08,
          0,
        ]}
        target-position={[dynamicCenterX + dynamicLength / 4, 0, 0]}
        intensity={6.0}
        angle={0.4}
        penumbra={0.7}
        distance={CEILING_HEIGHT}
        decay={2}
        color="#ffffff"
        castShadow={false}
      />

      {/* Luces adicionales para esquinas - muy tenues */}
      <pointLight
        position={[
          dynamicCenterX - dynamicLength / 2 + 1,
          CEILING_HEIGHT - 1,
          -3,
        ]}
        intensity={2.0}
        distance={4}
        decay={2}
        color="#f0f0f0"
      />

      <pointLight
        position={[
          dynamicCenterX + dynamicLength / 2 - 1,
          CEILING_HEIGHT - 1,
          3,
        ]}
        intensity={2.0}
        distance={4}
        decay={2}
        color="#f0f0f0"
      />
    </>
  );
}

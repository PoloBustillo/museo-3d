import React from "react";

/**
 * Componente reutilizable para materiales PBR con soporte para propiedades avanzadas
 * OPTIMIZADO: Reduce el uso de texturas para evitar exceder el límite de GPU
 */
export function PBRMaterial({
  maps,
  color,
  metalness = 0.1,
  roughness = 0.9,
  side = null,
  // Propiedades avanzadas para meshPhysicalMaterial
  clearcoat = 0,
  clearcoatRoughness = 0,
  transmission = 0,
  thickness = 0,
  ior = 1.5,
  sheen = 0,
  sheenRoughness = 0,
  sheenColor = undefined,
  reflectivity = 0.5,
  iridescence = 0,
  iridescenceIOR = 1.3,
  specularIntensity = 1,
  specularColor = undefined,
  envMapIntensity = 1,
  physical = false, // Flag para usar meshPhysicalMaterial
  // Nueva prop para optimización
  textureOptimization = "auto", // "auto", "minimal", "none"
}) {
  // Determinar si usar material físico basado en propiedades avanzadas
  const usePhysicalMaterial =
    physical ||
    clearcoat > 0 ||
    transmission > 0 ||
    sheen > 0 ||
    iridescence > 0;

  // OPTIMIZACIÓN: Limitar texturas basado en el modo
  const getOptimizedMaps = () => {
    if (!maps) return {};

    switch (textureOptimization) {
      case "minimal":
        // Solo la textura principal
        return { color: maps.color };
      case "none":
        // Sin texturas, solo colores procedimentales
        return {};
      case "auto":
      default:
        // Máximo 2 texturas simultáneas para este material
        return {
          color: maps.color,
          normal: maps.normal, // Solo normal si es crítica
          // Omitir roughness, metalness, ao para reducir carga de GPU
        };
    }
  };

  const optimizedMaps = getOptimizedMaps();

  const materialProps = {
    map: optimizedMaps.color || null,
    normalMap: optimizedMaps.normal || null,
    // Usar valores procedimentales en lugar de mapas
    color: color,
    metalness: metalness, // Valor fijo en lugar de mapa
    roughness: roughness, // Valor fijo en lugar de mapa
    side: side,
    envMapIntensity: envMapIntensity,
  };

  if (usePhysicalMaterial) {
    // meshPhysicalMaterial con propiedades avanzadas pero texturas limitadas
    const physicalProps = {
      ...materialProps,
      clearcoat,
      clearcoatRoughness,
      transmission,
      thickness,
      ior,
      sheen,
      sheenRoughness,
      reflectivity,
      iridescence,
      iridescenceIOR,
      specularIntensity,
    };

    // Solo agregar propiedades de color si están definidas
    if (sheenColor !== undefined) {
      physicalProps.sheenColor = sheenColor;
    }
    if (specularColor !== undefined) {
      physicalProps.specularColor = specularColor;
    }

    return <meshPhysicalMaterial {...physicalProps} />;
  }

  // meshStandardMaterial para casos simples con texturas limitadas
  if (optimizedMaps.color) {
    return <meshStandardMaterial {...materialProps} />;
  }

  return <meshStandardMaterial color={color} side={side} />;
}

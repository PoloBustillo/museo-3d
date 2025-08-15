import React from "react";
import * as THREE from "three";

/**
 * Sistema de materiales avanzados con múltiples opciones
 * OPTIMIZADO: Reducido uso de texturas para mejorar rendimiento
 */

// Material de mármol premium con efectos procedimentales OPTIMIZADO PARA LUZ TENUE
export function MarbleMaterial({
  color = "#f8f8f8",
  opacity = 1,
  maps = {},
  side = THREE.FrontSide,
  type = "carrara", // "carrara", "nero"
}) {
  const marbleColors = {
    carrara: "#fafafa", // Más claro para mejor visibilidad
    nero: "#3a3a3a", // Menos oscuro
  };

  return (
    <meshPhysicalMaterial
      color={marbleColors[type] || color}
      // OPTIMIZACIÓN: Sin texturas, efectos procedimentales mejorados para poca luz
      roughness={0.1} // Menos rugoso para mejor reflectancia
      metalness={0.01} // Mínimo para preservar apariencia mármol
      clearcoat={0.4} // Más clearcoat para brillo
      clearcoatRoughness={0.05} // Más pulido
      transmission={0.05} // Sutil transparencia
      thickness={0.3}
      envMapIntensity={1.5} // Mejor reflejo ambiental
      opacity={opacity}
      side={side}
      transparent={opacity < 1}
    />
  );
}

// Material de madera premium (PROCEDURAL)
export function PremiumWoodMaterial({
  color = "#8B4513",
  opacity = 1,
  maps = {},
  side = THREE.FrontSide,
  type = "walnut", // "walnut", "oak"
}) {
  const woodColors = {
    walnut: "#654321",
    oak: "#D2B48C",
  };

  return (
    <meshPhysicalMaterial
      color={woodColors[type] || color}
      // Sin texturas para optimización
      roughness={0.8}
      metalness={0.0}
      clearcoat={0.1}
      clearcoatRoughness={0.7}
      sheen={0.2}
      sheenColor="#D2691E"
      opacity={opacity}
      side={side}
      transparent={opacity < 1}
    />
  );
}

// Material metálico pulido (PROCEDURAL)
export function BrushedMetalMaterial({
  color = "#C0C0C0",
  opacity = 1,
  maps = {},
  side = THREE.FrontSide,
  type = "silver", // "silver", "gold", "copper"
}) {
  const metalColors = {
    silver: "#C0C0C0",
    gold: "#FFD700",
    copper: "#B87333",
  };

  return (
    <meshPhysicalMaterial
      color={metalColors[type] || color}
      // Sin texturas, efectos metálicos procedimentales
      roughness={0.2}
      metalness={0.9}
      clearcoat={0.8}
      clearcoatRoughness={0.1}
      opacity={opacity}
      side={side}
      transparent={opacity < 1}
    />
  );
}

// Material de vidrio (OPTIMIZADO)
export function GlassMaterial({
  color = "#ffffff",
  opacity = 0.1,
  maps = {},
  side = THREE.FrontSide,
  type = "clear", // "clear", "frosted"
}) {
  const glassSettings = {
    clear: { transmission: 0.9, roughness: 0.0 },
    frosted: { transmission: 0.5, roughness: 0.3 },
  };

  const settings = glassSettings[type] || glassSettings.clear;

  return (
    <meshPhysicalMaterial
      color={color}
      // Sin texturas para vidrio optimizado
      transmission={settings.transmission}
      thickness={0.5}
      roughness={settings.roughness}
      metalness={0.0}
      clearcoat={1.0}
      clearcoatRoughness={0.0}
      opacity={opacity}
      side={side}
      transparent={true}
    />
  );
}

// Material de tela de lujo (SIMPLIFICADO)
export function LuxuryFabricMaterial({
  color = "#8B0000",
  opacity = 1,
  maps = {},
  side = THREE.FrontSide,
  type = "velvet", // "velvet", "silk"
}) {
  const fabricColors = {
    velvet: "#8B0000",
    silk: "#4682B4",
  };

  const fabricSettings = {
    velvet: { sheen: 0.8, roughness: 0.9 },
    silk: { sheen: 0.5, roughness: 0.3 },
  };

  const settings = fabricSettings[type] || fabricSettings.velvet;

  return (
    <meshPhysicalMaterial
      color={fabricColors[type] || color}
      // Sin texturas, solo efectos de tela
      roughness={settings.roughness}
      metalness={0.0}
      sheen={settings.sheen}
      sheenColor={fabricColors[type] || color}
      clearcoat={0.0}
      opacity={opacity}
      side={side}
      transparent={opacity < 1}
    />
  );
}

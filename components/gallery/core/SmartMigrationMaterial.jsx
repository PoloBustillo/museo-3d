import React from 'react';
import { APIAwarePBRMaterial } from './APIAwarePBRMaterial.jsx';
import { useTexturePerformanceAnalyzer } from '../../../hooks/useTexturePerformanceAnalyzer.js';

/**
 * MIGRACIÓN INTELIGENTE: FastPBRMaterial → APIAwarePBRMaterial
 * 
 * Wrapper que reemplaza gradualmente FastPBRMaterial con el sistema inteligente
 * Mantiene compatibilidad completa mientras mejora el performance y visual
 */
export const SmartMigrationMaterial = ({
  // Props originales de FastPBRMaterial
  mode = "minimal",
  color = [1, 1, 1],
  roughness = 0.8,
  metalness = 0.2,
  children,
  
  // Nuevas props para migración inteligente
  salaId = null,
  materialType = "wall", // "wall", "floor", "ceiling", "decoration"
  enableAPITextures = true,
  enableMigration = true,
  migrationMode = "auto", // "auto", "force-fast", "force-api"
  
  ...props
}) => {
  
  const {
    frameRate,
    canLoadTexture,
    getStrategy,
    isPerformanceGood,
    debugInfo
  } = useTexturePerformanceAnalyzer();
  
  const strategy = getStrategy();

  // Determinar si usar el sistema nuevo o mantener FastPBRMaterial
  const shouldUseMigration = React.useMemo(() => {
    // Si está deshabilitada la migración, usar FastPBRMaterial
    if (!enableMigration) return false;
    
    // Si se fuerza el modo rápido, usar FastPBRMaterial
    if (migrationMode === "force-fast") return false;
    
    // Si se fuerza API, usar siempre el nuevo sistema
    if (migrationMode === "force-api") return true;
    
    // Modo automático: decidir según performance
    switch (strategy.strategy) {
      case "progressive":
        // Performance bueno: usar nuevo sistema con texturas
        return enableAPITextures && salaId;
      
      case "minimal":
        // Performance intermedio: usar nuevo sistema solo con colores API
        return enableAPITextures && salaId;
      
      case "emergency":
      default:
        // Performance crítico: mantener FastPBRMaterial
        return false;
    }
  }, [
    enableMigration, 
    migrationMode, 
    strategy.strategy, 
    enableAPITextures, 
    salaId
  ]);

  // Si debemos usar la migración, usar APIAwarePBRMaterial
  if (shouldUseMigration) {
    return (
      <APIAwarePBRMaterial
        salaId={salaId}
        type={materialType}
        fallbackColor={Array.isArray(color) ? `rgb(${color.map(c => Math.round(c * 255)).join(',')})` : color}
        roughness={roughness}
        metalness={metalness}
        force={migrationMode === "force-api"}
        {...props}
      />
    );
  }

  // Fallback: usar material básico ultraligero
  const materialProps = React.useMemo(() => ({
    color: Array.isArray(color) ? color : color,
    roughness,
    metalness,
    ...props
  }), [color, roughness, metalness, props]);

  return (
    <meshStandardMaterial
      {...materialProps}
    />
  );
};

/**
 * REEMPLAZO DIRECTO COMPATIBLE CON FastPBRMaterial
 * Drop-in replacement que mantiene toda la funcionalidad existente
 */
export const FastPBRMaterial = SmartMigrationMaterial;

/**
 * VERSIÓN CON MIGRACIÓN EXPLÍCITA
 * Para usar en lugares donde queremos control explícito de la migración
 */
export const IntelligentPBRMaterial = ({
  salaId,
  materialType = "wall",
  enableAPITextures = true,
  migrationMode = "auto",
  ...props
}) => {
  return (
    <SmartMigrationMaterial
      salaId={salaId}
      materialType={materialType}
      enableAPITextures={enableAPITextures}
      enableMigration={true}
      migrationMode={migrationMode}
      {...props}
    />
  );
};

/**
 * HOOK PARA MONITOREAR EL ESTADO DE MIGRACIÓN
 * Útil para debugging y analytics
 */
export const useMigrationStatus = () => {
  const {
    frameRate,
    canLoadTexture,
    getStrategy,
    isPerformanceGood,
    debugInfo
  } = useTexturePerformanceAnalyzer();
  
  const strategy = getStrategy();
  
  return React.useMemo(() => ({
    // Estado actual
    frameRate,
    strategy: strategy.strategy,
    canLoadTextures: canLoadTexture(),
    performanceLevel: isPerformanceGood ? 'good' : 'poor',
    
    // Recomendaciones
    recommendsAPITextures: strategy.loadTextures === true,
    recommendsAPIColors: strategy.loadTextures === 'colors',
    recommendsEmergencyMode: strategy.strategy === 'emergency',
    
    // Stats
    texturesActive: debugInfo.texturesLoaded,
    maxTextures: debugInfo.maxTextures,
    
    // Migration insights
    migrationBeneficial: strategy.strategy !== 'emergency',
    migrationSafe: frameRate > 25,
  }), [
    frameRate, 
    strategy, 
    canLoadTexture, 
    isPerformanceGood, 
    debugInfo
  ]);
};

export default SmartMigrationMaterial;

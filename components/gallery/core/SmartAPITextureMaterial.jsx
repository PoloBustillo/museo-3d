import React, { useMemo } from 'react';
import { useTexturePerformanceAnalyzer } from '../utils/texturePerformanceAnalyzer.js';

/**
 * SISTEMA DE TEXTURAS INTELIGENTE CON API
 * Combina datos de la API con análisis de performance
 */
export const SmartAPITextureMaterial = ({
  apiTextureData = null, // Datos de textura desde la API
  fallbackColor = "#f0f0f0",
  type = "wall", // wall, floor, ceiling
  priority = 1,
  ...materialProps
}) => {
  
  // Analizar capacidad de performance actual
  const { canLoadTexture, getStrategy, getColorFromAPI } = useTexturePerformanceAnalyzer();
  
  // Determinar estrategia de carga basada en performance
  const textureStrategy = useMemo(() => {
    if (!apiTextureData) {
      return { mode: 'color', value: fallbackColor };
    }
    
    const strategy = getStrategy();
    
    switch (strategy.strategy) {
      case 'emergency':
        // Solo colores - máximo performance
        return {
          mode: 'color',
          value: getAPITextureColor(apiTextureData) || fallbackColor
        };
        
      case 'minimal':
        // Colores inteligentes basados en API
        return {
          mode: 'smartColor',
          value: getAPITextureColor(apiTextureData) || fallbackColor,
          apiData: apiTextureData
        };
        
      case 'progressive':
        // Texturas completas si performance permite
        if (canLoadTexture()) {
          return {
            mode: 'texture',
            value: getAPITextureURL(apiTextureData),
            color: getAPITextureColor(apiTextureData) || fallbackColor
          };
        }
        // Fallback a color si no puede cargar
        return {
          mode: 'smartColor',
          value: getAPITextureColor(apiTextureData) || fallbackColor
        };
        
      default:
        return { mode: 'color', value: fallbackColor };
    }
  }, [apiTextureData, fallbackColor, canLoadTexture]);

  // Propiedades del material basadas en estrategia
  const materialConfig = useMemo(() => {
    const baseConfig = {
      roughness: getAPIRoughness(apiTextureData) || 0.8,
      metalness: getAPIMetalness(apiTextureData) || 0.1,
      ...materialProps
    };

    switch (textureStrategy.mode) {
      case 'texture':
        return {
          ...baseConfig,
          color: textureStrategy.color,
          // Aquí cargaríamos la textura real en un futuro
          // map: useTexture(textureStrategy.value)
        };
        
      case 'smartColor':
        return {
          ...baseConfig,
          color: enhanceColorWithAPIData(textureStrategy.value, textureStrategy.apiData),
          // Simular propiedades basadas en tipo de textura
          roughness: getSmartRoughness(apiTextureData, type),
          metalness: getSmartMetalness(apiTextureData, type)
        };
        
      case 'color':
      default:
        return {
          ...baseConfig,
          color: textureStrategy.value
        };
    }
  }, [textureStrategy, apiTextureData, type, materialProps]);

  return (
    <meshStandardMaterial {...materialConfig} />
  );
};

/**
 * Extrae color inteligente desde datos de la API
 */
function getAPITextureColor(apiData) {
  if (!apiData) return null;
  
  // Si la API incluye información de color
  if (apiData.dominantColor) {
    return apiData.dominantColor;
  }
  
  // Mapeo basado en nombre de textura
  const name = apiData.name?.toLowerCase() || '';
  
  const colorMap = {
    // Maderas
    'wood': '#8b4513',
    'oak': '#deb887',
    'pine': '#ffd700',
    'mahogany': '#c04000',
    
    // Piedras
    'marble': '#f8f8ff',
    'granite': '#708090',
    'stone': '#a9a9a9',
    'concrete': '#bebebe',
    
    // Metales
    'metal': '#c0c0c0',
    'steel': '#b0c4de',
    'aluminum': '#d3d3d3',
    'iron': '#696969',
    
    // Cerámicas
    'tile': '#f5f5dc',
    'ceramic': '#fff8dc',
    'porcelain': '#f0f8ff',
    
    // Textiles
    'fabric': '#dda0dd',
    'carpet': '#8b0000',
    'leather': '#8b4513'
  };
  
  for (const [keyword, color] of Object.entries(colorMap)) {
    if (name.includes(keyword)) {
      return color;
    }
  }
  
  // Color por categoría
  if (apiData.category) {
    const categoryColors = {
      wall: '#f0f0f0',
      floor: '#e8e8e8',
      ceiling: '#fafafa',
      generic: '#f5f5f5'
    };
    return categoryColors[apiData.category] || '#f0f0f0';
  }
  
  return null;
}

/**
 * Obtiene URL de textura desde API
 */
function getAPITextureURL(apiData) {
  if (!apiData) return null;
  
  // Priorizar albedo/color map
  if (apiData.maps?.albedo) return apiData.maps.albedo;
  if (apiData.maps?.color) return apiData.maps.color;
  if (apiData.previewUrl) return apiData.previewUrl;
  
  return null;
}

/**
 * Obtiene roughness desde API o estima
 */
function getAPIRoughness(apiData) {
  if (!apiData) return 0.8;
  
  // Si la API incluye datos de roughness
  if (apiData.materialProperties?.roughness) {
    return apiData.materialProperties.roughness;
  }
  
  // Estimar basado en tipo de material
  const name = apiData.name?.toLowerCase() || '';
  
  if (name.includes('metal')) return 0.3;
  if (name.includes('marble')) return 0.1;
  if (name.includes('wood')) return 0.7;
  if (name.includes('fabric')) return 0.9;
  if (name.includes('concrete')) return 0.8;
  
  return 0.8; // Default
}

/**
 * Obtiene metalness desde API o estima
 */
function getAPIMetalness(apiData) {
  if (!apiData) return 0.1;
  
  // Si la API incluye datos de metalness
  if (apiData.materialProperties?.metalness) {
    return apiData.materialProperties.metalness;
  }
  
  // Estimar basado en tipo de material
  const name = apiData.name?.toLowerCase() || '';
  
  if (name.includes('metal')) return 0.9;
  if (name.includes('steel')) return 0.8;
  if (name.includes('aluminum')) return 0.7;
  if (name.includes('gold')) return 1.0;
  
  return 0.1; // Default para materiales no metálicos
}

/**
 * Mejora color con datos adicionales de la API
 */
function enhanceColorWithAPIData(baseColor, apiData) {
  if (!apiData) return baseColor;
  
  // Si hay información de temperatura de color
  if (apiData.colorTemperature) {
    // Ajustar color basado en temperatura (cálido/frío)
    return adjustColorTemperature(baseColor, apiData.colorTemperature);
  }
  
  return baseColor;
}

/**
 * Ajusta color basado en temperatura
 */
function adjustColorTemperature(color, temperature) {
  // Simplificado - en una implementación real usaríamos bibliotecas de color
  if (temperature === 'warm') {
    // Agregar un poco de rojo/amarillo
    return color;
  } else if (temperature === 'cool') {
    // Agregar un poco de azul
    return color;
  }
  
  return color;
}

/**
 * Calcula roughness inteligente basado en API y tipo
 */
function getSmartRoughness(apiData, type) {
  const baseRoughness = getAPIRoughness(apiData);
  
  // Ajustar según tipo de superficie
  switch (type) {
    case 'floor':
      return Math.min(baseRoughness + 0.1, 1.0); // Pisos más rugosos
    case 'ceiling':
      return Math.max(baseRoughness - 0.1, 0.0); // Techos más lisos
    case 'wall':
    default:
      return baseRoughness;
  }
}

/**
 * Calcula metalness inteligente basado en API y tipo
 */
function getSmartMetalness(apiData, type) {
  const baseMetalness = getAPIMetalness(apiData);
  
  // Ajustar según tipo - pisos suelen ser menos metálicos
  if (type === 'floor' && baseMetalness > 0.5) {
    return baseMetalness * 0.7;
  }
  
  return baseMetalness;
}

export default SmartAPITextureMaterial;

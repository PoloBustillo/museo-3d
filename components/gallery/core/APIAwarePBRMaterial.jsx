import React, { useMemo, useEffect, useState } from 'react';
import { SmartAPITextureMaterial } from './SmartAPITextureMaterial.jsx';
import { useTextureRecommendations } from '../../../hooks/useTextureRecommendations.js';
import { useTexturePerformanceAnalyzer } from '../../../hooks/useTexturePerformanceAnalyzer.js';

/**
 * MATERIAL INTELIGENTE QUE USA API DE TEXTURAS
 * Combina recomendaciones de API con análisis de performance
 */
export const APIAwarePBRMaterial = ({
  salaId = null,
  type = "wall", // wall, floor, ceiling
  fallbackColor = "#f0f0f0",
  priority = 1,
  force = false, // Forzar carga de texturas independiente del performance
  ...materialProps
}) => {
  
  // Estado para datos de textura desde API
  const [apiTextureData, setApiTextureData] = useState(null);
  
  // Hook de recomendaciones de texturas
  const {
    currentTextures,
    wallRecommendations,
    floorRecommendations,
    getTextureUrl,
    loading: apiLoading
  } = useTextureRecommendations(salaId, type === 'wall' ? 'wall' : type === 'floor' ? 'floor' : 'all');
  
  // Análisis de performance
  const {
    canLoadTexture,
    getStrategy,
    getColorFromAPI,
    isPerformanceGood,
    debugInfo
  } = useTexturePerformanceAnalyzer();

  // Obtener datos de textura desde la API
  useEffect(() => {
    if (!salaId || apiLoading) return;
    
    const getTextureData = () => {
      let textureInfo = null;
      
      // Obtener textura actual de la sala
      if (type === 'wall' && currentTextures.pared) {
        textureInfo = {
          name: currentTextures.pared,
          url: getTextureUrl(currentTextures.pared, 'albedo'),
          category: 'wall'
        };
      } else if (type === 'floor' && currentTextures.piso) {
        textureInfo = {
          name: currentTextures.piso,
          url: getTextureUrl(currentTextures.piso, 'albedo'),
          category: 'floor'
        };
      }
      
      // Si no hay textura actual, usar la mejor recomendación
      if (!textureInfo) {
        const recommendations = type === 'wall' ? wallRecommendations : floorRecommendations;
        if (recommendations && recommendations.length > 0) {
          const bestRecommendation = recommendations[0];
          textureInfo = {
            name: bestRecommendation.name,
            url: getTextureUrl(bestRecommendation.name, 'albedo'),
            category: type,
            score: bestRecommendation.score,
            reason: bestRecommendation.reason,
            maps: bestRecommendation.maps
          };
        }
      }
      
      setApiTextureData(textureInfo);
    };
    
    getTextureData();
  }, [salaId, currentTextures, wallRecommendations, floorRecommendations, type, getTextureUrl, apiLoading]);

  // Configuración del material basada en performance y API
  const materialConfig = useMemo(() => {
    const strategy = getStrategy();
    
    // Si está forzado o es emergency mode, usar colores únicamente
    if (!force && (strategy.strategy === 'emergency' || !isPerformanceGood)) {
      return {
        mode: 'intelligentColor',
        color: getIntelligentColor(),
        roughness: getIntelligentRoughness(),
        metalness: getIntelligentMetalness(),
        strategy: strategy.strategy
      };
    }
    
    // Si no se puede cargar textura, usar color inteligente de API
    if (!force && !canLoadTexture()) {
      return {
        mode: 'apiColor',
        color: getColorFromAPI(apiTextureData) || getIntelligentColor(),
        roughness: getAPIBasedRoughness(),
        metalness: getAPIBasedMetalness(),
        strategy: 'apiColor'
      };
    }
    
    // Performance permite texturas - usar datos de API
    return {
      mode: 'apiTexture',
      apiData: apiTextureData,
      color: getColorFromAPI(apiTextureData) || fallbackColor,
      strategy: 'progressive'
    };
  }, [apiTextureData, canLoadTexture, force, isPerformanceGood, getStrategy]);

  // Funciones helper para propiedades inteligentes
  const getIntelligentColor = () => {
    // Colores basados en tipo y optimizados para performance
    const typeColors = {
      wall: '#F5F5F5',  // Blanco hueso para paredes
      floor: '#E8E8E8', // Gris claro para pisos
      ceiling: '#FAFAFA' // Blanco puro para techos
    };
    
    return typeColors[type] || fallbackColor;
  };

  const getIntelligentRoughness = () => {
    // Roughness realista por tipo de superficie
    const typeRoughness = {
      wall: 0.8,    // Paredes más rugosas
      floor: 0.7,   // Pisos moderadamente rugosos
      ceiling: 0.9  // Techos muy rugosos
    };
    
    return typeRoughness[type] || 0.8;
  };

  const getIntelligentMetalness = () => {
    // Metalness mínimo para superficies arquitectónicas
    return 0.05;
  };

  const getAPIBasedRoughness = () => {
    if (!apiTextureData) return getIntelligentRoughness();
    
    const name = apiTextureData.name?.toLowerCase() || '';
    
    // Mapeo basado en tipo de material de la API
    if (name.includes('metal')) return 0.3;
    if (name.includes('marble')) return 0.1;
    if (name.includes('wood')) return 0.7;
    if (name.includes('concrete')) return 0.8;
    if (name.includes('tile')) return 0.2;
    
    return getIntelligentRoughness();
  };

  const getAPIBasedMetalness = () => {
    if (!apiTextureData) return getIntelligentMetalness();
    
    const name = apiTextureData.name?.toLowerCase() || '';
    
    // Solo metales tienen metalness alto
    if (name.includes('metal') || name.includes('steel') || name.includes('aluminum')) {
      return 0.8;
    }
    
    return 0.05;
  };

  // Debug: log de la configuración actual
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`APIAwarePBRMaterial [${type}]:`, {
        mode: materialConfig.mode,
        strategy: materialConfig.strategy,
        hasApiData: !!apiTextureData,
        apiTextureData: apiTextureData,
        performance: debugInfo
      });
    }
  }, [materialConfig, apiTextureData, type, debugInfo]);

  // Renderizar material según configuración
  switch (materialConfig.mode) {
    case 'apiTexture':
      return (
        <SmartAPITextureMaterial
          apiTextureData={materialConfig.apiData}
          fallbackColor={materialConfig.color}
          type={type}
          priority={priority}
          {...materialProps}
        />
      );
      
    case 'apiColor':
    case 'intelligentColor':
      return (
        <meshStandardMaterial
          color={materialConfig.color}
          roughness={materialConfig.roughness}
          metalness={materialConfig.metalness}
          {...materialProps}
        />
      );
      
    default:
      return (
        <meshStandardMaterial
          color={fallbackColor}
          roughness={0.8}
          metalness={0.05}
          {...materialProps}
        />
      );
  }
};

/**
 * Hook para usar el material en componentes
 */
export function useAPIAwareMaterial(salaId, type, options = {}) {
  const {
    currentTextures,
    wallRecommendations,
    floorRecommendations,
    getColorFromAPI
  } = useTextureRecommendations(salaId);
  
  const { isPerformanceGood, canLoadTexture } = useTexturePerformanceAnalyzer();
  
  return useMemo(() => {
    const canUseTextures = options.force || (isPerformanceGood && canLoadTexture());
    
    return {
      canUseTextures,
      hasAPIData: !!(currentTextures.pared || currentTextures.piso),
      currentTexture: type === 'wall' ? currentTextures.pared : currentTextures.piso,
      recommendations: type === 'wall' ? wallRecommendations : floorRecommendations,
      performanceMode: !canUseTextures
    };
  }, [salaId, type, currentTextures, wallRecommendations, floorRecommendations, isPerformanceGood, canLoadTexture, options.force]);
}

export default APIAwarePBRMaterial;

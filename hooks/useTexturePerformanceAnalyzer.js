import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para análisis de performance de texturas en tiempo real
 */
export function useTexturePerformanceAnalyzer() {
  const [performanceData, setPerformanceData] = useState({
    frameRate: 60,
    canLoadTexture: true,
    strategy: 'progressive',
    texturesLoaded: 0
  });

  // Medir performance en tiempo real
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measurePerformance = () => {
      const now = performance.now();
      frameCount++;
      
      // Medir cada segundo
      if (now - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = now;
        
        // Actualizar métricas
        setPerformanceData(prev => ({
          ...prev,
          frameRate: fps,
          canLoadTexture: fps >= 30,
          strategy: getStrategyForFPS(fps),
          texturesLoaded: countActiveTextures()
        }));
      }
      
      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  /**
   * Determina estrategia basada en FPS
   */
  const getStrategyForFPS = (fps) => {
    if (fps >= 50) return 'progressive';
    if (fps >= 30) return 'minimal';
    return 'emergency';
  };

  /**
   * Cuenta texturas activas en la escena
   */
  const countActiveTextures = () => {
    // Contar elementos que podrían tener texturas
    const images = document.querySelectorAll('img[src*="texture"], canvas');
    return Math.min(images.length, 10); // Cap a 10 para evitar números irreales
  };

  /**
   * Verifica si se puede cargar una textura adicional
   */
  const canLoadTexture = useCallback(() => {
    return (
      performanceData.frameRate >= 30 &&
      performanceData.texturesLoaded < 6 && // Límite seguro
      performanceData.strategy !== 'emergency'
    );
  }, [performanceData]);

  /**
   * Obtiene estrategia actual de carga
   */
  const getStrategy = useCallback(() => {
    const { frameRate, texturesLoaded } = performanceData;
    
    if (frameRate < 20) {
      return {
        strategy: 'emergency',
        loadTextures: false,
        reason: 'FPS crítico - solo colores'
      };
    }
    
    if (frameRate < 30 || texturesLoaded >= 6) {
      return {
        strategy: 'minimal',
        loadTextures: 'colors',
        reason: 'Performance limitado - colores inteligentes'
      };
    }
    
    if (frameRate >= 50 && texturesLoaded < 4) {
      return {
        strategy: 'progressive',
        loadTextures: true,
        reason: 'Performance óptimo - texturas completas'
      };
    }
    
    return {
      strategy: 'adaptive',
      loadTextures: 'selective',
      reason: 'Carga selectiva basada en prioridad'
    };
  }, [performanceData]);

  /**
   * Obtiene color inteligente desde datos de API
   */
  const getColorFromAPI = useCallback((apiData) => {
    if (!apiData) return null;
    
    // Mapeo de texturas de la API a colores optimizados
    const textureColorMap = {
      // Maderas - tonos cálidos
      'WoodFloor003': '#8B4513',
      'WoodFloor': '#CD853F',
      'Oak': '#DEB887',
      'Pine': '#F4A460',
      
      // Metales - tonos fríos
      'MetalPlates': '#A9A9A9',
      'DiamondPlate': '#C0C0C0',
      'Steel': '#B0C4DE',
      'Metal': '#9E9E9E',
      
      // Piedras - tonos neutros
      'Rock050': '#A0A0A0',
      'Stone': '#9E9E9E',
      'Granite': '#708090',
      'Marble': '#F5F5F5',
      
      // Cerámicas - tonos claros
      'Tiles002': '#F5F5DC',
      'Ceramic': '#FFF8DC',
      'Porcelain': '#F0F8FF',
      
      // Concreto - tonos grises
      'Concrete': '#BEBEBE',
      'DiamondPlate006C': '#D3D3D3'
    };
    
    // Buscar por nombre exacto
    const exactMatch = textureColorMap[apiData.name];
    if (exactMatch) return exactMatch;
    
    // Buscar por palabras clave
    const name = apiData.name?.toLowerCase() || '';
    for (const [key, color] of Object.entries(textureColorMap)) {
      if (name.includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Fallback por categoría
    const categoryColors = {
      wall: '#F0F0F0',
      floor: '#E8E8E8',
      ceiling: '#FAFAFA',
      generic: '#F5F5F5'
    };
    
    return categoryColors[apiData.category] || '#F0F0F0';
  }, []);

  /**
   * Prioriza qué texturas cargar basado en visibilidad y tipo
   */
  const prioritizeTextures = useCallback((textureRequests) => {
    return textureRequests
      .map(req => ({
        ...req,
        priority: calculateTexturePriority(req)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, canLoadTexture() ? 4 : 2); // Limitar según capacidad
  }, [canLoadTexture]);

  /**
   * Calcula prioridad de carga para una textura
   */
  const calculateTexturePriority = (request) => {
    let priority = 0;
    
    // Prioridad por tipo
    if (request.type === 'wall') priority += 40;
    if (request.type === 'floor') priority += 30;
    if (request.type === 'ceiling') priority += 10;
    
    // Prioridad por visibilidad
    if (request.visible) priority += 30;
    
    // Prioridad por distancia (más cerca = mayor prioridad)
    if (request.distance) {
      priority += Math.max(0, 20 - request.distance);
    }
    
    // Penalización por texturas ya cargadas del mismo tipo
    if (request.alreadyLoaded) priority -= 20;
    
    return priority;
  };

  return {
    // Estado de performance
    performanceData,
    frameRate: performanceData.frameRate,
    
    // Funciones de análisis
    canLoadTexture,
    getStrategy,
    getColorFromAPI,
    prioritizeTextures,
    
    // Información de capacidad
    isPerformanceGood: performanceData.frameRate >= 30,
    isPerformanceExcellent: performanceData.frameRate >= 50,
    currentStrategy: performanceData.strategy,
    
    // Debug info
    debugInfo: {
      fps: performanceData.frameRate,
      texturesLoaded: performanceData.texturesLoaded,
      strategy: performanceData.strategy,
      canLoad: performanceData.canLoadTexture
    }
  };
}

export default useTexturePerformanceAnalyzer;

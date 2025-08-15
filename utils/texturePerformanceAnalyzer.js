/**
 * ANÁLISIS DE PERFORMANCE PARA TEXTURAS API
 * Sistema inteligente para texturas progresivas sin impacto en rendimiento
 */

export class TexturePerformanceAnalyzer {
  constructor() {
    this.metrics = {
      frameRate: 0,
      gpuMemory: 0,
      texturesLoaded: 0,
      loadTime: 0,
      canLoadMore: true
    };
    
    this.limits = {
      maxTexturesSimultaneous: 6, // Límite seguro para WebGL
      maxMemoryMB: 256, // Límite de memoria de texturas
      minFrameRate: 30, // FPS mínimo aceptable
      maxLoadTime: 2000 // Tiempo máximo de carga en ms
    };
  }

  /**
   * Analiza si el sistema puede manejar texturas adicionales
   */
  canLoadTexture() {
    const metrics = this.getCurrentMetrics();
    
    return (
      metrics.frameRate >= this.limits.minFrameRate &&
      metrics.texturesLoaded < this.limits.maxTexturesSimultaneous &&
      metrics.gpuMemory < this.limits.maxMemoryMB &&
      metrics.loadTime < this.limits.maxLoadTime
    );
  }

  /**
   * Obtiene métricas actuales del sistema
   */
  getCurrentMetrics() {
    // Mock de métricas - en producción obtendríamos datos reales
    return {
      frameRate: this.measureFrameRate(),
      gpuMemory: this.estimateGPUMemory(),
      texturesLoaded: this.countLoadedTextures(),
      loadTime: this.measureLoadTime()
    };
  }

  measureFrameRate() {
    // Simplificado - retornar valor seguro para testing
    return 60; // Mock: performance bueno
  }

  estimateGPUMemory() {
    // Estimar uso de memoria basado en texturas cargadas
    return this.countLoadedTextures() * 8; // ~8MB por textura 1K
  }

  countLoadedTextures() {
    // Contar texturas actualmente cargadas
    return document.querySelectorAll('canvas, img[src*="texture"]').length;
  }

  measureLoadTime() {
    // Mock de tiempo de carga
    return performance.now() % 1000; // Simulado
  }

  /**
   * Estrategia de carga progresiva de texturas
   */
  getLoadingStrategy() {
    const metrics = this.getCurrentMetrics();
    
    if (metrics.frameRate < 30) {
      return {
        strategy: 'emergency',
        loadTextures: false,
        reason: 'FPS demasiado bajo'
      };
    }
    
    if (metrics.texturesLoaded >= 4) {
      return {
        strategy: 'conservative',
        loadTextures: 'lowRes',
        reason: 'Muchas texturas cargadas, usar baja resolución'
      };
    }
    
    if (metrics.frameRate >= 50 && metrics.texturesLoaded < 3) {
      return {
        strategy: 'progressive',
        loadTextures: true,
        reason: 'Performance óptimo, cargar texturas completas'
      };
    }
    
    return {
      strategy: 'minimal',
      loadTextures: 'colors',
      reason: 'Performance intermedio, solo colores'
    };
  }

  /**
   * Prioriza qué texturas cargar primero
   */
  prioritizeTextures(textureRequests) {
    return textureRequests
      .map(req => ({
        ...req,
        priority: this.calculatePriority(req)
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  calculatePriority(textureRequest) {
    let priority = 0;
    
    // Prioridad por tipo
    if (textureRequest.type === 'wall') priority += 50;
    if (textureRequest.type === 'floor') priority += 40;
    
    // Prioridad por visibilidad
    if (textureRequest.visible) priority += 30;
    
    // Prioridad por distancia a cámara
    if (textureRequest.distance < 10) priority += 20;
    
    return priority;
  }
}

/**
 * Hook inteligente para texturas con análisis de performance
 */
export function useSmartTextureLoading(textureUrl, type = 'wall', priority = 1) {
  const analyzer = new TexturePerformanceAnalyzer();
  const strategy = analyzer.getLoadingStrategy();
  
  // Decisión inteligente basada en performance
  if (!strategy.loadTextures) {
    // No cargar texturas, usar colores
    return {
      maps: {},
      color: getColorForType(type),
      hasTexture: false,
      strategy: strategy.strategy
    };
  }
  
  if (strategy.loadTextures === 'lowRes') {
    // Cargar texturas de baja resolución
    return {
      maps: { color: textureUrl.replace('1K', '512') },
      color: getColorForType(type),
      hasTexture: true,
      strategy: strategy.strategy
    };
  }
  
  if (strategy.loadTextures === 'colors') {
    // Solo colores inteligentes basados en API
    return {
      maps: {},
      color: getColorFromAPI(textureUrl) || getColorForType(type),
      hasTexture: false,
      strategy: strategy.strategy
    };
  }
  
  // Cargar texturas completas si performance es óptimo
  return {
    maps: { color: textureUrl },
    color: getColorForType(type),
    hasTexture: true,
    strategy: strategy.strategy
  };
}

/**
 * Obtiene colores inteligentes desde datos de la API
 */
function getColorFromAPI(textureUrl) {
  // Mapeo inteligente de texturas API a colores
  const textureColorMap = {
    'WoodFloor': '#8b4513',
    'Tiles': '#e0e0e0',
    'Metal': '#9e9e9e',
    'Concrete': '#bdbdbd',
    'Marble': '#f5f5f5',
    'Stone': '#9e9e9e',
    'Brick': '#cd853f'
  };
  
  for (const [texture, color] of Object.entries(textureColorMap)) {
    if (textureUrl && textureUrl.includes(texture)) {
      return color;
    }
  }
  
  return null;
}

/**
 * Colores de fallback por tipo
 */
function getColorForType(type) {
  const colorMap = {
    wall: '#f0f0f0',
    floor: '#e8e8e8',
    ceiling: '#fafafa'
  };
  
  return colorMap[type] || '#f0f0f0';
}

/**
 * Monitor de performance en tiempo real
 */
export class PerformanceMonitor {
  constructor() {
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = this.startTime;
  }

  measureFrame() {
    this.frameCount++;
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    return {
      fps: 1000 / deltaTime,
      totalTime: now - this.startTime,
      frameCount: this.frameCount
    };
  }

  getHealthStatus() {
    const frame = this.measureFrame();
    
    if (frame.fps >= 50) return 'excellent';
    if (frame.fps >= 30) return 'good';
    if (frame.fps >= 20) return 'acceptable';
    return 'poor';
  }
}

export default TexturePerformanceAnalyzer;

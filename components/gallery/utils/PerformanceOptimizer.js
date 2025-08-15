/**
 * Sistema de optimización automática de rendimiento
 * Detecta capacidades del dispositivo y ajusta la calidad en tiempo real
 */

export class PerformanceOptimizer {
  constructor() {
    this.deviceTier = this.detectDeviceTier();
    this.frameTimeSamples = [];
    this.maxSamples = 60; // 1 segundo a 60fps
    this.targetFPS = 60;
    this.currentQuality = "auto";
  }

  /**
   * Detecta el nivel del dispositivo basado en specs del navegador
   */
  detectDeviceTier() {
    // Detectar GPU y memoria
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return "low";

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    // Memoria aproximada del dispositivo
    const memory = navigator.deviceMemory || 4; // Default 4GB si no está disponible
    
    // Núcleos de CPU
    const cores = navigator.hardwareConcurrency || 4;

    // Clasificación de dispositivo
    if (memory >= 8 && cores >= 8) {
      return "high";
    } else if (memory >= 4 && cores >= 4) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Monitorea el rendimiento y ajusta la calidad automáticamente
   */
  updatePerformanceMetrics(deltaTime) {
    const frameTime = deltaTime * 1000; // Convertir a ms
    this.frameTimeSamples.push(frameTime);

    if (this.frameTimeSamples.length > this.maxSamples) {
      this.frameTimeSamples.shift();
    }

    // Calcular FPS promedio cada segundo
    if (this.frameTimeSamples.length >= this.maxSamples) {
      const avgFrameTime = this.frameTimeSamples.reduce((a, b) => a + b) / this.frameTimeSamples.length;
      const avgFPS = 1000 / avgFrameTime;

      this.adjustQuality(avgFPS);
    }
  }

  /**
   * Ajusta la calidad basado en el FPS actual
   */
  adjustQuality(currentFPS) {
    if (currentFPS < 30 && this.currentQuality !== "low") {
      this.currentQuality = "low";
      console.log("🔧 Optimización: Calidad reducida a LOW por bajo FPS");
    } else if (currentFPS > 45 && currentFPS < 55 && this.currentQuality !== "medium") {
      this.currentQuality = "medium";
      console.log("🔧 Optimización: Calidad ajustada a MEDIUM");
    } else if (currentFPS > 55 && this.currentQuality !== "high") {
      this.currentQuality = "high";
      console.log("🔧 Optimización: Calidad optimizada a HIGH");
    }
  }

  /**
   * Obtiene la configuración optimizada para el dispositivo actual
   */
  getOptimizedSettings() {
    const baseSettings = {
      low: {
        textureOptimization: "none",
        shadowMapSize: 512,
        lightingPreset: "museum",
        ambientIntensity: 0.1,
        spotIntensity: 4.0,
        enablePostProcessing: false,
        maxLights: 4,
      },
      medium: {
        textureOptimization: "minimal",
        shadowMapSize: 1024,
        lightingPreset: "museum",
        ambientIntensity: 0.15,
        spotIntensity: 5.0,
        enablePostProcessing: false,
        maxLights: 6,
      },
      high: {
        textureOptimization: "auto",
        shadowMapSize: 2048,
        lightingPreset: "dramatic",
        ambientIntensity: 0.2,
        spotIntensity: 6.0,
        enablePostProcessing: true,
        maxLights: 8,
      }
    };

    const deviceSettings = baseSettings[this.deviceTier];
    const performanceSettings = baseSettings[this.currentQuality];

    // Combinar configuraciones de dispositivo y rendimiento (priorizar rendimiento)
    return {
      ...deviceSettings,
      ...performanceSettings,
      deviceTier: this.deviceTier,
      currentQuality: this.currentQuality,
    };
  }

  /**
   * Configuración específica para materiales optimizados
   */
  getMaterialOptimization() {
    const settings = this.getOptimizedSettings();
    
    return {
      textureOptimization: settings.textureOptimization,
      useSimplifiedShaders: settings.currentQuality === "low",
      reducedComplexity: settings.deviceTier === "low",
      enableEnvironmentMapping: settings.currentQuality !== "low",
    };
  }
}

// Instancia singleton del optimizador
export const performanceOptimizer = new PerformanceOptimizer();

// Hook para usar en componentes React
export function usePerformanceOptimization() {
  const [settings, setSettings] = React.useState(performanceOptimizer.getOptimizedSettings());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newSettings = performanceOptimizer.getOptimizedSettings();
      setSettings(newSettings);
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, []);

  return settings;
}

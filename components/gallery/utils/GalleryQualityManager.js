/**
 * Sistema de calidad automática para optimización de la galería
 * Detecta el dispositivo y ajusta todos los parámetros automáticamente
 */

import { performanceOptimizer } from './PerformanceOptimizer.js';

export class GalleryQualityManager {
  constructor() {
    this.deviceType = this.detectDeviceType();
    this.qualityLevel = this.determineQualityLevel();
    this.settings = this.getQualitySettings();
  }

  /**
   * Detecta el tipo de dispositivo
   */
  detectDeviceType() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth > 768;
    
    if (isMobile && !isTablet) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }

  /**
   * Determina el nivel de calidad basado en el dispositivo y sus capacidades
   */
  determineQualityLevel() {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const screenWidth = window.screen.width;

    // Móviles: siempre calidad baja/media
    if (this.deviceType === 'mobile') {
      return memory >= 6 ? 'medium' : 'low';
    }

    // Tablets: media/alta según specs
    if (this.deviceType === 'tablet') {
      return memory >= 6 && cores >= 6 ? 'high' : 'medium';
    }

    // Desktop: alta calidad si tiene buenas specs
    if (memory >= 8 && cores >= 8 && screenWidth >= 1920) {
      return 'ultra';
    } else if (memory >= 6 && cores >= 4) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  /**
   * Configuraciones optimizadas por nivel de calidad
   */
  getQualitySettings() {
    const configurations = {
      low: {
        // CALIDAD BAJA - Móviles antiguos
        textureOptimization: 'none',
        lightingPreset: 'museum',
        ambientIntensity: 0.1,
        spotIntensity: 4.0,
        frameStyle: 'dark', // Marcos simples
        shadowMapSize: 256,
        enableSpotlights: false, // Sin spotlights individuales
        artworkMaterial: 'standard', // meshStandardMaterial
        frameMaterial: 'standard',
        enableGlow: false,
        maxGeometryComplexity: 'low',
        enableClearcoat: false,
      },
      medium: {
        // CALIDAD MEDIA - Móviles modernos, tablets
        textureOptimization: 'minimal',
        lightingPreset: 'museum',
        ambientIntensity: 0.15,
        spotIntensity: 5.0,
        frameStyle: 'dark',
        shadowMapSize: 512,
        enableSpotlights: true,
        artworkMaterial: 'physical', // meshPhysicalMaterial básico
        frameMaterial: 'physical',
        enableGlow: true,
        maxGeometryComplexity: 'medium',
        enableClearcoat: true,
      },
      high: {
        // CALIDAD ALTA - Desktop, laptops buenos
        textureOptimization: 'auto',
        lightingPreset: 'dramatic',
        ambientIntensity: 0.2,
        spotIntensity: 6.0,
        frameStyle: 'gold',
        shadowMapSize: 1024,
        enableSpotlights: true,
        artworkMaterial: 'physical',
        frameMaterial: 'physical',
        enableGlow: true,
        maxGeometryComplexity: 'high',
        enableClearcoat: true,
      },
      ultra: {
        // CALIDAD ULTRA - Desktop gaming, workstations
        textureOptimization: 'auto',
        lightingPreset: 'golden',
        ambientIntensity: 0.25,
        spotIntensity: 7.0,
        frameStyle: 'gold',
        shadowMapSize: 2048,
        enableSpotlights: true,
        artworkMaterial: 'physical',
        frameMaterial: 'physical',
        enableGlow: true,
        maxGeometryComplexity: 'ultra',
        enableClearcoat: true,
      }
    };

    return configurations[this.qualityLevel];
  }

  /**
   * Configuración específica para las obras de arte
   */
  getArtworkConfiguration() {
    const settings = this.settings;
    
    if (settings.artworkMaterial === 'standard') {
      return {
        materialType: 'meshStandardMaterial',
        props: {
          roughness: 0.3,
          metalness: 0.0,
        }
      };
    }

    return {
      materialType: 'meshPhysicalMaterial',
      props: {
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: settings.enableClearcoat ? 0.2 : 0,
        clearcoatRoughness: 0.0,
        reflectivity: 0.9,
        envMapIntensity: 1.3,
      }
    };
  }

  /**
   * Configuración para marcos de cuadros
   */
  getFrameConfiguration() {
    const settings = this.settings;
    
    const baseConfig = {
      metalness: settings.frameStyle === 'gold' ? 0.8 : 0.2,
      roughness: settings.frameStyle === 'gold' ? 0.1 : 0.4,
      clearcoat: settings.enableClearcoat ? 0.6 : 0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.4,
    };

    return {
      materialType: settings.frameMaterial === 'physical' ? 'meshPhysicalMaterial' : 'meshStandardMaterial',
      props: baseConfig
    };
  }

  /**
   * Configuración de iluminación optimizada
   */
  getLightingConfiguration() {
    return {
      preset: this.settings.lightingPreset,
      ambientIntensity: this.settings.ambientIntensity,
      spotIntensity: this.settings.spotIntensity,
      enableIndividualSpotlights: this.settings.enableSpotlights,
      shadowMapSize: this.settings.shadowMapSize,
    };
  }

  /**
   * Información para debugging
   */
  getDebugInfo() {
    return {
      deviceType: this.deviceType,
      qualityLevel: this.qualityLevel,
      memory: navigator.deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown',
      screenSize: `${window.screen.width}x${window.screen.height}`,
      settings: this.settings,
    };
  }

  /**
   * Log de la configuración aplicada
   */
  logConfiguration() {
    const info = this.getDebugInfo();
    console.group('🎨 Gallery Quality Manager');
    console.log('📱 Device Type:', info.deviceType);
    console.log('⚡ Quality Level:', info.qualityLevel);
    console.log('💾 Memory:', info.memory, 'GB');
    console.log('🔧 CPU Cores:', info.cores);
    console.log('📺 Screen:', info.screenSize);
    console.log('⚙️ Settings:', info.settings);
    console.groupEnd();
  }
}

// Instancia singleton
export const galleryQualityManager = new GalleryQualityManager();

// Hook para React
export function useGalleryQuality() {
  const [quality] = React.useState(galleryQualityManager);
  
  React.useEffect(() => {
    quality.logConfiguration();
  }, []);

  return {
    settings: quality.settings,
    artworkConfig: quality.getArtworkConfiguration(),
    frameConfig: quality.getFrameConfiguration(),
    lightingConfig: quality.getLightingConfiguration(),
    debugInfo: quality.getDebugInfo(),
  };
}

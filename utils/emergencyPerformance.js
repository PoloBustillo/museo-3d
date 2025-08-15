/**
 * DESACTIVADOR DE GENERACIÓN PROCEDURAL - EMERGENCIA
 * Sobrescribe la función que está causando el lag masivo
 */

// Función de emergencia - elimina la generación procedural
const disableProceduralGeneration = () => {
  if (typeof window !== 'undefined') {
    // Interceptar y desactivar createOptimizedWoodTexture
    window.DISABLE_PROCEDURAL_TEXTURES = true;
    
    // Función mock que retorna textura básica
    window.createMockTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64; // SÚPER PEQUEÑO
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      
      // Color sólido simple
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, 0, 64, 64);
      
      return canvas;
    };
  }
};

// Configuración de emergencia para materiales
export const EMERGENCY_MATERIALS = {
  frame: {
    color: "#8B4513",
    roughness: 0.8,
    metalness: 0.0
  },
  wall: {
    color: "#f0f0f0",
    roughness: 0.9,
    metalness: 0.0
  },
  floor: {
    color: "#e0e0e0", 
    roughness: 0.8,
    metalness: 0.1
  },
  ceiling: {
    color: "#f8f8f8",
    roughness: 0.3,
    metalness: 0.0
  }
};

// Hook de emergencia para materiales sin texturas
export const useEmergencyMaterials = () => {
  disableProceduralGeneration();
  
  return {
    getMaterial: (type) => EMERGENCY_MATERIALS[type] || EMERGENCY_MATERIALS.wall,
    disableTextureGeneration: true,
    performanceMode: true
  };
};

export default useEmergencyMaterials;

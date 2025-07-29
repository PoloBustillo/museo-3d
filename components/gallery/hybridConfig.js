/**
 * Configuración del sistema híbrido de galería
 * Define diferentes tipos de sala y sus configuraciones
 */

export const HYBRID_GALLERY_CONFIG = {
  // Configuración base para todas las salas
  base: {
    width: 18, // Aumentado de 14 a 18 para más ancho
    length: 28, // Aumentado de 20 a 28 para más largo
    height: 6, // Aumentado de 5 a 6 para más alto
    wallThickness: 0.3, // Reducido de 0.5 a 0.3 para paredes más delgadas
    floorThickness: 0.2, // Reducido de 0.3 a 0.2
    ceilingThickness: 0.2, // Reducido de 0.3 a 0.2
    slotSpacing: 4,
    slotHeight: 3, // Aumentado de 2.5 a 3
    artworkDepth: 0.15,
    artworkFrameThickness: 0.05,
  },

  // Tipos de sala disponibles
  roomTypes: {
    standard: {
      name: "Sala Estándar",
      description: "Sala rectangular con distribución clásica",
      icon: "🏛️",
      color: "#1976d2",
      config: {
        width: 18,
        length: 28, // Aumentado de 20 a 28
        slotSpacing: 4, // Aumentado de 3 a 4
        maxArtworks: 16,
      },
    },

    contemporary: {
      name: "Sala Contemporánea",
      description: "Espacio amplio para obras grandes",
      icon: "🖼️",
      color: "#7b1fa2",
      config: {
        width: 22,
        length: 32, // Aumentado de 24 a 32
        slotSpacing: 5, // Aumentado de 4 a 5
        maxArtworks: 14,
      },
    },

    intimate: {
      name: "Sala Íntima",
      description: "Espacio acogedor para obras pequeñas",
      icon: "🎨",
      color: "#388e3c",
      config: {
        width: 14,
        length: 20, // Aumentado de 16 a 20
        slotSpacing: 3, // Aumentado de 2.5 a 3
        maxArtworks: 10,
      },
    },

    digital: {
      name: "Sala Digital",
      description: "Espacio moderno para arte digital",
      icon: "💻",
      color: "#f57c00",
      config: {
        width: 16,
        length: 24, // Aumentado de 18 a 24
        slotSpacing: 4, // Aumentado de 3 a 4
        maxArtworks: 12,
      },
    },
  },

  // Configuración de materiales por tipo de sala
  materials: {
    standard: {
      walls: { color: 0xf5f5f5, roughness: 0.8, metalness: 0.1 },
      floor: { color: 0x8b4513, roughness: 0.9, metalness: 0.0 },
      ceiling: { color: 0xffffff, roughness: 0.7, metalness: 0.0 },
    },
    contemporary: {
      walls: { color: 0xffffff, roughness: 0.6, metalness: 0.2 },
      floor: { color: 0x2c2c2c, roughness: 0.8, metalness: 0.1 },
      ceiling: { color: 0xfafafa, roughness: 0.5, metalness: 0.1 },
    },
    intimate: {
      walls: { color: 0xf8f4e6, roughness: 0.9, metalness: 0.0 },
      floor: { color: 0x8b7355, roughness: 0.9, metalness: 0.0 },
      ceiling: { color: 0xf5f5dc, roughness: 0.8, metalness: 0.0 },
    },
    digital: {
      walls: { color: 0x1a1a1a, roughness: 0.7, metalness: 0.3 },
      floor: { color: 0x333333, roughness: 0.8, metalness: 0.2 },
      ceiling: { color: 0x2a2a2a, roughness: 0.6, metalness: 0.2 },
    },
  },

  // Configuración de iluminación por tipo de sala
  lighting: {
    standard: {
      ambient: { color: 0xffffff, intensity: 0.4 },
      directional: [
        { color: 0xffffff, intensity: 0.6, position: [7, 6, 15] },
        { color: 0xffffff, intensity: 0.4, position: [-7, 6, -15] },
      ],
    },
    contemporary: {
      ambient: { color: 0xffffff, intensity: 0.5 },
      directional: [
        { color: 0xffffff, intensity: 0.7, position: [9, 7, 17] },
        { color: 0xffffff, intensity: 0.3, position: [-9, 7, -17] },
      ],
    },
    intimate: {
      ambient: { color: 0xfff8dc, intensity: 0.6 },
      directional: [
        { color: 0xfff8dc, intensity: 0.5, position: [5, 5, 10] },
        { color: 0xfff8dc, intensity: 0.3, position: [-5, 5, -10] },
      ],
    },
    digital: {
      ambient: { color: 0x444444, intensity: 0.3 },
      directional: [
        { color: 0xffffff, intensity: 0.8, position: [8, 6, 12] },
        { color: 0x0066ff, intensity: 0.2, position: [-8, 6, -12] },
      ],
    },
  },
};

/**
 * Obtiene la configuración completa para un tipo de sala
 * @param {string} roomType - Tipo de sala
 * @returns {Object} Configuración completa
 */
export function getRoomConfig(roomType = "standard") {
  const baseConfig = HYBRID_GALLERY_CONFIG.base;
  const typeConfig = HYBRID_GALLERY_CONFIG.roomTypes[roomType]?.config || {};

  return {
    ...baseConfig,
    ...typeConfig,
    materials:
      HYBRID_GALLERY_CONFIG.materials[roomType] ||
      HYBRID_GALLERY_CONFIG.materials.standard,
    lighting:
      HYBRID_GALLERY_CONFIG.lighting[roomType] ||
      HYBRID_GALLERY_CONFIG.lighting.standard,
    roomType,
    roomInfo:
      HYBRID_GALLERY_CONFIG.roomTypes[roomType] ||
      HYBRID_GALLERY_CONFIG.roomTypes.standard,
  };
}

/**
 * Calcula los slots disponibles para un número de obras
 * @param {number} artworkCount - Número de obras
 * @param {Object} roomConfig - Configuración de la sala
 * @returns {Array} Array de slots con posiciones
 */
export function calculateSlots(artworkCount, roomConfig) {
  const { width, length, slotSpacing, slotHeight, maxArtworks } = roomConfig;

  // Limitar el número de obras al máximo de la sala
  const actualArtworkCount = Math.min(artworkCount, maxArtworks);

  // Calcular cuántos slots necesitamos
  const slotsPerWall = Math.floor(length / slotSpacing);
  const totalSlots = slotsPerWall * 2; // Dos paredes

  // Si tenemos más obras que slots, distribuir uniformemente
  if (actualArtworkCount > totalSlots) {
    // Reducir el espaciado para acomodar más obras
    const newSpacing = length / Math.ceil(actualArtworkCount / 2);
    return generateSlots(
      actualArtworkCount,
      width,
      length,
      newSpacing,
      slotHeight
    );
  }

  return generateSlots(
    actualArtworkCount,
    width,
    length,
    slotSpacing,
    slotHeight
  );
}

/**
 * Genera los slots con posiciones específicas
 * @param {number} artworkCount - Número de obras
 * @param {number} width - Ancho de la sala
 * @param {number} length - Largo de la sala
 * @param {number} spacing - Espaciado entre obras
 * @param {number} height - Altura de los slots
 * @returns {Array} Array de slots
 */
function generateSlots(artworkCount, width, length, spacing, height) {
  const slots = [];
  const slotsPerWall = Math.ceil(artworkCount / 2);

  // Distribuir obras entre las dos paredes
  for (let i = 0; i < artworkCount; i++) {
    const wall = i % 2 === 0 ? "left" : "right";
    const index = Math.floor(i / 2);

    const x = wall === "left" ? -width / 2 - 0.1 : width / 2 + 0.1;
    const z = -length / 2 + spacing / 2 + index * spacing;

    slots.push({
      id: `${wall}-${index + 1}`,
      position: [x, height, z],
      rotation: wall === "left" ? [0, 0, 0] : [0, Math.PI, 0],
      wall,
      index,
      artworkIndex: i,
    });
  }

  return slots;
}

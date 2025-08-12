// Configuración del espacio 3D del museo
export const GALLERY_CONFIG = {
  // Dimensiones del espacio
  HALL_WIDTH: 14,
  HALL_LENGTH: 40,
  WALL_HEIGHT: 2,
  CEILING_HEIGHT: 5.5,
  FLOOR_EXTRA: 10,

  // Configuración de obras
  PICTURE_SPACING: 5, // Aumentado de 4 a 5 para más espacio entre cuadros
  PICTURE_WIDTH: 3,
  WALL_MARGIN_INITIAL: 4, // Aumentado de 1 a 2 para más espacio inicial
  WALL_MARGIN_FINAL: 3, // Aumentado de 2 a 3 para más espacio final

  // Texturas (actualizadas a rutas existentes)
  TEXTURES: {
    FLOOR: "/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG_Color.jpg",
    WALL: "/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG_Color.jpg",
    FALLBACKS: [
      "/assets/textures/DiamondPlate006C_1K-JPG/DiamondPlate006C_1K-JPG_Color.jpg",
    ],
  },

  // Configuración de salas disponibles
  AVAILABLE_ROOMS: [
    {
      id: 1,
      name: "Sala Principal",
      description: "Exposición principal con obras destacadas",
      icon: "🎨",
      color: "#1976d2",
    },
    {
      id: 2,
      name: "Sala Contemporánea",
      description: "Arte contemporáneo y experimental",
      icon: "🖼️",
      color: "#7b1fa2",
    },
    {
      id: 3,
      name: "Sala Digital",
      description: "Arte digital y nuevas tecnologías",
      icon: "💻",
      color: "#388e3c",
    },
    {
      id: 4,
      name: "Sala ARPA",
      description: "Murales del programa ARPA",
      icon: "🎭",
      color: "#f57c00",
    },
  ],
};

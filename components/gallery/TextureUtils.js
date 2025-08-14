import * as THREE from "three";

// Utilidades para texturas PBR completas
export const TEXTURE_SETS = {
  // Pisos
  wood: {
    base: "/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "floor",
  },
  parquet: {
    base: "/assets/textures/WoodFloor003_1K-JPG/WoodFloor003_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "floor",
  },
  tiles: {
    base: "/assets/textures/Tiles002_1K-JPG/Tiles002_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "floor",
  },
  marble: {
    base: "/assets/textures/Tiles002_1K-JPG/Tiles002_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "floor",
  },
  stone_floor: {
    base: "/assets/textures/PavingStones130_1K-JPG/PavingStones130_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "floor",
  },

  // Paredes
  concrete: {
    base: "/assets/textures/DiamondPlate006C_1K-JPG/DiamondPlate006C_1K-JPG",
    hasMetalness: true,
    hasDisplacement: true,
    type: "wall",
  },
  metal: {
    base: "/assets/textures/DiamondPlate006C_1K-JPG/DiamondPlate006C_1K-JPG",
    hasMetalness: true,
    hasDisplacement: true,
    type: "wall",
  },
  metal_diamond: {
    base: "/assets/textures/DiamondPlate008C_1K-JPG/DiamondPlate008C_1K-JPG",
    hasMetalness: true,
    hasDisplacement: true,
    type: "wall",
  },
  metal_plates: {
    base: "/assets/textures/MetalPlates006_1K-JPG/MetalPlates006_1K-JPG",
    hasMetalness: true,
    hasDisplacement: true,
    hasAO: false, // MetalPlates006 no tiene AO
    type: "wall",
  },
  metal_industrial: {
    base: "/assets/textures/MetalPlates014_1K-JPG/MetalPlates014_1K-JPG",
    hasMetalness: true,
    hasDisplacement: true,
    type: "wall",
  },
  stone: {
    base: "/assets/textures/Rock050_1K-JPG/Rock050_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "wall",
  },
  brick: {
    base: "/assets/textures/PavingStones130_1K-JPG/PavingStones130_1K-JPG",
    hasDisplacement: true,
    hasMetalness: false,
    type: "wall",
  },
};

/**
 * Resuelve un alias de textura o URL a un path base de textura
 */
export function resolveTextureSet(input, type = "any") {
  if (!input) return null;

  // Si es una URL completa, intentar extraer el base
  if (input.includes("/")) {
    return input.includes("_Color.jpg")
      ? input.replace("_Color.jpg", "")
      : input;
  }

  // Si es un alias, buscar en TEXTURE_SETS
  const textureSet = TEXTURE_SETS[input];
  if (textureSet && (textureSet.type === type || type === "any")) {
    return textureSet.base;
  }

  return null;
}

/**
 * Construye el array completo de rutas PBR para una textura
 */
export function buildPBRTexturePaths(basePath) {
  if (!basePath) return [];

  // Determinar qué texturas están disponibles
  const textureAlias = Object.keys(TEXTURE_SETS).find(
    (alias) => TEXTURE_SETS[alias].base === basePath
  );
  const textureInfo = textureAlias ? TEXTURE_SETS[textureAlias] : {};

  // Array básico de texturas
  const paths = [
    basePath + "_Color.jpg", // 0: Color (siempre)
    basePath + "_NormalGL.jpg", // 1: Normal (siempre)
    basePath + "_Roughness.jpg", // 2: Roughness (siempre)
  ];

  // Agregar AO si está disponible (la mayoría lo tienen)
  if (textureInfo.hasAO !== false) {
    paths.push(basePath + "_AmbientOcclusion.jpg"); // 3: AO
  }

  // Agregar Metalness si está disponible
  if (textureInfo.hasMetalness) {
    paths.push(basePath + "_Metalness.jpg"); // 4: Metalness
  }

  // Agregar Displacement si está disponible
  if (textureInfo.hasDisplacement) {
    paths.push(basePath + "_Displacement.jpg"); // 4 o 5: Displacement
  }

  return paths;
}

/**
 * Mapea texturas cargadas a un objeto de propiedades de material
 */
export function mapTexturesToMaterial(textures, offset, basePath) {
  if (!textures.length || !basePath) return {};

  const textureAlias = Object.keys(TEXTURE_SETS).find((alias) =>
    basePath.includes(TEXTURE_SETS[alias].base.split("/").pop())
  );
  const textureInfo = textureAlias ? TEXTURE_SETS[textureAlias] : {};

  const maps = {
    color: textures[offset], // 0: Color
    normal: textures[offset + 1], // 1: Normal
    roughness: textures[offset + 2], // 2: Roughness
    ao: textures[offset + 3], // 3: AO
  };

  let currentOffset = 4;

  // Agregar Metalness si existe
  if (textureInfo.hasMetalness && textures[offset + currentOffset]) {
    maps.metalness = textures[offset + currentOffset];
    currentOffset++;
  }

  // Agregar Displacement si existe
  if (textureInfo.hasDisplacement && textures[offset + currentOffset]) {
    maps.displacement = textures[offset + currentOffset];
  }

  return maps;
}

/**
 * Configura propiedades de wrapping y repetición para una textura
 */
export function configureTexture(texture, repeatX, repeatY) {
  if (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 16;
  }
}

import { GALLERY_CONFIG } from "./config.js";

const {
  HALL_WIDTH,
  WALL_HEIGHT,
  PICTURE_SPACING,
  PICTURE_WIDTH,
  WALL_MARGIN_INITIAL,
  WALL_MARGIN_FINAL,
} = GALLERY_CONFIG;

/**
 * Calcula las posiciones de las obras en el pasillo
 * @param {Array} images - Array de imágenes/murales
 * @param {number} firstX - Posición X inicial
 * @param {number} pictureSpacing - Espaciado entre cuadros
 * @param {number} contentLength - Longitud total del contenido para distribución
 * @returns {Array} Array de obras con posiciones calculadas
 */
export function calculateArtworkPositions(
  images,
  firstX,
  pictureSpacing,
  contentLength = null
) {
  const positions = [];
  if (images.length === 0) return positions;
  // Distribuir siempre sobre ambas paredes alternando; si hay layout personalizado se ignora esta función.
  const pairs = Math.ceil(images.length / 2);
  let actualSpacing = pictureSpacing;
  let startX = firstX;
  if (contentLength && pairs > 1) {
    const availableSpace = contentLength - PICTURE_WIDTH;
    actualSpacing = availableSpace / (pairs - 1);
    const maxSpacing = pictureSpacing * 2.5; // permitir un poco más para aire
    actualSpacing = Math.min(actualSpacing, maxSpacing);
  }
  // Centrado mejorado
  if (contentLength) {
    const totalWidth = (pairs - 1) * actualSpacing + PICTURE_WIDTH;
    const offset = (contentLength - totalWidth) / 2;
    startX = firstX + offset;
  }
  for (let i = 0; i < images.length; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const index = Math.floor(i / 2);
    const x = startX + index * actualSpacing;
    const cuadroProfundidad = 0.15;
    const z =
      side === 1
        ? HALL_WIDTH / 2 - cuadroProfundidad / 2
        : -(HALL_WIDTH / 2 - cuadroProfundidad / 2);
    const rotation = [0, side === 1 ? 0 : Math.PI, 0];
    positions.push({ ...images[i], position: [x, WALL_HEIGHT / 2, z], rotation });
  }
  return positions;
}

/**
 * Calcula las dimensiones dinámicas de la galería basadas en el número de obras
 * @param {Array} artworks - Array de obras de arte
 * @returns {Object} Objeto con dimensiones calculadas
 */
export function calculateGalleryDimensions(artworks) {
  if (artworks.length === 0) {
    return {
      pairs: 0,
      spacingTotal: 0,
      contentLength: PICTURE_WIDTH,
      firstX: -PICTURE_WIDTH / 2,
      lastX: PICTURE_WIDTH / 2,
      dynamicLength: WALL_MARGIN_INITIAL + PICTURE_WIDTH + WALL_MARGIN_FINAL,
      dynamicCenterX: 0,
      wallMarginInitial: WALL_MARGIN_INITIAL,
      wallMarginFinal: WALL_MARGIN_FINAL,
    };
  }
  const pairs = Math.ceil(artworks.length / 2);
  const minSpacing = PICTURE_SPACING;
  const spacingTotal = (pairs - 1) * minSpacing;
  const contentLength = spacingTotal + PICTURE_WIDTH;
  const MIN_GALLERY_LENGTH = 20;
  const minPairs = Math.max(3, pairs);
  const adjustedSpacingTotal = (minPairs - 1) * minSpacing;
  const adjustedContentLength = Math.max(
    MIN_GALLERY_LENGTH,
    adjustedSpacingTotal + PICTURE_WIDTH
  );
  const firstX = -adjustedContentLength / 2;
  const lastX = firstX + adjustedSpacingTotal;
  const dynamicLength =
    adjustedContentLength + WALL_MARGIN_INITIAL + WALL_MARGIN_FINAL;
  return {
    pairs,
    spacingTotal: adjustedSpacingTotal,
    contentLength: adjustedContentLength,
    firstX,
    lastX,
    dynamicLength,
    dynamicCenterX: 0,
    wallMarginInitial: WALL_MARGIN_INITIAL,
    wallMarginFinal: WALL_MARGIN_FINAL,
  };
}

export function parseAutores(autorString) {
  return autorString
    ? autorString
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
}

export function parseColaboradores(colabString) {
  return colabString
    ? colabString
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];
}

export function normalizeTecnica(tecnica) {
  if (!tecnica) return tecnica;
  const normalized = tecnica.toLowerCase();
  if (
    normalized.includes("acrílico") ||
    normalized.includes("acrilico") ||
    normalized.includes("acrílica") ||
    normalized.includes("acrilica")
  ) {
    return "Acrílico";
  }
  if (
    normalized.includes("vinílica") ||
    normalized.includes("vinilica") ||
    normalized.includes("vinil")
  ) {
    return "Pintura vinílica";
  }
  if (normalized.includes("óleo") || normalized.includes("oleo")) {
    return "Óleo";
  }
  if (normalized.includes("acuarela")) {
    return "Acuarela";
  }
  return tecnica.charAt(0).toUpperCase() + tecnica.slice(1).toLowerCase();
}

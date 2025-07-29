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

  // Calcular cuántos pares de obras (una en cada pared)
  const pairs = Math.ceil(images.length / 2);

  // Calcular el espaciado real basado en la longitud disponible
  let actualSpacing = pictureSpacing;
  let startX = firstX;

  if (contentLength && pairs > 1) {
    // Distribuir uniformemente a lo largo de toda la longitud disponible
    const availableSpace = contentLength - PICTURE_WIDTH;
    actualSpacing = availableSpace / (pairs - 1);

    // Limitar el espaciado máximo para evitar separación excesiva
    const maxSpacing = pictureSpacing * 2;
    actualSpacing = Math.min(actualSpacing, maxSpacing);
  }

  // Para salas con pocos cuadros, centrarlos mejor
  if (images.length <= 4 && contentLength) {
    const totalArtworkWidth = (pairs - 1) * actualSpacing + PICTURE_WIDTH;
    const extraSpace = contentLength - totalArtworkWidth;
    startX = firstX + extraSpace * 0.4; // Centrar mejor usando 40% del espacio extra
  }

  for (let i = 0; i < images.length; i++) {
    const side = i % 2 === 0 ? 1 : -1; // Alternar entre paredes (izquierda/derecha)
    const index = Math.floor(i / 2);
    const x = startX + index * actualSpacing;
    const cuadroProfundidad = 0.15;

    // Calcular posición Z según la pared (izquierda o derecha)
    const z =
      side === 1
        ? HALL_WIDTH / 2 - cuadroProfundidad / 2 // Pared izquierda
        : -(HALL_WIDTH / 2 - cuadroProfundidad / 2); // Pared derecha

    // Rotación según la pared (mirar hacia el centro del pasillo)
    const rotation = [0, side === 1 ? 0 : Math.PI, 0];

    positions.push({
      ...images[i],
      position: [x, WALL_HEIGHT / 2, z], // Centrar verticalmente en la pared
      rotation,
    });
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
    // Dimensiones mínimas para sala vacía
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

  // Calcular espaciado mínimo necesario
  const minSpacing = PICTURE_SPACING;
  const spacingTotal = (pairs - 1) * minSpacing;
  const contentLength = spacingTotal + PICTURE_WIDTH;

  // Para salas pequeñas, usar dimensiones mínimas pero balanceadas
  const MIN_GALLERY_LENGTH = 20; // Longitud mínima de la galería
  const MIN_PAIRS = 3; // Mínimo 3 pares (6 obras) para distribución cómoda

  let adjustedContentLength = contentLength;
  let adjustedSpacingTotal = spacingTotal;

  if (artworks.length < MIN_PAIRS * 2) {
    // Para salas con pocas obras, usar espaciado más generoso
    const minPairs = Math.max(MIN_PAIRS, pairs);
    adjustedSpacingTotal = (minPairs - 1) * minSpacing;
    adjustedContentLength = Math.max(
      MIN_GALLERY_LENGTH,
      adjustedSpacingTotal + PICTURE_WIDTH
    );
  }

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

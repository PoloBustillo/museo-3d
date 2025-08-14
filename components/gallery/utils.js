import { GALLERY_CONFIG } from "./core/config.js";

const {
  HALL_WIDTH,
  WALL_HEIGHT,
  PICTURE_SPACING,
  PICTURE_WIDTH,
  WALL_MARGIN_INITIAL,
  WALL_MARGIN_FINAL,
} = GALLERY_CONFIG;

const WALL_ART_OFFSET = 0.25; // separación desde la pared hacia adentro

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
    const z = side === 1 ? (HALL_WIDTH / 2 - WALL_ART_OFFSET) : -(HALL_WIDTH / 2 - WALL_ART_OFFSET);
    const rotation = [0, side === 1 ? 0 : Math.PI, 0];
    // Altura fija 1.5 para centrar mejor cuadros altos
    positions.push({ ...images[i], position: [x, 1.6, z], rotation });
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
  // Span mínimo entre centros (sin contar ancho de un cuadro)
  let centerSpan = (pairs - 1) * minSpacing; // distancia entre primer y último centro
  // Longitud mínima total requerida (centers span + ancho de un cuadro)
  const naturalContent = centerSpan + PICTURE_WIDTH;
  const MIN_GALLERY_LENGTH = 20;
  // Ajustar a mínimo global
  let targetContent = Math.max(MIN_GALLERY_LENGTH, naturalContent);
  // Si targetContent es mayor, expandimos spacing para llenar uniformemente
  let spacing = minSpacing;
  if (pairs > 1) {
    spacing = (targetContent - PICTURE_WIDTH) / (pairs - 1);
    centerSpan = (pairs - 1) * spacing;
  } else {
    centerSpan = 0; // una sola obra
  }
  // Centrar: primer centro en -centerSpan/2, último en +centerSpan/2
  const firstCenter = -centerSpan / 2;
  const lastCenter = centerSpan / 2;
  const firstX = firstCenter; // interpretamos firstX como posición X del primer centro
  const lastX = lastCenter; // y lastX del último centro para alineación con slots
  const contentLength = targetContent; // conservar semántica previa
  const dynamicLength = contentLength + WALL_MARGIN_INITIAL + WALL_MARGIN_FINAL;
  const result = {
    pairs,
    spacingTotal: centerSpan,
    contentLength,
    firstX,
    lastX,
    dynamicLength,
    dynamicCenterX: 0,
    wallMarginInitial: WALL_MARGIN_INITIAL,
    wallMarginFinal: WALL_MARGIN_FINAL,
    spacing, // nuevo: spacing real utilizado
  };
  if (typeof window !== 'undefined' && !window.__GALLERY_DIM_LOGGED__) {
    console.log('[GalleryDimensions] debug', result);
    window.__GALLERY_DIM_LOGGED__ = true;
  }
  return result;
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

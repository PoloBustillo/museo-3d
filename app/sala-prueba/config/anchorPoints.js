/**
 * Configuración de puntos de anclaje para obras de arte
 * Distribuidos uniformemente en todas las paredes de la sala
 */
import { 
  HALL_WIDTH, 
  HALL_DEPTH, 
  HALL_HEIGHT, 
  FRONT_CENTER, 
  BACK_CENTER, 
  HALF_HALL_W, 
  HALF_HALL_D,
  TOTAL_LENGTH 
} from '../sceneConfig';

// Altura estándar para colocar obras (altura media)
const ARTWORK_HEIGHT = HALL_HEIGHT * 0.4; // 4.8 unidades de altura

// Separación entre puntos de anclaje
const ANCHOR_SPACING = 6;

// Generar puntos en pared izquierda
const leftWallAnchors = [];
const leftWallCount = Math.floor(TOTAL_LENGTH / ANCHOR_SPACING);
for (let i = 0; i < leftWallCount; i++) {
  const z = -TOTAL_LENGTH/2 + (i + 0.5) * ANCHOR_SPACING;
  leftWallAnchors.push({
    id: `left-${i}`,
    position: [-HALF_HALL_W + 0.1, ARTWORK_HEIGHT, z],
    normal: [1, 0, 0], // normal hacia el interior
    wall: 'left'
  });
}

// Generar puntos en pared derecha
const rightWallAnchors = [];
const rightWallCount = Math.floor(TOTAL_LENGTH / ANCHOR_SPACING);
for (let i = 0; i < rightWallCount; i++) {
  const z = -TOTAL_LENGTH/2 + (i + 0.5) * ANCHOR_SPACING;
  rightWallAnchors.push({
    id: `right-${i}`,
    position: [HALF_HALL_W - 0.1, ARTWORK_HEIGHT, z],
    normal: [-1, 0, 0], // normal hacia el interior
    wall: 'right'
  });
}

// Generar puntos en pared trasera (back wall)
const backWallAnchors = [];
const backWallCount = Math.floor(HALL_WIDTH / ANCHOR_SPACING);
for (let i = 0; i < backWallCount; i++) {
  const x = -HALF_HALL_W + (i + 0.5) * ANCHOR_SPACING;
  backWallAnchors.push({
    id: `back-${i}`,
    position: [x, ARTWORK_HEIGHT, BACK_CENTER - HALF_HALL_D + 0.1],
    normal: [0, 0, 1], // normal hacia el interior
    wall: 'back'
  });
}

// Generar puntos en las paredes frontales (evitando la entrada)
const frontWallAnchors = [];
// Lado izquierdo de la entrada
const frontLeftCount = Math.floor((HALL_WIDTH/2 - 5) / ANCHOR_SPACING); // evitar zona de entrada
for (let i = 0; i < frontLeftCount; i++) {
  const x = -HALF_HALL_W + (i + 0.5) * ANCHOR_SPACING;
  if (x < -5) { // solo si está fuera de la zona de entrada
    frontWallAnchors.push({
      id: `front-left-${i}`,
      position: [x, ARTWORK_HEIGHT, FRONT_CENTER + HALF_HALL_D - 0.1],
      normal: [0, 0, -1],
      wall: 'front-left'
    });
  }
}

// Lado derecho de la entrada
const frontRightCount = Math.floor((HALL_WIDTH/2 - 5) / ANCHOR_SPACING);
for (let i = 0; i < frontRightCount; i++) {
  const x = 5 + (i + 0.5) * ANCHOR_SPACING; // empezar después de la entrada
  if (x < HALF_HALL_W) {
    frontWallAnchors.push({
      id: `front-right-${i}`,
      position: [x, ARTWORK_HEIGHT, FRONT_CENTER + HALF_HALL_D - 0.1],
      normal: [0, 0, -1],
      wall: 'front-right'
    });
  }
}

// Puntos en las paredes internas (separación entre salas)
const internalFrontAnchors = [];
const internalBackAnchors = [];

// Pared interna frontal (evitando apertura central)
const internalFrontLeftCount = Math.floor((HALL_WIDTH/2 - 7) / ANCHOR_SPACING);
for (let i = 0; i < internalFrontLeftCount; i++) {
  const x = -HALF_HALL_W + (i + 0.5) * ANCHOR_SPACING;
  if (x < -7) {
    internalFrontAnchors.push({
      id: `internal-front-left-${i}`,
      position: [x, ARTWORK_HEIGHT, FRONT_CENTER - HALF_HALL_D + 0.1],
      normal: [0, 0, 1],
      wall: 'internal-front-left'
    });
  }
}

const internalFrontRightCount = Math.floor((HALL_WIDTH/2 - 7) / ANCHOR_SPACING);
for (let i = 0; i < internalFrontRightCount; i++) {
  const x = 7 + (i + 0.5) * ANCHOR_SPACING;
  if (x < HALF_HALL_W) {
    internalFrontAnchors.push({
      id: `internal-front-right-${i}`,
      position: [x, ARTWORK_HEIGHT, FRONT_CENTER - HALF_HALL_D + 0.1],
      normal: [0, 0, 1],
      wall: 'internal-front-right'
    });
  }
}

// Pared interna trasera (evitando apertura central)
const internalBackLeftCount = Math.floor((HALL_WIDTH/2 - 7) / ANCHOR_SPACING);
for (let i = 0; i < internalBackLeftCount; i++) {
  const x = -HALF_HALL_W + (i + 0.5) * ANCHOR_SPACING;
  if (x < -7) {
    internalBackAnchors.push({
      id: `internal-back-left-${i}`,
      position: [x, ARTWORK_HEIGHT, BACK_CENTER + HALF_HALL_D - 0.1],
      normal: [0, 0, -1],
      wall: 'internal-back-left'
    });
  }
}

const internalBackRightCount = Math.floor((HALL_WIDTH/2 - 7) / ANCHOR_SPACING);
for (let i = 0; i < internalBackRightCount; i++) {
  const x = 7 + (i + 0.5) * ANCHOR_SPACING;
  if (x < HALF_HALL_W) {
    internalBackAnchors.push({
      id: `internal-back-right-${i}`,
      position: [x, ARTWORK_HEIGHT, BACK_CENTER + HALF_HALL_D - 0.1],
      normal: [0, 0, -1],
      wall: 'internal-back-right'
    });
  }
}

// Combinar todos los puntos de anclaje
export const anchorPoints = [
  ...leftWallAnchors,
  ...rightWallAnchors,
  ...backWallAnchors,
  ...frontWallAnchors,
  ...internalFrontAnchors,
  ...internalBackAnchors
];

// Utilidades para buscar puntos específicos
export const getAnchorById = (id) => anchorPoints.find(point => point.id === id);

export const getAnchorsByWall = (wall) => anchorPoints.filter(point => point.wall === wall);

export const getAvailableAnchors = (usedAnchorIds = []) => 
  anchorPoints.filter(point => !usedAnchorIds.includes(point.id));

// Estadísticas de la configuración
export const anchorStats = {
  total: anchorPoints.length,
  byWall: {
    left: leftWallAnchors.length,
    right: rightWallAnchors.length,
    back: backWallAnchors.length,
    front: frontWallAnchors.length,
    internalFront: internalFrontAnchors.length,
    internalBack: internalBackAnchors.length
  },
  spacing: ANCHOR_SPACING,
  height: ARTWORK_HEIGHT
};

console.log('Anchor Points Configuration:', anchorStats);

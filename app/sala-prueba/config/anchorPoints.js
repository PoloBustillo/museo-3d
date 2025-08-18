/**
 * Configuración de puntos de anclaje para obras de arte
 * Distribuidos uniformemente en paredes seleccionadas de la sala, evitando divisores y entrada
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

// Separación entre puntos de anclaje - aumentada para evitar amontonamiento
const ANCHOR_SPACING = 15; // Aumentado de 10 a 15 para mayor separación

// Generar puntos en pared izquierda - evitando zona de divisores (Z ≈ 0)
const leftWallAnchors = [];

// SALA TRASERA (Z negativo) - solo 3 puntos bien separados
for (let i = 0; i < 3; i++) {
  const z = BACK_CENTER - HALF_HALL_D + 5 + (i * ANCHOR_SPACING);
  if (z < -10) { // Evitar acercarse a la zona divisoria
    leftWallAnchors.push({
      id: `left-back-${i}`,
      position: [-HALF_HALL_W + 0.1, ARTWORK_HEIGHT, z],
      normal: [1, 0, 0], // normal hacia el interior
      wall: 'left-back'
    });
  }
}

// SALA FRONTAL (Z positivo) - solo 3 puntos bien separados  
for (let i = 0; i < 3; i++) {
  const z = FRONT_CENTER - HALF_HALL_D + 5 + (i * ANCHOR_SPACING);
  if (z > 10 && z < FRONT_CENTER + HALF_HALL_D - 5) { // Evitar zona divisoria y zona de entrada
    leftWallAnchors.push({
      id: `left-front-${i}`,
      position: [-HALF_HALL_W + 0.1, ARTWORK_HEIGHT, z],
      normal: [1, 0, 0], // normal hacia el interior
      wall: 'left-front'
    });
  }
}

// Generar puntos en pared derecha - misma lógica que izquierda
const rightWallAnchors = [];

// SALA TRASERA (Z negativo)
for (let i = 0; i < 3; i++) {
  const z = BACK_CENTER - HALF_HALL_D + 5 + (i * ANCHOR_SPACING);
  if (z < -10) { // Evitar zona divisoria
    rightWallAnchors.push({
      id: `right-back-${i}`,
      position: [HALF_HALL_W - 0.1, ARTWORK_HEIGHT, z],
      normal: [-1, 0, 0], // normal hacia el interior
      wall: 'right-back'
    });
  }
}

// SALA FRONTAL (Z positivo)
for (let i = 0; i < 3; i++) {
  const z = FRONT_CENTER - HALF_HALL_D + 5 + (i * ANCHOR_SPACING);
  if (z > 10 && z < FRONT_CENTER + HALF_HALL_D - 5) { // Evitar zona divisoria y entrada
    rightWallAnchors.push({
      id: `right-front-${i}`,
      position: [HALF_HALL_W - 0.1, ARTWORK_HEIGHT, z],
      normal: [-1, 0, 0], // normal hacia el interior
      wall: 'right-front'
    });
  }
}

// Generar puntos en pared trasera - solo 2 puntos bien separados
const backWallAnchors = [];
const backPositions = [-10, 10]; // Solo 2 posiciones: izquierda y derecha del centro

backPositions.forEach((x, index) => {
  backWallAnchors.push({
    id: `back-${index}`,
    position: [x, ARTWORK_HEIGHT, BACK_CENTER - HALF_HALL_D + 0.1],
    normal: [0, 0, 1], // normal hacia el interior
    wall: 'back'
  });
});

// Generar puntos en las paredes frontales (solo algunas posiciones, lejos de la entrada)
const frontWallAnchors = [];
// Solo en las esquinas, alejado de la zona central de entrada
const frontPositions = [
  { x: -HALF_HALL_W + 3, side: 'front-far-left' },
  { x: HALF_HALL_W - 3, side: 'front-far-right' }
];

frontPositions.forEach((pos, index) => {
  frontWallAnchors.push({
    id: `front-${pos.side}`,
    position: [pos.x, ARTWORK_HEIGHT, FRONT_CENTER + HALF_HALL_D - 0.1],
    normal: [0, 0, -1],
    wall: pos.side
  });
});

// Puntos en las paredes internas (separación entre salas) deshabilitados para evitar obras cerca de divisores
const internalFrontAnchors = [];
const internalBackAnchors = [];

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

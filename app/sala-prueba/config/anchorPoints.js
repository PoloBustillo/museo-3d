/**
 * Configuración de puntos de anclaje para obras de arte
 * Nueva distribución: recorre en orden lógico desde la puerta (sala frontal) hacia la sala trasera.
 * Se mantienen los nombres de paredes e IDs compatibles con el algoritmo de asignación (useSalaData) pero
 * se recalculan posiciones para mejorar visibilidad, ritmo y evitar tapar obras con muros internos.
 */
import { 
  HALL_WIDTH, 
  HALL_DEPTH, 
  HALL_HEIGHT, 
  FRONT_CENTER, 
  BACK_CENTER, 
  HALF_HALL_W, 
  HALF_HALL_D
} from '../sceneConfig';

// Altura estándar (aprox. 1.6m – 1.8m a centro de obra) => 40% de la altura del hall
const ARTWORK_HEIGHT = HALL_HEIGHT * 0.4; // 4.8

// Margenes para no invadir áreas conflictivas
const ENTRANCE_MARGIN_Z = 3;         // metros dentro desde la puerta
const DIVIDER_MARGIN_Z = 2;          // separación de los planos divisores (z ≈ ±25)
const BACK_WALL_MARGIN = 0.1;        // ligera separación de pared
const SIDE_WALL_OFFSET = 0.1;        // separar del plano lateral

// Cantidad de anclajes por tramo
const FRONT_SIDE_COUNT = 4; // más ritmo visual en sala frontal
const BACK_SIDE_COUNT = 3;  // menos densidad atrás para remate
const BACK_WALL_COUNT = 2;  // remate final (izq / der)

// Rango Z sala frontal: [FRONT_CENTER - HALF_HALL_D, FRONT_CENTER + HALF_HALL_D]
const FRONT_Z_MIN = FRONT_CENTER - HALF_HALL_D + DIVIDER_MARGIN_Z; // evitar divisor frontal (≈25)
const FRONT_Z_MAX = FRONT_CENTER + HALF_HALL_D - ENTRANCE_MARGIN_Z; // evitar puerta (≈53 - margen)

// Rango Z sala trasera: [BACK_CENTER - HALF_HALL_D, BACK_CENTER + HALF_HALL_D]
const BACK_Z_BACK_WALL = BACK_CENTER - HALF_HALL_D + BACK_WALL_MARGIN; // pared más profunda (≈ -53)
const BACK_Z_MIN = BACK_CENTER + HALF_HALL_D - DIVIDER_MARGIN_Z;       // borde cercano al divisor (≈ -25 + margen)
const BACK_Z_MAX = BACK_Z_BACK_WALL + 6; // un poco hacia delante desde la pared para ritmo (-47 aprox)

// Utilidad para generar posiciones interpoladas (inclusive endpoints controlados)
function spreadDescending(from, to, count) {
  if (count === 1) return [from];
  const arr = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    arr.push(from + (to - from) * t);
  }
  return arr; // devolver en el orden construido (from → to)
}

// 1) PAREDES SALA FRONTAL – perspectiva inicial
// Right-front: empezar CERCA de la entrada y avanzar hacia el interior (Z decreciente)
const rightFrontZs = spreadDescending(FRONT_Z_MAX, FRONT_Z_MIN + 6, FRONT_SIDE_COUNT); // dejar colchón antes del divisor
// Left-front: queremos que el recorrido cruce y "regrese" hacia la salida para balance visual, así que invertimos el sentido
const leftFrontZs = spreadDescending(FRONT_Z_MIN + 6, FRONT_Z_MAX, FRONT_SIDE_COUNT);

const leftFrontAnchors = leftFrontZs.map((z, i) => ({
  id: `left-front-${i}`,
  position: [-HALF_HALL_W + SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z],
  normal: [1, 0, 0],
  wall: 'left-front'
}));
const rightFrontAnchors = rightFrontZs.map((z, i) => ({
  id: `right-front-${i}`,
  position: [HALF_HALL_W - SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z],
  normal: [-1, 0, 0],
  wall: 'right-front'
}));

// 2) ESQUINAS FRONTALES (eliminadas: no se permiten obras en pared de la puerta)
const frontCornersAnchors = [];

// 3) PAREDES SALA TRASERA – progresión final
// Right-back: avanzar desde el "umbral" (cerca del divisor) hacia la pared trasera (z más negativo)
const rightBackZs = spreadDescending(BACK_Z_MIN, BACK_Z_MAX, BACK_SIDE_COUNT);
// Left-back: invertir sentido para ritmo (del fondo hacia el umbral) – se aplicará mismo orden de IDs
const leftBackZs = spreadDescending(BACK_Z_MAX, BACK_Z_MIN, BACK_SIDE_COUNT);

const rightBackAnchors = rightBackZs.map((z, i) => ({
  id: `right-back-${i}`,
  position: [HALF_HALL_W - SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z],
  normal: [-1, 0, 0],
  wall: 'right-back'
}));
const leftBackAnchors = leftBackZs.map((z, i) => ({
  id: `left-back-${i}`,
  position: [-HALF_HALL_W + SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z],
  normal: [1, 0, 0],
  wall: 'left-back'
}));

// 4) PARED TRASERA – remate (centrada y clara)
// Distribuir horizontalmente evitando centro exacto para foco de vista + ritmo
const backWallXs = [-10, 10];
const backWallAnchors = backWallXs.slice(0, BACK_WALL_COUNT).map((x, i) => ({
  id: `back-${i}`,
  position: [x, ARTWORK_HEIGHT, BACK_Z_BACK_WALL],
  normal: [0, 0, 1],
  wall: 'back'
}));

// Agregar zona media (corredor) para distribuir cuando hay pocas obras
const MID_SIDE_COUNT = 3; // -18, 0, +18 aprox.
const CORRIDOR_Z_MIN = - (FRONT_CENTER - HALF_HALL_D) + 2; // ~ -23
const CORRIDOR_Z_MAX = (FRONT_CENTER - HALF_HALL_D) - 2;  // ~ 23
// Distribución manual para control fino
const midZs = [-18, 0, 18].filter(z => z > CORRIDOR_Z_MIN && z < CORRIDOR_Z_MAX);
const rightMidAnchors = midZs.map((z,i)=>({
  id: `right-mid-${i}`,
  position: [HALF_HALL_W - SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z],
  normal: [-1,0,0],
  wall: 'right-mid'
}));
const leftMidAnchors = midZs.map((z,i)=>({
  id: `left-mid-${i}`,
  position: [-HALF_HALL_W + SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z],
  normal: [1,0,0],
  wall: 'left-mid'
}));

// Ajustar front anchors para no acercarse demasiado a la puerta (eliminar los más cercanos si z > FRONT_Z_MAX - 4)
const FRONT_DOOR_SAFE_Z = FRONT_Z_MAX - 4;
const filteredRightFrontAnchors = rightFrontAnchors.filter(a => a.position[2] <= FRONT_DOOR_SAFE_Z);
const filteredLeftFrontAnchors = leftFrontAnchors.filter(a => a.position[2] <= FRONT_DOOR_SAFE_Z);

// Asegurar arrays internos definidos (actualmente no usados)
const internalFrontAnchors = [];
const internalBackAnchors = [];

// Exportar anchorPoints actualizados (sin pared de la puerta y filtrando cualquier normal -Z)
let rawAnchorPoints = [
  ...filteredRightFrontAnchors,
  ...filteredLeftFrontAnchors,
  ...rightMidAnchors,
  ...leftMidAnchors,
  ...rightBackAnchors,
  ...leftBackAnchors,
  ...backWallAnchors,
  ...internalFrontAnchors,
  ...internalBackAnchors
];
// Filtro defensivo: excluir cualquier anchor cuya normal apunte hacia -Z (pared con puerta)
rawAnchorPoints = rawAnchorPoints.filter(a => !(a.normal && a.normal[2] < 0));
export const anchorPoints = rawAnchorPoints;

// Utilidades para buscar puntos específicos
export const getAnchorById = (id) => anchorPoints.find(point => point.id === id);
export const getAnchorsByWall = (wall) => anchorPoints.filter(point => point.wall === wall);
export const getAvailableAnchors = (usedAnchorIds = []) => anchorPoints.filter(point => !usedAnchorIds.includes(point.id));

// Estadísticas
export const anchorStats = {
  total: anchorPoints.length,
  byWall: {
    rightFront: filteredRightFrontAnchors.length,
    leftFront: filteredLeftFrontAnchors.length,
    rightMid: rightMidAnchors.length,
    leftMid: leftMidAnchors.length,
    rightBack: rightBackAnchors.length,
    leftBack: leftBackAnchors.length,
    back: backWallAnchors.length,
    // frontCorners removido
    internalFront: internalFrontAnchors.length,
    internalBack: internalBackAnchors.length
  },
  layout: {
    frontZRange: [FRONT_Z_MIN, FRONT_Z_MAX],
    midZRange: [CORRIDOR_Z_MIN, CORRIDOR_Z_MAX],
    backZRange: [BACK_Z_BACK_WALL, BACK_Z_MIN],
    entranceMargin: ENTRANCE_MARGIN_Z,
    dividerMargin: DIVIDER_MARGIN_Z,
    doorSafeZ: FRONT_DOOR_SAFE_Z
  },
  artworkHeight: ARTWORK_HEIGHT
};

console.log('Anchor Points Configuration (nuevo con mid):', anchorStats);

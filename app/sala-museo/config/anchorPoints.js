// Configuración de puntos de anclaje integrada
import { HALL_HEIGHT, FRONT_CENTER, BACK_CENTER, HALF_HALL_W, HALF_HALL_D } from '../sceneConfig';
const ARTWORK_HEIGHT = HALL_HEIGHT * 0.4;
const ENTRANCE_MARGIN_Z = 3;
const DIVIDER_MARGIN_Z = 2;
const BACK_WALL_MARGIN = 0.1;
const SIDE_WALL_OFFSET = 0.1;
const FRONT_SIDE_COUNT = 4;
const BACK_SIDE_COUNT = 3;
const BACK_WALL_COUNT = 2;
const FRONT_Z_MIN = FRONT_CENTER - HALF_HALL_D + DIVIDER_MARGIN_Z;
const FRONT_Z_MAX = FRONT_CENTER + HALF_HALL_D - ENTRANCE_MARGIN_Z;
const BACK_Z_BACK_WALL = BACK_CENTER - HALF_HALL_D + BACK_WALL_MARGIN;
const BACK_Z_MIN = BACK_CENTER + HALF_HALL_D - DIVIDER_MARGIN_Z;
const BACK_Z_MAX = BACK_Z_BACK_WALL + 6;
function spreadDescending(from, to, count){ if(count===1) return [from]; const arr=[]; for(let i=0;i<count;i++){ const t=i/(count-1); arr.push(from + (to-from)*t);} return arr; }
const rightFrontZs = spreadDescending(FRONT_Z_MAX, FRONT_Z_MIN + 6, FRONT_SIDE_COUNT);
const leftFrontZs = spreadDescending(FRONT_Z_MIN + 6, FRONT_Z_MAX, FRONT_SIDE_COUNT);
const leftFrontAnchors = leftFrontZs.map((z,i)=>({ id:`left-front-${i}`, position:[-HALF_HALL_W + SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z], normal:[1,0,0], wall:'left-front'}));
const rightFrontAnchors = rightFrontZs.map((z,i)=>({ id:`right-front-${i}`, position:[HALF_HALL_W - SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z], normal:[-1,0,0], wall:'right-front'}));
const rightBackZs = spreadDescending(BACK_Z_MIN, BACK_Z_MAX, BACK_SIDE_COUNT);
const leftBackZs = spreadDescending(BACK_Z_MAX, BACK_Z_MIN, BACK_SIDE_COUNT);
const rightBackAnchors = rightBackZs.map((z,i)=>({ id:`right-back-${i}`, position:[HALF_HALL_W - SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z], normal:[-1,0,0], wall:'right-back'}));
const leftBackAnchors = leftBackZs.map((z,i)=>({ id:`left-back-${i}`, position:[-HALF_HALL_W + SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z], normal:[1,0,0], wall:'left-back'}));
const backWallXs = [-10, 10];
const backWallAnchors = backWallXs.slice(0,BACK_WALL_COUNT).map((x,i)=>({ id:`back-${i}`, position:[x, ARTWORK_HEIGHT, BACK_Z_BACK_WALL], normal:[0,0,1], wall:'back'}));
const midZs = [-18,0,18].filter(z=> z > -(FRONT_CENTER - HALF_HALL_D) + 2 && z < FRONT_CENTER - HALF_HALL_D - 2);
const rightMidAnchors = midZs.map((z,i)=>({ id:`right-mid-${i}`, position:[HALF_HALL_W - SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z], normal:[-1,0,0], wall:'right-mid'}));
const leftMidAnchors = midZs.map((z,i)=>({ id:`left-mid-${i}`, position:[-HALF_HALL_W + SIDE_WALL_OFFSET, ARTWORK_HEIGHT, z], normal:[1,0,0], wall:'left-mid'}));
const FRONT_DOOR_SAFE_Z = FRONT_Z_MAX - 4;
const filteredRightFrontAnchors = rightFrontAnchors.filter(a=> a.position[2] <= FRONT_DOOR_SAFE_Z);
const filteredLeftFrontAnchors = leftFrontAnchors.filter(a=> a.position[2] <= FRONT_DOOR_SAFE_Z);
const FRONT_DIVIDER_Z = FRONT_CENTER - HALF_HALL_D;
const BACK_DIVIDER_Z = BACK_CENTER + HALF_HALL_D;
const DIVIDER_WALL_XS = [-HALF_HALL_W * 0.6, 0, HALF_HALL_W * 0.6];
const dividerFrontAnchors = DIVIDER_WALL_XS.map((x,i)=>({ id:`divider-front-${i}`, position:[x, ARTWORK_HEIGHT, FRONT_DIVIDER_Z + 0.01], normal:[0,0,1], wall:'divider-front'}));
const dividerBackAnchors = DIVIDER_WALL_XS.map((x,i)=>({ id:`divider-back-${i}`, position:[x, ARTWORK_HEIGHT, BACK_DIVIDER_Z + 0.01], normal:[0,0,1], wall:'divider-back'}));
let rawAnchorPoints = [
  ...filteredRightFrontAnchors,
  ...filteredLeftFrontAnchors,
  ...dividerFrontAnchors,
  ...rightMidAnchors,
  ...leftMidAnchors,
  ...dividerBackAnchors,
  ...rightBackAnchors,
  ...leftBackAnchors,
  ...backWallAnchors
];
rawAnchorPoints = rawAnchorPoints.filter(a=> !(a.normal && a.normal[2] < 0));
export const anchorPoints = rawAnchorPoints;
export const getAnchorById = id => anchorPoints.find(p=>p.id===id);
export const getAnchorsByWall = wall => anchorPoints.filter(p=>p.wall===wall);
export const getAvailableAnchors = (used=[]) => anchorPoints.filter(p=> !used.includes(p.id));

"use client";
// Configuración y constantes de la sala de prueba
export const HALL_WIDTH = 40;      // ancho total X
export const HALL_DEPTH = 28;      // profundidad de cada sala
export const HALL_HEIGHT = 12;     // altura
export const CORRIDOR_WIDTH = 14;  // ancho del pasillo y de las aperturas
export const CORRIDOR_LENGTH = 50; // separación entre las salas
export const WALL_THICK = 0.4;
export const ENTRANCE_WIDTH = 10;  // entrada principal

// Derivados
export const TOTAL_LENGTH = HALL_DEPTH * 2 + CORRIDOR_LENGTH;
export const FRONT_CENTER = CORRIDOR_LENGTH / 2 + HALL_DEPTH / 2;
export const BACK_CENTER = -FRONT_CENTER;
export const HALF_HALL_W = HALL_WIDTH / 2;
export const HALF_HALL_D = HALL_DEPTH / 2;

// Colores
export const WALL_COLOR = '#f2f2f2';
export const FLOOR_COLOR = '#dadada';
export const CEIL_COLOR = '#ffffff';

export const PRESENTATION_ROT_SPEED = 0.15;

"use client";
// Configuración y constantes de la sala de prueba
export const HALL_WIDTH = 40; // ancho total X
export const HALL_DEPTH = 28; // profundidad de cada sala
export const HALL_HEIGHT = 12; // altura
export const CORRIDOR_WIDTH = 14; // ancho del pasillo y de las aperturas
export const CORRIDOR_LENGTH = 50; // separación entre las salas
export const WALL_THICK = 0.4;
export const ENTRANCE_WIDTH = 10; // entrada principal

// Derivados
export const TOTAL_LENGTH = HALL_DEPTH * 2 + CORRIDOR_LENGTH;
export const FRONT_CENTER = CORRIDOR_LENGTH / 2 + HALL_DEPTH / 2;
export const BACK_CENTER = -FRONT_CENTER;
export const HALF_HALL_W = HALL_WIDTH / 2;
export const HALF_HALL_D = HALL_DEPTH / 2;

// Colores
export const WALL_COLOR = "#f2f2f2"; // base mid tone
export const WALL_TOP_COLOR = "#ffffff"; // gradiente parte superior
export const WALL_BOTTOM_COLOR = "#e3e3e3"; // gradiente parte inferior
export const ENTRANCE_ACCENT_COLOR = "#c7c7c7"; // marco / moldura
export const FLOOR_COLOR = "#d5d5d5";
export const CEIL_COLOR = "#fcfcfc";

// Escala / rotaciones de presentación
export const MB = 0.5; // miniatura base (escala)
export const INITIAL_ROT_Y = (45 * Math.PI) / 180; // 45 grados en Y
export const INITIAL_ROT_X = (30 * Math.PI) / 180; // -20 grados en X (ligera inclinación hacia abajo)

// Dinámica de presentación
export const PRESENTATION_ROT_SPEED = 0.12; // rad/s
export const PRESENTATION_EASE_IN = 1.2; // s para llegar a velocidad completa
export const PRESENTATION_EASE_OUT = 0.6; // s para detenerse
export const PRESENTATION_FLOAT_AMPLITUDE = 0.25; // metros
export const PRESENTATION_FLOAT_SPEED = 0.5; // Hz
// Pulso de luz ambiental
export const PRESENTATION_PULSE_BASE = 0.35;
export const PRESENTATION_PULSE_DELTA = 0.08;

// Presentación / cámara
// Camera positions tuned to show more interior (lower height, deeper look)
export const CAMERA_INITIAL_POS = [
  0,
  HALL_HEIGHT * 0.8,
  FRONT_CENTER + HALF_HALL_D + 20,
];
// Posición objetivo: justo dentro del lobby frente a la puerta (a ~1m detrás del plano de la puerta)
export const CAMERA_TARGET_POS = [0, 1.85, FRONT_CENTER + HALF_HALL_D - 1.4]; // ~51.6 si puerta ~52.6
export const CAMERA_TARGET_LOOK = [0, 1.9, FRONT_CENTER - HALF_HALL_D + 3]; // mira hacia el interior desde la puerta
export const ENTRANCE_ANIM_DURATION = 3000; // ms
export const ENABLE_FOG = true;
export const FOG_NEAR = 35;
export const FOG_FAR = 160;

// Límites de exploración (evitan atravesar muros y salida frontal). Valores ajustados con un margen interno.
export const EXPLORE_BOUNDS = {
  minX: -HALF_HALL_W + 1,
  maxX: HALF_HALL_W - 1,
  // Permite recorrer desde casi el fondo hasta el lobby frontal
  minZ: BACK_CENTER - HALF_HALL_D + 1.2,
  // Hasta justo antes del plano de la puerta exterior (evita atravesarla)
  maxZ: FRONT_CENTER + HALF_HALL_D - 1.2 // ~51.8
};

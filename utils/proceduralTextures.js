/**
 * Utilidades para generar texturas procedurales optimizadas
 * Módulo centralizado para evitar duplicación de código
 */
import * as THREE from 'three';

// Configuración optimizada para tiles de techo
const CEILING_CONFIG = {
  TILE_W: 128,
  TILE_H: 64, 
  COLS: 4,
  ROWS: 8,
  BASE_LUMINANCE: 236,
  LUMINANCE_VARIANCE: 12,
  NOISE_AMPLITUDE: 6,
  HEIGHT_NOISE_AMPLITUDE: 4,
  REPEAT_SCALE: 4,
  NORMAL_SCALE: 0.4,
  ROUGHNESS: 0.35,
  EMISSIVE_INTENSITY: 0.04
};

/**
 * Genera un canal de altura para mapas de normales
 */
function generateHeightData(canvas, ctx, config) {
  const { TILE_W, TILE_H, COLS, ROWS } = config;
  const w = TILE_W * COLS;
  const h = TILE_H * ROWS;

  ctx.fillStyle = 'rgb(215,215,215)';
  ctx.fillRect(0, 0, w, h);

  // Generar tiles con altura variable
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      // Área elevada del tile
      ctx.fillStyle = 'rgb(228,228,228)';
      ctx.fillRect(tx * TILE_W + 2, ty * TILE_H + 2, TILE_W - 4, TILE_H - 4);
      
      // Gradiente de altura interno
      const gradient = ctx.createLinearGradient(0, ty * TILE_H, 0, ty * TILE_H + TILE_H);
      gradient.addColorStop(0, 'rgb(220,220,220)');
      gradient.addColorStop(0.5, 'rgb(238,238,238)');
      gradient.addColorStop(1, 'rgb(220,220,220)');
      ctx.fillStyle = gradient;
      ctx.fillRect(tx * TILE_W + 3, ty * TILE_H + 3, TILE_W - 6, TILE_H - 6);
    }
  }

  // Uniones recesadas
  ctx.strokeStyle = 'rgb(205,205,205)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= COLS; x++) {
    const px = x * TILE_W + 1;
    ctx.moveTo(px, 0);
    ctx.lineTo(px, h);
  }
  for (let y = 0; y <= ROWS; y++) {
    const py = y * TILE_H + 1;
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
  }
  ctx.stroke();
}

/**
 * Genera datos de color para tiles de techo
 */
function generateColorData(canvas, ctx, config) {
  const { TILE_W, TILE_H, COLS, ROWS, BASE_LUMINANCE, LUMINANCE_VARIANCE } = config;
  const w = TILE_W * COLS;
  const h = TILE_H * ROWS;

  ctx.fillStyle = '#f1f2f5';
  ctx.fillRect(0, 0, w, h);

  // Generar tiles con variación de luminancia
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const baseLum = BASE_LUMINANCE + Math.random() * LUMINANCE_VARIANCE;
      ctx.fillStyle = `rgb(${baseLum},${baseLum},${baseLum})`;
      ctx.fillRect(tx * TILE_W, ty * TILE_H, TILE_W, TILE_H);

      // Gradiente de sombreado sutil
      const gradient = ctx.createLinearGradient(0, ty * TILE_H, 0, ty * TILE_H + TILE_H);
      gradient.addColorStop(0, 'rgba(0,0,0,0.04)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.045)');
      ctx.fillStyle = gradient;
      ctx.fillRect(tx * TILE_W + 1, ty * TILE_H + 1, TILE_W - 2, TILE_H - 2);
    }
  }

  // Uniones visibles
  ctx.strokeStyle = 'rgba(135,135,145,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= COLS; x++) {
    const px = x * TILE_W + 1;
    ctx.moveTo(px, 0);
    ctx.lineTo(px, h);
  }
  for (let y = 0; y <= ROWS; y++) {
    const py = y * TILE_H + 1;
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
  }
  ctx.stroke();
}

/**
 * Aplica ruido micro-detalle a ImageData
 */
function applyNoise(imageData, amplitude) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * amplitude;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
}

/**
 * Genera mapa de normales usando filtro Sobel optimizado
 */
function generateNormalMap(heightImageData, width, height) {
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  const nctx = normalCanvas.getContext('2d');
  const normalData = nctx.createImageData(width, height);

  const heightAt = (x, y) => {
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
    return heightImageData.data[(y * width + x) * 4];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hl = heightAt(x - 1, y);
      const hr = heightAt(x + 1, y);
      const hu = heightAt(x, y - 1);
      const hd = heightAt(x, y + 1);
      
      const sx = (hl - hr) / 255;
      const sy = (hu - hd) / 255;
      const sz = 1 / Math.sqrt(sx * sx + sy * sy + 1);
      
      const offset = (y * width + x) * 4;
      normalData.data[offset] = (sx * sz * 0.5 + 0.5) * 255;
      normalData.data[offset + 1] = (sy * sz * 0.5 + 0.5) * 255;
      normalData.data[offset + 2] = (sz * 0.5 + 0.5) * 255;
      normalData.data[offset + 3] = 255;
    }
  }

  nctx.putImageData(normalData, 0, 0);
  return normalCanvas;
}

/**
 * Crea textura de techo profesional con tiles rectangulares blancos
 */
export function createCeilingTileTexture(config = CEILING_CONFIG) {
  const { TILE_W, TILE_H, COLS, ROWS, NOISE_AMPLITUDE, HEIGHT_NOISE_AMPLITUDE, 
          REPEAT_SCALE, NORMAL_SCALE, ROUGHNESS, EMISSIVE_INTENSITY } = config;
  
  const w = TILE_W * COLS;
  const h = TILE_H * ROWS;

  // Canvas para color
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = w;
  colorCanvas.height = h;
  const colorCtx = colorCanvas.getContext('2d');

  // Canvas para altura
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = w;
  heightCanvas.height = h;
  const heightCtx = heightCanvas.getContext('2d');

  // Generar datos base
  generateColorData(colorCanvas, colorCtx, config);
  generateHeightData(heightCanvas, heightCtx, config);

  // Aplicar ruido
  const colorImageData = colorCtx.getImageData(0, 0, w, h);
  const heightImageData = heightCtx.getImageData(0, 0, w, h);
  
  applyNoise(colorImageData, NOISE_AMPLITUDE);
  applyNoise(heightImageData, HEIGHT_NOISE_AMPLITUDE);
  
  colorCtx.putImageData(colorImageData, 0, 0);
  heightCtx.putImageData(heightImageData, 0, 0);

  // Generar mapa de normales
  const normalCanvas = generateNormalMap(heightImageData, w, h);

  // Crear texturas Three.js optimizadas
  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
  colorTexture.repeat.set(REPEAT_SCALE, REPEAT_SCALE);
  colorTexture.anisotropy = 8;
  colorTexture.needsUpdate = true;

  const normalTexture = new THREE.CanvasTexture(normalCanvas);
  normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.repeat.set(REPEAT_SCALE, REPEAT_SCALE);
  normalTexture.anisotropy = 4;
  normalTexture.needsUpdate = true;

  // Material optimizado
  const material = new THREE.MeshStandardMaterial({
    map: colorTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(NORMAL_SCALE, NORMAL_SCALE),
    roughness: ROUGHNESS,
    metalness: 0,
    emissive: '#ffffff',
    emissiveIntensity: EMISSIVE_INTENSITY,
    side: THREE.DoubleSide,
    color: '#ffffff'
  });

  return { material, colorTexture, normalTexture };
}

/**
 * Hook React optimizado para texturas de techo
 */
export function useCeilingMaterial(config) {
  return React.useMemo(() => {
    const { material } = createCeilingTileTexture(config);
    return material;
  }, [config]);
}

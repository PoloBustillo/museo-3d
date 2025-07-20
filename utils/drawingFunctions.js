/**
 * @fileoverview Professional Drawing Engine for Canvas-based Digital Art
 * @author Museo 3D Development Team
 * @version 2.0.0
 *
 * This module provides a comprehensive, performant, and type-safe drawing system
 * for canvas-based digital art applications. Features include:
 * - 46+ advanced brush implementations
 * - Memory-efficient history management
 * - Color utilities with caching
 * - Professional error handling
 * - Modular architecture for easy extension
 *
 * @example
 * ```javascript
 * import { BrushEngine, ColorUtils, CanvasUtils } from './drawingFunctions';
 *
 * const engine = new BrushEngine(canvas);
 * engine.configure({ type: 'acuarela', color: '#ff0000', size: 20 });
 * engine.draw({ x: 100, y: 100 });
 * ```
 */

// ===========================
// TYPE DEFINITIONS & CONSTANTS
// ===========================

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} RGB
 * @property {number} r - Red value (0-255)
 * @property {number} g - Green value (0-255)
 * @property {number} b - Blue value (0-255)
 */

/**
 * @typedef {Object} BrushSettings
 * @property {string} type - Brush type identifier
 * @property {string} color - Color in hex format
 * @property {number} size - Brush size (1-200)
 * @property {number} [opacity=1] - Opacity value (0-1)
 */

// Performance and memory optimization constants
const PERFORMANCE = {
  MAX_BRUSH_SIZE: 200,
  MIN_BRUSH_SIZE: 1,
  PARTICLE_DENSITY_FACTOR: 0.3,
  INTERPOLATION_STEP: 3,
  MAX_HISTORY_SIZE: 50,
};

const DEFAULT_CANVAS_SIZE = { width: 800, height: 600 };

// ===========================
// COLOR UTILITIES
// ===========================

/**
 * Professional color utility class with validation, caching, and performance optimization
 */
export class ColorUtils {
  static #hexCache = new Map();
  static #rgbCache = new Map();

  /**
   * Validates hex color format with comprehensive checking
   * @param {string} hex - Color in hex format
   * @returns {boolean} - True if valid hex color
   */
  static isValidHex(hex) {
    if (typeof hex !== "string") return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  /**
   * Converts hex color to RGB with caching and error handling
   * @param {string} hex - Hex color string
   * @returns {RGB|null} - RGB object or null if invalid
   */
  static hexToRgb(hex) {
    if (!this.isValidHex(hex)) {
      console.warn(`Invalid hex color format: ${hex}`);
      return null;
    }

    // Check cache first for performance
    if (this.#hexCache.has(hex)) {
      return this.#hexCache.get(hex);
    }

    const cleanHex = hex.replace("#", "");
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split("")
            .map((char) => char + char)
            .join("")
        : cleanHex;

    const result = {
      r: parseInt(fullHex.slice(0, 2), 16),
      g: parseInt(fullHex.slice(2, 4), 16),
      b: parseInt(fullHex.slice(4, 6), 16),
    };

    // Cache for future use
    this.#hexCache.set(hex, result);
    return result;
  }

  /**
   * Converts hex to RGBA string with alpha channel
   * @param {string} hex - Hex color
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} - RGBA string
   */
  static hexToRgba(hex, alpha = 1) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return "rgba(0,0,0,1)";

    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${clampedAlpha})`;
  }

  /**
   * Converts RGB values to hex with caching
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {string} - Hex color string
   */
  static rgbToHex(r, g, b) {
    const cacheKey = `${r}-${g}-${b}`;
    if (this.#rgbCache.has(cacheKey)) {
      return this.#rgbCache.get(cacheKey);
    }

    const toHex = (n) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, "0");
    const result = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    this.#rgbCache.set(cacheKey, result);
    return result;
  }

  /**
   * Creates optimized radial gradient for brush effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Gradient radius
   * @param {string} color - Base color
   * @param {number[]} stops - Alpha stops for gradient
   * @returns {CanvasGradient} - Radial gradient
   */
  static createRadialGradient(ctx, x, y, radius, color, stops = [1, 0.5, 0]) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    stops.forEach((alpha, index) => {
      const position = index / (stops.length - 1);
      gradient.addColorStop(position, this.hexToRgba(color, alpha));
    });

    return gradient;
  }

  /**
   * Shades a color by a given percentage
   * @param {string} hex - Base color in hex
   * @param {number} percent - Percentage to shade (e.g., 10 for 10% lighter)
   * @returns {string} - Shaded color in hex
   */
  static shadeColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8) & (0x00ff + amt);
    const B = (num & 0x0000ff) + amt;
    const newHex =
      "#" + (0x10000 + R * 0x100 + G * 0x1 + B).toString(16).slice(1);
    return newHex;
  }

  /**
   * Clears color caches to free memory
   */
  static clearCache() {
    this.#hexCache.clear();
    this.#rgbCache.clear();
  }
}

// ===========================
// CANVAS UTILITIES
// ===========================

/**
 * Professional canvas utility class with comprehensive error handling
 */
export class CanvasUtils {
  /**
   * Safely gets canvas context with validation
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {CanvasRenderingContext2D} - 2D context
   * @throws {Error} - If canvas or context is invalid
   */
  static getContext(canvas) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid canvas element provided");
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get 2D context from canvas");
    }

    return ctx;
  }

  /**
   * Resets canvas context to optimized default state
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  static resetContext(ctx) {
    const defaults = {
      globalCompositeOperation: "source-over",
      globalAlpha: 1,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: "transparent",
      lineCap: "round",
      lineJoin: "round",
      lineWidth: 1,
      strokeStyle: "#000000",
      fillStyle: "#000000",
      imageSmoothingEnabled: true,
    };

    Object.assign(ctx, defaults);
  }

  /**
   * Efficiently clears canvas with background color
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {string} backgroundColor - Background color
   */
  static clear(canvas, backgroundColor = "#FFFFFF") {
    const ctx = this.getContext(canvas);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  /**
   * Initializes canvas with optimal settings
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {string} backgroundColor - Background color
   */
  static initialize(
    canvas,
    width = DEFAULT_CANVAS_SIZE.width,
    height = DEFAULT_CANVAS_SIZE.height,
    backgroundColor = "#FFFFFF"
  ) {
    canvas.width = Math.max(1, Math.min(8192, width)); // Reasonable limits
    canvas.height = Math.max(1, Math.min(8192, height));

    this.clear(canvas, backgroundColor);
    this.resetContext(this.getContext(canvas));
  }

  /**
   * Gets accurate mouse coordinates with DPI scaling
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {number} clientX - Mouse X coordinate
   * @param {number} clientY - Mouse Y coordinate
   * @returns {Point} - Canvas coordinates
   */
  static getCoordinates(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  }

  /**
   * Loads image with proper error handling and CORS support
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {string} imageUrl - Image URL
   * @returns {Promise<void>} - Promise that resolves when image is loaded
   */
  static async loadImage(canvas, imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Enable CORS

      img.onload = () => {
        try {
          const ctx = this.getContext(canvas);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        } catch (error) {
          reject(new Error(`Failed to draw image: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image from URL: ${imageUrl}`));
      };

      // Add timeout for network issues
      setTimeout(() => {
        reject(new Error("Image load timeout"));
      }, 10000);

      img.src = imageUrl;
    });
  }
}

// ===========================
// HISTORY MANAGEMENT
// ===========================

/**
 * Memory-efficient canvas history manager with compression
 */
export class HistoryManager {
  #history = [];
  #currentIndex = -1;
  #maxSize;

  /**
   * Creates new history manager
   * @param {number} maxSize - Maximum history entries
   */
  constructor(maxSize = PERFORMANCE.MAX_HISTORY_SIZE) {
    this.#maxSize = Math.max(1, maxSize);
  }

  /**
   * Saves current canvas state with memory optimization
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {boolean} - True if saved successfully
   */
  save(canvas) {
    try {
      const dataUrl = canvas.toDataURL("image/png", 0.8); // Slight compression

      // Remove future history if we're not at the end
      this.#history = this.#history.slice(0, this.#currentIndex + 1);

      // Add new state
      this.#history.push(dataUrl);
      this.#currentIndex = this.#history.length - 1;

      // Trim history if it exceeds max size (FIFO)
      if (this.#history.length > this.#maxSize) {
        this.#history.shift();
        this.#currentIndex--;
      }

      return true;
    } catch (error) {
      console.error("Failed to save canvas state:", error);
      return false;
    }
  }

  /**
   * Undoes last action with error handling
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Promise<boolean>} - True if undo was successful
   */
  async undo(canvas) {
    if (!this.canUndo()) return false;

    this.#currentIndex--;
    return await this.#restoreState(canvas, this.#history[this.#currentIndex]);
  }

  /**
   * Redoes last undone action
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Promise<boolean>} - True if redo was successful
   */
  async redo(canvas) {
    if (!this.canRedo()) return false;

    this.#currentIndex++;
    return await this.#restoreState(canvas, this.#history[this.#currentIndex]);
  }

  /**
   * Checks if undo is possible
   * @returns {boolean} - True if can undo
   */
  canUndo() {
    return this.#currentIndex > 0;
  }

  /**
   * Checks if redo is possible
   * @returns {boolean} - True if can redo
   */
  canRedo() {
    return this.#currentIndex < this.#history.length - 1;
  }

  /**
   * Clears all history and frees memory
   */
  clear() {
    this.#history = [];
    this.#currentIndex = -1;
  }

  /**
   * Gets current history statistics
   * @returns {Object} - History statistics
   */
  getStats() {
    return {
      total: this.#history.length,
      current: this.#currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage: this.#calculateMemoryUsage(),
    };
  }

  /**
   * Estimates memory usage of history
   * @private
   * @returns {number} - Estimated bytes
   */
  #calculateMemoryUsage() {
    return this.#history.reduce(
      (total, dataUrl) => total + dataUrl.length * 2,
      0
    );
  }

  /**
   * Restores canvas state from data URL
   * @private
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {string} dataUrl - Canvas data URL
   * @returns {Promise<boolean>} - True if restored successfully
   */
  #restoreState(canvas, dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        try {
          const ctx = CanvasUtils.getContext(canvas);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(true);
        } catch (error) {
          console.error("Failed to restore canvas state:", error);
          resolve(false);
        }
      };

      img.onerror = () => {
        console.error("Failed to load history image");
        resolve(false);
      };

      img.src = dataUrl;
    });
  }
}

// ===========================
// BRUSH ENGINE
// ===========================

/**
 * High-performance brush engine with 46+ brush implementations
 */
export class BrushEngine {
  #canvas;
  #ctx;
  #settings = {
    type: "brush",
    color: "#000000",
    size: 15,
    opacity: 1,
  };

  // Variables para el pincel de grosor variable (tu algoritmo)
  #variableWidthPoints = [];
  #tempCanvas = null;

  /**
   * Creates new brush engine instance
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  constructor(canvas) {
    this.#canvas = canvas;
    this.#ctx = CanvasUtils.getContext(canvas);
  }

  /**
   * Updates brush settings with validation
   * @param {Partial<BrushSettings>} settings - New settings
   */
  configure(settings) {
    if (settings.size !== undefined) {
      settings.size = Math.max(
        PERFORMANCE.MIN_BRUSH_SIZE,
        Math.min(PERFORMANCE.MAX_BRUSH_SIZE, settings.size)
      );
    }

    if (settings.opacity !== undefined) {
      settings.opacity = Math.max(0, Math.min(1, settings.opacity));
    }

    if (
      settings.color !== undefined &&
      !ColorUtils.isValidHex(settings.color)
    ) {
      console.warn(`Invalid color: ${settings.color}, using default`);
      settings.color = "#000000";
    }

    // Validate brush type
    if (settings.type !== undefined) {
      if (!settings.type || typeof settings.type !== "string") {
        console.warn(
          `Invalid brush type: "${settings.type}", using default "brush"`
        );
        settings.type = "brush";
      } else if (!this.#getBrushImplementation(settings.type)) {
        console.warn(
          `Unknown brush type: "${settings.type}", using default "brush"`
        );
        settings.type = "brush";
      }
    }

    this.#settings = { ...this.#settings, ...settings };
  }

  /**
   * Main drawing function with performance optimization
   * @param {Point} point - Current drawing point
   * @param {Point} [lastPoint] - Previous drawing point
   * @returns {boolean} - True if drawing was successful
   */
  draw(point, lastPoint = null) {
    try {
      if (!this.#isValidPoint(point)) {
        return false;
      }

      const { x, y } = point;
      const { type, color, size, opacity } = this.#settings;

      // Get brush implementation
      const brushImpl = this.#getBrushImplementation(type);
      if (!brushImpl) {
        console.warn(
          `⚠️ Pincel no implementado: "${type}". Usando pincel básico por defecto.`
        );
        this.#drawBasicBrush({ x, y, lastPoint, color, size });
        return true;
      }

      // Check if brush is using placeholder implementation
      if (this.#isPlaceholderBrush(type)) {
        console.warn(
          `⚠️ Pincel "${type}" usa implementación placeholder. Considera implementar lógica específica.`
        );
      }

      // Save context state
      this.#ctx.save();

      // Apply global settings
      this.#ctx.globalAlpha = opacity;

      // Execute brush-specific drawing
      brushImpl.call(this, { x, y, lastPoint, color, size });

      // Handle buffer cleanup when stroke ends
      if (lastPoint === null) {
        if (type === "smooth_curves" && this.pointsBuffer) {
          this.resetSmoothCurvesBuffer();
        }
        if (type === "variable_width") {
          this.#clearVariableWidthPoints();
        }
      }

      // Restore context state
      this.#ctx.restore();

      return true;
    } catch (error) {
      console.error("Drawing error:", error);
      this.#ctx.restore(); // Ensure context is restored
      return false;
    }
  }

  /**
   * Validates drawing point
   * @private
   */
  #isValidPoint(point) {
    return (
      point &&
      typeof point.x === "number" &&
      typeof point.y === "number" &&
      !isNaN(point.x) &&
      !isNaN(point.y) &&
      point.x >= 0 &&
      point.x <= this.#canvas.width &&
      point.y >= 0 &&
      point.y <= this.#canvas.height
    );
  }

  /**
   * Gets brush implementation function
   * @private
   */
  #getBrushImplementation(type) {
    const brushes = {
      // Basic brushes
      brush: this.#drawBasicBrush,
      eraser: this.#drawEraser,
      pencil: this.#drawPencil,
      shadow: this.#drawShadow,

      // Artistic brushes
      pen: this.#drawPen,
      pen2: this.#drawPen2,
      thick: this.#drawThick,
      sliced: this.#drawSliced,
      multi: this.#drawMulti,
      multi_opacity: this.#drawMultiOpacity,
      carboncillo: this.#drawCharcoal,
      acuarela: this.#drawWatercolor,
      tiza: this.#drawChalk,
      marcador: this.#drawMarker,
      oleo: this.#drawOil,
      pixel: this.#drawPixel,
      neon: this.#drawNeon,
      puntos: this.#drawDots,
      lineas: this.#drawLines,
      fuego: this.#drawFire,
      beads: this.#drawBeads,
      wiggle: this.#drawWiggle,

      // Stamp brushes
      stamp_circle: this.#drawStampCircle,
      stamp_star: this.#drawStampStar,

      // Pattern brushes
      pattern_dots: this.#drawPatternDots,
      pattern_lines: this.#drawPatternLines,
      pattern_rainbow: this.#drawPatternRainbow,
      pattern_image: this.#drawPatternImage,

      // Spray brushes
      aerosol: this.#drawAerosol,
      spray: this.#drawSpray,
      airbrush_soft: this.#drawAirbrushSoft,
      smooth_curves: this.#drawSmoothCurves,
      spray_time: this.#drawSprayTime,
      spray_speed: this.#drawSpraySpeed,

      // Sketch/Harmony brushes
      sketchy: this.#drawSketchy,
      neighbor: this.#drawNeighbor,
      fur_neighbor: this.#drawFurNeighbor,

      // Special brushes
      rainbow_dynamic: this.#drawRainbowDynamic,
      confetti: this.#drawConfetti,
      shooting_star: this.#drawShootingStar,
      glitch: this.#drawGlitch,
      heart_spray: this.#drawHeartSpray,
      lightning: this.#drawLightning,
      bubble: this.#drawBubble,
      ribbon: this.#drawRibbon,
      fire_realistic: this.#drawFireRealistic,
      particles: this.#drawParticles,

      // Image-based brushes
      image_brush: this.#drawImageBrush,
      texture_stamp: this.#drawTextureStamp,
      pattern_brush: this.#drawPatternBrush,

      // Variable width brush
      variable_width: this.#drawVariableWidth,

      // Effect brushes
      glow: this.#drawGlow,

      // Extended brushes (compatibilidad)
      splatter: this.#drawSplatter,
      textured: this.#drawTextured,
      sketch: this.#drawSketch,
      fabric: this.#drawFabric,
      fur: this.#drawFur,
      leaves: this.#drawLeaves,
      rain: this.#drawRain,
      snow: this.#drawSnow,
      stars: this.#drawStars,
      hearts: this.#drawHearts,
      flowers: this.#drawFlowers,
      bubbles: this.#drawBubbles,
      smoke: this.#drawSmoke,
      grass: this.#drawGrass,
      wood: this.#drawWood,
      metal: this.#drawMetal,
      glass: this.#drawGlass,
      water: this.#drawWater,
      sand: this.#drawSand,
      stone: this.#drawStone,
      cloud: this.#drawCloud,
      galaxy: this.#drawGalaxy,
      plasma: this.#drawPlasma,
      electric: this.#drawElectric,
      crystal: this.#drawCrystal,
      magic: this.#drawMagic,
      rainbow: this.#drawRainbow,
      gradient: this.#drawGradient,
      mosaic: this.#drawMosaic,
      kaleidoscope: this.#drawKaleidoscope,
      mandala: this.#drawMandala,
      celtic: this.#drawCeltic,
      tribal: this.#drawTribal,
      geometric: this.#drawGeometric,
      organic: this.#drawOrganic,
      fractal: this.#drawFractal,
      impressionist: this.#drawImpressionist,
      pointillist: this.#drawPointillist,
      abstract: this.#drawAbstract,
      surreal: this.#drawSurreal,
      minimalist: this.#drawMinimalist,
      vintage: this.#drawVintage,
      grunge: this.#drawGrunge,
      digital: this.#drawDigital,
    };

    return brushes[type] || null;
  }

  /**
   * Check if brush is using placeholder implementation
   * @private
   */
  #isPlaceholderBrush(type) {
    const placeholderBrushes = [
      "splatter",
      "spray",
      "textured",
      "sketch",
      "fabric",
      "fur",
      "leaves",
      "rain",
      "snow",
      "stars",
      "hearts",
      "flowers",
      "bubbles",
      "lightning",
      "smoke",
      "grass",
      "wood",
      "metal",
      "glass",
      "water",
      "sand",
      "stone",
      "cloud",
      "galaxy",
      "plasma",
      "electric",
      "crystal",
      "magic",
      "rainbow",
      "gradient",
      "mosaic",
      "kaleidoscope",
      "mandala",
      "celtic",
      "tribal",
      "geometric",
      "organic",
      "fractal",
      "impressionist",
      "pointillist",
      "abstract",
      "surreal",
      "minimalist",
      "vintage",
      "grunge",
      "digital",
    ];
    return placeholderBrushes.includes(type);
  }

  // ===========================
  // CORE BRUSH IMPLEMENTATIONS
  // ===========================

  /**
   * Pencil brush implementation (lápiz realista)
   * @private
   */
  #drawPencil({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.shadowBlur = 0; // Sin blur para lápiz definido

    // Simula presión variable del lápiz
    const pressure = 0.4 + Math.random() * 0.6;
    const baseAlpha = 0.6 + pressure * 0.3; // Más opaco que smooth
    this.#ctx.globalAlpha = baseAlpha;

    // Trazo principal fino y definido
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(0.8, size * 0.25); // Más definido

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Textura granular compacta del grafito (sin dispersión)
    const grainCount = Math.floor(size * 0.6);
    for (let i = 0; i < grainCount; i++) {
      const grainX = x + (Math.random() - 0.5) * size * 0.3; // Menos dispersión
      const grainY = y + (Math.random() - 0.5) * size * 0.3;
      const grainSize = Math.random() * 0.6; // Granos más pequeños
      const grainAlpha = (0.2 + Math.random() * 0.3) * pressure; // Más opaco

      this.#ctx.globalAlpha = grainAlpha;
      this.#ctx.fillStyle = color;
      this.#ctx.beginPath();
      this.#ctx.arc(grainX, grainY, grainSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Efecto de desgaste de la punta (trazo secundario definido)
    if (Math.random() < 0.4) {
      this.#ctx.globalAlpha = 0.25 * pressure;
      this.#ctx.lineWidth = Math.max(0.5, size * 0.12);
      this.#ctx.strokeStyle = color;

      if (lastPoint) {
        const offsetX = (Math.random() - 0.5) * size * 0.25;
        const offsetY = (Math.random() - 0.5) * size * 0.25;
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offsetX, lastPoint.y + offsetY);
        this.#ctx.lineTo(x + offsetX, y + offsetY);
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Basic brush implementation mejorada (línea sólida, presión simulada)
   * @private
   */
  #drawBasicBrush({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    // Simula presión: leve variación de opacidad y grosor
    const baseAlpha = 0.92 + Math.random() * 0.08;
    this.#ctx.globalAlpha = baseAlpha;
    const widthJitter = size * (0.97 + Math.random() * 0.06);
    this.#ctx.lineWidth = widthJitter;
    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    } else {
      this.#ctx.beginPath();
      this.#ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      this.#ctx.fillStyle = color;
      this.#ctx.fill();
    }
  }

  /**
   * Eraser mejorado: difuso, centro fuerte y borde suave
   * @private
   */
  #drawEraser({ x, y, lastPoint, size }) {
    this.#ctx.globalCompositeOperation = "destination-out";
    this.#ctx.lineCap = "round";
    this.#ctx.shadowColor = "#000";
    this.#ctx.shadowBlur = size * 0.7;
    this.#ctx.globalAlpha = 0.7;
    this.#ctx.lineWidth = size * 1.1;
    // Trazo principal
    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
    // Borrado difuso extra (borde atenuado)
    this.#ctx.save();
    const grad = this.#ctx.createRadialGradient(
      x,
      y,
      size * 0.2,
      x,
      y,
      size * 0.55
    );
    grad.addColorStop(0, "rgba(0,0,0,0.7)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    this.#ctx.globalAlpha = 0.25;
    this.#ctx.globalCompositeOperation = "destination-out";
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
    this.#ctx.fillStyle = grad;
    this.#ctx.fill();
    this.#ctx.restore();
  }

  /**
   * Charcoal brush with realistic texture mejorado
   * @private
   */
  #drawCharcoal({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "multiply";

    // Múltiples trazos con variación de presión y dirección
    for (let offset = 0; offset < 6; offset++) {
      const offsetDist = offset * 0.8;
      const alpha = 0.25 - offset * 0.03;
      this.#ctx.strokeStyle = ColorUtils.hexToRgba(color, alpha);
      this.#ctx.lineWidth = Math.max(1, size - offset * 1.5);
      this.#ctx.lineCap = "round";

      if (lastPoint) {
        const angle =
          Math.atan2(y - lastPoint.y, x - lastPoint.x) + Math.PI / 2;
        const offsetX = Math.cos(angle) * offsetDist;
        const offsetY = Math.sin(angle) * offsetDist;

        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offsetX, lastPoint.y + offsetY);
        this.#ctx.lineTo(x + offsetX, y + offsetY);
        this.#ctx.stroke();
      }
    }

    // Textura granular realista del carboncillo
    const particleCount = Math.floor(size * 0.8);
    for (let i = 0; i < particleCount; i++) {
      const grainX = x + (Math.random() - 0.5) * size * 1.5;
      const grainY = y + (Math.random() - 0.5) * size * 1.5;
      this.#ctx.globalAlpha = 0.15 + Math.random() * 0.2;
      this.#ctx.fillStyle = color;
      this.#ctx.beginPath();
      this.#ctx.arc(grainX, grainY, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Efecto de presión variable
    if (Math.random() < 0.4) {
      this.#ctx.globalAlpha = 0.3;
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = size * 0.3;
      if (lastPoint) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x, lastPoint.y);
        this.#ctx.lineTo(x, y);
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Chalk brush mejorado (tiza realista)
   * @private
   */
  #drawChalk({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";

    // Trazo principal seco de tiza
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size * 0.9;
    this.#ctx.globalAlpha = 0.7 + Math.random() * 0.2;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Efecto de polvo de tiza
    const dustCount = Math.floor(size * 1.2);
    for (let i = 0; i < dustCount; i++) {
      const dustX = x + (Math.random() - 0.5) * size * 2;
      const dustY = y + (Math.random() - 0.5) * size * 2;
      const dustSize = Math.random() * 2 + 0.5;
      const dustAlpha =
        (0.1 + Math.random() * 0.15) * (0.5 + Math.random() * 0.5);

      this.#ctx.globalAlpha = dustAlpha;
      this.#ctx.fillStyle = color;
      this.#ctx.beginPath();
      this.#ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Trazos secundarios para textura
    if (Math.random() < 0.6) {
      this.#ctx.globalAlpha = 0.3;
      this.#ctx.lineWidth = size * 0.4;
      if (lastPoint) {
        const offsetX = (Math.random() - 0.5) * size * 0.8;
        const offsetY = (Math.random() - 0.5) * size * 0.8;
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offsetX, lastPoint.y + offsetY);
        this.#ctx.lineTo(x + offsetX, y + offsetY);
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Marker brush mejorado (marcador realista)
   * @private
   */
  #drawMarker({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";

    // Trazo principal fluido del marcador
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size * 0.8;
    this.#ctx.globalAlpha = 0.9 + Math.random() * 0.1;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Efecto de saturación alta (marcador intenso)
    this.#ctx.globalCompositeOperation = "lighter";
    this.#ctx.globalAlpha = 0.3;
    this.#ctx.lineWidth = size * 0.6;
    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Borde definido del marcador
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.globalAlpha = 0.4;
    this.#ctx.lineWidth = size * 0.3;
    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  /**
   * Oil brush mejorado (óleo realista)
   * @private
   */
  #drawOil({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";

    // Pinceladas gruesas de óleo
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size * 1.2;
    this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Textura de óleo con pinceladas
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * size * 0.6;
      const offsetY = (Math.random() - 0.5) * size * 0.6;
      this.#ctx.globalAlpha = 0.3 + Math.random() * 0.2;
      this.#ctx.lineWidth = size * (0.4 + Math.random() * 0.3);

      if (lastPoint) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offsetX, lastPoint.y + offsetY);
        this.#ctx.lineTo(x + offsetX, y + offsetY);
        this.#ctx.stroke();
      }
    }

    // Efecto de mezcla de colores
    if (Math.random() < 0.3) {
      const mixedColor = ColorUtils.shadeColor(color, Math.random() * 20 - 10);
      this.#ctx.strokeStyle = mixedColor;
      this.#ctx.globalAlpha = 0.4;
      this.#ctx.lineWidth = size * 0.5;
      if (lastPoint) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x, lastPoint.y);
        this.#ctx.lineTo(x, y);
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Watercolor brush with bleeding effect
   * @private
   */
  #drawWatercolor({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "multiply";

    for (let ring = 0; ring < 4; ring++) {
      const ringRadius = size * (0.7 + ring * 0.5);
      const baseAlpha = 0.18 - ring * 0.03;

      const gradient = ColorUtils.createRadialGradient(
        this.#ctx,
        x,
        y,
        ringRadius,
        color,
        [baseAlpha, 0]
      );

      this.#ctx.fillStyle = gradient;
      this.#ctx.beginPath();
      this.#ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      this.#ctx.fill();
    }
  }

  // Additional brush implementations with placeholder logic
  // (In a real implementation, each would have unique algorithms)
  #drawGlow(params) {
    const { x, y, lastPoint, color, size } = params;
    this.#ctx.globalCompositeOperation = "source-over";

    // Múltiples capas de resplandor
    const glowLayers = [
      { blur: size * 3, alpha: 0.15, width: size * 1.5 },
      { blur: size * 2, alpha: 0.25, width: size * 1.2 },
      { blur: size * 1, alpha: 0.35, width: size * 0.9 },
      { blur: size * 0.5, alpha: 0.45, width: size * 0.7 },
    ];

    glowLayers.forEach((layer) => {
      this.#ctx.shadowColor = color;
      this.#ctx.shadowBlur = layer.blur;
      this.#ctx.globalAlpha = layer.alpha;
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = layer.width;
      this.#ctx.lineCap = "round";
      this.#ctx.lineJoin = "round";

      if (lastPoint) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x, lastPoint.y);
        this.#ctx.lineTo(x, y);
        this.#ctx.stroke();
      } else {
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, layer.width / 2, 0, Math.PI * 2);
        this.#ctx.fillStyle = color;
        this.#ctx.fill();
      }
    });
  }

  #drawNeon(params) {
    const { x, y, lastPoint, color, size } = params;
    this.#ctx.globalCompositeOperation = "source-over";

    // Borde exterior brillante
    this.#ctx.shadowColor = color;
    this.#ctx.shadowBlur = size * 2;
    this.#ctx.globalAlpha = 0.8;
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size * 1.3;
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Centro brillante
    this.#ctx.shadowBlur = size * 0.5;
    this.#ctx.globalAlpha = 1;
    this.#ctx.lineWidth = size * 0.7;
    this.#ctx.strokeStyle = "#ffffff";

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    } else {
      this.#ctx.beginPath();
      this.#ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
      this.#ctx.fillStyle = "#ffffff";
      this.#ctx.fill();
    }

    // Punto central intenso
    this.#ctx.shadowBlur = 0;
    this.#ctx.globalAlpha = 0.9;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    this.#ctx.fillStyle = color;
    this.#ctx.fill();
  }
  #drawFire({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "lighter";

    // Llamas principales con gradientes
    const flameColors = ["#FF4500", "#FF8C00", "#FFD700", "#FFFF00"];
    const flameCount = Math.floor(size / 3);

    for (let i = 0; i < flameCount; i++) {
      const flameX = x + (Math.random() - 0.5) * size * 0.8;
      const flameY = y + (Math.random() - 0.5) * size * 0.8;
      const flameSize = size * (0.3 + Math.random() * 0.4);
      const flameColor =
        flameColors[Math.floor(Math.random() * flameColors.length)];

      // Gradiente radial para la llama
      const gradient = this.#ctx.createRadialGradient(
        flameX,
        flameY,
        0,
        flameX,
        flameY,
        flameSize
      );
      gradient.addColorStop(0, flameColor);
      gradient.addColorStop(0.7, ColorUtils.hexToRgba(flameColor, 0.6));
      gradient.addColorStop(1, "transparent");

      this.#ctx.fillStyle = gradient;
      this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;
      this.#ctx.beginPath();
      this.#ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Partículas de fuego
    const particleCount = Math.floor(size * 0.8);
    for (let i = 0; i < particleCount; i++) {
      const particleX = x + (Math.random() - 0.5) * size * 1.5;
      const particleY = y + (Math.random() - 0.5) * size * 1.5;
      const particleSize = Math.random() * 3 + 1;
      const particleColor =
        flameColors[Math.floor(Math.random() * flameColors.length)];

      this.#ctx.fillStyle = particleColor;
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      this.#ctx.beginPath();
      this.#ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Efecto de calor (glow)
    this.#ctx.shadowColor = "#FF4500";
    this.#ctx.shadowBlur = size * 1.5;
    this.#ctx.globalAlpha = 0.3;
    this.#ctx.fillStyle = "#FF4500";
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    this.#ctx.fill();
    this.#ctx.shadowBlur = 0;
  }
  #drawPixel({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.imageSmoothingEnabled = false; // Desactivar anti-aliasing

    const pixelSize = Math.max(2, Math.floor(size / 4));
    const gridX = Math.floor(x / pixelSize) * pixelSize;
    const gridY = Math.floor(y / pixelSize) * pixelSize;

    // Píxel principal
    this.#ctx.fillStyle = color;
    this.#ctx.globalAlpha = 1;
    this.#ctx.fillRect(gridX, gridY, pixelSize, pixelSize);

    // Píxeles adyacentes para efecto de grosor
    const adjacentPixels = Math.floor(size / pixelSize / 2);
    for (let i = -adjacentPixels; i <= adjacentPixels; i++) {
      for (let j = -adjacentPixels; j <= adjacentPixels; j++) {
        if (Math.random() < 0.3) {
          const px = gridX + i * pixelSize;
          const py = gridY + j * pixelSize;
          this.#ctx.globalAlpha = 0.7 + Math.random() * 0.3;
          this.#ctx.fillRect(px, py, pixelSize, pixelSize);
        }
      }
    }

    this.#ctx.imageSmoothingEnabled = true; // Reactivar anti-aliasing
  }
  #drawDots({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Puntos principales con variación de tamaño
    const dotCount = Math.floor(size * 1.5);
    for (let i = 0; i < dotCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * size * 0.8;
      const dotX = x + Math.cos(angle) * radius;
      const dotY = y + Math.sin(angle) * radius;
      const dotSize = Math.max(1, size * (0.1 + Math.random() * 0.2));
      const dotAlpha = 0.6 + Math.random() * 0.4;

      this.#ctx.globalAlpha = dotAlpha;
      this.#ctx.fillStyle = color;
      this.#ctx.beginPath();
      this.#ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Puntos secundarios para densidad
    if (Math.random() < 0.7) {
      const extraDots = Math.floor(size * 0.8);
      for (let i = 0; i < extraDots; i++) {
        const dotX = x + (Math.random() - 0.5) * size * 1.2;
        const dotY = y + (Math.random() - 0.5) * size * 1.2;
        const dotSize = Math.max(0.5, size * (0.05 + Math.random() * 0.1));
        this.#ctx.globalAlpha = 0.4 + Math.random() * 0.3;
        this.#ctx.fillStyle = color;
        this.#ctx.beginPath();
        this.#ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
        this.#ctx.fill();
      }
    }
  }

  /**
   * Lines brush mejorado (grabado cruzado)
   * @private
   */
  #drawLines({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";

    // Líneas principales en múltiples direcciones
    const lineDirections = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];

    lineDirections.forEach((angle, index) => {
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = Math.max(1, size * (0.3 - index * 0.05));
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;

      const length = size * 0.8;
      const startX = x - (Math.cos(angle) * length) / 2;
      const startY = y - (Math.sin(angle) * length) / 2;
      const endX = x + (Math.cos(angle) * length) / 2;
      const endY = y + (Math.sin(angle) * length) / 2;

      this.#ctx.beginPath();
      this.#ctx.moveTo(startX, startY);
      this.#ctx.lineTo(endX, endY);
      this.#ctx.stroke();
    });

    // Líneas adicionales aleatorias
    if (Math.random() < 0.5) {
      const extraLines = Math.floor(size / 3);
      for (let i = 0; i < extraLines; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = size * (0.3 + Math.random() * 0.4);
        const startX = x - (Math.cos(angle) * length) / 2;
        const startY = y - (Math.sin(angle) * length) / 2;
        const endX = x + (Math.cos(angle) * length) / 2;
        const endY = y + (Math.sin(angle) * length) / 2;

        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = Math.max(0.5, size * 0.15);
        this.#ctx.globalAlpha = 0.3 + Math.random() * 0.3;
        this.#ctx.beginPath();
        this.#ctx.moveTo(startX, startY);
        this.#ctx.lineTo(endX, endY);
        this.#ctx.stroke();
      }
    }
  }

  // Extended brush placeholders (would implement unique algorithms in production)
  #drawSplatter({ x, y, color, size }) {
    this.#drawDots({ x, y, color, size });
  }
  #drawSpray({ x, y, color, size }) {
    this.#drawDots({ x, y, color, size });
  }
  #drawTextured({ x, y, color, size }) {
    this.#drawCharcoal({ x, y, color, size });
  }
  #drawSketch({ x, y, color, size }) {
    this.#drawLines({ x, y, color, size });
  }
  #drawFabric({ x, y, color, size }) {
    this.#drawTextured({ x, y, color, size });
  }
  #drawFur({ x, y, color, size }) {
    this.#drawLines({ x, y, color, size });
  }
  /**
   * Leaves brush - Natural leaf patterns
   * @private
   */
  #drawLeaves({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Draw multiple leaves
    const leafCount = Math.floor(size / 6) + 2;
    for (let i = 0; i < leafCount; i++) {
      const leafX = x + (Math.random() - 0.5) * size;
      const leafY = y + (Math.random() - 0.5) * size;
      const leafSize = size * (0.3 + Math.random() * 0.4);
      const rotation = Math.random() * Math.PI * 2;

      this.#ctx.save();
      this.#ctx.translate(leafX, leafY);
      this.#ctx.rotate(rotation);

      // Leaf shape
      this.#ctx.beginPath();
      this.#ctx.ellipse(0, 0, leafSize, leafSize * 1.8, 0, 0, Math.PI * 2);

      // Leaf color variation
      const leafColor = ColorUtils.shadeColor(color, Math.random() * 40 - 20);
      this.#ctx.fillStyle = leafColor;
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;
      this.#ctx.fill();

      // Leaf stem
      this.#ctx.strokeStyle = ColorUtils.shadeColor(color, -20);
      this.#ctx.lineWidth = Math.max(0.5, leafSize * 0.1);
      this.#ctx.globalAlpha = 0.8;
      this.#ctx.beginPath();
      this.#ctx.moveTo(0, leafSize * 1.5);
      this.#ctx.lineTo(0, leafSize * 2);
      this.#ctx.stroke();

      this.#ctx.restore();
    }
  }

  /**
   * Rain brush - Diagonal rain droplets
   * @private
   */
  #drawRain({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const dropCount = Math.floor(size * 1.5);
    for (let i = 0; i < dropCount; i++) {
      const dropX = x + (Math.random() - 0.5) * size * 2;
      const dropY = y + (Math.random() - 0.5) * size * 2;
      const dropLength = size * (0.3 + Math.random() * 0.7);
      const angle = Math.PI / 6; // Rain angle

      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = Math.max(0.5, Math.random() * 2);
      this.#ctx.globalAlpha = 0.4 + Math.random() * 0.4;
      this.#ctx.lineCap = "round";

      this.#ctx.beginPath();
      this.#ctx.moveTo(dropX, dropY);
      this.#ctx.lineTo(
        dropX + Math.cos(angle) * dropLength,
        dropY + Math.sin(angle) * dropLength
      );
      this.#ctx.stroke();
    }
  }

  /**
   * Snow brush - Soft snowflakes
   * @private
   */
  #drawSnow({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const snowflakeCount = Math.floor(size / 3) + 2;
    for (let i = 0; i < snowflakeCount; i++) {
      const snowX = x + (Math.random() - 0.5) * size * 2;
      const snowY = y + (Math.random() - 0.5) * size * 2;
      const snowSize = Math.random() * size * 0.3 + 2;

      // Snowflake center
      this.#ctx.fillStyle = color;
      this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;
      this.#ctx.beginPath();
      this.#ctx.arc(snowX, snowY, snowSize, 0, Math.PI * 2);
      this.#ctx.fill();

      // Snowflake arms
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = Math.max(0.5, snowSize * 0.2);
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;

      for (let arm = 0; arm < 6; arm++) {
        const angle = (arm * Math.PI) / 3;
        const armLength = snowSize * 1.5;

        this.#ctx.beginPath();
        this.#ctx.moveTo(snowX, snowY);
        this.#ctx.lineTo(
          snowX + Math.cos(angle) * armLength,
          snowY + Math.sin(angle) * armLength
        );
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Stars brush - Twinkling stars
   * @private
   */
  #drawStars({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "lighter";

    const starCount = Math.floor(size / 4) + 2;
    for (let i = 0; i < starCount; i++) {
      const starX = x + (Math.random() - 0.5) * size * 2;
      const starY = y + (Math.random() - 0.5) * size * 2;
      const starSize = size * (0.2 + Math.random() * 0.4);

      // Use drawStar utility
      drawStar(this.#ctx, starX, starY, starSize, starSize * 0.5, 5, color);

      // Add twinkle effect
      if (Math.random() < 0.3) {
        this.#ctx.save();
        this.#ctx.globalAlpha = 0.8;
        this.#ctx.shadowColor = color;
        this.#ctx.shadowBlur = starSize * 2;
        this.#ctx.fillStyle = "#ffffff";
        this.#ctx.beginPath();
        this.#ctx.arc(starX, starY, starSize * 0.3, 0, Math.PI * 2);
        this.#ctx.fill();
        this.#ctx.restore();
      }
    }
  }

  /**
   * Hearts brush - Romantic heart shapes
   * @private
   */
  #drawHearts({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const heartCount = Math.floor(size / 8) + 1;
    for (let i = 0; i < heartCount; i++) {
      const heartX = x + (Math.random() - 0.5) * size * 1.5;
      const heartY = y + (Math.random() - 0.5) * size * 1.5;
      const heartSize = size * (0.2 + Math.random() * 0.3);
      const heartColor =
        i === 0 ? color : ColorUtils.shadeColor(color, Math.random() * 30 - 15);

      this.#ctx.save();
      this.#ctx.translate(heartX, heartY);
      this.#ctx.fillStyle = heartColor;
      this.#ctx.globalAlpha = 0.7 + Math.random() * 0.3;

      // Draw heart shape
      this.#ctx.beginPath();
      this.#ctx.moveTo(0, 0);
      this.#ctx.bezierCurveTo(
        0,
        -heartSize * 0.4,
        -heartSize * 0.5,
        -heartSize * 0.4,
        -heartSize * 0.5,
        0
      );
      this.#ctx.bezierCurveTo(
        -heartSize * 0.5,
        heartSize * 0.5,
        0,
        heartSize * 0.7,
        0,
        heartSize * 1.1
      );
      this.#ctx.bezierCurveTo(
        0,
        heartSize * 0.7,
        heartSize * 0.5,
        heartSize * 0.5,
        heartSize * 0.5,
        0
      );
      this.#ctx.bezierCurveTo(
        heartSize * 0.5,
        -heartSize * 0.4,
        0,
        -heartSize * 0.4,
        0,
        0
      );
      this.#ctx.closePath();
      this.#ctx.fill();

      this.#ctx.restore();
    }
  }

  /**
   * Flowers brush - Delicate flower petals
   * @private
   */
  #drawFlowers({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const flowerCount = Math.floor(size / 10) + 1;
    for (let i = 0; i < flowerCount; i++) {
      const flowerX = x + (Math.random() - 0.5) * size * 1.2;
      const flowerY = y + (Math.random() - 0.5) * size * 1.2;
      const flowerSize = size * (0.3 + Math.random() * 0.4);
      const petalCount = 5 + Math.floor(Math.random() * 3);

      this.#ctx.save();
      this.#ctx.translate(flowerX, flowerY);

      // Draw petals
      for (let petal = 0; petal < petalCount; petal++) {
        const angle = (petal * 2 * Math.PI) / petalCount;
        this.#ctx.save();
        this.#ctx.rotate(angle);

        // Petal shape
        this.#ctx.fillStyle = ColorUtils.shadeColor(
          color,
          Math.random() * 20 - 10
        );
        this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;
        this.#ctx.beginPath();
        this.#ctx.ellipse(
          0,
          flowerSize * 0.6,
          flowerSize * 0.3,
          flowerSize * 0.6,
          0,
          0,
          Math.PI * 2
        );
        this.#ctx.fill();

        this.#ctx.restore();
      }

      // Flower center
      this.#ctx.fillStyle = ColorUtils.shadeColor(color, -30);
      this.#ctx.globalAlpha = 0.8;
      this.#ctx.beginPath();
      this.#ctx.arc(0, 0, flowerSize * 0.2, 0, Math.PI * 2);
      this.#ctx.fill();

      this.#ctx.restore();
    }
  }

  /**
   * Bubbles brush - Floating soap bubbles
   * @private
   */
  #drawBubbles({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const bubbleCount = Math.floor(size / 4) + 2;
    for (let i = 0; i < bubbleCount; i++) {
      const bubbleX = x + (Math.random() - 0.5) * size * 2;
      const bubbleY = y + (Math.random() - 0.5) * size * 2;
      const bubbleSize = size * (0.2 + Math.random() * 0.4);

      // Bubble outline
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = Math.max(0.5, bubbleSize * 0.1);
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;
      this.#ctx.beginPath();
      this.#ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      this.#ctx.stroke();

      // Bubble highlight
      this.#ctx.fillStyle = "#ffffff";
      this.#ctx.globalAlpha = 0.4 + Math.random() * 0.3;
      this.#ctx.beginPath();
      this.#ctx.arc(
        bubbleX - bubbleSize * 0.3,
        bubbleY - bubbleSize * 0.3,
        bubbleSize * 0.2,
        0,
        Math.PI * 2
      );
      this.#ctx.fill();

      // Secondary highlight
      this.#ctx.globalAlpha = 0.2;
      this.#ctx.beginPath();
      this.#ctx.arc(
        bubbleX + bubbleSize * 0.4,
        bubbleY + bubbleSize * 0.4,
        bubbleSize * 0.1,
        0,
        Math.PI * 2
      );
      this.#ctx.fill();
    }
  }

  /**
   * Lightning brush - Electric lightning bolts
   * @private
   */
  #drawLightning({ x, y, lastPoint, color, size }) {
    if (!lastPoint) return;

    this.#ctx.globalCompositeOperation = "lighter";

    const x1 = lastPoint.x;
    const y1 = lastPoint.y;
    const x2 = x;
    const y2 = y;
    const segments = 8;

    // Main lightning bolt
    this.#ctx.save();
    for (let layer = 0; layer < 3; layer++) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(x1, y1);

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const jitterX = (Math.random() - 0.5) * size * 0.8;
        const jitterY = (Math.random() - 0.5) * size * 0.8;
        const segmentX = x1 + (x2 - x1) * t + jitterX;
        const segmentY = y1 + (y2 - y1) * t + jitterY;
        this.#ctx.lineTo(segmentX, segmentY);
      }

      this.#ctx.lineTo(x2, y2);

      // Layer styling
      this.#ctx.strokeStyle =
        layer === 0 ? "#ffffff" : layer === 1 ? "#aaaaff" : color;
      this.#ctx.lineWidth = size * (1.5 - layer * 0.4);
      this.#ctx.globalAlpha = 0.9 - layer * 0.2;
      this.#ctx.shadowColor = "#ffffff";
      this.#ctx.shadowBlur = size * (2 - layer * 0.5);
      this.#ctx.stroke();
    }

    // Branch lightning
    if (Math.random() < 0.3) {
      const branchCount = 2 + Math.floor(Math.random() * 3);
      for (let branch = 0; branch < branchCount; branch++) {
        const branchStart = Math.random() * 0.8 + 0.1;
        const startX = x1 + (x2 - x1) * branchStart;
        const startY = y1 + (y2 - y1) * branchStart;
        const branchLength = size * (0.5 + Math.random() * 0.7);
        const branchAngle = (Math.random() - 0.5) * Math.PI;

        this.#ctx.beginPath();
        this.#ctx.moveTo(startX, startY);

        const branchSegments = 4;
        for (let i = 1; i <= branchSegments; i++) {
          const t = i / branchSegments;
          const jitter = (Math.random() - 0.5) * size * 0.5;
          const branchX =
            startX + Math.cos(branchAngle) * branchLength * t + jitter;
          const branchY =
            startY + Math.sin(branchAngle) * branchLength * t + jitter;
          this.#ctx.lineTo(branchX, branchY);
        }

        this.#ctx.strokeStyle = "#aaaaff";
        this.#ctx.lineWidth = size * 0.6;
        this.#ctx.globalAlpha = 0.7;
        this.#ctx.shadowBlur = size * 1.2;
        this.#ctx.stroke();
      }
    }

    this.#ctx.restore();
  }

  /**
   * Smoke brush - Wispy smoke clouds
   * @private
   */
  #drawSmoke({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "multiply";

    // Multiple smoke puffs with varying opacity
    const puffCount = Math.floor(size / 5) + 2;
    for (let i = 0; i < puffCount; i++) {
      const puffX = x + (Math.random() - 0.5) * size * 1.5;
      const puffY = y + (Math.random() - 0.5) * size * 1.5;
      const puffSize = size * (0.4 + Math.random() * 0.6);
      const puffColor = ColorUtils.shadeColor(color, Math.random() * 30 - 15);

      // Create gradient for smoke puff
      const gradient = this.#ctx.createRadialGradient(
        puffX,
        puffY,
        0,
        puffX,
        puffY,
        puffSize
      );
      gradient.addColorStop(
        0,
        ColorUtils.hexToRgba(puffColor, 0.3 + Math.random() * 0.4)
      );
      gradient.addColorStop(
        0.6,
        ColorUtils.hexToRgba(puffColor, 0.1 + Math.random() * 0.2)
      );
      gradient.addColorStop(1, "transparent");

      this.#ctx.fillStyle = gradient;
      this.#ctx.beginPath();
      this.#ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Wispy tendrils
    const tendrilCount = Math.floor(size / 8);
    for (let i = 0; i < tendrilCount; i++) {
      const tendrilX = x + (Math.random() - 0.5) * size;
      const tendrilY = y + (Math.random() - 0.5) * size;
      const tendrilLength = size * (0.5 + Math.random() * 1);
      const tendrilAngle = Math.random() * Math.PI * 2;

      this.#ctx.strokeStyle = ColorUtils.hexToRgba(
        color,
        0.2 + Math.random() * 0.3
      );
      this.#ctx.lineWidth = Math.max(0.5, Math.random() * 2);
      this.#ctx.lineCap = "round";

      // Curved tendril
      this.#ctx.beginPath();
      this.#ctx.moveTo(tendrilX, tendrilY);

      const segments = 5;
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const curvature = Math.sin(t * Math.PI) * size * 0.3;
        const segmentX = tendrilX + Math.cos(tendrilAngle) * tendrilLength * t;
        const segmentY =
          tendrilY + Math.sin(tendrilAngle) * tendrilLength * t + curvature;
        this.#ctx.lineTo(segmentX, segmentY);
      }

      this.#ctx.stroke();
    }
  }

  /**
   * Grass brush - Natural grass blades
   * @private
   */
  #drawGrass({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const grassCount = Math.floor(size * 1.2);
    for (let i = 0; i < grassCount; i++) {
      const grassX = x + (Math.random() - 0.5) * size * 1.2;
      const grassY = y + (Math.random() - 0.5) * size * 0.8;
      const grassHeight = size * (0.5 + Math.random() * 0.8);
      const grassWidth = Math.max(0.5, Math.random() * 2);
      const grassColor = ColorUtils.shadeColor(color, Math.random() * 40 - 20);
      const bend = (Math.random() - 0.5) * size * 0.3;

      this.#ctx.strokeStyle = grassColor;
      this.#ctx.lineWidth = grassWidth;
      this.#ctx.lineCap = "round";
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.4;

      // Draw grass blade with slight curve
      this.#ctx.beginPath();
      this.#ctx.moveTo(grassX, grassY);
      this.#ctx.quadraticCurveTo(
        grassX + bend,
        grassY - grassHeight / 2,
        grassX + bend * 1.5,
        grassY - grassHeight
      );
      this.#ctx.stroke();
    }
  }

  /**
   * Wood brush - Wood grain texture
   * @private
   */
  #drawWood({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "multiply";

    // Wood grain lines
    if (lastPoint) {
      const grainCount = Math.floor(size / 3);
      for (let i = 0; i < grainCount; i++) {
        const offset = (i - grainCount / 2) * 2;
        const grainColor = ColorUtils.shadeColor(
          color,
          Math.random() * 30 - 15
        );

        this.#ctx.strokeStyle = grainColor;
        this.#ctx.lineWidth = Math.max(0.5, Math.random() * 2);
        this.#ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        this.#ctx.lineCap = "round";

        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offset, lastPoint.y);
        this.#ctx.lineTo(x + offset, y);
        this.#ctx.stroke();
      }
    }

    // Wood knots
    if (Math.random() < 0.1) {
      const knotSize = size * (0.3 + Math.random() * 0.4);
      this.#ctx.strokeStyle = ColorUtils.shadeColor(color, -30);
      this.#ctx.lineWidth = Math.max(1, knotSize * 0.2);
      this.#ctx.globalAlpha = 0.6;

      this.#ctx.beginPath();
      this.#ctx.arc(x, y, knotSize, 0, Math.PI * 2);
      this.#ctx.stroke();
    }

    // Wood texture points
    const textureCount = Math.floor(size * 0.8);
    for (let i = 0; i < textureCount; i++) {
      const texX = x + (Math.random() - 0.5) * size;
      const texY = y + (Math.random() - 0.5) * size;
      const texSize = Math.random() * 1 + 0.5;

      this.#ctx.globalAlpha = 0.2 + Math.random() * 0.3;
      this.#ctx.fillStyle = ColorUtils.shadeColor(
        color,
        Math.random() * 20 - 10
      );
      this.#ctx.beginPath();
      this.#ctx.arc(texX, texY, texSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }
  }
  /**
   * Metal brush - Metallic surface texture
   * @private
   */
  #drawMetal({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Base metallic stroke
    if (lastPoint) {
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = size;
      this.#ctx.lineCap = "round";
      this.#ctx.globalAlpha = 0.8;
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    // Metallic highlights
    const highlightCount = Math.floor(size / 4);
    for (let i = 0; i < highlightCount; i++) {
      const highlightX = x + (Math.random() - 0.5) * size;
      const highlightY = y + (Math.random() - 0.5) * size;
      const highlightSize = Math.random() * size * 0.3 + 2;

      // Bright metallic shine
      this.#ctx.fillStyle = "#ffffff";
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;
      this.#ctx.beginPath();
      this.#ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
      this.#ctx.fill();

      // Secondary reflection
      this.#ctx.fillStyle = ColorUtils.shadeColor(color, 40);
      this.#ctx.globalAlpha = 0.4 + Math.random() * 0.3;
      this.#ctx.beginPath();
      this.#ctx.arc(
        highlightX + highlightSize * 0.5,
        highlightY + highlightSize * 0.5,
        highlightSize * 0.6,
        0,
        Math.PI * 2
      );
      this.#ctx.fill();
    }

    // Metallic scratches
    if (Math.random() < 0.3) {
      const scratchCount = Math.floor(size / 6);
      for (let i = 0; i < scratchCount; i++) {
        const scratchAngle = Math.random() * Math.PI * 2;
        const scratchLength = size * (0.3 + Math.random() * 0.5);
        const scratchX = x + (Math.random() - 0.5) * size;
        const scratchY = y + (Math.random() - 0.5) * size;

        this.#ctx.strokeStyle = ColorUtils.shadeColor(color, -20);
        this.#ctx.lineWidth = Math.max(0.5, Math.random() * 1.5);
        this.#ctx.globalAlpha = 0.3 + Math.random() * 0.4;

        this.#ctx.beginPath();
        this.#ctx.moveTo(scratchX, scratchY);
        this.#ctx.lineTo(
          scratchX + Math.cos(scratchAngle) * scratchLength,
          scratchY + Math.sin(scratchAngle) * scratchLength
        );
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Glass brush - Transparent glass effect
   * @private
   */
  #drawGlass({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Glass base with transparency
    this.#ctx.fillStyle = ColorUtils.hexToRgba(color, 0.3);
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    this.#ctx.fill();

    // Glass highlight
    this.#ctx.fillStyle = "#ffffff";
    this.#ctx.globalAlpha = 0.8;
    this.#ctx.beginPath();
    this.#ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
    this.#ctx.fill();

    // Secondary reflection
    this.#ctx.globalAlpha = 0.4;
    this.#ctx.beginPath();
    this.#ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.15, 0, Math.PI * 2);
    this.#ctx.fill();

    // Glass edge reflection
    this.#ctx.strokeStyle = "#ffffff";
    this.#ctx.lineWidth = Math.max(1, size * 0.1);
    this.#ctx.globalAlpha = 0.6;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.8, Math.PI * 0.2, Math.PI * 0.8);
    this.#ctx.stroke();

    this.#ctx.globalAlpha = 1;
  }

  /**
   * Water brush - Fluid water effect (uses existing watercolor)
   * @private
   */
  #drawWater({ x, y, color, size }) {
    this.#drawWatercolor({ x, y, color, size });

    // Add water ripples
    const rippleCount = Math.floor(size / 8) + 1;
    this.#ctx.globalCompositeOperation = "source-over";

    for (let i = 0; i < rippleCount; i++) {
      const rippleRadius = size * (0.4 + i * 0.3);
      const rippleAlpha = 0.3 - i * 0.1;

      if (rippleAlpha > 0) {
        this.#ctx.strokeStyle = ColorUtils.hexToRgba(color, rippleAlpha);
        this.#ctx.lineWidth = Math.max(0.5, 2 - i * 0.5);
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
        this.#ctx.stroke();
      }
    }
  }

  /**
   * Sand brush - Granular sand texture
   * @private
   */
  #drawSand({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Dense sand grains
    const grainCount = Math.floor(size * 4);
    for (let i = 0; i < grainCount; i++) {
      const grainX = x + (Math.random() - 0.5) * size * 1.2;
      const grainY = y + (Math.random() - 0.5) * size * 1.2;
      const grainSize = Math.random() * 1.5 + 0.5;
      const grainColor = ColorUtils.shadeColor(color, Math.random() * 20 - 10);

      this.#ctx.fillStyle = grainColor;
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      this.#ctx.beginPath();
      this.#ctx.arc(grainX, grainY, grainSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Larger sand clusters
    const clusterCount = Math.floor(size / 6);
    for (let i = 0; i < clusterCount; i++) {
      const clusterX = x + (Math.random() - 0.5) * size;
      const clusterY = y + (Math.random() - 0.5) * size;
      const clusterSize = size * (0.1 + Math.random() * 0.2);
      const clusterColor = ColorUtils.shadeColor(
        color,
        Math.random() * 30 - 15
      );

      this.#ctx.fillStyle = clusterColor;
      this.#ctx.globalAlpha = 0.4 + Math.random() * 0.3;
      this.#ctx.beginPath();
      this.#ctx.arc(clusterX, clusterY, clusterSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }
  }

  /**
   * Stone brush - Rocky stone texture (uses enhanced charcoal)
   * @private
   */
  #drawStone({ x, y, lastPoint, color, size }) {
    // Use charcoal base for rough texture
    this.#drawCharcoal({ x, y, lastPoint, color, size });

    // Add stone-specific details
    this.#ctx.globalCompositeOperation = "multiply";

    // Stone cracks
    if (Math.random() < 0.3) {
      const crackCount = Math.floor(size / 8);
      for (let i = 0; i < crackCount; i++) {
        const crackAngle = Math.random() * Math.PI * 2;
        const crackLength = size * (0.2 + Math.random() * 0.4);
        const crackX = x + (Math.random() - 0.5) * size * 0.8;
        const crackY = y + (Math.random() - 0.5) * size * 0.8;

        this.#ctx.strokeStyle = ColorUtils.shadeColor(color, -30);
        this.#ctx.lineWidth = Math.max(0.5, Math.random() * 1.5);
        this.#ctx.globalAlpha = 0.4 + Math.random() * 0.3;

        this.#ctx.beginPath();
        this.#ctx.moveTo(crackX, crackY);
        this.#ctx.lineTo(
          crackX + Math.cos(crackAngle) * crackLength,
          crackY + Math.sin(crackAngle) * crackLength
        );
        this.#ctx.stroke();
      }
    }

    // Stone mineral flecks
    const fleckCount = Math.floor(size * 0.6);
    for (let i = 0; i < fleckCount; i++) {
      const fleckX = x + (Math.random() - 0.5) * size;
      const fleckY = y + (Math.random() - 0.5) * size;
      const fleckSize = Math.random() * 2 + 0.5;
      const fleckColor =
        Math.random() < 0.5
          ? ColorUtils.shadeColor(color, 20)
          : ColorUtils.shadeColor(color, -20);

      this.#ctx.fillStyle = fleckColor;
      this.#ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      this.#ctx.beginPath();
      this.#ctx.arc(fleckX, fleckY, fleckSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }
  }

  /**
   * Cloud brush - Fluffy cloud texture
   * @private
   */
  #drawCloud({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Multiple cloud puffs with soft edges
    const puffCount = Math.floor(size / 4) + 3;
    for (let i = 0; i < puffCount; i++) {
      const puffX = x + (Math.random() - 0.5) * size * 1.2;
      const puffY = y + (Math.random() - 0.5) * size * 1.2;
      const puffSize = size * (0.3 + Math.random() * 0.5);

      // Soft cloud gradient
      const gradient = this.#ctx.createRadialGradient(
        puffX,
        puffY,
        0,
        puffX,
        puffY,
        puffSize
      );
      gradient.addColorStop(0, ColorUtils.hexToRgba(color, 0.8));
      gradient.addColorStop(0.5, ColorUtils.hexToRgba(color, 0.4));
      gradient.addColorStop(1, "transparent");

      this.#ctx.fillStyle = gradient;
      this.#ctx.beginPath();
      this.#ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }

    // Cloud wisps
    const wispCount = Math.floor(size / 6);
    for (let i = 0; i < wispCount; i++) {
      const wispX = x + (Math.random() - 0.5) * size * 1.5;
      const wispY = y + (Math.random() - 0.5) * size * 1.5;
      const wispLength = size * (0.3 + Math.random() * 0.6);
      const wispAngle = Math.random() * Math.PI * 2;

      this.#ctx.strokeStyle = ColorUtils.hexToRgba(
        color,
        0.3 + Math.random() * 0.4
      );
      this.#ctx.lineWidth = size * (0.1 + Math.random() * 0.2);
      this.#ctx.lineCap = "round";

      // Curved wisp
      this.#ctx.beginPath();
      this.#ctx.moveTo(wispX, wispY);

      const segments = 4;
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const curve = Math.sin(t * Math.PI) * size * 0.2;
        const segmentX = wispX + Math.cos(wispAngle) * wispLength * t;
        const segmentY = wispY + Math.sin(wispAngle) * wispLength * t + curve;
        this.#ctx.lineTo(segmentX, segmentY);
      }

      this.#ctx.stroke();
    }
  }

  /**
   * Galaxy brush - Starry galaxy effect
   * @private
   */
  #drawGalaxy({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "lighter";

    // Galaxy core
    const coreGradient = this.#ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      size * 0.8
    );
    coreGradient.addColorStop(0, ColorUtils.hexToRgba(color, 0.8));
    coreGradient.addColorStop(0.3, ColorUtils.hexToRgba(color, 0.5));
    coreGradient.addColorStop(1, "transparent");

    this.#ctx.fillStyle = coreGradient;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    this.#ctx.fill();

    // Spiral arms
    const armCount = 2;
    for (let arm = 0; arm < armCount; arm++) {
      const armAngle = arm * Math.PI + Math.random() * 0.5;
      const armLength = size * 1.5;

      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const spiral = armAngle + t * Math.PI * 4;
        const radius = t * armLength;
        const armX = x + Math.cos(spiral) * radius;
        const armY = y + Math.sin(spiral) * radius;

        // Arm particles
        const particleCount = Math.floor((1 - t) * 8) + 2;
        for (let j = 0; j < particleCount; j++) {
          const particleX = armX + (Math.random() - 0.5) * size * 0.3 * (1 - t);
          const particleY = armY + (Math.random() - 0.5) * size * 0.3 * (1 - t);
          const particleSize = Math.random() * 2 + 0.5;
          const particleColor = `hsl(${Math.random() * 60 + 200}, 70%, ${60 + Math.random() * 40}%)`;

          this.#ctx.fillStyle = particleColor;
          this.#ctx.globalAlpha = 0.6 + Math.random() * 0.4;
          this.#ctx.beginPath();
          this.#ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          this.#ctx.fill();
        }
      }
    }

    // Scattered stars
    const starCount = Math.floor(size / 3);
    for (let i = 0; i < starCount; i++) {
      const starX = x + (Math.random() - 0.5) * size * 2;
      const starY = y + (Math.random() - 0.5) * size * 2;
      const starSize = Math.random() * 3 + 1;

      this.#ctx.fillStyle = "#ffffff";
      this.#ctx.globalAlpha = 0.7 + Math.random() * 0.3;
      this.#ctx.beginPath();
      this.#ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      this.#ctx.fill();

      // Star twinkle
      if (Math.random() < 0.3) {
        this.#ctx.shadowColor = "#ffffff";
        this.#ctx.shadowBlur = starSize * 3;
        this.#ctx.beginPath();
        this.#ctx.arc(starX, starY, starSize * 0.5, 0, Math.PI * 2);
        this.#ctx.fill();
        this.#ctx.shadowBlur = 0;
      }
    }

    this.#ctx.globalAlpha = 1;
  }

  /**
   * Plasma brush - Electric plasma effect
   * @private
   */
  #drawPlasma({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "lighter";

    // Plasma core
    const colors = ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"];
    const coreColor = colors[Math.floor(Math.random() * colors.length)];

    this.#ctx.fillStyle = coreColor;
    this.#ctx.globalAlpha = 0.8;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    this.#ctx.fill();

    // Plasma tentacles
    const tentacleCount = 8;
    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI * 2;
      const tentacleLength = size * (0.8 + Math.random() * 0.7);
      const tentacleColor = colors[Math.floor(Math.random() * colors.length)];

      // Organic tentacle path
      this.#ctx.strokeStyle = tentacleColor;
      this.#ctx.lineWidth = size * (0.1 + Math.random() * 0.2);
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.3;
      this.#ctx.lineCap = "round";

      this.#ctx.beginPath();
      this.#ctx.moveTo(x, y);

      const segments = 8;
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const wobble = Math.sin(t * Math.PI * 4) * size * 0.2;
        const tentacleX = x + Math.cos(angle) * tentacleLength * t + wobble;
        const tentacleY = y + Math.sin(angle) * tentacleLength * t;
        this.#ctx.lineTo(tentacleX, tentacleY);
      }

      this.#ctx.stroke();

      // Plasma sparks along tentacle
      for (let j = 0; j < 5; j++) {
        const sparkT = Math.random();
        const sparkX = x + Math.cos(angle) * tentacleLength * sparkT;
        const sparkY = y + Math.sin(angle) * tentacleLength * sparkT;
        const sparkSize = Math.random() * 2 + 1;

        this.#ctx.fillStyle = "#ffffff";
        this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;
        this.#ctx.beginPath();
        this.#ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        this.#ctx.fill();
      }
    }

    this.#ctx.globalAlpha = 1;
  }

  /**
   * Electric brush - High voltage electric effect
   * @private
   */
  #drawElectric({ x, y, lastPoint, color, size }) {
    // Use enhanced neon as base
    this.#drawNeon({ x, y, lastPoint, color, size });

    // Add electric arcs
    this.#ctx.globalCompositeOperation = "lighter";

    const arcCount = Math.floor(size / 4) + 2;
    for (let i = 0; i < arcCount; i++) {
      const arcAngle = Math.random() * Math.PI * 2;
      const arcLength = size * (0.5 + Math.random() * 1);
      const arcX = x + (Math.random() - 0.5) * size * 0.5;
      const arcY = y + (Math.random() - 0.5) * size * 0.5;

      // Jagged electric arc
      this.#ctx.strokeStyle = "#ffffff";
      this.#ctx.lineWidth = Math.max(1, Math.random() * 3);
      this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;
      this.#ctx.shadowColor = "#00ffff";
      this.#ctx.shadowBlur = size * 0.5;

      this.#ctx.beginPath();
      this.#ctx.moveTo(arcX, arcY);

      const segments = 6;
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const jitter = (Math.random() - 0.5) * size * 0.4;
        const segmentX = arcX + Math.cos(arcAngle) * arcLength * t + jitter;
        const segmentY = arcY + Math.sin(arcAngle) * arcLength * t + jitter;
        this.#ctx.lineTo(segmentX, segmentY);
      }

      this.#ctx.stroke();
    }

    this.#ctx.shadowBlur = 0;
  }
  /**
   * Crystal brush - Geometric crystalline patterns
   * @private
   */
  #drawCrystal({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Crystal facets
    const facetCount = Math.floor(size / 6) + 3;
    for (let i = 0; i < facetCount; i++) {
      const facetX = x + (Math.random() - 0.5) * size;
      const facetY = y + (Math.random() - 0.5) * size;
      const facetSize = size * (0.2 + Math.random() * 0.3);
      const rotation = Math.random() * Math.PI * 2;
      const sides = 4 + Math.floor(Math.random() * 4); // 4-7 sided crystals

      this.#ctx.save();
      this.#ctx.translate(facetX, facetY);
      this.#ctx.rotate(rotation);

      // Draw crystal facet
      this.#ctx.beginPath();
      for (let side = 0; side < sides; side++) {
        const angle = (side / sides) * Math.PI * 2;
        const sideX = Math.cos(angle) * facetSize;
        const sideY = Math.sin(angle) * facetSize;

        if (side === 0) this.#ctx.moveTo(sideX, sideY);
        else this.#ctx.lineTo(sideX, sideY);
      }
      this.#ctx.closePath();

      // Crystal color with transparency
      this.#ctx.fillStyle = ColorUtils.hexToRgba(
        color,
        0.6 + Math.random() * 0.3
      );
      this.#ctx.fill();

      // Crystal outline
      this.#ctx.strokeStyle = ColorUtils.shadeColor(color, 30);
      this.#ctx.lineWidth = Math.max(0.5, facetSize * 0.1);
      this.#ctx.stroke();

      // Crystal highlight
      this.#ctx.fillStyle = "#ffffff";
      this.#ctx.globalAlpha = 0.4 + Math.random() * 0.4;
      this.#ctx.beginPath();
      this.#ctx.arc(
        -facetSize * 0.3,
        -facetSize * 0.3,
        facetSize * 0.2,
        0,
        Math.PI * 2
      );
      this.#ctx.fill();

      this.#ctx.restore();
    }
  }

  /**
   * Magic brush - Mystical sparkle effect
   * @private
   */
  #drawMagic({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "lighter";

    // Magic aura
    const auraGradient = this.#ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      size * 1.2
    );
    auraGradient.addColorStop(0, ColorUtils.hexToRgba(color, 0.6));
    auraGradient.addColorStop(0.5, ColorUtils.hexToRgba(color, 0.3));
    auraGradient.addColorStop(1, "transparent");

    this.#ctx.fillStyle = auraGradient;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
    this.#ctx.fill();

    // Magic sparkles
    const sparkleCount = Math.floor(size / 3) + 5;
    const sparkleColors = ["#ffff00", "#ff00ff", "#00ffff", "#ffffff"];

    for (let i = 0; i < sparkleCount; i++) {
      const sparkleX = x + (Math.random() - 0.5) * size * 2;
      const sparkleY = y + (Math.random() - 0.5) * size * 2;
      const sparkleSize = Math.random() * size * 0.2 + 1;
      const sparkleColor =
        sparkleColors[Math.floor(Math.random() * sparkleColors.length)];

      // Sparkle core
      this.#ctx.fillStyle = sparkleColor;
      this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;
      this.#ctx.beginPath();
      this.#ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
      this.#ctx.fill();

      // Sparkle rays
      if (Math.random() < 0.5) {
        this.#ctx.strokeStyle = sparkleColor;
        this.#ctx.lineWidth = Math.max(0.5, sparkleSize * 0.3);
        this.#ctx.globalAlpha = 0.6;

        // Four-pointed star
        const rayLength = sparkleSize * 2;
        for (let ray = 0; ray < 4; ray++) {
          const angle = (ray * Math.PI) / 2 + Math.PI / 4;
          this.#ctx.beginPath();
          this.#ctx.moveTo(
            sparkleX + Math.cos(angle) * rayLength * 0.3,
            sparkleY + Math.sin(angle) * rayLength * 0.3
          );
          this.#ctx.lineTo(
            sparkleX + Math.cos(angle) * rayLength,
            sparkleY + Math.sin(angle) * rayLength
          );
          this.#ctx.stroke();
        }
      }
    }

    this.#ctx.globalAlpha = 1;
  }

  /**
   * Rainbow brush - Multicolor rainbow effect
   * @private
   */
  #drawRainbow({ x, y, lastPoint, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const rainbowColors = [
      "#FF0000",
      "#FF7F00",
      "#FFFF00",
      "#00FF00",
      "#0000FF",
      "#4B0082",
      "#9400D3",
    ];

    if (lastPoint) {
      // Multiple colored strokes
      rainbowColors.forEach((color, index) => {
        const offset = (index - rainbowColors.length / 2) * 3;
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = Math.max(1, size * 0.8 - index);
        this.#ctx.globalAlpha = 0.8;
        this.#ctx.lineCap = "round";

        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offset, lastPoint.y);
        this.#ctx.lineTo(x + offset, y);
        this.#ctx.stroke();
      });
    } else {
      // Rainbow circle
      rainbowColors.forEach((color, index) => {
        const radius = size * (0.8 - index * 0.1);
        this.#ctx.fillStyle = color;
        this.#ctx.globalAlpha = 0.6;
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.#ctx.fill();
      });
    }

    this.#ctx.globalAlpha = 1;
  }

  /**
   * Gradient brush - Color gradient effect
   * @private
   */
  #drawGradient({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Create gradient from color to lighter version
    const gradient = this.#ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, ColorUtils.shadeColor(color, 30));
    gradient.addColorStop(
      1,
      ColorUtils.hexToRgba(ColorUtils.shadeColor(color, 60), 0)
    );

    this.#ctx.fillStyle = gradient;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size, 0, Math.PI * 2);
    this.#ctx.fill();
  }

  /**
   * Mosaic brush - Tile mosaic pattern
   * @private
   */
  #drawMosaic({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const tileSize = Math.max(2, size / 4);
    const tilesX = Math.ceil((size * 2) / tileSize);
    const tilesY = Math.ceil((size * 2) / tileSize);
    const startX = x - (tilesX * tileSize) / 2;
    const startY = y - (tilesY * tileSize) / 2;

    for (let i = 0; i < tilesX; i++) {
      for (let j = 0; j < tilesY; j++) {
        const tileX = startX + i * tileSize;
        const tileY = startY + j * tileSize;
        const distance = Math.sqrt((tileX - x) ** 2 + (tileY - y) ** 2);

        // Only draw tiles within brush radius
        if (distance <= size) {
          const tileColor = ColorUtils.shadeColor(
            color,
            (Math.random() - 0.5) * 40
          );
          const tileAlpha = Math.max(0.3, 1 - distance / size);

          this.#ctx.fillStyle = tileColor;
          this.#ctx.globalAlpha = tileAlpha;
          this.#ctx.fillRect(tileX, tileY, tileSize * 0.9, tileSize * 0.9);

          // Tile grout lines
          this.#ctx.strokeStyle = ColorUtils.shadeColor(color, -30);
          this.#ctx.lineWidth = Math.max(0.5, tileSize * 0.1);
          this.#ctx.globalAlpha = tileAlpha * 0.8;
          this.#ctx.strokeRect(tileX, tileY, tileSize * 0.9, tileSize * 0.9);
        }
      }
    }

    this.#ctx.globalAlpha = 1;
  }

  /**
   * Kaleidoscope brush - Symmetric kaleidoscope pattern
   * @private
   */
  #drawKaleidoscope({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    const segments = 8;
    const segmentAngle = (Math.PI * 2) / segments;

    this.#ctx.save();
    this.#ctx.translate(x, y);

    for (let i = 0; i < segments; i++) {
      this.#ctx.save();
      this.#ctx.rotate(i * segmentAngle);

      // Create pattern elements
      const elementCount = Math.floor(size / 8) + 2;
      for (let j = 0; j < elementCount; j++) {
        const elementX = Math.random() * size * 0.8;
        const elementY = (Math.random() - 0.5) * size * 0.3;
        const elementSize = size * (0.1 + Math.random() * 0.2);
        const elementColor = ColorUtils.shadeColor(
          color,
          (Math.random() - 0.5) * 60
        );

        this.#ctx.fillStyle = elementColor;
        this.#ctx.globalAlpha = 0.6 + Math.random() * 0.4;

        // Random shapes for kaleidoscope
        if (Math.random() < 0.5) {
          // Circle
          this.#ctx.beginPath();
          this.#ctx.arc(elementX, elementY, elementSize, 0, Math.PI * 2);
          this.#ctx.fill();
        } else {
          // Triangle
          this.#ctx.beginPath();
          this.#ctx.moveTo(elementX, elementY - elementSize);
          this.#ctx.lineTo(elementX - elementSize, elementY + elementSize);
          this.#ctx.lineTo(elementX + elementSize, elementY + elementSize);
          this.#ctx.closePath();
          this.#ctx.fill();
        }
      }

      this.#ctx.restore();
    }

    this.#ctx.restore();
    this.#ctx.globalAlpha = 1;
  }

  /**
   * Mandala brush - Sacred geometric mandala pattern
   * @private
   */
  #drawMandala({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    this.#ctx.save();
    this.#ctx.translate(x, y);

    // Concentric circles with patterns
    const rings = Math.floor(size / 10) + 2;
    for (let ring = 0; ring < rings; ring++) {
      const ringRadius = (ring + 1) * (size / rings);
      const elements = 6 + ring * 2; // More elements in outer rings

      for (let element = 0; element < elements; element++) {
        const angle = (element / elements) * Math.PI * 2;
        const elementX = Math.cos(angle) * ringRadius;
        const elementY = Math.sin(angle) * ringRadius;
        const elementSize = size * (0.05 + (rings - ring) * 0.02);
        const elementColor = ColorUtils.shadeColor(color, ring * 10 - 20);

        this.#ctx.save();
        this.#ctx.translate(elementX, elementY);
        this.#ctx.rotate(angle);

        this.#ctx.fillStyle = elementColor;
        this.#ctx.globalAlpha = 0.7 - ring * 0.1;

        // Petal shape
        this.#ctx.beginPath();
        this.#ctx.ellipse(
          0,
          0,
          elementSize,
          elementSize * 2,
          0,
          0,
          Math.PI * 2
        );
        this.#ctx.fill();

        this.#ctx.restore();
      }

      // Ring outline
      this.#ctx.strokeStyle = ColorUtils.hexToRgba(color, 0.3);
      this.#ctx.lineWidth = Math.max(0.5, size * 0.02);
      this.#ctx.beginPath();
      this.#ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      this.#ctx.stroke();
    }

    // Central dot
    this.#ctx.fillStyle = color;
    this.#ctx.globalAlpha = 1;
    this.#ctx.beginPath();
    this.#ctx.arc(0, 0, size * 0.05, 0, Math.PI * 2);
    this.#ctx.fill();

    this.#ctx.restore();
  }

  // ===========================
  // ARTISTIC STYLE BRUSHES
  // ===========================

  /**
   * Impressionist brush - Impressionist painting style
   * @private
   */
  #drawImpressionist({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Broken color technique
    const strokeCount = Math.floor(size / 3) + 3;
    for (let i = 0; i < strokeCount; i++) {
      const strokeX = x + (Math.random() - 0.5) * size;
      const strokeY = y + (Math.random() - 0.5) * size;
      const strokeLength = size * (0.3 + Math.random() * 0.5);
      const strokeAngle = Math.random() * Math.PI * 2;
      const strokeColor = ColorUtils.shadeColor(
        color,
        (Math.random() - 0.5) * 40
      );

      this.#ctx.strokeStyle = strokeColor;
      this.#ctx.lineWidth = Math.max(1, size * (0.1 + Math.random() * 0.2));
      this.#ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      this.#ctx.lineCap = "round";

      this.#ctx.beginPath();
      this.#ctx.moveTo(strokeX, strokeY);
      this.#ctx.lineTo(
        strokeX + Math.cos(strokeAngle) * strokeLength,
        strokeY + Math.sin(strokeAngle) * strokeLength
      );
      this.#ctx.stroke();
    }
  }

  /**
   * Pointillist brush - Pointillism dots technique
   * @private
   */
  #drawPointillist({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Pure color dots
    const dotCount = Math.floor(size * 2);
    for (let i = 0; i < dotCount; i++) {
      const dotX = x + (Math.random() - 0.5) * size * 1.5;
      const dotY = y + (Math.random() - 0.5) * size * 1.5;
      const dotSize = size * (0.05 + Math.random() * 0.15);

      // Color variations for optical mixing
      const colorVariations = [
        color,
        ColorUtils.shadeColor(color, 20),
        ColorUtils.shadeColor(color, -20),
        ColorUtils.shadeColor(color, 10),
      ];
      const dotColor =
        colorVariations[Math.floor(Math.random() * colorVariations.length)];

      this.#ctx.fillStyle = dotColor;
      this.#ctx.globalAlpha = 0.8 + Math.random() * 0.2;
      this.#ctx.beginPath();
      this.#ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      this.#ctx.fill();
    }
  }

  // Placeholder implementations for remaining brushes
  // These would be expanded with unique algorithms in a full implementation
  #drawCeltic({ x, y, lastPoint, color, size }) {
    // Celtic knot patterns
    this.#drawLines({ x, y, lastPoint, color, size });

    // Add celtic spiral elements
    if (Math.random() < 0.3) {
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = Math.max(1, size * 0.2);
      this.#ctx.globalAlpha = 0.6;

      const spiralRadius = size * 0.5;
      this.#ctx.beginPath();
      this.#ctx.arc(x, y, spiralRadius, 0, Math.PI * 1.5);
      this.#ctx.stroke();
    }
  }

  #drawTribal({ x, y, lastPoint, color, size }) {
    // Bold tribal patterns
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.fillStyle = color;
    this.#ctx.globalAlpha = 0.9;

    // Angular tribal shapes
    const shapeCount = Math.floor(size / 8) + 1;
    for (let i = 0; i < shapeCount; i++) {
      const shapeX = x + (Math.random() - 0.5) * size;
      const shapeY = y + (Math.random() - 0.5) * size;
      const shapeSize = size * (0.2 + Math.random() * 0.3);

      this.#ctx.beginPath();
      this.#ctx.moveTo(shapeX, shapeY - shapeSize);
      this.#ctx.lineTo(shapeX + shapeSize, shapeY);
      this.#ctx.lineTo(shapeX, shapeY + shapeSize);
      this.#ctx.lineTo(shapeX - shapeSize, shapeY);
      this.#ctx.closePath();
      this.#ctx.fill();
    }
  }

  #drawGeometric({ x, y, color, size }) {
    // Sharp geometric shapes
    this.#drawMosaic({ x, y, color, size });
  }

  #drawOrganic({ x, y, color, size }) {
    // Natural, flowing forms
    this.#drawWatercolor({ x, y, color, size });
  }

  #drawFractal({ x, y, color, size }) {
    // Self-similar patterns
    this.#ctx.globalCompositeOperation = "source-over";

    const drawFractalBranch = (branchX, branchY, branchSize, depth) => {
      if (depth <= 0 || branchSize < 1) return;

      this.#ctx.fillStyle = ColorUtils.hexToRgba(color, 0.7 - depth * 0.1);
      this.#ctx.beginPath();
      this.#ctx.arc(branchX, branchY, branchSize, 0, Math.PI * 2);
      this.#ctx.fill();

      // Recursive branches
      const branches = 4;
      for (let i = 0; i < branches; i++) {
        const angle = (i / branches) * Math.PI * 2;
        const newX = branchX + Math.cos(angle) * branchSize * 2;
        const newY = branchY + Math.sin(angle) * branchSize * 2;
        drawFractalBranch(newX, newY, branchSize * 0.6, depth - 1);
      }
    };

    drawFractalBranch(x, y, size * 0.3, 3);
  }

  #drawAbstract({ x, y, color, size }) {
    this.#drawBasicBrush({ x, y, color, size });
  }

  #drawSurreal({ x, y, color, size }) {
    this.#drawBasicBrush({ x, y, color, size });
  }

  #drawMinimalist({ x, y, lastPoint, color, size }) {
    // Clean, simple lines
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(1, size * 0.5);
    this.#ctx.globalAlpha = 1;
    this.#ctx.lineCap = "round";

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  #drawVintage({ x, y, lastPoint, color, size }) {
    // Aged, worn appearance
    this.#drawCharcoal({ x, y, lastPoint, color, size });

    // Add vintage spots
    if (Math.random() < 0.2) {
      const spotCount = Math.floor(size / 6);
      for (let i = 0; i < spotCount; i++) {
        const spotX = x + (Math.random() - 0.5) * size;
        const spotY = y + (Math.random() - 0.5) * size;
        const spotSize = Math.random() * 3 + 1;

        this.#ctx.fillStyle = ColorUtils.shadeColor(color, -30);
        this.#ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        this.#ctx.beginPath();
        this.#ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        this.#ctx.fill();
      }
    }
  }

  #drawGrunge({ x, y, lastPoint, color, size }) {
    // Rough, distressed texture
    this.#drawCharcoal({ x, y, lastPoint, color, size });

    // Add grunge scratches
    const scratchCount = Math.floor(size / 4);
    for (let i = 0; i < scratchCount; i++) {
      const scratchAngle = Math.random() * Math.PI * 2;
      const scratchLength = size * (0.2 + Math.random() * 0.6);
      const scratchX = x + (Math.random() - 0.5) * size;
      const scratchY = y + (Math.random() - 0.5) * size;

      this.#ctx.strokeStyle = ColorUtils.shadeColor(color, -20);
      this.#ctx.lineWidth = Math.max(0.5, Math.random() * 2);
      this.#ctx.globalAlpha = 0.4 + Math.random() * 0.4;

      this.#ctx.beginPath();
      this.#ctx.moveTo(scratchX, scratchY);
      this.#ctx.lineTo(
        scratchX + Math.cos(scratchAngle) * scratchLength,
        scratchY + Math.sin(scratchAngle) * scratchLength
      );
      this.#ctx.stroke();
    }
  }

  #drawDigital({ x, y, color, size }) {
    // Pixelated digital effect
    this.#drawPixel({ x, y, color, size });
  }

  // ===========================
  // NEW BRUSH IMPLEMENTATIONS
  // ===========================

  // Basic brushes
  #drawShadow({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "lighter";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size;
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.shadowColor = color;
    this.#ctx.shadowBlur = size * 2.5;
    this.#ctx.globalAlpha = 0.85;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }

    this.#ctx.shadowBlur = 0;
    this.#ctx.globalAlpha = 1;
    this.#ctx.globalCompositeOperation = "source-over";
  }

  // Artistic brushes
  #drawPen({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size * (0.7 + Math.random() * 0.6);
    this.#ctx.lineCap = "round";
    this.#ctx.globalAlpha = 1;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  #drawPen2({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = size * 0.7;
    this.#ctx.lineCap = "round";
    this.#ctx.globalAlpha = 1;

    if (lastPoint) {
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * size * 0.7;
        const offsetY = (Math.random() - 0.5) * size * 0.7;
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offsetX, lastPoint.y + offsetY);
        this.#ctx.lineTo(x + offsetX, y + offsetY);
        this.#ctx.stroke();
      }
    }
  }

  #drawThick({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(2, size * 0.8);
    this.#ctx.globalAlpha = 0.7;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  #drawSliced({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "butt";
    this.#ctx.lineJoin = "miter";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(1, size * 0.4);
    this.#ctx.globalAlpha = 0.8;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  #drawMulti({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineCap = "round";
    const numLines = 7;

    if (lastPoint) {
      for (let i = 0; i < numLines; i++) {
        // Offset aleatorio para cada línea
        const offsetX = (Math.random() - 0.5) * size * 1.5;
        const offsetY = (Math.random() - 0.5) * size * 1.5;
        this.#ctx.globalAlpha = 0.18 + Math.random() * 0.32;
        this.#ctx.lineWidth = size * (0.25 + Math.random() * 0.25);
        // Variar longitud (simula líneas más cortas/largas)
        const t1 = Math.random() * 0.2;
        const t2 = 0.8 + Math.random() * 0.2;
        this.#ctx.beginPath();
        this.#ctx.moveTo(
          lastPoint.x + offsetX * (1 - t1),
          lastPoint.y + offsetY * (1 - t1)
        );
        this.#ctx.lineTo(x + offsetX * (1 - t2), y + offsetY * (1 - t2));
        this.#ctx.stroke();
      }
      // Líneas cruzadas (diagonales)
      for (let i = 0; i < 3; i++) {
        const angle = Math.PI / 4 + ((Math.random() - 0.5) * Math.PI) / 2;
        const length = size * (2 + Math.random() * 2);
        this.#ctx.globalAlpha = 0.12 + Math.random() * 0.18;
        this.#ctx.lineWidth = size * (0.18 + Math.random() * 0.18);
        this.#ctx.beginPath();
        const midX = (lastPoint.x + x) / 2;
        const midY = (lastPoint.y + y) / 2;
        this.#ctx.moveTo(
          midX - (Math.cos(angle) * length) / 2,
          midY - (Math.sin(angle) * length) / 2
        );
        this.#ctx.lineTo(
          midX + (Math.cos(angle) * length) / 2,
          midY + (Math.sin(angle) * length) / 2
        );
        this.#ctx.stroke();
      }
    }
    this.#ctx.globalAlpha = 1;
  }

  #drawMultiOpacity({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    const numLines = 5;

    if (lastPoint) {
      for (let i = 0; i < numLines; i++) {
        const offsetX = (Math.random() - 0.5) * size * 1.1;
        const offsetY = (Math.random() - 0.5) * size * 1.1;
        this.#ctx.globalAlpha = 1 - i * 0.18 - Math.random() * 0.12;
        this.#ctx.lineWidth = size * (0.7 - i * 0.12 + Math.random() * 0.08);
        // Variar longitud de la línea
        const t1 = Math.random() * 0.15;
        const t2 = 0.85 + Math.random() * 0.15;
        this.#ctx.beginPath();
        this.#ctx.moveTo(
          lastPoint.x + offsetX * (1 - t1),
          lastPoint.y + offsetY * (1 - t1)
        );
        this.#ctx.lineTo(x + offsetX * (1 - t2), y + offsetY * (1 - t2));
        this.#ctx.stroke();
      }
    }
    this.#ctx.globalAlpha = 1;
  }

  #drawBeads({ x, y, lastPoint, color, size }) {
    if (lastPoint) {
      const x1 = lastPoint.x;
      const y1 = lastPoint.y;
      const x2 = x;
      const y2 = y;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const beadSize = Math.max(2, distance * 0.3);

      this.#ctx.fillStyle = color;
      this.#ctx.globalAlpha = 0.8;
      this.#ctx.beginPath();
      this.#ctx.arc(midX, midY, beadSize, 0, Math.PI * 2);
      this.#ctx.fill();
      this.#ctx.globalAlpha = 1;
    }
  }

  #drawWiggle({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(1, size * 0.3);
    this.#ctx.globalAlpha = 0.8;

    if (lastPoint) {
      const points = 10;
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);

      for (let i = 1; i <= points; i++) {
        const t = i / points;
        const wiggleX =
          lastPoint.x + (x - lastPoint.x) * t + Math.sin(t * Math.PI * 3) * 3;
        const wiggleY =
          lastPoint.y + (y - lastPoint.y) * t + Math.cos(t * Math.PI * 2) * 2;
        this.#ctx.lineTo(wiggleX, wiggleY);
      }

      this.#ctx.stroke();
    }
  }

  // Stamp brushes
  #drawStampCircle({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.fillStyle = color;
    this.#ctx.globalAlpha = 0.8;
    this.#ctx.beginPath();
    this.#ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    this.#ctx.fill();
  }

  #drawStampStar({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.fillStyle = color;
    this.#ctx.globalAlpha = 0.8;

    const points = 5;
    const outerRadius = size * 0.4;
    const innerRadius = size * 0.2;

    this.#ctx.beginPath();
    this.#ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      this.#ctx.lineTo(x + Math.sin(angle) * r, y - Math.cos(angle) * r);
    }

    this.#ctx.closePath();
    this.#ctx.fill();
  }

  // Pattern brushes
  #drawPatternDots({ x, y, color, size }) {
    this.#drawDots({ x, y, color, size });
  }

  #drawPatternLines({ x, y, color, size }) {
    this.#drawLines({ x, y, color, size });
  }

  #drawPatternRainbow({ x, y, color, size }) {
    const colors = [
      "#FF0000",
      "#FF7F00",
      "#FFFF00",
      "#00FF00",
      "#0000FF",
      "#4B0082",
      "#9400D3",
    ];
    const colorIndex = Math.floor(Math.random() * colors.length);
    this.#drawBasicBrush({ x, y, color: colors[colorIndex], size });
  }

  #drawPatternImage({ x, y, color, size }) {
    this.#drawBasicBrush({ x, y, color, size });
  }

  // Spray brushes
  #drawAerosol({ x, y, color, size }) {
    this.#drawSpray({ x, y, color, size });
  }

  #drawSprayTime({ x, y, color, size }) {
    this.#drawSpray({ x, y, color, size });
  }

  #drawSpraySpeed({ x, y, color, size }) {
    this.#drawSpray({ x, y, color, size });
  }

  /**
   * Airbrush soft - Smooth radial gradient effect inspired by user's code
   * @private
   */
  #drawAirbrushSoft({ x, y, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";

    // Dynamic sizing based on brush size
    const innerRadius = size * 0.2; // Core radius
    const outerRadius = size * 0.8; // Fade radius
    const rectSize = size * 1.6; // Rectangle size for fillRect

    // Create radial gradient - inspired by user's technique
    const radialGradient = this.#ctx.createRadialGradient(
      x,
      y,
      innerRadius, // Inner circle
      x,
      y,
      outerRadius // Outer circle
    );

    // Parse color for gradient stops
    const rgba = ColorUtils.hexToRgba(color, 1);
    const colorCore = rgba; // Full opacity at center
    const colorMid = ColorUtils.hexToRgba(color, 0.5); // Half opacity at mid
    const colorEdge = ColorUtils.hexToRgba(color, 0); // Transparent at edge

    radialGradient.addColorStop(0, colorCore);
    radialGradient.addColorStop(0.5, colorMid);
    radialGradient.addColorStop(1, colorEdge);

    // Apply gradient and draw smooth circle
    this.#ctx.fillStyle = radialGradient;
    this.#ctx.globalAlpha = 0.8; // Subtle transparency for buildable opacity

    // Use fillRect for consistent shape like in user's code
    const halfSize = rectSize / 2;
    this.#ctx.fillRect(x - halfSize, y - halfSize, rectSize, rectSize);
  }

  /**
   * Smooth curves brush - Advanced bezier curves inspired by user's technique
   * Uses incremental quadratic curves without clearing the canvas
   * @private
   */
  #drawSmoothCurves({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.lineWidth = size;
    this.#ctx.globalAlpha = 1.0;

    // Initialize points buffer if it doesn't exist (first point)
    if (!this.pointsBuffer) {
      this.pointsBuffer = [];
    }

    // Add current point to buffer
    this.pointsBuffer.push({ x, y });

    // Limit buffer size to prevent memory issues (keep last 4 points max)
    if (this.pointsBuffer.length > 4) {
      this.pointsBuffer.shift(); // Remove oldest point
    }

    // Need at least 3 points to draw smooth curves
    if (this.pointsBuffer.length >= 3) {
      const len = this.pointsBuffer.length;
      const p0 = this.pointsBuffer[len - 3]; // Previous point
      const p1 = this.pointsBuffer[len - 2]; // Control point
      const p2 = this.pointsBuffer[len - 1]; // Current point

      // Calculate midpoint between p1 and p2 (your technique!)
      const midPoint = {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      };

      this.#ctx.beginPath();
      this.#ctx.moveTo(p0.x, p0.y);

      // Use your quadratic curve algorithm!
      this.#ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      this.#ctx.stroke();
    } else if (lastPoint) {
      // For first few points, draw straight lines
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  // Reset points buffer when stroke ends
  resetSmoothCurvesBuffer() {
    this.pointsBuffer = null;
  }

  // Sketch/Harmony brushes

  // Sketch/Harmony brushes
  #drawSketchy({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(0.5, size * 0.2);
    this.#ctx.globalAlpha = 0.6;

    if (lastPoint) {
      const segments = 3;
      for (let i = 0; i < segments; i++) {
        const t1 = i / segments;
        const t2 = (i + 1) / segments;
        const x1 = lastPoint.x + (x - lastPoint.x) * t1;
        const y1 = lastPoint.y + (y - lastPoint.y) * t1;
        const x2 = lastPoint.x + (x - lastPoint.x) * t2;
        const y2 = lastPoint.y + (y - lastPoint.y) * t2;

        this.#ctx.beginPath();
        this.#ctx.moveTo(x1, y1);
        this.#ctx.lineTo(x2, y2);
        this.#ctx.stroke();
      }
    }
  }

  #drawNeighbor({ x, y, lastPoint, color, size }) {
    this.#ctx.globalCompositeOperation = "source-over";
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";
    this.#ctx.strokeStyle = color;
    this.#ctx.lineWidth = Math.max(1, size * 0.3);
    this.#ctx.globalAlpha = 0.7;

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();

      // Línea vecina
      this.#ctx.globalAlpha = 0.4;
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x + 2, lastPoint.y + 2);
      this.#ctx.lineTo(x + 2, y + 2);
      this.#ctx.stroke();
    }
  }

  #drawFurNeighbor({ x, y, lastPoint, color, size }) {
    this.#drawFur({ x, y, lastPoint, color, size });
  }

  // Special brushes
  #drawRainbowDynamic({ x, y, lastPoint, color, size }) {
    const hue = (Date.now() / 10) % 360;
    this.#ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
    this.#ctx.lineWidth = size;
    this.#ctx.lineCap = "round";
    this.#ctx.lineJoin = "round";

    if (lastPoint) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(lastPoint.x, lastPoint.y);
      this.#ctx.lineTo(x, y);
      this.#ctx.stroke();
    }
  }

  #drawConfetti({ x, y, color, size }) {
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * size * 2;
      const offsetY = (Math.random() - 0.5) * size * 2;
      this.#ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
      this.#ctx.fillRect(x + offsetX, y + offsetY, 2, 2);
    }
  }

  #drawShootingStar({ x, y, lastPoint, color, size }) {
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * size * 2;
      const offsetY = (Math.random() - 0.5) * size * 2;
      this.#ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
      this.#ctx.fillRect(x + offsetX, y + offsetY, 2, 2);
    }
  }

  #drawGlitch({ x, y, lastPoint, color, size }) {
    // Línea principal
    this.#ctx.save();
    this.#ctx.globalCompositeOperation = "lighter";

    if (lastPoint) {
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * 2;
        this.#ctx.strokeStyle = ["#f00", "#0ff", "#fff"][i];
        this.#ctx.lineWidth = size + (i === 1 ? 2 : 0);
        this.#ctx.beginPath();
        this.#ctx.moveTo(lastPoint.x + offset, lastPoint.y + offset);
        this.#ctx.lineTo(x + offset, y + offset);
        this.#ctx.stroke();
      }
      // Saltos aleatorios
      for (let i = 0; i < 4; i++) {
        this.#ctx.strokeStyle = "#fff";
        this.#ctx.lineWidth = size * 0.7;
        const t = Math.random();
        const x1 =
          lastPoint.x + (x - lastPoint.x) * t + (Math.random() - 0.5) * 8;
        const y1 =
          lastPoint.y + (y - lastPoint.y) * t + (Math.random() - 0.5) * 8;
        const x2 = x1 + (Math.random() - 0.5) * 16;
        const y2 = y1 + (Math.random() - 0.5) * 16;
        this.#ctx.beginPath();
        this.#ctx.moveTo(x1, y1);
        this.#ctx.lineTo(x2, y2);
        this.#ctx.stroke();
      }
    }
    this.#ctx.restore();
  }

  #drawHeartSpray({ x, y, color, size }) {
    // Spray de corazones
    for (let i = 0; i < size * 1.2; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * size * 1.5;
      const heartX = x + Math.cos(angle) * radius;
      const heartY = y + Math.sin(angle) * radius;
      this.#ctx.save();
      this.#ctx.translate(heartX, heartY);
      this.#ctx.rotate(angle);
      this.#ctx.scale(0.7 + Math.random() * 0.7, 0.7 + Math.random() * 0.7);
      this.#ctx.beginPath();
      this.#ctx.moveTo(0, 0);
      this.#ctx.bezierCurveTo(
        0,
        -size * 0.4,
        -size * 0.5,
        -size * 0.4,
        -size * 0.5,
        0
      );
      this.#ctx.bezierCurveTo(
        -size * 0.5,
        size * 0.5,
        0,
        size * 0.7,
        0,
        size * 1.1
      );
      this.#ctx.bezierCurveTo(
        0,
        size * 0.7,
        size * 0.5,
        size * 0.5,
        size * 0.5,
        0
      );
      this.#ctx.bezierCurveTo(size * 0.5, -size * 0.4, 0, -size * 0.4, 0, 0);
      this.#ctx.closePath();
      this.#ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 60%)`;
      this.#ctx.globalAlpha = 0.7 + Math.random() * 0.3;
      this.#ctx.fill();
      this.#ctx.restore();
    }
  }

  #drawBubble({ x, y, color, size }) {
    // Burbujas translúcidas
    for (let i = 0; i < size * 1.2; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * size * 1.5;
      const bubbleX = x + Math.cos(angle) * radius;
      const bubbleY = y + Math.sin(angle) * radius;
      this.#ctx.beginPath();
      this.#ctx.arc(
        bubbleX,
        bubbleY,
        Math.max(3, size * 0.5 + Math.random() * size * 0.5),
        0,
        Math.PI * 2
      );
      this.#ctx.globalAlpha = 0.18 + Math.random() * 0.22;
      this.#ctx.fillStyle = `rgba(180,220,255,0.5)`;
      this.#ctx.fill();
      // Reflejo
      this.#ctx.globalAlpha = 0.12;
      this.#ctx.beginPath();
      this.#ctx.arc(
        bubbleX - size * 0.2,
        bubbleY - size * 0.2,
        Math.max(1, size * 0.18),
        0,
        Math.PI * 2
      );
      this.#ctx.fillStyle = "#fff";
      this.#ctx.fill();
    }
    this.#ctx.globalAlpha = 1;
  }

  #drawRibbon({ x, y, lastPoint, color, size }) {
    // Cinta ondulante
    if (lastPoint) {
      const x1 = lastPoint.x;
      const y1 = lastPoint.y;
      const x2 = x;
      const y2 = y;
      const steps = 16;
      this.#ctx.save();
      this.#ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = Math.PI * 2 * t * 2 + Date.now() / 200;
        const r = Math.sin(angle) * size * 0.7;
        const ribbonX = x1 + (x2 - x1) * t + Math.cos(angle) * r;
        const ribbonY = y1 + (y2 - y1) * t + Math.sin(angle) * r;
        if (i === 0) this.#ctx.moveTo(ribbonX, ribbonY);
        else this.#ctx.lineTo(ribbonX, ribbonY);
      }
      this.#ctx.strokeStyle = color;
      this.#ctx.lineWidth = size * 0.9;
      this.#ctx.globalAlpha = 0.7;
      this.#ctx.stroke();
      this.#ctx.globalAlpha = 1;
      this.#ctx.restore();
    }
  }

  #drawFireRealistic({ x, y, color, size }) {
    // Llama realista
    for (let i = 0; i < 3; i++) {
      const flameColor = [
        "rgba(255, 200, 0, 0.18)",
        "rgba(255, 100, 0, 0.13)",
        "rgba(255, 255, 255, 0.08)",
      ][i];
      const flameSize = size * (1.2 + i * 0.5);
      this.#ctx.beginPath();
      this.#ctx.ellipse(
        x,
        y,
        flameSize,
        flameSize * (1.2 + Math.random() * 0.5),
        0,
        0,
        Math.PI * 2
      );
      this.#ctx.fillStyle = flameColor;
      this.#ctx.fill();
    }
    // Chispas
    for (let i = 0; i < Math.floor(size / 2); i++) {
      this.#ctx.globalAlpha = 0.7;
      this.#ctx.fillStyle = "yellow";
      this.#ctx.beginPath();
      this.#ctx.arc(
        x + (Math.random() - 0.5) * size * 2,
        y - Math.random() * size * 2,
        Math.random() * 2 + 1,
        0,
        Math.PI * 2
      );
      this.#ctx.fill();
    }
    this.#ctx.globalAlpha = 1;
  }

  #drawParticles({ x, y, color, size }) {
    // Partículas de colores
    for (let i = 0; i < size * 2; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * size * 1.2;
      const particleX = x + Math.cos(angle) * radius;
      const particleY = y + Math.sin(angle) * radius;
      this.#ctx.beginPath();
      this.#ctx.arc(
        particleX,
        particleY,
        Math.max(1, size * 0.18),
        0,
        Math.PI * 2
      );
      this.#ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      this.#ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 60%)`;
      this.#ctx.fill();
    }
    this.#ctx.globalAlpha = 1;
  }

  // ===========================
  // IMAGE-BASED BRUSH METHODS
  // ===========================

  /**
   * Pincel que usa una imagen/textura y la repite a lo largo del trazo
   * Basado en el algoritmo que compartiste
   */
  #drawImageBrush({ x, y, lastPoint, color, size }) {
    // Si no hay punto anterior, solo dibujamos un punto
    if (!lastPoint) {
      this.#drawImageStamp(x, y, size, color);
      return;
    }

    // Calcular distancia y ángulo entre puntos (tu algoritmo!)
    const dist = this.#distanceBetween(lastPoint, { x, y });
    const angle = this.#angleBetween(lastPoint, { x, y });

    // Dibujar stamps a lo largo del trazo con espaciado uniforme
    const spacing = Math.max(2, size * 0.3); // Espaciado entre stamps
    const steps = Math.floor(dist / spacing);

    for (let i = 0; i <= steps; i++) {
      const progress = steps > 0 ? i / steps : 0;
      const currentX = lastPoint.x + (x - lastPoint.x) * progress;
      const currentY = lastPoint.y + (y - lastPoint.y) * progress;

      // Pequeña variación aleatoria para efecto más orgánico
      const offsetX = (Math.random() - 0.5) * size * 0.2;
      const offsetY = (Math.random() - 0.5) * size * 0.2;

      this.#drawImageStamp(
        currentX + offsetX,
        currentY + offsetY,
        size * (0.8 + Math.random() * 0.4),
        color
      );
    }
  }

  /**
   * Sello con textura procedural que simula una imagen
   */
  #drawTextureStamp({ x, y, color, size }) {
    const ctx = this.#ctx;
    ctx.save();

    // Crear patrón de textura procedural
    const patternCanvas = document.createElement("canvas");
    const patternSize = Math.ceil(size * 2);
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternCtx = patternCanvas.getContext("2d");

    // Generar textura procedural (simulando imagen)
    const imageData = patternCtx.createImageData(patternSize, patternSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const pixelX = pixelIndex % patternSize;
      const pixelY = Math.floor(pixelIndex / patternSize);

      // Crear patrón tipo brush/textura
      const centerX = patternSize / 2;
      const centerY = patternSize / 2;
      const distFromCenter = Math.sqrt(
        Math.pow(pixelX - centerX, 2) + Math.pow(pixelY - centerY, 2)
      );

      // Gradiente radial con ruido
      const intensity = Math.max(0, 1 - distFromCenter / (patternSize / 2));
      const noise = Math.random() * 0.3;
      const alpha = Math.min(255, intensity * 255 * (1 + noise));

      // Aplicar color del brush
      const rgb = ColorUtils.hexToRgb(color);
      data[i] = rgb.r; // Red
      data[i + 1] = rgb.g; // Green
      data[i + 2] = rgb.b; // Blue
      data[i + 3] = alpha; // Alpha
    }

    patternCtx.putImageData(imageData, 0, 0);

    // Dibujar el stamp con la textura
    ctx.globalAlpha = 0.7;
    ctx.drawImage(patternCanvas, x - size, y - size, size * 2, size * 2);

    ctx.restore();
  }

  /**
   * Pincel con patrón repetitivo que sigue el trazo
   */
  #drawPatternBrush({ x, y, lastPoint, color, size }) {
    if (!lastPoint) {
      this.#drawPatternStamp(x, y, size, color);
      return;
    }

    const dist = this.#distanceBetween(lastPoint, { x, y });
    const angle = this.#angleBetween(lastPoint, { x, y });

    // Dibujar patrón a lo largo del trazo
    const spacing = size * 0.8;
    const steps = Math.ceil(dist / spacing);

    for (let i = 0; i <= steps; i++) {
      const progress = steps > 0 ? i / steps : 0;
      const currentX = lastPoint.x + (x - lastPoint.x) * progress;
      const currentY = lastPoint.y + (y - lastPoint.y) * progress;

      this.#drawPatternStamp(currentX, currentY, size, color, angle);
    }
  }

  // ===========================
  // HELPER METHODS FOR IMAGE BRUSHES
  // ===========================

  /**
   * Función auxiliar para calcular distancia entre puntos (tu algoritmo!)
   */
  #distanceBetween(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  /**
   * Función auxiliar para calcular ángulo entre puntos (tu algoritmo!)
   */
  #angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  /**
   * Dibuja un stamp individual con forma de brush
   */
  #drawImageStamp(x, y, size, color) {
    const ctx = this.#ctx;
    ctx.save();

    // Crear brush stamp circular con gradiente
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    const rgb = ColorUtils.hexToRgb(color);

    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
    gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Añadir textura con puntos
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < size / 2; i++) {
      const offsetX = (Math.random() - 0.5) * size * 1.5;
      const offsetY = (Math.random() - 0.5) * size * 1.5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        x + offsetX,
        y + offsetY,
        Math.random() * 2 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Dibuja un stamp con patrón geométrico
   */
  #drawPatternStamp(x, y, size, color, angle = 0) {
    const ctx = this.#ctx;
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(angle);

    // Patrón en forma de cruz con círculos
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.1);
    ctx.globalAlpha = 0.7;

    // Cruz principal
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();

    // Círculos en las esquinas
    const positions = [
      [-size * 0.5, -size * 0.5],
      [size * 0.5, -size * 0.5],
      [-size * 0.5, size * 0.5],
      [size * 0.5, size * 0.5],
    ];

    ctx.fillStyle = color;
    positions.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Pincel de grosor variable que redibuja el canvas en cada movimiento
   * Implementa tu algoritmo de puntos con grosor aleatorio
   * @param {Object} params - Parámetros del pincel
   * @param {number} params.x - Coordenada X
   * @param {number} params.y - Coordenada Y
   * @param {string} params.color - Color en formato hex
   * @param {number} params.size - Tamaño base del pincel
   */
  #drawVariableWidth({ x, y, color, size }) {
    const ctx = this.#ctx;

    // Función de utilidad para números aleatorios (tu algoritmo)
    const getRandomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Crear canvas temporal si no existe
    if (!this.#tempCanvas) {
      this.#tempCanvas = document.createElement("canvas");
      this.#tempCanvas.width = this.#canvas.width;
      this.#tempCanvas.height = this.#canvas.height;
    }

    // Almacenar el punto actual con grosor aleatorio
    const randomWidth = getRandomInt(size * 0.5, size * 1.5);
    this.#variableWidthPoints.push({
      x: x,
      y: y,
      width: randomWidth,
    });

    // Guardar el estado del canvas principal
    const tempCtx = this.#tempCanvas.getContext("2d");
    tempCtx.drawImage(this.#canvas, 0, 0);

    // Limpiar el canvas principal
    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    // Restaurar el contenido anterior
    ctx.drawImage(this.#tempCanvas, 0, 0);

    // Dibujar toda la línea con grosores variables
    if (this.#variableWidthPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Dibujar conexiones suaves entre puntos
      for (let i = 1; i < this.#variableWidthPoints.length; i++) {
        const prevPoint = this.#variableWidthPoints[i - 1];
        const currPoint = this.#variableWidthPoints[i];

        // Grosor promedio entre puntos
        const avgWidth = (prevPoint.width + currPoint.width) / 2;

        ctx.beginPath();
        ctx.lineWidth = avgWidth;
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(currPoint.x, currPoint.y);
        ctx.stroke();
      }

      ctx.restore();
    } else {
      // Primer punto - solo dibujar un círculo
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, randomWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Método para limpiar los puntos cuando se termine el trazo
   * Debe llamarse cuando termine un stroke
   */
  #clearVariableWidthPoints() {
    this.#variableWidthPoints = [];
  }
}

// ===========================
// LEGACY COMPATIBILITY LAYER
// ===========================

/**
 * Legacy compatibility functions for backward compatibility
 * @deprecated Use new class-based API instead
 */

export const drawAt = (x, y, canvas, ctx, type, color, size, lastPoint) => {
  console.warn("drawAt function is deprecated. Use BrushEngine class instead.");

  const engine = new BrushEngine(canvas);
  engine.configure({ type, color, size });
  return engine.draw({ x, y }, lastPoint);
};

export const hexToRgb = (hex) => {
  console.warn(
    "hexToRgb function is deprecated. Use ColorUtils.hexToRgb instead."
  );
  return ColorUtils.hexToRgb(hex);
};

export const hexToRgba = (hex, alpha) => {
  console.warn(
    "hexToRgba function is deprecated. Use ColorUtils.hexToRgba instead."
  );
  return ColorUtils.hexToRgba(hex, alpha);
};

export const clearCanvas = (canvas, backgroundColor) => {
  console.warn(
    "clearCanvas function is deprecated. Use CanvasUtils.clear instead."
  );
  return CanvasUtils.clear(canvas, backgroundColor);
};

export const saveCanvasToHistory = (canvas, history, historyIndex) => {
  console.warn(
    "saveCanvasToHistory function is deprecated. Use HistoryManager class instead."
  );

  try {
    const newHistory = [...history, canvas.toDataURL()];
    return {
      newHistory,
      newIndex: newHistory.length - 1,
    };
  } catch (e) {
    console.error("Error saving canvas to history:", e);
    return { newHistory: history, newIndex: historyIndex };
  }
};

export const undoCanvas = (canvas, history, historyIndex) => {
  console.warn(
    "undoCanvas function is deprecated. Use HistoryManager class instead."
  );

  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    const ctx = CanvasUtils.getContext(canvas);
    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    img.src = history[newIndex];

    return {
      newHistory: history,
      newIndex,
    };
  }

  return { newHistory: history, newIndex: historyIndex };
};

export const redoCanvas = (canvas, history, historyIndex) => {
  console.warn(
    "redoCanvas function is deprecated. Use HistoryManager class instead."
  );

  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1;
    const ctx = CanvasUtils.getContext(canvas);
    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    img.src = history[newIndex];

    return {
      newHistory: history,
      newIndex,
    };
  }

  return { newHistory: history, newIndex: historyIndex };
};

export const resetCanvasContext = (ctx) => {
  console.warn(
    "resetCanvasContext function is deprecated. Use CanvasUtils.resetContext instead."
  );
  return CanvasUtils.resetContext(ctx);
};

/**
 * Star drawing utility function
 */
export const drawStar = (
  ctx,
  x,
  y,
  outerRadius,
  innerRadius,
  points,
  color
) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);

  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(x + Math.sin(angle) * r, y - Math.cos(angle) * r);
  }

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};

// ===========================
// CONSTANTS & CONFIGURATIONS
// ===========================

export const BRUSH_TYPES = {
  // Basic brushes
  BRUSH: "brush",
  ERASER: "eraser",
  PENCIL: "pencil",

  // Artistic brushes
  CARBONCILLO: "carboncillo",
  ACUARELA: "acuarela",
  TIZA: "tiza",
  MARCADOR: "marcador",
  OLEO: "oleo",

  // Effect brushes
  GLOW: "glow",
  NEON: "neon",
  FUEGO: "fuego",

  // Pattern brushes
  PIXEL: "pixel",
  PUNTOS: "puntos",
  LINEAS: "lineas",

  // Extended brushes (33 additional from CrearObraModal.jsx)
  SPLATTER: "splatter",
  SPRAY: "spray",
  AIRBRUSH_SOFT: "airbrush_soft",
  SMOOTH_CURVES: "smooth_curves",
  TEXTURED: "textured",
  SKETCH: "sketch",
  FABRIC: "fabric",
  FUR: "fur",
  LEAVES: "leaves",
  RAIN: "rain",
  SNOW: "snow",
  STARS: "stars",
  HEARTS: "hearts",
  FLOWERS: "flowers",
  BUBBLES: "bubbles",
  LIGHTNING: "lightning",
  SMOKE: "smoke",
  GRASS: "grass",
  WOOD: "wood",
  METAL: "metal",
  GLASS: "glass",
  WATER: "water",
  SAND: "sand",
  STONE: "stone",
  CLOUD: "cloud",
  GALAXY: "galaxy",
  PLASMA: "plasma",
  ELECTRIC: "electric",
  CRYSTAL: "crystal",
  MAGIC: "magic",
  RAINBOW: "rainbow",
  GRADIENT: "gradient",
  MOSAIC: "mosaic",
  KALEIDOSCOPE: "kaleidoscope",
  MANDALA: "mandala",
  CELTIC: "celtic",
  TRIBAL: "tribal",
  GEOMETRIC: "geometric",
  ORGANIC: "organic",
  FRACTAL: "fractal",
  IMPRESSIONIST: "impressionist",
  POINTILLIST: "pointillist",
  ABSTRACT: "abstract",
  SURREAL: "surreal",
  MINIMALIST: "minimalist",
  VINTAGE: "vintage",
  GRUNGE: "grunge",
  DIGITAL: "digital",

  // Special brushes
  HOLOGRAPHIC: "holographic",
  NEON_GLOW: "neon_glow",
  LASER: "laser",
  MATRIX: "matrix",
  CYBER: "cyber",
  GLITCH_ADVANCED: "glitch_advanced",
  PORTAL: "portal",
  ENERGY_WAVE: "energy_wave",
  COSMIC_DUST: "cosmic_dust",
  QUANTUM: "quantum",
  TIME_WARP: "time_warp",
  DIMENSION: "dimension",
  HOLOGRAM: "hologram",
  ELECTRIC_STORM: "electric_storm",
  AURORA: "aurora",
  SOLAR_FLARE: "solar_flare",
  BLACK_HOLE: "black_hole",
  WORMHOLE: "wormhole",
  PARTICLE_EXPLOSION: "particle_explosion",
  ENERGY_FIELD: "energy_field",
  MAGNETIC: "magnetic",
  RADIOACTIVE: "radioactive",
  X_RAY: "x_ray",
  ULTRASONIC: "ultrasonic",

  // Image-based brushes
  IMAGE_BRUSH: "image_brush",
  TEXTURE_STAMP: "texture_stamp",
  PATTERN_BRUSH: "pattern_brush",

  // Variable width brush
  VARIABLE_WIDTH: "variable_width",
};

export const BRUSH_CONFIGS = [
  // Pinceles básicos
  { type: "pencil", name: "Lápiz", icon: "Pencil", category: "basic" },
  { type: "shadow", name: "Sombra", icon: "Brush", category: "basic" },
  { type: "brush", name: "Pincel", icon: "Brush", category: "basic" },
  { type: "eraser", name: "Borrador", icon: "Eraser", category: "basic" },

  // Pinceles artísticos
  { type: "pen", name: "Pluma", icon: "Brush", category: "artistic" },
  { type: "pen2", name: "Pluma Doble", icon: "Brush", category: "artistic" },
  { type: "thick", name: "Pincel Grueso", icon: "Brush", category: "artistic" },
  {
    type: "sliced",
    name: "Pincel Cortado",
    icon: "Brush",
    category: "artistic",
  },
  { type: "multi", name: "Multi-línea", icon: "Brush", category: "artistic" },
  {
    type: "multi_opacity",
    name: "Multi-opacidad",
    icon: "Brush",
    category: "artistic",
  },
  {
    type: "carboncillo",
    name: "Carboncillo",
    icon: "Brush",
    category: "artistic",
  },
  {
    type: "acuarela",
    name: "Acuarela",
    icon: "Droplets",
    category: "artistic",
  },
  { type: "tiza", name: "Tiza", icon: "Minus", category: "artistic" },
  { type: "marcador", name: "Marcador", icon: "Brush", category: "artistic" },
  { type: "oleo", name: "Óleo", icon: "Brush", category: "artistic" },
  { type: "pixel", name: "Pixel", icon: "Grid3X3", category: "artistic" },
  { type: "neon", name: "Neón", icon: "Zap", category: "artistic" },
  {
    type: "puntos",
    name: "Puntillismo",
    icon: "MoreHorizontal",
    category: "artistic",
  },
  { type: "lineas", name: "Líneas", icon: "Minus", category: "artistic" },
  { type: "fuego", name: "Fuego", icon: "Flame", category: "artistic" },
  { type: "beads", name: "Cuentas", icon: "Circle", category: "artistic" },
  { type: "wiggle", name: "Ondulado", icon: "Brush", category: "artistic" },

  // Pinceles de estampado
  { type: "stamp_circle", name: "Círculo", icon: "Circle", category: "stamp" },
  { type: "stamp_star", name: "Estrella", icon: "Sparkles", category: "stamp" },
  {
    type: "splatter",
    name: "Salpicadura",
    icon: "Droplets",
    category: "stamp",
  },
  { type: "textured", name: "Texturado", icon: "Square", category: "stamp" },

  // Pinceles de patrón
  {
    type: "pattern_dots",
    name: "Patrón Puntos",
    icon: "MoreHorizontal",
    category: "pattern",
  },
  {
    type: "pattern_lines",
    name: "Patrón Líneas",
    icon: "Minus",
    category: "pattern",
  },
  {
    type: "pattern_rainbow",
    name: "Patrón Arcoíris",
    icon: "Circle",
    category: "pattern",
  },
  {
    type: "pattern_image",
    name: "Patrón Imagen",
    icon: "Square",
    category: "pattern",
  },
  { type: "mosaic", name: "Mosaico", icon: "Grid3X3", category: "pattern" },
  {
    type: "kaleidoscope",
    name: "Caleidoscopio",
    icon: "Sparkles",
    category: "pattern",
  },
  { type: "mandala", name: "Mandala", icon: "Target", category: "pattern" },
  { type: "gradient", name: "Degradado", icon: "Circle", category: "pattern" },

  // Pinceles de spray
  { type: "aerosol", name: "Aerosol", icon: "Circle", category: "spray" },
  { type: "spray", name: "Spray", icon: "Circle", category: "spray" },
  {
    type: "airbrush_soft",
    name: "Aerógrafo Suave",
    icon: "Circle",
    category: "spray",
  },
  {
    type: "smooth_curves",
    name: "Curvas Suaves",
    icon: "Waves",
    category: "spray",
  },
  {
    type: "spray_time",
    name: "Spray Tiempo",
    icon: "Circle",
    category: "spray",
  },
  {
    type: "spray_speed",
    name: "Spray Velocidad",
    icon: "Circle",
    category: "spray",
  },

  // Pinceles de sketch/harmony
  { type: "sketchy", name: "Boceto", icon: "Brush", category: "sketch" },
  { type: "neighbor", name: "Vecino", icon: "Brush", category: "sketch" },
  {
    type: "fur_neighbor",
    name: "Vecino Peludo",
    icon: "Brush",
    category: "sketch",
  },
  { type: "sketch", name: "Boceto Rápido", icon: "Brush", category: "sketch" },

  // Pinceles de naturaleza
  { type: "leaves", name: "Hojas", icon: "Leaf", category: "nature" },
  { type: "rain", name: "Lluvia", icon: "Droplets", category: "nature" },
  { type: "snow", name: "Nieve", icon: "Snowflake", category: "nature" },
  { type: "stars", name: "Estrellas", icon: "Sparkles", category: "nature" },
  { type: "flowers", name: "Flores", icon: "Flower", category: "nature" },
  { type: "grass", name: "Pasto", icon: "TreePine", category: "nature" },
  { type: "cloud", name: "Nube", icon: "Cloud", category: "nature" },
  { type: "water", name: "Agua", icon: "Waves", category: "nature" },

  // Pinceles de materiales
  { type: "wood", name: "Madera", icon: "Square", category: "materials" },
  { type: "metal", name: "Metal", icon: "Zap", category: "materials" },
  { type: "glass", name: "Cristal", icon: "Circle", category: "materials" },
  { type: "sand", name: "Arena", icon: "Circle", category: "materials" },
  { type: "stone", name: "Piedra", icon: "Square", category: "materials" },
  { type: "fabric", name: "Tela", icon: "Square", category: "materials" },
  { type: "fur", name: "Pelaje", icon: "Brush", category: "materials" },

  // Pinceles de efectos especiales
  {
    type: "rainbow_dynamic",
    name: "Arcoíris Dinámico",
    icon: "Circle",
    category: "effects",
  },
  { type: "confetti", name: "Confeti", icon: "Circle", category: "effects" },
  {
    type: "shooting_star",
    name: "Estrella Fugaz",
    icon: "Sparkles",
    category: "effects",
  },
  { type: "glitch", name: "Glitch", icon: "Grid3X3", category: "effects" },
  {
    type: "heart_spray",
    name: "Spray Corazones",
    icon: "Heart",
    category: "effects",
  },
  { type: "lightning", name: "Rayo", icon: "Zap", category: "effects" },
  { type: "bubble", name: "Burbuja", icon: "Circle", category: "effects" },
  { type: "ribbon", name: "Cinta", icon: "Brush", category: "effects" },
  {
    type: "fire_realistic",
    name: "Fuego Realista",
    icon: "Flame",
    category: "effects",
  },
  {
    type: "particles",
    name: "Partículas",
    icon: "Circle",
    category: "effects",
  },
  { type: "glow", name: "Resplandor", icon: "Sparkles", category: "effects" },
  { type: "magic", name: "Mágico", icon: "Sparkles", category: "effects" },
  { type: "galaxy", name: "Galaxia", icon: "Sparkles", category: "effects" },
  { type: "plasma", name: "Plasma", icon: "Zap", category: "effects" },
  { type: "electric", name: "Eléctrico", icon: "Zap", category: "effects" },
  { type: "crystal", name: "Cristal", icon: "Grid3X3", category: "effects" },
  { type: "rainbow", name: "Arcoíris", icon: "Circle", category: "effects" },

  // Pinceles de emociones/formas
  { type: "hearts", name: "Corazones", icon: "Heart", category: "emotions" },
  { type: "bubbles", name: "Burbujas", icon: "Circle", category: "emotions" },
  { type: "smoke", name: "Humo", icon: "Circle", category: "emotions" },

  // Pinceles de estilo artístico
  { type: "celtic", name: "Celta", icon: "Circle", category: "styles" },
  { type: "tribal", name: "Tribal", icon: "Brush", category: "styles" },
  {
    type: "geometric",
    name: "Geométrico",
    icon: "Grid3X3",
    category: "styles",
  },
  { type: "organic", name: "Orgánico", icon: "Circle", category: "styles" },
  { type: "fractal", name: "Fractal", icon: "Sparkles", category: "styles" },
  {
    type: "impressionist",
    name: "Impresionista",
    icon: "Brush",
    category: "styles",
  },
  {
    type: "pointillist",
    name: "Puntillista",
    icon: "MoreHorizontal",
    category: "styles",
  },
  { type: "abstract", name: "Abstracto", icon: "Brush", category: "styles" },
  {
    type: "surreal",
    name: "Surrealista",
    icon: "Sparkles",
    category: "styles",
  },
  {
    type: "minimalist",
    name: "Minimalista",
    icon: "Minus",
    category: "styles",
  },
  { type: "vintage", name: "Vintage", icon: "Brush", category: "styles" },
  { type: "grunge", name: "Grunge", icon: "Brush", category: "styles" },
  { type: "digital", name: "Digital", icon: "Grid3X3", category: "styles" },

  // Pinceles especiales - efectos únicos y avanzados
  {
    type: "holographic",
    name: "Holográfico",
    icon: "Sparkles",
    category: "special",
  },
  {
    type: "neon_glow",
    name: "Neón Brillante",
    icon: "Zap",
    category: "special",
  },
  { type: "laser", name: "Láser", icon: "Zap", category: "special" },
  { type: "matrix", name: "Matrix", icon: "Grid3X3", category: "special" },
  { type: "cyber", name: "Cibernético", icon: "Zap", category: "special" },
  {
    type: "glitch_advanced",
    name: "Glitch Avanzado",
    icon: "Grid3X3",
    category: "special",
  },
  { type: "portal", name: "Portal", icon: "Circle", category: "special" },
  {
    type: "energy_wave",
    name: "Onda Energía",
    icon: "Waves",
    category: "special",
  },
  {
    type: "cosmic_dust",
    name: "Polvo Cósmico",
    icon: "Sparkles",
    category: "special",
  },
  { type: "quantum", name: "Cuántico", icon: "Zap", category: "special" },
  {
    type: "time_warp",
    name: "Distorsión Temporal",
    icon: "Sparkles",
    category: "special",
  },
  {
    type: "dimension",
    name: "Dimensional",
    icon: "Square",
    category: "special",
  },
  {
    type: "hologram",
    name: "Holograma",
    icon: "Sparkles",
    category: "special",
  },
  {
    type: "electric_storm",
    name: "Tormenta Eléctrica",
    icon: "Zap",
    category: "special",
  },
  { type: "aurora", name: "Aurora", icon: "Waves", category: "special" },
  {
    type: "solar_flare",
    name: "Llamarada Solar",
    icon: "Flame",
    category: "special",
  },
  {
    type: "black_hole",
    name: "Agujero Negro",
    icon: "Circle",
    category: "special",
  },
  {
    type: "wormhole",
    name: "Agujero de Gusano",
    icon: "Circle",
    category: "special",
  },
  {
    type: "particle_explosion",
    name: "Explosión Partículas",
    icon: "Sparkles",
    category: "special",
  },
  {
    type: "energy_field",
    name: "Campo de Energía",
    icon: "Waves",
    category: "special",
  },
  { type: "magnetic", name: "Magnético", icon: "Circle", category: "special" },
  {
    type: "radioactive",
    name: "Radioactivo",
    icon: "Zap",
    category: "special",
  },
  { type: "x_ray", name: "Rayos X", icon: "Zap", category: "special" },
  {
    type: "ultrasonic",
    name: "Ultrasónico",
    icon: "Waves",
    category: "special",
  },

  // Nuevos pinceles con textura/imagen
  {
    type: "image_brush",
    name: "Pincel Imagen",
    icon: "Grid3X3",
    category: "artistic",
  },
  {
    type: "texture_stamp",
    name: "Sello Textura",
    icon: "Target",
    category: "stamp",
  },
  {
    type: "pattern_brush",
    name: "Pincel Patrón",
    icon: "Grid3X3",
    category: "pattern",
  },

  // Pincel con grosor variable y redibujado
  {
    type: "variable_width",
    name: "Grosor Variable",
    icon: "Brush",
    category: "artistic",
  },
];

export const BRUSH_CATEGORIES = {
  BASIC: {
    name: "Básicos",
    icon: "Brush",
    brushes: ["pencil", "shadow", "brush", "eraser"],
  },
  ARTISTIC: {
    name: "Artísticos",
    icon: "Palette",
    brushes: [
      "pen",
      "pen2",
      "thick",
      "sliced",
      "multi",
      "multi_opacity",
      "carboncillo",
      "acuarela",
      "tiza",
      "marcador",
      "oleo",
      "pixel",
      "neon",
      "puntos",
      "lineas",
      "fuego",
      "beads",
      "wiggle",
      "image_brush",
      "variable_width",
    ],
  },
  STAMP: {
    name: "Estampado",
    icon: "Stamp",
    brushes: [
      "stamp_circle",
      "stamp_star",
      "splatter",
      "textured",
      "texture_stamp",
    ],
  },
  PATTERN: {
    name: "Patrones",
    icon: "Grid3X3",
    brushes: [
      "pattern_dots",
      "pattern_lines",
      "pattern_rainbow",
      "pattern_image",
      "mosaic",
      "kaleidoscope",
      "mandala",
      "gradient",
      "pattern_brush",
    ],
  },
  SPRAY: {
    name: "Spray",
    icon: "Circle",
    brushes: [
      "aerosol",
      "spray",
      "airbrush_soft",
      "smooth_curves",
      "spray_time",
      "spray_speed",
    ],
  },
  SKETCH: {
    name: "Bocetos",
    icon: "PenTool",
    brushes: ["sketchy", "neighbor", "fur_neighbor", "sketch"],
  },
  NATURE: {
    name: "Naturaleza",
    icon: "Leaf",
    brushes: [
      "leaves",
      "rain",
      "snow",
      "stars",
      "flowers",
      "grass",
      "cloud",
      "water",
    ],
  },
  MATERIALS: {
    name: "Materiales",
    icon: "Layers",
    brushes: ["wood", "metal", "glass", "sand", "stone", "fabric", "fur"],
  },
  EFFECTS: {
    name: "Efectos",
    icon: "Sparkles",
    brushes: [
      "rainbow_dynamic",
      "confetti",
      "shooting_star",
      "glitch",
      "heart_spray",
      "lightning",
      "bubble",
      "ribbon",
      "fire_realistic",
      "particles",
      "glow",
      "magic",
      "galaxy",
      "plasma",
      "electric",
      "crystal",
      "rainbow",
    ],
  },
  EMOTIONS: {
    name: "Emociones",
    icon: "Heart",
    brushes: ["hearts", "bubbles", "smoke"],
  },
  STYLES: {
    name: "Estilos",
    icon: "Image",
    brushes: [
      "celtic",
      "tribal",
      "geometric",
      "organic",
      "fractal",
      "impressionist",
      "pointillist",
      "abstract",
      "surreal",
      "minimalist",
      "vintage",
      "grunge",
      "digital",
    ],
  },
  SPECIAL: {
    name: "Especiales",
    icon: "Zap",
    brushes: [
      "holographic",
      "neon_glow",
      "laser",
      "matrix",
      "cyber",
      "glitch_advanced",
      "portal",
      "energy_wave",
      "cosmic_dust",
      "quantum",
      "time_warp",
      "dimension",
      "hologram",
      "electric_storm",
      "aurora",
      "solar_flare",
      "black_hole",
      "wormhole",
      "particle_explosion",
      "energy_field",
      "magnetic",
      "radioactive",
      "x_ray",
      "ultrasonic",
    ],
  },
};

export const DEFAULT_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#008000",
  "#000080",
  "#800000",
  "#808000",
  "#008080",
  "#C0C0C0",
  "#FFD700",
];

export const DEFAULT_BRUSH_CONFIG = {
  type: BRUSH_TYPES.BRUSH,
  color: "#000000",
  size: 15,
  opacity: 1,
};

// ===========================
// PERFORMANCE MONITORING
// ===========================

/**
 * Performance monitoring utilities for development
 */
export class PerformanceMonitor {
  static #metrics = new Map();

  static startTimer(name) {
    this.#metrics.set(name, performance.now());
  }

  static endTimer(name) {
    const start = this.#metrics.get(name);
    if (start) {
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      this.#metrics.delete(name);
      return duration;
    }
    return 0;
  }

  static getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  }
}

// Script para optimizar imágenes del proyecto usando sharp
// Convierte JPG/PNG a WebP y comprime WebP grandes

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGE_DIRS = [
  "public/assets/artworks",
  "public/assets",
  "public/assets/textures",
  "public/images",
];

const exts = [".jpg", ".jpeg", ".png", ".webp"];

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const outPath = filePath.replace(ext, ".webp");
  if (fs.existsSync(outPath)) return; // No sobrescribir si ya existe
  try {
    const image = sharp(filePath);
    const { width } = await image.metadata();
    // Redimensionar si es muy grande
    const resizeWidth = width > 1920 ? 1920 : null;
    await image.resize(resizeWidth).webp({ quality: 75 }).toFile(outPath);
    console.log("Optimized:", outPath);
  } catch (e) {
    console.error("Error optimizing", filePath, e);
  }
}

function walkDir(dir, cb) {
  fs.readdirSync(dir).forEach((f) => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full, cb);
    } else if (exts.includes(path.extname(full).toLowerCase())) {
      cb(full);
    }
  });
}

(async () => {
  for (const dir of IMAGE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    walkDir(dir, optimizeImage);
  }
})();

// Instrucciones:
// 1. Instala sharp: npm install sharp
// 2. Ejecuta este script: node scripts/optimize_images.js
// 3. Reemplaza las rutas de imágenes en tu código por la versión .webp si existe

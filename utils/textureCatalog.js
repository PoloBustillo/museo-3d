import fs from "fs";
import path from "path";

// Root inside /public so results are directly servable via URLs
const TEXTURES_PUBLIC_ROOT = path.join(
  process.cwd(),
  "public",
  "assets",
  "textures"
);

// Recognized file extensions for texture images
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Heuristic category classifier based on folder/file names
function guessCategoryFromName(name) {
  const n = name.toLowerCase();
  if (/(wood|floor|paving|tile|stone|concrete|marble)/.test(n)) return "floor";
  if (/(wall|plaster|brick|paint|stucco)/.test(n)) return "wall";
  return "generic";
}

// Map filename keywords to texture slots
function detectSlot(filename) {
  const f = filename.toLowerCase();
  // Normalize separators
  // Common slots across texture sites
  if (/(albedo|basecolor|base_color|base-colo|diffuse|color|col\b)/.test(f)) {
    return { slot: "albedo" };
  }
  if (/(normal|norm|nrm)/.test(f)) {
    const isDX = /(dx|directx)/.test(f);
    const isGL = /(gl|opengl)/.test(f);
    return {
      slot: "normal",
      normalSpace: isDX ? "dx" : isGL ? "gl" : "unknown",
    };
  }
  if (/(roughness|rough)/.test(f)) {
    return { slot: "roughness" };
  }
  if (/(gloss|glossiness)/.test(f)) {
    return { slot: "glossiness" };
  }
  if (/(metalness|metallic|metal)/.test(f)) {
    return { slot: "metalness" };
  }
  if (/(ao|occ|ambientocclusion|occlusion)/.test(f)) {
    return { slot: "ao" };
  }
  if (/(height|displ|displacement)/.test(f)) {
    return { slot: "height" };
  }
  if (/(specular|spec)/.test(f)) {
    return { slot: "specular" };
  }
  return null;
}

export function scanTextureDirectories() {
  if (!fs.existsSync(TEXTURES_PUBLIC_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(TEXTURES_PUBLIC_ROOT, { withFileTypes: true });

  const results = [];

  // Include loose images in root as standalone textures
  const rootImages = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => IMAGE_EXTENSIONS.includes(path.extname(n).toLowerCase()));
  for (const imgName of rootImages) {
    const id = `root-${imgName}`;
    const url = `/assets/textures/${imgName}`;
    results.push({
      id,
      name: imgName,
      dir: `/assets/textures`,
      category: guessCategoryFromName(imgName),
      maps: { albedo: url },
      previewUrl: url,
      flags: { invertNormalY: false, hasGlossiness: false },
      completeness: {
        hasAlbedo: true,
        hasNormal: false,
        hasRoughness: false,
        hasAO: false,
        hasHeight: false,
        hasMetalness: false,
      },
    });
  }

  // Helper: list images recursively inside a directory
  const listImagesRecursive = (absDir, baseRel = "") => {
    const out = [];
    const ents = fs.readdirSync(absDir, { withFileTypes: true });
    for (const e of ents) {
      const absPath = path.join(absDir, e.name);
      const relPath = path.join(baseRel, e.name).replace(/\\/g, "/");
      if (e.isDirectory()) {
        out.push(...listImagesRecursive(absPath, relPath));
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) out.push(relPath);
      }
    }
    return out;
  };

  for (const dirent of entries.filter((e) => e.isDirectory())) {
    const dirName = dirent.name;
    const absDir = path.join(TEXTURES_PUBLIC_ROOT, dirName);
    let imagesRel = [];
    try {
      imagesRel = listImagesRecursive(absDir, "");
    } catch (e) {
      continue;
    }
    if (imagesRel.length === 0) continue;

    const maps = {};
    let invertNormalY = false;
    let hasGlossiness = false;

    for (const rel of imagesRel) {
      const fname = path.basename(rel);
      const det = detectSlot(fname);
      const url = `/assets/textures/${dirName}/${rel}`;
      if (!det) continue;
      switch (det.slot) {
        case "albedo":
          maps.albedo = url;
          break;
        case "normal":
          maps.normal = url;
          if (det.normalSpace === "dx") invertNormalY = true;
          break;
        case "roughness":
          maps.roughness = url;
          break;
        case "glossiness":
          maps.glossiness = url;
          hasGlossiness = true;
          break;
        case "metalness":
          maps.metalness = url;
          break;
        case "ao":
          maps.ao = url;
          break;
        case "height":
          maps.height = url;
          break;
        case "specular":
          maps.specular = url;
          break;
        default:
          break;
      }
    }

    const previewUrl = maps.albedo
      ? maps.albedo
      : maps.roughness
        ? maps.roughness
        : `/assets/textures/${dirName}/${imagesRel[0]}`;

    const category = guessCategoryFromName(dirName);
    const id = dirName;

    results.push({
      id,
      name: dirName,
      dir: `/assets/textures/${dirName}`,
      category,
      maps,
      previewUrl,
      flags: { invertNormalY, hasGlossiness },
      completeness: {
        hasAlbedo: Boolean(maps.albedo),
        hasNormal: Boolean(maps.normal),
        hasRoughness: Boolean(maps.roughness) || Boolean(maps.glossiness),
        hasAO: Boolean(maps.ao),
        hasHeight: Boolean(maps.height),
        hasMetalness: Boolean(maps.metalness),
      },
    });
  }

  return results;
}

export function getTextureCatalogSummary() {
  const all = scanTextureDirectories();
  const byCategory = all.reduce((acc, t) => {
    acc[t.category] = acc[t.category] || [];
    acc[t.category].push({
      id: t.id,
      name: t.name,
      previewUrl: t.previewUrl,
      completeness: t.completeness,
    });
    return acc;
  }, {});
  return { count: all.length, categories: Object.keys(byCategory), byCategory };
}

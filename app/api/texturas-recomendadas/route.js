import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  scanTextureDirectories,
  getTextureCatalogSummary,
} from "@/utils/textureCatalog";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Mapeo de temas de sala a estilos de texturas
const TEXTURE_THEME_MAP = {
  moderno: {
    wall: ["MetalPlates", "DiamondPlate", "concrete", "modern"],
    floor: ["Tiles", "marble", "polished", "modern"],
    priority: "clean",
  },
  clasico: {
    wall: ["brick", "stone", "plaster", "classic"],
    floor: ["WoodFloor", "marble", "stone", "classic"],
    priority: "elegant",
  },
  industrial: {
    wall: ["MetalPlates", "DiamondPlate", "concrete", "steel"],
    floor: ["concrete", "MetalPlates", "industrial"],
    priority: "rough",
  },
  rustico: {
    wall: ["Rock", "BrownRock", "stone", "brick"],
    floor: ["WoodFloor", "stone", "PavingStones"],
    priority: "natural",
  },
  contemporaneo: {
    wall: ["clean", "modern", "minimalist"],
    floor: ["Tiles", "polished", "clean"],
    priority: "minimal",
  },
};

// Mapeo de colores a estilos
const COLOR_STYLE_MAP = {
  warm: ["brown", "wood", "warm", "earth"],
  cool: ["metal", "steel", "cool", "modern"],
  neutral: ["concrete", "stone", "neutral"],
  dark: ["dark", "black", "industrial"],
  light: ["white", "light", "clean", "minimal"],
};

/**
 * Analiza el color de la sala y determina el estilo
 */
function analyzeColorStyle(colorHex) {
  if (!colorHex) return "neutral";

  // Convertir hex a RGB para análisis
  const hex = colorHex.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const brightness = (r + g + b) / 3;
  const warmth = (r - b) / 255;

  if (brightness < 80) return "dark";
  if (brightness > 180) return "light";
  if (warmth > 0.2) return "warm";
  if (warmth < -0.2) return "cool";
  return "neutral";
}

/**
 * Califica texturas basándose en criterios de sala
 */
function scoreTexture(texture, salaData, type) {
  let score = 0;
  const name = texture.name.toLowerCase();
  const tema = salaData.tema?.toLowerCase() || "moderno";
  const colorStyle = analyzeColorStyle(salaData.color);

  // Puntuación base por categoría
  if (texture.category === type) score += 50;

  // Puntuación por tema
  const themeConfig = TEXTURE_THEME_MAP[tema] || TEXTURE_THEME_MAP["moderno"];
  const relevantKeywords = themeConfig[type === "floor" ? "floor" : "wall"];

  relevantKeywords.forEach((keyword) => {
    if (name.includes(keyword.toLowerCase())) {
      score += 30;
    }
  });

  // Puntuación por estilo de color
  const colorKeywords = COLOR_STYLE_MAP[colorStyle] || [];
  colorKeywords.forEach((keyword) => {
    if (name.includes(keyword.toLowerCase())) {
      score += 20;
    }
  });

  // Bonificación por calidad (resolución)
  if (name.includes("1k")) score += 10;
  if (name.includes("2k")) score += 15;
  if (name.includes("4k")) score += 20;

  // Penalización si no tiene texturas PBR completas
  const hasAlbedo = texture.maps.albedo;
  const hasNormal = texture.maps.normal;
  const hasRoughness = texture.maps.roughness;

  if (hasAlbedo && hasNormal && hasRoughness) {
    score += 25; // Bonus por PBR completo
  } else if (hasAlbedo) {
    score += 10; // Al menos tiene albedo
  }

  return score;
}

/**
 * Obtiene texturas recomendadas para una sala específica
 */
async function getTextureRecommendations(salaId) {
  try {
    // Obtener datos de la sala
    const sala = await prisma.sala.findUnique({
      where: { id: parseInt(salaId) },
      select: {
        id: true,
        nombre: true,
        tema: true,
        color: true,
        texturaPared: true,
        texturaPiso: true,
        lightingPreset: true,
        ambientIntensity: true,
      },
    });

    if (!sala) {
      throw new Error(`Sala ${salaId} no encontrada`);
    }

    // Escanear catálogo de texturas
    const catalog = scanTextureDirectories();

    // Clasificar y puntuar texturas
    const wallTextures = catalog
      .filter((tex) => tex.category === "wall" || tex.category === "generic")
      .map((tex) => ({
        ...tex,
        score: scoreTexture(tex, sala, "wall"),
        reason: generateRecommendationReason(tex, sala, "wall"),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const floorTextures = catalog
      .filter((tex) => tex.category === "floor" || tex.category === "generic")
      .map((tex) => ({
        ...tex,
        score: scoreTexture(tex, sala, "floor"),
        reason: generateRecommendationReason(tex, sala, "floor"),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      sala: {
        id: sala.id,
        nombre: sala.nombre,
        tema: sala.tema,
        color: sala.color,
        currentTextures: {
          pared: sala.texturaPared,
          piso: sala.texturaPiso,
        },
      },
      recommendations: {
        paredes: wallTextures,
        pisos: floorTextures,
      },
      analysis: {
        colorStyle: analyzeColorStyle(sala.color),
        suggestedTheme: sala.tema || "moderno",
        lightingConsiderations: analyzeLightingNeeds(sala),
      },
    };
  } catch (error) {
    console.error("Error getting texture recommendations:", error);
    throw error;
  }
}

/**
 * Genera razón de recomendación
 */
function generateRecommendationReason(texture, sala, type) {
  const reasons = [];
  const name = texture.name.toLowerCase();
  const tema = sala.tema?.toLowerCase() || "moderno";
  const colorStyle = analyzeColorStyle(sala.color);

  if (texture.category === type) {
    reasons.push(`Categorizada como ${type}`);
  }

  const themeConfig = TEXTURE_THEME_MAP[tema];
  if (themeConfig) {
    const keywords = themeConfig[type === "floor" ? "floor" : "wall"];
    const matchedKeywords = keywords.filter((kw) =>
      name.includes(kw.toLowerCase())
    );
    if (matchedKeywords.length > 0) {
      reasons.push(`Ideal para tema ${tema}`);
    }
  }

  if (texture.maps.albedo && texture.maps.normal && texture.maps.roughness) {
    reasons.push("Texturas PBR completas");
  }

  const colorKeywords = COLOR_STYLE_MAP[colorStyle] || [];
  const matchedColors = colorKeywords.filter((kw) =>
    name.includes(kw.toLowerCase())
  );
  if (matchedColors.length > 0) {
    reasons.push(`Complementa estilo ${colorStyle}`);
  }

  return reasons.join(", ");
}

/**
 * Analiza necesidades de iluminación
 */
function analyzeLightingNeeds(sala) {
  const considerations = [];

  if (sala.lightingPreset === "dramatic") {
    considerations.push("Usar texturas con alto contraste");
  }

  if (sala.ambientIntensity && sala.ambientIntensity < 0.5) {
    considerations.push(
      "Texturas más claras recomendadas para baja iluminación"
    );
  }

  if (sala.ambientIntensity && sala.ambientIntensity > 1.0) {
    considerations.push("Texturas con detalles finos funcionarán bien");
  }

  return considerations;
}

/**
 * Endpoint principal
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const salaId = searchParams.get("salaId");
    const type = searchParams.get("type"); // "wall", "floor", or "all"

    if (!salaId) {
      return NextResponse.json(
        { error: "salaId es requerido" },
        { status: 400 }
      );
    }

    const recommendations = await getTextureRecommendations(salaId);

    // Filtrar por tipo si se especifica
    if (type === "wall") {
      return NextResponse.json({
        ...recommendations,
        recommendations: {
          paredes: recommendations.recommendations.paredes,
        },
      });
    } else if (type === "floor") {
      return NextResponse.json({
        ...recommendations,
        recommendations: {
          pisos: recommendations.recommendations.pisos,
        },
      });
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para actualizar texturas de sala
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { salaId, texturaPared, texturaPiso } = body;

    if (!salaId) {
      return NextResponse.json(
        { error: "salaId es requerido" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (texturaPared !== undefined) updateData.texturaPared = texturaPared;
    if (texturaPiso !== undefined) updateData.texturaPiso = texturaPiso;

    const updatedSala = await prisma.sala.update({
      where: { id: parseInt(salaId) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        texturaPared: true,
        texturaPiso: true,
      },
    });

    return NextResponse.json({
      success: true,
      sala: updatedSala,
      message: "Texturas actualizadas correctamente",
    });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      {
        error: "Error actualizando texturas",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

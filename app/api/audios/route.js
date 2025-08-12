import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), "public", "audio");
    
    // Verificar si el directorio existe
    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({
        audios: [],
        message: "Directorio de audios no encontrado"
      });
    }

    // Leer archivos del directorio
    const files = fs.readdirSync(audioDir);
    
    // Filtrar solo archivos de audio
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
    });

    // Crear objeto con metadatos de audio
    const audios = audioFiles.map(file => {
      const name = path.basename(file, path.extname(file));
      return {
        id: name,
        name: formatAudioName(name),
        filename: file,
        url: `/audio/${file}`,
        category: getAudioCategory(name),
        description: getAudioDescription(name)
      };
    });

    return NextResponse.json({
      audios,
      total: audios.length
    });

  } catch (error) {
    console.error("Error loading audios:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Función para formatear el nombre del audio
function formatAudioName(filename) {
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\d+/g, '')
    .trim();
}

// Función para categorizar audios
function getAudioCategory(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('museum') || name.includes('exhibition')) {
    return 'museum';
  } else if (name.includes('atmos') || name.includes('ambient')) {
    return 'ambient';
  } else if (name.includes('cafe') || name.includes('restaurant')) {
    return 'social';
  } else if (name.includes('walking') || name.includes('stairs')) {
    return 'movement';
  } else if (name.includes('temple') || name.includes('sacred')) {
    return 'sacred';
  } else {
    return 'general';
  }
}

// Función para obtener descripción del audio
function getAudioDescription(filename) {
  const descriptions = {
    'atmos-museum-quiet-met-nyc': 'Ambiente silencioso de museo metropolitano',
    'museum-cafe': 'Ambiente relajado de cafetería de museo',
    'stairs-near-ichot-museum': 'Sonidos de escaleras cerca del museo',
    'temple-museum-tourist': 'Ambiente de museo con turistas',
    'walking-around-and-out-of-busy-exhibition-in-tate-britain': 'Caminando por una exposición concurrida',
    'menu': 'Audio del menú principal'
  };
  
  return descriptions[filename] || 'Audio ambiente para sala';
}

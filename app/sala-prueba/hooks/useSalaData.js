/**
 * Hook para obtener datos reales de una sala específica
 */
import { useState, useEffect, useMemo } from 'react';
import { anchorPoints } from '../config/anchorPoints';

export function useSalaData(salaId = null) {
  const [sala, setSala] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!salaId) {
      // Si no hay ID específico, usar la primera sala disponible o datos mock
      fetchFirstAvailableSala();
    } else {
      fetchSalaById(salaId);
    }
  }, [salaId]);

  const fetchFirstAvailableSala = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando salas disponibles...');
      
      // Intentar obtener salas del API
      const response = await fetch('/api/salas');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Respuesta API:', {
        totalSalas: data.salas?.length || 0,
        primeraSala: data.salas?.[0]?.nombre || 'N/A'
      });
      
      if (data.salas && data.salas.length > 0) {
        // Buscar específicamente la sala "Colección ARPA" (primera sala) 
        const salaARPA = data.salas.find(s => s.nombre === "Colección ARPA" || s.id === 1);
        if (salaARPA && salaARPA.murales && salaARPA.murales.length > 0) {
          console.log('🏛️ ✅ Cargando sala ARPA:', salaARPA.nombre, 'con', salaARPA.murales?.length || 0, 'murales');
          setSala(salaARPA);
          return;
        }
        
        // Fallback: Buscar cualquier sala con murales
        const salaConMurales = data.salas.find(s => s.murales && s.murales.length > 0);
        if (salaConMurales) {
          console.log('🏛️ ⚠️ Cargando sala fallback:', salaConMurales.nombre, 'con', salaConMurales.murales.length, 'murales');
          setSala(salaConMurales);
          return;
        }
        
        // Si no hay murales, usar datos mock
        console.log('⚠️ No hay salas con murales, usando datos mock');
        setSala(getMockSalaData());
      } else {
        // Fallback a datos mock si no hay salas
        console.log('⚠️ No hay salas disponibles, usando datos mock');
        setSala(getMockSalaData());
      }
    } catch (err) {
      console.error('❌ Error fetching sala data:', err);
      console.log('🔄 Usando datos mock como fallback');
      setSala(getMockSalaData());
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaById = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/salas/${id}`);
      
      if (!response.ok) {
        throw new Error(`Sala ${id} no encontrada`);
      }
      
      const data = await response.json();
      setSala(data);
    } catch (err) {
      console.error('Error fetching sala by ID:', err);
      setError(err.message);
      setSala(getMockSalaData());
    } finally {
      setLoading(false);
    }
  };

  // Convertir murales de la sala a formato compatible con anchor points
    const convertMuralesToArtworks = (murales) => {
    console.log('🔄 Convirtiendo murales a artworks:', murales.length, 'murales encontrados');
    
    return murales.map((salaMural, index) => {
      const mural = salaMural.mural;
      console.log(`📷 Procesando mural ${index + 1}:`, {
        titulo: mural.titulo,
        autor: mural.autor,
        url_imagen: mural.url_imagen,
        imagenUrlWebp: mural.imagenUrlWebp
      });
      
      const anchorId = getSequentialAnchorId(index);
      
      return {
        id: mural.id,
        titulo: mural.titulo,
        title: mural.titulo,
        autor: mural.autor,
        artist: mural.autor,
        anio: mural.anio,
        year: mural.anio,
        technique: mural.tecnica,
        tecnica: mural.tecnica,
        descripcion: mural.descripcion,
        imageUrl: mural.imagenUrlWebp || mural.url_imagen,
        imagenUrlWebp: mural.imagenUrlWebp,
        url_imagen: mural.url_imagen,
        width: salaMural.scale ? Math.max(6 * salaMural.scale, 6) : 6, // Obras más grandes, mínimo 6
        height: salaMural.scale ? Math.max(4.5 * salaMural.scale, 4.5) : 4.5, // Más altas, mínimo 4.5
        type: detectArtworkType(mural.tecnica),
        frameStyle: salaMural.frameStyle || 'classic',
        frameMaterial: 'wood',
        animated: false,
        anchorId: anchorId, // ID del anchor asignado
        // Posición y rotación del layout
        position: salaMural.pos ? [salaMural.pos.x, salaMural.pos.y, salaMural.pos.z] : null,
        rotation: salaMural.rot ? [salaMural.rot.x, salaMural.rot.y, salaMural.rot.z] : null,
        scale: salaMural.scale || 1,
        spotlightIntensity: salaMural.spotlightIntensity || 1
      };
    });
  };

  const getSequentialAnchorId = (index) => {
    // Construir secuencia basada en anchors existentes para evitar IDs inexistentes
    const by = (pred) => anchorPoints.filter(pred);
    const sortByIndex = (id) => {
      const m = id.match(/-(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    };

    const rightFront = by(a => a.wall === 'right-front').sort((a,b)=>sortByIndex(a.id)-sortByIndex(b.id));
    const leftFront  = by(a => a.wall === 'left-front').sort((a,b)=>sortByIndex(a.id)-sortByIndex(b.id));
    const frontCorners = by(a => a.wall?.startsWith('front-far'));
    const rightBack  = by(a => a.wall === 'right-back').sort((a,b)=>sortByIndex(a.id)-sortByIndex(b.id));
    const leftBack   = by(a => a.wall === 'left-back').sort((a,b)=>sortByIndex(a.id)-sortByIndex(b.id));
    const backWall   = by(a => a.wall === 'back').sort((a,b)=>sortByIndex(a.id)-sortByIndex(b.id));

    const sequence = [
      ...rightFront.map(a=>a.id),
      ...leftFront.map(a=>a.id),
      ...frontCorners.map(a=>a.id),
      ...rightBack.map(a=>a.id),
      ...leftBack.map(a=>a.id),
      ...backWall.map(a=>a.id)
    ];

    const selected = sequence[index % sequence.length];
    return selected;
  };

  const detectArtworkType = (tecnica) => {
    if (!tecnica) return 'painting';
    
    const tecnicaLower = tecnica.toLowerCase();
    
    if (tecnicaLower.includes('fotograf')) return 'photo';
    if (tecnicaLower.includes('digital')) return 'photo';
    if (tecnicaLower.includes('relieve') || tecnicaLower.includes('escultura')) return 'relief';
    if (tecnicaLower.includes('mixta') || tecnicaLower.includes('mix')) return 'mixed';
    
    return 'painting';
  };

  // Convertir murales a artworks cuando la sala cambie
  const artworks = useMemo(() => {
    if (!sala || !sala.murales || sala.murales.length === 0) {
      console.log('⚠️ No hay murales para convertir');
      return [];
    }
    
    console.log('🔄 Convirtiendo murales a artworks...');
    const converted = convertMuralesToArtworks(sala.murales);
    // Limitar al número de anclajes disponibles para evitar reutilización/solapamiento
    return converted.slice(0, anchorPoints.length);
  }, [sala]);

  return {
    sala,
    artworks,
    loading,
    error,
    refresh: () => {
      if (salaId) {
        fetchSalaById(salaId);
      } else {
        fetchFirstAvailableSala();
      }
    }
  };
}

// Datos mock para cuando el API no está disponible
function getMockSalaData() {
  return {
    id: 'mock-sala',
    nombre: 'Sala de Prueba - Datos Mock',
    descripcion: 'Sala de demostración con datos simulados',
    murales: [
      {
        mural: {
          id: 1,
          titulo: 'Paisaje Urbano Nocturno',
          autor: 'Elena Martínez',
          anio: 2023,
          tecnica: 'Óleo sobre lienzo',
          descripcion: 'Una visión contemporánea de la ciudad en la noche',
          imagenUrlWebp: '/images/placeholder-artwork-1.jpg',
          url_imagen: '/images/placeholder-artwork-1.jpg'
        },
        scale: 1.2,
        frameStyle: 'classic'
      },
      {
        mural: {
          id: 2,
          titulo: 'Reflexiones en Azul',
          autor: 'Carlos Mendoza',
          anio: 2024,
          tecnica: 'Fotografía digital',
          descripcion: 'Serie fotográfica sobre la luz y el agua',
          imagenUrlWebp: '/images/placeholder-artwork-2.jpg',
          url_imagen: '/images/placeholder-artwork-2.jpg'
        },
        scale: 1.0,
        frameStyle: 'modern'
      },
      {
        mural: {
          id: 3,
          titulo: 'Memoria Colectiva',
          autor: 'Ana Ruiz',
          anio: 2023,
          tecnica: 'Técnica mixta',
          descripcion: 'Exploración de la identidad a través de materiales diversos',
          imagenUrlWebp: '/images/placeholder-artwork-3.jpg',
          url_imagen: '/images/placeholder-artwork-3.jpg'
        },
        scale: 1.5,
        frameStyle: 'ornate'
      },
      {
        mural: {
          id: 4,
          titulo: 'Geometrías del Tiempo',
          autor: 'Roberto Silva',
          anio: 2024,
          tecnica: 'Acrílico sobre madera',
          descripcion: 'Abstracción geométrica inspirada en el paso del tiempo',
          imagenUrlWebp: '/images/placeholder-artwork-4.jpg',
          url_imagen: '/images/placeholder-artwork-4.jpg'
        },
        scale: 0.8,
        frameStyle: 'minimal'
      }
    ],
    _count: { murales: 4 }
  };
}

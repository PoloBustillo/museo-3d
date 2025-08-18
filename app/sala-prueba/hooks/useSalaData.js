/**
 * Hook para obtener datos reales de una sala específica
 */
import { useState, useEffect, useMemo } from 'react';

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
    // DISTRIBUCIÓN SIMPLE Y ESPACIADA: Solo usar anchor points principales bien separados
    // Empezar por sala trasera, luego sala frontal, evitando zona de divisores
    const anchorSequence = [
      // PRIMERA SALA (frontal, cerca de la entrada)
      'right-front-0', 'left-front-0',
      'right-front-1', 'left-front-1',
      'right-front-2', 'left-front-2',
      // Paredes frontales (esquinas) si hacen falta
      'front-far-left', 'front-far-right',
      // SEGUNDA SALA (trasera)
      'right-back-0', 'left-back-0',
      'right-back-1', 'left-back-1',
      'right-back-2', 'left-back-2',
      // Pared del fondo
      'back-0', 'back-1'
    ];
    
    const selectedAnchor = anchorSequence[index % anchorSequence.length];
    console.log(`🎯 Obra ${index + 1}: Asignando anchor "${selectedAnchor}"`);
    return selectedAnchor;
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
    return convertMuralesToArtworks(sala.murales);
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

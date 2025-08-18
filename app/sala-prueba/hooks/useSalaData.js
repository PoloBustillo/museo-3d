/**
 * Hook para obtener datos reales de una sala específica
 */
import { useState, useEffect } from 'react';

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
      
      // Intentar obtener salas del API
      const response = await fetch('/api/salas');
      
      if (!response.ok) {
        throw new Error('API no disponible');
      }
      
      const data = await response.json();
      
      if (data.salas && data.salas.length > 0) {
        // Buscar sala con murales
        const salaConMurales = data.salas.find(s => s._count?.murales > 0);
        if (salaConMurales) {
          setSala(salaConMurales);
        } else {
          // Usar primera sala disponible
          setSala(data.salas[0]);
        }
      } else {
        // Fallback a datos mock si no hay salas
        setSala(getMockSalaData());
      }
    } catch (err) {
      console.warn('Error fetching sala data, using mock data:', err);
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
  const getArtworksForAnchors = () => {
    if (!sala || !sala.murales) return [];

    return sala.murales.map((salaMural, index) => {
      const mural = salaMural.mural;
      return {
        id: `mural-${mural.id}`,
        // Usar posición del layout si existe, sino usar anchor points secuenciales
        anchorId: salaMural.wallId || getSequentialAnchorId(index),
        titulo: mural.titulo,
        artist: mural.autor,
        autor: mural.autor,
        year: mural.anio,
        anio: mural.anio,
        technique: mural.tecnica,
        tecnica: mural.tecnica,
        descripcion: mural.descripcion,
        imageUrl: mural.imagenUrlWebp || mural.url_imagen,
        imagenUrlWebp: mural.imagenUrlWebp,
        url_imagen: mural.url_imagen,
        width: salaMural.scale ? 4 * salaMural.scale : 4,
        height: salaMural.scale ? 3 * salaMural.scale : 3,
        type: detectArtworkType(mural.tecnica),
        frameStyle: salaMural.frameStyle || 'classic',
        frameMaterial: 'wood',
        animated: false,
        // Posición y rotación del layout
        position: salaMural.pos ? [salaMural.pos.x, salaMural.pos.y, salaMural.pos.z] : null,
        rotation: salaMural.rot ? [salaMural.rot.x, salaMural.rot.y, salaMural.rot.z] : null,
        scale: salaMural.scale || 1,
        spotlightIntensity: salaMural.spotlightIntensity || 1
      };
    });
  };

  const getSequentialAnchorId = (index) => {
    const anchorSequence = [
      'right-0', 'right-2', 'right-4', 'right-6',
      'left-0', 'left-2', 'left-4', 'left-6',
      'back-1', 'back-3', 'back-5',
      'front-left-0', 'front-right-0'
    ];
    return anchorSequence[index % anchorSequence.length];
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

  return {
    sala,
    artworks: getArtworksForAnchors(),
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

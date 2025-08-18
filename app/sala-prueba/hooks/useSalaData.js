/**
 * Hook para obtener datos reales de una sala específica
 */
import { useState, useEffect, useMemo } from 'react';
import { anchorPoints } from '../config/anchorPoints';

const DEBUG_SALA = false; // poner true sólo para depurar

// Deducción de tipo de obra según técnica (restaurado tras refactor)
function detectArtworkType(tecnica) {
  if (!tecnica) return 'painting';
  const t = tecnica.toLowerCase();
  if (t.includes('fotograf')) return 'photo';
  if (t.includes('digital')) return 'photo';
  if (t.includes('escultur') || t.includes('relieve')) return 'relief';
  if (t.includes('mixta') || t.includes('mix')) return 'mixed';
  return 'painting';
}

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
      if (DEBUG_SALA) console.log('🔍 Buscando salas disponibles...');
      
      // Intentar obtener salas del API
      const response = await fetch('/api/salas');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (DEBUG_SALA) console.log('📊 Respuesta API:', {
        totalSalas: data.salas?.length || 0,
        primeraSala: data.salas?.[0]?.nombre || 'N/A'
      });
      
      if (data.salas && data.salas.length > 0) {
        // Buscar específicamente la sala "Colección ARPA" (primera sala) 
        const salaARPA = data.salas.find(s => s.nombre === "Colección ARPA" || s.id === 1);
        if (salaARPA && salaARPA.murales && salaARPA.murales.length > 0) {
          if (DEBUG_SALA) console.log('🏛️ ✅ Cargando sala ARPA:', salaARPA.nombre, 'con', salaARPA.murales?.length || 0, 'murales');
          setSala(salaARPA);
          return;
        }
        
        // Fallback: Buscar cualquier sala con murales
        const salaConMurales = data.salas.find(s => s.murales && s.murales.length > 0);
        if (salaConMurales) {
          if (DEBUG_SALA) console.log('🏛️ ⚠️ Cargando sala fallback:', salaConMurales.nombre, 'con', salaConMurales.murales.length, 'murales');
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
    if (DEBUG_SALA) console.log('🔄 Convirtiendo murales a artworks:', murales.length, 'murales encontrados');
    return murales.map((salaMural, index) => {
      const mural = salaMural.mural;
      if (DEBUG_SALA) console.log(`📷 Procesando mural ${index + 1}:`, { titulo: mural.titulo, autor: mural.autor });
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
        width: salaMural.scale ? Math.max(6 * salaMural.scale, 6) : 6,
        height: salaMural.scale ? Math.max(4.5 * salaMural.scale, 4.5) : 4.5,
        type: detectArtworkType(mural.tecnica),
        frameStyle: salaMural.frameStyle || 'classic',
        frameMaterial: 'wood',
        animated: false,
        // anchorId se asignará luego de forma inteligente
        anchorId: null,
        position: salaMural.pos ? [salaMural.pos.x, salaMural.pos.y, salaMural.pos.z] : null,
        rotation: salaMural.rot ? [salaMural.rot.x, salaMural.rot.y, salaMural.rot.z] : null,
        scale: salaMural.scale || 1,
        spotlightIntensity: salaMural.spotlightIntensity || 1
      };
    });
  };

  // Nueva: asignación inteligente de anchors según cantidad y tamaño
  function allocateAnchors(arts) {
    if (!arts || arts.length === 0) return [];

    // --- PREPROCESO: ordenar copia por área (grandes primero) ---
    const sortedByArea = [...arts].sort((a,b)=> (b.width*b.height)-(a.width*a.height));

    // Clasificar anchors por secciones para recorrido longitudinal
    const sections = {
      rf: [], lf: [], rm: [], lm: [], rb: [], lb: [], bw: [] // fc removido
    };
    for (const a of anchorPoints) {
      // descartar cualquier anchor de pared puerta por robustez
      if (a.normal && a.normal[2] < 0) continue;
      if (a.wall === 'right-front') sections.rf.push(a);
      else if (a.wall === 'left-front') sections.lf.push(a);
      else if (a.wall === 'right-mid') sections.rm.push(a);
      else if (a.wall === 'left-mid') sections.lm.push(a);
      else if (a.wall === 'right-back') sections.rb.push(a);
      else if (a.wall === 'left-back') sections.lb.push(a);
      else if (a.wall === 'back') sections.bw.push(a);
    }
    // Orden interno
    const sortDescZ = arr=>arr.sort((a,b)=> b.position[2]-a.position[2]);
    const sortAscZ  = arr=>arr.sort((a,b)=> a.position[2]-b.position[2]);
    sortDescZ(sections.rf); sortDescZ(sections.lf);
    // mid ocupa rango central: ordenar descendente para mantener coherencia de recorrido
    sortDescZ(sections.rm); sortDescZ(sections.lm);
    sortAscZ(sections.rb);  sortAscZ(sections.lb);

    // Nueva ruta: derecha frente → izquierda frente → derecha mid → izquierda mid → derecha back → izquierda back → back wall → (esquinas frontales al final solo overflow)
    const pathOrdered = [
      ...sections.rf,
      ...sections.lf,
      ...sections.rm,
      ...sections.lm,
      ...sections.rb,
      ...sections.lb,
      ...sections.bw
    ];

    if (pathOrdered.length === 0) return arts.map(a => ({ ...a, anchorId: null }));

    // --- MUestreo equiespaciado para cubrir TODO el museo incluso con pocos cuadros ---
    const targetCount = Math.min(sortedByArea.length, pathOrdered.length);
    const chosenAnchors = [];
    const usedIds = new Set();
    for (let i=0; i<targetCount; i++) {
      // Distribuir índices uniformemente 0 → last
      const t = targetCount === 1 ? 0 : i/(targetCount-1);
      let idx = Math.round(t * (pathOrdered.length-1));
      // Evitar duplicados desplazando a la derecha luego izquierda
      let offset = 0;
      while (usedIds.has(pathOrdered[idx]?.id) && offset < pathOrdered.length) {
        idx = (idx + 1) % pathOrdered.length;
        offset++;
      }
      if (!usedIds.has(pathOrdered[idx]?.id)) {
        usedIds.add(pathOrdered[idx]);
        chosenAnchors.push(pathOrdered[idx]);
      }
    }

    // Si por alguna razón faltan anchors (colisiones), rellenar con cualquier disponible restante
    if (chosenAnchors.length < targetCount) {
      for (const a of pathOrdered) {
        if (chosenAnchors.length === targetCount) break;
        if (!usedIds.has(a.id)) { usedIds.add(a.id); chosenAnchors.push(a); }
      }
    }

    // --- Asignar: piezas grandes reciben anchors más visibles (primeros de la ruta) ---
    const assignments = [];
    for (let i=0;i<sortedByArea.length;i++) {
      const anchor = chosenAnchors[i % chosenAnchors.length];
      assignments.push({ artwork: sortedByArea[i], anchorId: anchor ? anchor.id : null });
    }

    // --- Espaciado adicional: bloquear anchors demasiado cercanos en mismas paredes (solo si sobran anchors) ---
    // (Opcional rápido) si hay más cuadros que anchors elegidos no hacemos ajuste.
    // Recuperar mapping id final para restaurar orden original de entrada.
    const idMap = new Map(assignments.map(x => [x.artwork.id, x.anchorId]));
    return arts.map(a => ({ ...a, anchorId: idMap.get(a.id) || null }));
  }

  // Convertir murales a artworks cuando la sala cambie
  const artworks = useMemo(() => {
    if (!sala || !sala.murales || sala.murales.length === 0) return [];
    const converted = convertMuralesToArtworks(sala.murales).slice(0, anchorPoints.length);
    return allocateAnchors(converted);
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

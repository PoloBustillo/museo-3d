/**
 * Hook para obtener y preparar los datos de una sala con asignación inteligente de anchors.
 * Optimizaciones aplicadas:
 * - Pre‐clasificación memoizada de anchor points por sección (evita recorrerlos cada asignación)
 * - Asignación en O(n log n) (ordenamiento) + O(n) (selección) con early exits para casos triviales
 * - Evita recrear funciones (useCallback) y cálculos (useMemo) innecesarios
 * - Cancelación de fetch en desmontaje (AbortController)
 * - Instrumentación opcional de performance controlada por flag
 * - Código documentado y consistente
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { anchorPoints } from "../config/anchorPoints";
import { FRONT_CENTER, BACK_CENTER, HALF_HALL_D } from "../sceneConfig";

// DEBUG general del hook (colocar en true sólo puntualmente)
const DEBUG_SALA = false;

// DEBUG de asignación (más detallado – mantener false salvo análisis puntual)
const DEBUG_ALLOC = false;

// ------------------------------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------------------------------
/** Deducción de tipo de obra según técnica */
function detectArtworkType(tecnica) {
  if (!tecnica) return "painting";
  const t = tecnica.toLowerCase();
  if (t.includes("fotograf") || t.includes("digital")) return "photo";
  if (t.includes("escultur") || t.includes("relieve")) return "relief";
  if (t.includes("mixta") || t.includes("mix")) return "mixed";
  return "painting";
}

/**
 * Datos mock fallback cuando la API no responde.
 */
function getMockSalaData() {
  return {
    id: "mock-sala",
    nombre: "Sala de Prueba - Datos Mock",
    descripcion: "Sala de demostración con datos simulados",
    murales: [
      {
        mural: {
          id: 1,
          titulo: "Paisaje Urbano Nocturno",
          autor: "Elena Martínez",
          anio: 2023,
          tecnica: "Óleo sobre lienzo",
          descripcion: "Una visión contemporánea de la ciudad en la noche",
          imagenUrlWebp: "/images/placeholder-artwork-1.jpg",
          url_imagen: "/images/placeholder-artwork-1.jpg",
        },
        scale: 1.2,
        frameStyle: "classic",
      },
      {
        mural: {
          id: 2,
          titulo: "Reflexiones en Azul",
          autor: "Carlos Mendoza",
          anio: 2024,
          tecnica: "Fotografía digital",
          descripcion: "Serie fotográfica sobre la luz y el agua",
          imagenUrlWebp: "/images/placeholder-artwork-2.jpg",
          url_imagen: "/images/placeholder-artwork-2.jpg",
        },
        scale: 1.0,
        frameStyle: "modern",
      },
      {
        mural: {
          id: 3,
          titulo: "Memoria Colectiva",
          autor: "Ana Ruiz",
          anio: 2023,
          tecnica: "Técnica mixta",
          descripcion:
            "Exploración de la identidad a través de materiales diversos",
          imagenUrlWebp: "/images/placeholder-artwork-3.jpg",
          url_imagen: "/images/placeholder-artwork-3.jpg",
        },
        scale: 1.5,
        frameStyle: "ornate",
      },
      {
        mural: {
          id: 4,
          titulo: "Geometrías del Tiempo",
          autor: "Roberto Silva",
          anio: 2024,
          tecnica: "Acrílico sobre madera",
          descripcion: "Abstracción geométrica inspirada en el paso del tiempo",
          imagenUrlWebp: "/images/placeholder-artwork-4.jpg",
          url_imagen: "/images/placeholder-artwork-4.jpg",
        },
        scale: 0.8,
        frameStyle: "minimal",
      },
    ],
    _count: { murales: 4 },
  };
}

// ------------------------------------------------------------------------------------
// Preclasificación de anchors (memoizado globalmente mientras anchorPoints no cambie)
// ------------------------------------------------------------------------------------
const classifyAnchors = (points) => {
  const sections = { rf: [], lf: [], rm: [], lm: [], rb: [], lb: [], bw: [] };
  for (const a of points) {
    // descartar robustamente cualquier anchor de pared de puerta (normal Z negativa)
    if (a.normal && a.normal[2] < 0) continue;
    switch (a.wall) {
      case "right-front":
        sections.rf.push(a);
        break;
      case "left-front":
        sections.lf.push(a);
        break;
      case "right-mid":
        sections.rm.push(a);
        break;
      case "left-mid":
        sections.lm.push(a);
        break;
      case "right-back":
        sections.rb.push(a);
        break;
      case "left-back":
        sections.lb.push(a);
        break;
      case "back":
        sections.bw.push(a);
        break;
      default:
        break; // ignorar otros
    }
  }
  // Ordenamientos internos (consistentes con trayectoria visual)
  const sortDescZ = (arr) => arr.sort((a, b) => b.position[2] - a.position[2]);
  const sortAscZ = (arr) => arr.sort((a, b) => a.position[2] - b.position[2]);
  sortDescZ(sections.rf);
  sortDescZ(sections.lf);
  sortDescZ(sections.rm);
  sortDescZ(sections.lm);
  sortAscZ(sections.rb);
  sortAscZ(sections.lb);
  // Cadena de recorrido
  const pathOrdered = [
    ...sections.rf,
    ...sections.lf,
    ...sections.rm,
    ...sections.lm,
    ...sections.rb,
    ...sections.lb,
    ...sections.bw,
  ];
  return { sections, pathOrdered };
};

// Memo global simple (no cambia mientras anchorPoints === referencia original)
let _anchorCache = null;
function getAnchorClassification() {
  if (!_anchorCache || _anchorCache.source !== anchorPoints) {
    _anchorCache = { source: anchorPoints, ...classifyAnchors(anchorPoints) };
    if (DEBUG_ALLOC) console.log("[ANCHORS] Clasificación recalculada");
  }
  return _anchorCache;
}

// ------------------------------------------------------------------------------------
// Hook principal
// ------------------------------------------------------------------------------------
export function useSalaData(salaId = null, options = {}) {
  const { allowMockOnErrorWhenId = true } = options;
  const [sala, setSala] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // ------------------------------------------------------------------
  // Fetchers (memo) con cancelación
  // ------------------------------------------------------------------
  const fetchFirstAvailableSala = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    const started = performance.now();
    try {
      if (DEBUG_SALA) console.log("🔍 Buscando salas disponibles...");
      const response = await fetch("/api/salas", { signal: controller.signal });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const salas = data.salas || [];
      let picked = salas.find(
        (s) =>
          s.nombre === "Colección ARPA" || (s.id === 1 && s.murales?.length)
      );
      if (!picked)
        picked = salas.find((s) => s.murales && s.murales.length > 0);
      if (!picked) picked = getMockSalaData();
      setSala(picked);
    } catch (err) {
      if (err.name === "AbortError") return; // ignorar abort
      console.error("❌ Error fetching salas:", err);
      setSala(getMockSalaData());
      setError(err.message);
    } finally {
      setLoading(false);
      if (DEBUG_SALA)
        console.log(
          `⏱️ fetchFirstAvailableSala ${(performance.now() - started).toFixed(1)}ms`
        );
    }
  }, []);

  const fetchSalaById = useCallback(async (id) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    const started = performance.now();
    try {
      const response = await fetch(`/api/salas/${id}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Sala ${id} no encontrada`);
      const data = await response.json();
      setSala(data);
    } catch (err) {
      if (err.name === "AbortError") return; // fetch cancelada
      console.error("❌ Error fetching sala by ID:", err);
      if (allowMockOnErrorWhenId) {
        setSala(getMockSalaData());
      } else {
        setSala(null);
      }
      setError(err.message);
    } finally {
      setLoading(false);
      if (DEBUG_SALA)
        console.log(
          `⏱️ fetchSalaById ${(performance.now() - started).toFixed(1)}ms`
        );
    }
  }, []);

  // Efecto inicial / cambio de salaId
  useEffect(() => {
    if (!salaId) fetchFirstAvailableSala();
    else fetchSalaById(salaId);
    return () => abortRef.current?.abort();
  }, [salaId, fetchFirstAvailableSala, fetchSalaById]);

  // ------------------------------------------------------------------
  // Conversión de murales -> artworks (memo)
  // ------------------------------------------------------------------
  const artworksRaw = useMemo(() => {
    if (!sala?.murales?.length) return [];
    const start = DEBUG_ALLOC ? performance.now() : 0;
    const converted = sala.murales.map((salaMural) => {
      const mural = salaMural.mural;
      const scale = salaMural.scale || 1;
      const widthBase = 6; // baseline
      const heightBase = 4.5;
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
        width: Math.max(widthBase * scale, widthBase),
        height: Math.max(heightBase * scale, heightBase),
        type: detectArtworkType(mural.tecnica),
        frameStyle: salaMural.frameStyle || "classic",
        frameMaterial: "wood",
        animated: false,
        anchorId: null,
        position: salaMural.pos
          ? [salaMural.pos.x, salaMural.pos.y, salaMural.pos.z]
          : null,
        rotation: salaMural.rot
          ? [salaMural.rot.x, salaMural.rot.y, salaMural.rot.z]
          : null,
        scale,
        spotlightIntensity: salaMural.spotlightIntensity || 1,
      };
    });
    if (DEBUG_ALLOC)
      console.log(
        `🧪 convertMuralesToArtworks: ${(performance.now() - start).toFixed(2)}ms`
      );
    return converted.slice(0, anchorPoints.length);
  }, [sala]);

  // ------------------------------------------------------------------
  // Asignación inteligente de anchors
  // ------------------------------------------------------------------
  const allocateAnchors = useCallback((arts) => {
    if (!arts.length) return [];
    const t0 = DEBUG_ALLOC ? performance.now() : 0;

    const { pathOrdered, sections } = getAnchorClassification();
    if (!pathOrdered.length) return arts.map((a) => ({ ...a, anchorId: null }));

    // Incluir walls válidas y prioridad para diversidad
    const WALL_PRIORITY_ORDER = [
      "right-front",
      "left-front",
      "divider-front",
      "right-mid",
      "left-mid",
      "divider-back",
      "right-back",
      "left-back",
      "back",
    ];

    // Planos divisores (z) (se conservan para evitar cruce físico real con espesor > 0 si se requiere)
    const DIVIDER_PLANES = [
      FRONT_CENTER - HALF_HALL_D,
      BACK_CENTER + HALF_HALL_D,
    ];
    const DIVIDER_MARGIN = 0.6;

    const crossesDivider = (art, anchor) => {
      if (!anchor) return false;
      const wall = anchor.wall || "";
      const lateral = wall.includes("right") || wall.includes("left");
      if (!lateral) return false;
      const halfSpanZ = (art.width || 6) * 0.5;
      const zMin = anchor.position[2] - halfSpanZ;
      const zMax = anchor.position[2] + halfSpanZ;
      for (let i = 0; i < DIVIDER_PLANES.length; i++) {
        const p = DIVIDER_PLANES[i];
        if (zMin - DIVIDER_MARGIN < p && zMax + DIVIDER_MARGIN > p) return true;
      }
      return false;
    };

    // Utilidad para comprobar solapamiento potencial entre obras ya asignadas en la MISMA pared.
    // Simplificación: sólo chequeamos traslape en la dimensión longitudinal de esa pared.
    const willOverlap = (art, anchor, placed) => {
      if (!anchor) return false;
      const wall = anchor.wall;
      // En paredes divisor/back (normales +Z) se ordenan por X; en paredes laterales se ordenan por Z.
      const axisIndex =
        wall.includes("back") || wall.includes("divider") ? 0 : 2; // 0->X, 2->Z
      const span =
        wall.includes("back") || wall.includes("divider")
          ? art.width || 6
          : art.width || 6; // width usado en ambos casos como extensión visible
      const half = span * 0.5;
      const pos = anchor.position[axisIndex];
      const min = pos - half;
      const max = pos + half;
      for (const p of placed) {
        if (p.wall !== wall) continue; // sólo misma pared
        const otherArt = p.art;
        const otherAnchor = p.anchor;
        const oPos = otherAnchor.position[axisIndex];
        const oHalf = (otherArt.width || 6) * 0.5;
        const oMin = oPos - oHalf;
        const oMax = oPos + oHalf;
        // Se considera solapado si intervalos se cruzan con margen pequeño
        if (!(max < oMin || min > oMax)) return true;
      }
      return false;
    };

    // Ordenar por área (grandes primero)
    const sorted = [...arts].sort(
      (a, b) => b.width * b.height - a.width * a.height
    );
    const totalAnchors = pathOrdered.length;
    const target = Math.min(sorted.length, totalAnchors);

    // Construir índice de anchors por wall en el orden de prioridad dado
    const anchorsByWall = new Map();
    for (const w of WALL_PRIORITY_ORDER) anchorsByWall.set(w, []);
    for (const a of pathOrdered) {
      if (!anchorsByWall.has(a.wall)) anchorsByWall.set(a.wall, []);
      anchorsByWall.get(a.wall).push(a);
    }

    // Interleaving walls para diversidad: generamos una cola rotando walls con anchors disponibles
    const wallQueues = WALL_PRIORITY_ORDER.filter(
      (w) => (anchorsByWall.get(w) || []).length
    );

    const placed = []; // { art, anchor, wall }
    const usedAnchorIds = new Set();

    for (const art of sorted.slice(0, target)) {
      let chosenAnchor = null;

      // Intento 1: recorrer walls en orden rotatorio buscando un anchor libre que no cruce divisores ni solape
      for (let wi = 0; wi < wallQueues.length && !chosenAnchor; wi++) {
        const wall = wallQueues[wi];
        const list = anchorsByWall.get(wall) || [];
        for (let ai = 0; ai < list.length; ai++) {
          const candidate = list[ai];
          if (usedAnchorIds.has(candidate.id)) continue;
          if (crossesDivider(art, candidate)) continue;
          if (willOverlap(art, candidate, placed)) continue;
          chosenAnchor = candidate;
          break;
        }
      }

      // Intento 2: fallback global (cualquier anchor que no solape ni cruce)
      if (!chosenAnchor) {
        for (const candidate of pathOrdered) {
          if (usedAnchorIds.has(candidate.id)) continue;
          if (crossesDivider(art, candidate)) continue;
          if (willOverlap(art, candidate, placed)) continue;
          chosenAnchor = candidate;
          break;
        }
      }

      // Intento 3: permitir solape (último recurso) - pero la consigna es NUNCA solapar, así que mejor dejar null
      if (chosenAnchor) {
        usedAnchorIds.add(chosenAnchor.id);
        placed.push({ art, anchor: chosenAnchor, wall: chosenAnchor.wall });
      } else {
        if (DEBUG_ALLOC)
          console.warn("⚠️ No se encontró anchor sin solape para obra", art.id);
      }
    }

    // Mapear resultados
    const assignments = new Map(placed.map((p) => [p.art.id, p.anchor.id]));

    const result = arts.map((a) => ({
      ...a,
      anchorId: assignments.get(a.id) || null,
    }));
    if (DEBUG_ALLOC)
      console.log(
        `🧩 allocateAnchors (no-overlap) ${(performance.now() - t0).toFixed(2)}ms placed=${placed.length}/${arts.length}`
      );
    return result;
  }, []);

  const artworks = useMemo(
    () => allocateAnchors(artworksRaw),
    [artworksRaw, allocateAnchors]
  );

  // API pública del hook
  return {
    sala,
    artworks,
    loading,
    error,
    refresh: () => {
      salaId ? fetchSalaById(salaId) : fetchFirstAvailableSala();
    },
  };
}

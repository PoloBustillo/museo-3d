"use client";
import React, { useRef, createContext, useContext, useState, useCallback, useReducer, useActionState} from "react";
import * as Sentry from "@sentry/nextjs";
import { useStateManager } from "react-select";
import { array } from "yup";

const GalleryContext = createContext();

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
};

export const GalleryProvider = ({ children }) => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allMurales, setAllMurales] = useState([]);
  const [loadingAllMurales, setLoadingAllMurales] = useState(false);
  const [allMuralesLoaded, setAllMuralesLoaded] = useState(false);

  const loadArtworksForRoom = useCallback(async (roomId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/salas/${roomId}/murales`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transformar los datos del nuevo esquema
      const transformedArtworks = data.murales.map((mural) => {
        console.log("Room mural autor data:", {
          muralId: mural.id,
          titulo: mural.titulo,
          autor: mural.autor,
          artistId: mural.artistId,
          artistName: mural.artist?.user?.name,
          artistUser: mural.artist?.user,
        });

        return {
          id: mural.id,
          title: mural.titulo,
          artist: mural.artista,
          technique: mural.tecnica,
          year: mural.anio,
          description: mural.descripcion,
          imageUrl: mural.imagenUrl,
          imageUrlWebp: mural.imagenUrlWebp,
          location: mural.ubicacion,
          dimensions: mural.dimensiones,
          state: mural.estado,
          latitude: mural.latitud,
          longitude: mural.longitud,
          createdAt: mural.createdAt,
          updatedAt: mural.updatedAt,
          // Campos adicionales para compatibilidad
          url_imagen: mural.imagenUrl,
          nombre: mural.titulo,
          autor:
            mural.autor || mural.artist?.user?.name || "Artista desconocido",
          medidas: mural.dimensiones,
        };
      });

      setArtworks(transformedArtworks);

      // Log exitoso de carga de galería
      Sentry.addBreadcrumb({
        message: `Galería cargada exitosamente para sala: ${roomId}`,
        category: "api",
        level: "info",
        data: { roomId, artworkCount: transformedArtworks.length },
      });
    } catch (err) {
      console.error("Error loading artworks:", err);
      setError(err.message);

      // Capturar error en Sentry
      Sentry.captureException(err, {
        tags: {
          action: "load_room_artworks",
          roomId: roomId,
        },
        extra: {
          roomId,
          errorMessage: err.message,
        },
      });
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar todos los murales (para galería general, filtros, carrusel, etc.)
  const fetchAllMurales = useCallback(
    async (force = false) => {
      if (allMuralesLoaded && !force) return;
      setLoadingAllMurales(true);
      setError(null);
      try {
        const response = await fetch("/api/murales");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Procesar los murales para incluir el nombre del artista
        const processedMurales = (data.murales || []).map((mural) => {
          console.log("Mural autor data:", {
            muralId: mural.id,
            titulo: mural.titulo,
            autor: mural.autor,
            artistId: mural.artistId,
            artistName: mural.artist?.user?.name,
            artistUser: mural.artist?.user,
          });

          return {
            ...mural,
            autor:
              mural.autor || mural.artist?.user?.name || "Artista desconocido",
          };
        });

        setAllMurales(processedMurales);
        setAllMuralesLoaded(true);
      } catch (err) {
        console.error("Error loading all murales:", err);
        setError(err.message);
        setAllMurales([]);
      } finally {
        setLoadingAllMurales(false);
      }
    },
    [allMuralesLoaded]
  );
//useReduce para el renderizado y busqueda mediante filtros
const filterInitialState = {
  isFilter: false,
  aiActive: false,
  status: "NO-ACTION",
  setOfFilters: [], 
  filters: {
    room: "",
    keyWord: "",
  },
  muralesForScroll: [],
  error: null,
};

const [loadingPageMurales, setLoadingPageMurales] = useState(false);
const pageRef = useRef(0);
const pageTotalRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);

const filterPaginatedReducer = (state, action) => {
  let filterStatus;
  let iaStatus;
  switch (action.type) {
    case "SET_KEYWORD":
      filterStatus = state.isFilter === false ? true : state.isFilter;
      return {
        ...state,
        isFilter: filterStatus,
        status:"SEARCH_ACTION",
        filters: {
          ...state.filters, 
          keyWord: action.keyWord
        } 
      };
    case "SET_IA":
      iaStatus = state.aiActive === false ? true : state.aiActive;
      filterStatus = state.isFilter === true ? false : state.isFilter;
      return{
        ...state,
        aiActive: iaStatus,
        isFilter: filterStatus,
        status:"SET_IA_ACTION",
        filters: {
          ...state.filters, 
        } 
      };
    case "SET_IA_KEYWORD":
        iaStatus = state.aiActive === false ? true : state.aiActive;
      return{
        ...state,
        aiActive: iaStatus,
        status:"SEARCH_IA_ACTION",
        filters: {
          ...state.filters, 
          keyWord: action.keyWord,
        } 
      };

case "GET_BACK":
  return {
    ...state,
    aiActive: false,    // 👈 Desactiva IA siempre
    isFilter: false,    // 👈 Limpia filtro siempre
    status: "BACK_ACTION",
    filters: {
      ...state.filters,
      keyWord: "",
      room: "",
    },
  };

    case "SET_SALA":
      filterStatus = state.isFilter === false ? true : state.isFilter;
      return {
        ...state,
        isFilter: filterStatus,
        status:"SEARCH_ACTION",
        filters: {
          ...state.filters, 
          keyWord: "",
          room: action.salaId
        }
        
      };
      
    case "RESET":
      filterStatus = state.isFilter === true ? false : state.isFilter;
      iaStatus = state.aiActive === true ? false : state.aiActive;
      return {
        ...state,
        aiActive: iaStatus,
        isFilter: filterStatus,
        status:"NO_ACTION",
        filters: {
          ...state.filters, 
          room: "",
          keyWord: "",
        }
        
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
//Funcion asincrona categorizar busqueda
async function sentimentalAnalysis(description) {
  try {
    const response = await fetch("https://kenaisan-sentiana.hf.space/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description })
    });

    if (!response.ok) throw new Error("Error en la API de Hugging Face");

    const responseData = await response.json();
    const probNegativa = parseFloat(responseData.probabilidades[0][0].toFixed(7));
    const probPositiva = parseFloat(responseData.probabilidades[0][1].toFixed(7));

    return [responseData.polaridad, probNegativa, probPositiva];

  } catch (err) {
    console.error("⚠️ Error analizando sentimiento:", err);
    // Si falla la IA, asignamos valores por defecto
    return ["POSITIVO", 0.6666, 0.77777];
  }
}

const [stateFilter, dispatchFilter] = useReducer (filterPaginatedReducer,filterInitialState);
const [muralesForScroll, setMuralesForScroll] = useState([]);

//Cargar lo murales mediante la paginacion de los mismos
const fetchPageMurales = async(page=1)=>{
  if (pageRef.current === page ) return;
  setLoadingPageMurales(true);
  setError(null);
  try{
    pageRef.current = page;
    let request = `/api/murales/?page=${page}`;

    if(stateFilter.isFilter && !stateFilter.aiActive){
      if(stateFilter.filters.keyWord){
        request += `&keyword=${stateFilter.filters.keyWord}`;
      }
      if(stateFilter.filters.room){
        request += `&salaId=${stateFilter.filters.room}`;
      }
    }

if (stateFilter.aiActive) {
  if (stateFilter.filters.keyWord) {
    const [polaridad, probNegativa, probPositiva] = await sentimentalAnalysis(stateFilter.filters.keyWord);
    request += `&polaridad=${polaridad}`;
  }
}

    
    console.log(request);
    const response = await fetch(request);
    const data = await response.json();
    pageTotalRef.current = data.filtros.paginationInfo.totalPages;
    setMuralesForScroll(prev=>[...prev,...data.murales]);
    
  } catch (err) {
    console.error(`Error loading ${page} from murales:`, err);
    setError(err.message);
    setMuralesForScroll([]);
  } finally {
    setLoadingPageMurales(false);
  }
};

// Cargar el nombre, id, y primera imagen de una sala
  const [roomsToShow, setRoomsToShow] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const hasLoadedRoomsRef =  useRef(false);

  const fetchRoomsNames = useCallback(async (force=false) =>{
    if(hasLoadedRoomsRef.current && !force) return;
    hasLoadedRoomsRef.current = true;

try { 
  setLoadingRooms(true);
  const request = await fetch(`/api/salas`);
  const response = await request.json();
  console.log(response);

  const salas = response.salas
    // ✅ Filtrar solo las públicas y que tengan al menos un mural con imagen
    .filter(
      (sala) => sala.publica && sala.murales.length > 0 && sala.murales[0]?.mural?.url_imagen
    )
    // ✅ Crear el objeto de salida limpio
    .map((sala) => ({
      id: sala.id,
      name: sala.nombre,
      img: sala.murales[0].mural.url_imagen, // Ahora es seguro
    }));

  setRoomsToShow(salas);
} catch (error) {
  console.error("Error fetching Rooms:", error);
} finally {
  setLoadingRooms(false);
}

  },[]);

  const getGalleryStats = useCallback(() => {
    if (artworks.length === 0) {
      return {
        totalArtworks: 0,
        uniqueArtists: 0,
        uniqueTechniques: 0,
        oldestYear: null,
        newestYear: null,
      };
    }

    const artists = new Set(artworks.map((a) => a.artist).filter(Boolean));
    const techniques = new Set(
      artworks.map((a) => a.technique).filter(Boolean)
    );
    const years = artworks
      .map((a) => a.year)
      .filter(Boolean)
      .sort((a, b) => a - b);

    return {
      totalArtworks: artworks.length,
      uniqueArtists: artists.size,
      uniqueTechniques: techniques.size,
      oldestYear: years.length > 0 ? years[0] : null,
      newestYear: years.length > 0 ? years[years.length - 1] : null,
    };
  }, [artworks]);

  const addArtworkToCollection = useCallback(
    async (artworkId, artworkType = "mural") => {
      try {
        const response = await fetch("/api/collection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artworkId: artworkId.toString(),
            artworkType,
            artworkData: {
              id: artworkId,
              type: artworkType,
              addedAt: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add artwork to collection");
        }

        return await response.json();
      } catch (error) {
        console.error("Error adding artwork to collection:", error);
        throw error;
      }
    },
    []
  );

  const removeArtworkFromCollection = useCallback(async (itemId) => {
    try {
      const response = await fetch(`/api/collection?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove artwork from collection");
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing artwork from collection:", error);
      throw error;
    }
  }, []);

  const value = {
    artworks,
    loading,
    error,
    loadArtworksForRoom,
    getGalleryStats,
    addArtworkToCollection,
    removeArtworkFromCollection,
    // NUEVO: para galería general
    allMurales,
    loadingAllMurales,
    fetchAllMurales,
    //INFINITE SCROLL en galeria general
    muralesForScroll,
    loadingPageMurales,
    fetchPageMurales,
    setMuralesForScroll,
    pageTotalRef,
    currentPage,
    setCurrentPage,
    //FUNCIONES PARA OBTENER LAS SALAS EXISTENTES
    loadingRooms,
    roomsToShow,
    fetchRoomsNames,
    hasLoadedRoomsRef,
    //NECESARIO PARA DESPACHAR LA GALERIA 
    stateFilter,
    dispatchFilter,
    pageRef
  };

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
};

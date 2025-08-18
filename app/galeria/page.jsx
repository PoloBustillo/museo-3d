"use client";
import { useState, useEffect, useRef } from "react";
import { PageLoader,SectionLoader } from "../../components/LoadingSpinner";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import { useGallery } from "../../providers/GalleryProvider";
import useMuralFilters from "@/app/hooks/useMuralFilters";
import FilterControls from "../mis-obras/components/FilterControls";
import { useUIState } from "../mis-obras/hooks/useUIState";
import MuralesList from "../../components/gallery/MuralesList";
import SalasList from "../../components/gallery/SalasList";
import SearchBar from "../../components/gallery/SearchBar";
import ModalZoomImage from "../../components/gallery/ModalZoomImage";
import { useCollection } from "../../providers/CollectionProvider";
import { toast } from "react-hot-toast";
import { normalizeTecnica } from "../../components/gallery/utils";
import GalleryCarousel from "../../components/GalleryCarousel";
import useSalas from "@/app/hooks/useSalas";
import dynamic from "next/dynamic";
//Para el Scroll Infinito
import InfiniteScroll from 'react-infinite-scroll-component';

const ARExperience = dynamic(() => import("../../components/ar/ARExperience"), { ssr: false });

export default function GaleriaPage() {
  
  const {
    //Fetch Galeria General a Todos los
    allMurales,
    loadingAllMurales,
    fetchAllMurales,
    //Fetch para el scroll infinito
    muralesForScroll,
    loadingPageMurales,
    fetchPageMurales,
    pageTotalRef,

    artworks: murales,
    loading,
    //Para determinar y cargar las salas dentro de la barra de busqueda
    loadingRooms,
    fetchRoomsNames,
    // Si tienes salas en el provider, agrégalas aquí
  } = useGallery();
  // Si las salas no están en el provider, puedes mantener un estado local o migrar la lógica después.
  const [currentMurales, setCurrentMurales] = useState(muralesForScroll);
  // Estado de filtros y UI (adaptado de mis obras)
  const [filters, setFilters] = useState({
    search: "",
    tecnica: "",
    year: "",
    sortBy: "newest",
  });
  const resetFilters = () => setFilters({ search: "", tecnica: "", year: "", sortBy: "newest" });
  const getFilterOptions = () => ({
    tecnicas: [...new Set(muralesForScroll.map((m) => normalizeTecnica(m.tecnica)).filter(Boolean))].sort(),
    years: [...new Set(muralesForScroll.map((m) => m.anio || m.year).filter(Boolean))].sort((a, b) => b - a),
  });
  // UI state para vista y filtros avanzados
  const { view, setView, showFilters, setShowFilters } = useUIState();

  // Hook para obtener salas
  const { salas, loading: loadingSalas } = useSalas();

  // Estado para sala seleccionada
  const [selectedSalaId, setSelectedSalaId] = useState(null);

  // Filtrar murales por sala seleccionada (si hay selección)
  const muralesFiltradosPorSala = selectedSalaId
    ? muralesForScroll.filter(
        (m) =>
          m.SalaMural &&
          m.SalaMural.some((sm) => sm.salaId === selectedSalaId)
      )
    : muralesForScroll;

  // Adaptar lógica de filtrado (usando useMuralFilters o lógica propia)
  const filteredMurales = useMuralFilters({
    allMurales: muralesFiltradosPorSala,
    searchTerm: filters.search,
    filterTecnica: filters.tecnica,
    filterAnio: filters.year ? Number(filters.year) : undefined,
    sortBy: filters.sortBy === "newest" ? "anio" : filters.sortBy === "oldest" ? "anio" : filters.sortBy === "title" ? "titulo" : filters.sortBy === "year" ? "anio" : filters.sortBy,
  });

  const { collection, isInCollection, addToCollection, removeFromCollection } =
    useCollection();

  // Función para manejar like/unlike
  const handleLike = async (mural) => {
    try {
      if (isInCollection(mural.id)) {
        await removeFromCollection(mural.id);
        toast.success("Obra removida de tu colección");
      } else {
        await addToCollection(mural.id, "mural", mural);
        toast.success("Obra guardada en tu colección");
      }
    } catch (err) {
      toast.error(err.message || "Debes iniciar sesión para guardar obras");
    }
  };

  // Lista de IDs de murales favoritos
  const likedMurales = collection.map((item) => item.id);

  // Técnicas y años únicos para los selects
  const tecnicasUnicas = [
    ...new Set(muralesForScroll.map((m) => m.tecnica).filter(Boolean)),
  ].sort();
  const aniosUnicos = [
    ...new Set(muralesForScroll.map((m) => m.anio).filter(Boolean)),
  ].sort((a, b) => b - a);

  // Estado para mostrar el modal AR
  const [arMural, setArMural] = useState(null);

  // Función para manejar click en AR
  const handleARClick = (mural) => {
    setArMural(mural);
  };

  // Cargar todos los murales al montar la galería (para el carrusel)
  const [page, setPage] = useState(1);
  const carruselRef = useRef();

    useEffect(() => {
      fetchPageMurales(page);  

      if(page===1) {
        carruselRef.current = muralesForScroll
        fetchRoomsNames();
        
      };

       
    }, [page]);

const previousScrollY = window.scrollY;

useEffect(() => {
  window.scrollTo({ top: previousScrollY });
}, [muralesForScroll]);


  // Estado para el modal de zoom
  const [zoomMural, setZoomMural] = useState(null);

  if (loading || loadingPageMurales  && page ===1) return <PageLoader text="Cargando galería..."/>;
  
  return (
    <div className="relative min-h-screen  bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Galería Virtual
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora las obras de arte organizadas por salas temáticas o navega
            por el archivo completo
          </p>
        </div>

        {/* Carrusel destacado */}
        {carruselRef.current && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Obras Destacadas
            </h2>
            <GalleryCarousel
              items={muralesForScroll.slice(0, 10)}
              title="Galería de Obras"
            />
          </div>
        )}

        {/* Sección de selección de salas
        {salas && salas.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-muted-foreground">Filtrar por sala:</span>
            <button
              className={`px-3 py-1 rounded-lg border text-sm font-medium transition ${!selectedSalaId ? "bg-indigo-600 text-white" : "bg-white dark:bg-neutral-800 text-foreground border-border hover:bg-indigo-50 dark:hover:bg-neutral-700"}`}
              onClick={() => setSelectedSalaId(null)}
            >
              Todas
            </button>
            {salas.map((sala) => (
              <button
                key={sala.id}
                className={`px-3 py-1 rounded-lg border text-sm font-medium transition ${selectedSalaId === sala.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-neutral-800 text-foreground border-border hover:bg-indigo-50 dark:hover:bg-neutral-700"}`}
                onClick={() => setSelectedSalaId(sala.id)}
              >
                {sala.nombre}
              </button>
            ))}
          </div>
        )}
        */}

        {/* Header de filtros y tabs 
        <div className="mb-4">
          <FilterControls
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            getFilterOptions={getFilterOptions}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            view={view}
            setView={setView}
            resultsCount={filteredMurales.length}
          />
        </div>
        */}

        {/* Vista principal: siempre mostrar murales filtrados 
        {muralesForScroll.length > 0 ? (
          <MuralesList
            murales={filteredMurales}
            onMuralClick={setZoomMural}
            onLike={handleLike}
            likedMurales={likedMurales}
            view={view}
            onARClick={handleARClick}
          />
        ) : (
          <div className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border mt-8">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No hay resultados
            </h3>
            <p className="text-muted-foreground">
              No se encontraron murales que coincidan con tu búsqueda o filtros.
            </p>
          </div>
        )}*/}
      <div className="relative z-50">
        <SearchBar 
        
        />
      </div>

       <InfiniteScroll 
          className="z-10"
          dataLength={muralesForScroll.length}
          next={() => setPage((prev) => prev + 1)}
          hasMore={!(page > pageTotalRef.current)}
          pullDownToRefreshThreshold={100}
          loader={<SectionLoader/>}
          endMessage={
              <p style={{ textAlign: 'center' }}>
              <b>¡Has llegado al final!</b>
              </p>
          }
          >
          <MuralesList
              murales={muralesForScroll}
              onMuralClick={setZoomMural}
              onLike={handleLike}
              likedMurales={likedMurales}
              view={view}
              onARClick={handleARClick}
          />
        </InfiniteScroll>


        {/* Modal de zoom */}
        {zoomMural && (
          <ModalZoomImage
            mural={zoomMural}
            onClose={() => setZoomMural(null)}
          />
        )}
        {/* Modal AR */}
        {arMural && (
          <ARExperience onClose={() => setArMural(null)} mural={arMural} />
        )}
      </div>
    </div>
  );
}
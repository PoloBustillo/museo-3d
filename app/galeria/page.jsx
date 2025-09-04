"use client";
import { useState, useEffect, useRef } from "react";
import { PageLoader, SectionLoader } from "../../components/LoadingSpinner";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import { useGallery } from "../../providers/GalleryProvider";
import MuralesList from "../../components/gallery/MuralesList";
import SearchBar from "../../components/gallery/SearchBar";
import ModalZoomImage from "../../components/gallery/ModalZoomImage";
import { useCollection } from "../../providers/CollectionProvider";
import { toast } from "react-hot-toast";
import GalleryCarousel from "../../components/GalleryCarousel";
import dynamic from "next/dynamic";
import InfiniteScroll from "react-infinite-scroll-component";

const ARExperience = dynamic(
  () => import("../../components/ar/ARExperience"),
  { ssr: false }
);

export default function GaleriaPage() {
  const {
    muralesForScroll,
    loadingPageMurales,
    fetchPageMurales,
    pageTotalRef,
    fetchRoomsNames,
    currentPage, 
    setCurrentPage,
    setMuralesForScroll,
    stateFilter,
    pageRef,
    dispatchFilter
  } = useGallery();

  const { collection, isInCollection, addToCollection, removeFromCollection } = useCollection();

  const [arMural, setArMural] = useState(null);
  const [zoomMural, setZoomMural] = useState(null);
  const uniqueLoadRef = useRef(false);
  const carruselRef = useRef([]);

  // Manejo de "like"
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

  // Lista de favoritos
  const likedMurales = collection.map((item) => item.id);
  // Llamada centralizada: solo se hace fetch cuando currentPage cambia
  useEffect(() => {
    fetchPageMurales(currentPage);
  }, [currentPage]);

  //Llamada unica para cargar nombre de salas
  useEffect(()=>{
    if (!uniqueLoadRef.current) {
      uniqueLoadRef.current = true;
      fetchRoomsNames(); // Solo en la primera carga
    }
  },[]);

  //Llamada encargada de manejar disitiantas acciones dadas por el dispatch
  useEffect(() => {  
    switch(stateFilter.status){
      case "SEARCH_ACTION":
          setMuralesForScroll([]);
          setCurrentPage(1); // Esto dispara el primer useEffect automáticamente
          pageRef.current = 0;
          fetchPageMurales(1);
        break;
      case "NO-ACTION":
        break;
      case "BACK_ACTION":
          setMuralesForScroll([]);
          setCurrentPage(1); // Esto dispara el primer useEffect automáticamente
          pageRef.current = 0;
          fetchPageMurales(1);
          dispatchFilter({ type: "RESET"});
        break;
    }

  }, [stateFilter]);

  // Mantener posición de scroll al cargar más
  const previousScrollY = window.scrollY;
  useEffect(() => {
    window.scrollTo({ top: previousScrollY });
  }, [muralesForScroll]);

  if ((loadingPageMurales && currentPage === 1)) {
    return <PageLoader text="Cargando galería..." />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
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

    <div className="relative z-50 mb-6">
      <SearchBar />
    </div>
    {muralesForScroll.length > 0 ? (
      <InfiniteScroll
        key={stateFilter.status}
        className="z-10"
        dataLength={muralesForScroll.length}
        next={() => setCurrentPage((prev) => prev + 1)}
        hasMore={currentPage < pageTotalRef.current}
        pullDownToRefreshThreshold={0}
        loader={<SectionLoader />}
        endMessage={
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-center">
              <b>¡Has llegado al final!</b>
            </p>
            {carruselRef.current.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Obras Destacadas
                </h2>
                <GalleryCarousel
                  items={carruselRef.current}
                  title="Galería de Obras"
                />
              </div>
            )}
          </div>
        }
      >
        <MuralesList
          murales={muralesForScroll}
          onMuralClick={setZoomMural}
          onLike={handleLike}
          likedMurales={likedMurales}
          onARClick={(mural) => setArMural(mural)}
        />
      </InfiniteScroll>
    ) : (
      <div className="w-full flex items-center mt-10">
        <span className="m-auto font-bold text-xl">
          ¡Lo sentimos! No se encontraron obras asociadas
        </span>
      </div>
    )}
  </div>
  
  {zoomMural && (
    <ModalZoomImage
      mural={zoomMural}
      onClose={() => setZoomMural(null)}
    />
  )}

  {arMural && (
    <ARExperience onClose={() => setArMural(null)} mural={arMural} />
  )}
</div>
  );
}

"use client";
import InfiniteScroll from "react-infinite-scroll-component";
import MuralesList from "./MuralesList";
import { useState, useEffect, useRef } from "react";
import { SectionLoader } from "../LoadingSpinner";
import { useGallery } from "../../providers/GalleryProvider";

export default function GalleryInfiniteScroll({
  muralesForScroll,
  pageTotalRef,
  currentPage,
  setCurrentPage,
  likedMurales,
  handleLike,
  setZoomMural,
  setArMural
})
  
{
  const {
    setMuralesForScroll,
    pageRef,
    fetchPageMurales,
    stateFilter
  } =useGallery();
  // Mantener posición de scroll al cargar más
  const previousScrollY = window.scrollY;
    useEffect(() => {
      window.scrollTo({ top: previousScrollY });
  }, [muralesForScroll]);

  useEffect(() => {
  if (stateFilter.isFilter) {
    setMuralesForScroll([]);
    setCurrentPage(1); 
    pageRef.current = 0;
    fetchPageMurales(1);
  }
}, [stateFilter]);

  return (
    <InfiniteScroll
      className="z-10"
      dataLength={muralesForScroll.length}
      next={() => setCurrentPage((prev) => prev + 1)}
      hasMore={currentPage < pageTotalRef.current}
      pullDownToRefreshThreshold={0}
      loader={<SectionLoader />}
      endMessage={
        <p style={{ textAlign: "center" }}>
          <b>¡Has llegado al final!</b>
        </p>
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
  );
}

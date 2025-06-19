"use client";
import { createContext, useContext, useState } from "react";
const GalleryContext = createContext();
export function GalleryProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [artworks, setArtworks] = useState([]);
  return (
    <GalleryContext.Provider value={{ room, setRoom, artworks, setArtworks }}>
      {children}
    </GalleryContext.Provider>
  );
}
export const useGallery = () => useContext(GalleryContext);

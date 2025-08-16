// Test de carga instantánea - UltraSimpleGallery
import React from "react";
import UltraSimpleGallery from "../components/UltraSimpleGallery.jsx";

export default function TestUltraSimpleGallery() {
  // Artworks de prueba con solo colores
  const testArtworks = [
    {
      id: 1,
      title: "Rojo Abstracto",
      artist: "Test Artist",
      color: "#ff0000",
    },
    {
      id: 2,
      title: "Azul Profundo",
      artist: "Test Artist",
      color: "#0000ff",
    },
    {
      id: 3,
      title: "Verde Naturaleza",
      artist: "Test Artist",
      color: "#00ff00",
    },
    {
      id: 4,
      title: "Amarillo Sol",
      artist: "Test Artist",
      color: "#ffff00",
    },
    {
      id: 5,
      title: "Púrpura Místico",
      artist: "Test Artist",
      color: "#800080",
    },
  ];

  return (
    <div className="w-full h-screen">
      <UltraSimpleGallery
        artworks={testArtworks}
        onExitGallery={() => {
          console.log("Saliendo de galería ultra simple");
          // En producción esto navegaría de vuelta
        }}
      />
    </div>
  );
}

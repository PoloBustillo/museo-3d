<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes
"use client";
import { useEffect, useState } from "react";
import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/murales');
        const data = await res.json();
<<<<<<< Updated upstream
        const dataInfo = await data.murales;
        console.log(dataInfo);

        const parsedPhotos = dataInfo.map((item) => {
=======
        const dataMurales = await data.murales;
        console.log(data);

        const parsedPhotos = dataMurales.map((item) => {
>>>>>>> Stashed changes
          const medidas = item.medidas?.match(/([\d.]+)\s*x\s*([\d.]+)/);
          let width = 800;
          let height = 600;

          if (medidas && medidas.length === 3) {
<<<<<<< Updated upstream
            width = parseFloat(medidas[1]) * 60;  // escalar para ajustar
=======
            width = parseFloat(medidas[1]) * 120;  // escalar para ajustar
>>>>>>> Stashed changes
            height = parseFloat(medidas[2]) * 100;
          }

          return {
            src: item.url_imagen,
            width,
            height,
            title: item.nombre,
          };
        });

        setPhotos(parsedPhotos);
        console.log(photos);
      } catch (e) {
        console.error('Error al obtener murales: ', e);
      }
    };

    fetchData();
  }, []);

  return (
    <ColumnsPhotoAlbum
      photos={photos}
      layout="columns"
    />
  );
}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes

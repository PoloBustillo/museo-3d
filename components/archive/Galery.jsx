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
        const dataInfo = await data.murales;
        console.log(dataInfo);

        const parsedPhotos = dataInfo.map((item) => {
          const medidas = item.medidas?.match(/([\d.]+)\s*x\s*([\d.]+)/);
          let width = 800;
          let height = 600;

          if (medidas && medidas.length === 3) {
            width = parseFloat(medidas[1]) * 60;  // escalar para ajustar
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

"use client";
import { useEffect, useState } from "react";
import  Search from '../../components/archive/Search';
import Carousel from '../../components/archive/Carousel';
import Gallery from '../../components/archive/Galery';
import { object } from "yup";

function agruparMuralesPorFiltrosNumericos(murales, filtrosSeleccionados) {
  const resultado = {};

  murales.forEach(mural => {
    // Revisa todas las claves que interesan
    const posiblesFiltros = {
      anio: mural.anio,
      salaId: mural.salaId,
    };

    Object.values(posiblesFiltros).forEach(valor => {
      const clave = valor?.toString();
      if (
        filtrosSeleccionados.includes(clave) &&
        !isNaN(Number(clave))
      ) {
        if (!resultado[clave]) {
          resultado[clave] = [];
        }
        resultado[clave].push(mural);
      }
    });
  });

  return resultado;
}



export default function ArchiveCarussel (){
const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/murales');
        const data = await res.json();

        console.log("TODO el objeto:", data);


        // Acceder a estadísticas:
        const dataYear = data.estadisticas.porAnio;
        console.log("Estadísticas:", dataYear);

        const dataInfo =  data.murales;
        console.log("HOLA",data);

        const filtrosNumericos = Object.keys(dataYear); // ["2021", "2022", "2023"]
        const agrupados = agruparMuralesPorFiltrosNumericos(dataInfo, filtrosNumericos);
        console.log("Agrupados:", agrupados);
        console.log("3:", agrupados['2023'].length);




        const parsedPhotos = dataInfo.map((item) => {
          const medidas = item.medidas?.match(/([\d.]+)\s*x\s*([\d.]+)/);
          let width = 800;
          let height = 600;

          if (medidas && medidas.length === 3) {
            width = parseFloat(medidas[1]) * 120;  // escalar para ajustar
            height = parseFloat(medidas[2]) * 100;
          }

          return {
            src: item.url_imagen,
            autor: item.autor,
            tecnica: item.tecnica,
            
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
        <div>
            <Search/>
            <Gallery photos={photos}></Gallery>
            <Carousel items={photos}></Carousel>

        </div>
    )
}


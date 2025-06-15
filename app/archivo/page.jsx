"use client";
import { useEffect, useState } from "react";
import  Search from '../../components/archive/Search';
import Carousel from '../../components/archive/Carousel';
import Gallery from '../../components/archive/Galery';
import { object } from "yup";
import styles from './Achive.module.css';

function agruparMuralesPorFiltrosNumericos(murales, filtrosSeleccionados) {
  const resultado = {};
  const final = [];

  murales.forEach(mural => {
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
    Object.entries(resultado).forEach(([clave, lista]) => {
        if (lista.length > 1) {
            final.push({ [clave]: lista });
        }
    });


  return final;
}

const parsedPhotos = (dataImg) => {
    return dataImg.map((item) => {
        let width = 200;
        let height = 300;

        if (typeof item.medidas === 'string') {
            // Extraer todas las dimensiones numéricas del string
            const dimensiones = item.medidas
                .replace(/m/g, '') // quitar unidad "m"
                .split('x')        // separar por 'x'
                .map(d => parseFloat(d.trim()))
                .filter(n => !isNaN(n));

            // Si al menos hay dos dimensiones válidas
            if (dimensiones.length >= 2) {
                width = dimensiones[0] * 10;
                height = dimensiones[1] * 10;
            }
        }

        return {
            src: item.url_imagen,
            autor: item.autor,
            colab: item.colaboradores,
            medidas:item.medidas,
            anio: item.anio,
            tecnica: item.tecnica,
            width,
            height,
            title: item.nombre,
        };
    });
};



export default function ArchiveCarussel () {
  const [photos, setPhotos] = useState([]);
  const [yearPhotos, setYearPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/murales');
        const data = await res.json();

        const dataInfo = data.murales;
        const dataYear = data.estadisticas.porAnio;
        const filtrosNumericos = Object.keys(dataYear);

        const agrupados = agruparMuralesPorFiltrosNumericos(dataInfo, filtrosNumericos);
        console.log("Agrupados:", agrupados);

        setPhotos(parsedPhotos(dataInfo));

        // Extraer el grupo de murales del año 2023 si existe
        const grupo2023 = agrupados.find(grupo => grupo['2024']);
        if (grupo2023) {
          setYearPhotos(parsedPhotos(grupo2023['2024']));
        }

      } catch (e) {
        console.error('Error al obtener murales: ', e);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
       
        <div className={styles.searchItem}>
             <h1 className={styles.headingTitle}>Acervo Arpa</h1>
        </div>
        
        <div className={styles.mainContent}>
            
            <Carousel items={photos} />
            <Gallery photos={photos} />

        </div>


    </div>
  );
}

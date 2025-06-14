// components/archive/Carousel.jsx
"use client";
import { useRef, useEffect, useState } from "react";
import styles from "./Carousel.module.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Carousel() {
  const slideRef = useRef(null);
  const [murals, setMurals] = useState([]);

  useEffect(() => {
    const fetchMurals = async () => {
      try {
        const response = await fetch('/api/murales');
        if (!response.ok) throw new Error("Error fetching data");

        const data = await response.json();
        setMurals(data.murales); // ← Acceso correcto al array de murales
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchMurals();
  }, []);

  const next = () => {
    const first = slideRef.current.children[0];
    slideRef.current.appendChild(first);
  };

  const prev = () => {
    const last = slideRef.current.children[slideRef.current.children.length - 1];
    slideRef.current.prepend(last);
  };

  return (
    <div className={styles.container}>
      <div className={styles.slide} ref={slideRef}>
        {murals.map((mural) => (
          <div
            key={mural.id}
            className={styles.item}
            style={{ backgroundImage: `url(${mural.url_imagen})` }}
          >
            <div className={styles.content}>
              <div className={styles.name}>{mural.nombre}</div>
              <div className={styles.des}>
                {mural.autor ? `Autor: ${mural.autor}` : "Autor desconocido"}
                <br />
                Año: {mural.anio}
                <br />
                Ubicación: {mural.ubicacion}
              </div>
              <button>See More</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.button}>
        <button onClick={prev} className={styles.prev}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button onClick={next} className={styles.next}>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
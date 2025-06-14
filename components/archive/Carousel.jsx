// Carousel.jsx
"use client";
import { useRef } from "react";
import styles from "./Carousel.module.css";
import "@fortawesome/fontawesome-free/css/all.min.css";



export default function Carousel({items}) {
  const slideRef = useRef(null);

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
        {items.map((item, i) => (
          <div
            key={i}
            className={styles.item}
            style={{ backgroundImage: `url(${item.src})` }}
          >
            <div className={styles.content}>
              <div className={styles.name}>{item.title}</div>
              <div className={styles.des}>{item.autor}</div>
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
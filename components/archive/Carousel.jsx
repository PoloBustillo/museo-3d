// Carousel.jsx
"use client";
import { useRef } from "react";
import styles from "./Carousel.module.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const items = [
  {
    title: "Switzerland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    image: "https://i.ibb.co/qCkd9jS/img1.jpg",
  },
  {
    title: "Finland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    image: "https://i.ibb.co/jrRb11q/img2.jpg",
  },
  {
    title: "Iceland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    image: "https://i.ibb.co/NSwVv8D/img3.jpg",
  },
  {
    title: "Australia",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    image: "https://i.ibb.co/Bq4Q0M8/img4.jpg",
  },
  {
    title: "Netherland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    image: "https://i.ibb.co/jTQfmTq/img5.jpg",
  },
  {
    title: "Ireland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    image: "https://i.ibb.co/RNkk6L0/img6.jpg",
  },
];

export default function Carousel() {
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
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div className={styles.content}>
              <div className={styles.name}>{item.title}</div>
              <div className={styles.des}>{item.description}</div>
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
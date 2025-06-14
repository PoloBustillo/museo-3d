"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AuthModal from "./components/AuthModal";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedTriangleOverlay from "./components/TriangleOverlay";

const steps = [
  {
    img: "/images/Origen.webp",
    text: "Bienvenido a la experiencia del Mural Arpa, explora y descubre su historia.",
  },
  {
    img: "/images/Impulso_Humano_Creador.webp",
    text: "Visita nuestra galería de arte y conoce a los artistas detrás de las obras.",
  },
  {
    img: "/images/CCU_15_años_de_Arte_y_Cultura.webp",
    text: "Inicia sesión para subir tus propias obras de arte y ser parte de nuestra comunidad.",
  },
];

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [authModal, setAuthModal] = useState(null);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  const fileInputRef = useRef();
  const router = useRouter();

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleSubirArchivo = (e) => {
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => {
      router.push("/crear-sala");
    }, 900);
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setCurrent(Number(e.target.dataset.index));
          }
        });
      },
      { root: containerRef.current, threshold: 0.5 }
    );
    const secs = containerRef.current.querySelectorAll(".section");
    secs.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const side = current % 2 === 0 ? "left" : "right";

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {steps.map((s, i) => (
          <div
            key={i}
            data-index={i}
            className="section snap-center h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${s.img})` }}
          />
        ))}

        <AnimatePresence mode="wait">
          <AnimatedTriangleOverlay
            key={current}
            step={current + 1}
            text={steps[current].text}
            side={side}
            isFinalStep={current === steps.length - 1}
          />
        </AnimatePresence>
      </div>

      {authModal && (
        <AuthModal
          open={!!authModal}
          mode={authModal}
          onClose={(mode) => setAuthModal(mode || null)}
        />
      )}
    </>
  );
}

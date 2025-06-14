"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import AuthModal from "./components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedTriangleOverlay from "./components/TriangleOver";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./components/ui/navigation-menu";

const sections = [
  {
    imageUrl: "/images/Origen.jpg",
    instructions:
      "Bienvenido a la experiencia del Mural Arpa, explora y descubre su historia.",
  },
  {
    imageUrl: "/images/Impulso_Humano_Creador.jpg",
    instructions:
      "Visita nuestra galería de arte y conoce a los artistas detrás de las obras.",
  },
  {
    imageUrl: "/images/CCU_15_años_de_Arte_y_Cultura.jpg",
    instructions:
      "Inicia sesión para subir tus propias obras de arte y ser parte de nuestra comunidad.",
  },
];

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
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
      router.push("/subir-archivo");
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
        className="relative h-screen overflow-y-scroll scroll-smooth snap-y snap-mandatory"
      >
        {sections.map((sec, i) => (
          <div
            key={i}
            data-index={i}
            className="section snap-center h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${sec.imageUrl})` }}
          />
        ))}

        <AnimatePresence mode="wait">
          <AnimatedTriangleOverlay
            key={sections[current].instructions}
            text={sections[current].instructions}
            side={side}
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

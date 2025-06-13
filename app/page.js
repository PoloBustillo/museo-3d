"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import AuthModal from "./components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes
export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
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

  return (
    <>
<<<<<<< Updated upstream
=======
   
>>>>>>> Stashed changes
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 60% 20%, #e3eafc 60%, #b0b6c3 100%)",
          fontFamily: "serif",
        }}
      >
        {/* Banner visual superior */}
        <img
          src="/assets/banner68.jpg"
          alt="Banner Movimiento Estudiantil 68"
          style={{
            width: "100%",
            objectFit: "cover",
            opacity: 0.92,
            minHeight: 180,
            maxHeight: 320,
            marginBottom: 32,
            boxShadow: "0 4px 32px #0002",
            borderRadius: "0 0 32px 32px",
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: 16,
            color: "#1a237e",
            letterSpacing: 1,
            textShadow: "0 2px 12px #fff8",
          }}
        >
          Acervo Virtual del Movimiento Estudiantil de 1968
        </h1>
        <p
          style={{
            maxWidth: 540,
            color: "#222",
            fontSize: 18,
            marginBottom: 32,
            textAlign: "center",
            background: "#fff9",
            borderRadius: 12,
            padding: "1em 2em",
            boxShadow: "0 2px 16px #0001",
          }}
        >
          Comparte, resguarda y explora documentos, imágenes, audios y videos
          históricos del movimiento estudiantil del 68. Este espacio busca
          preservar la memoria colectiva y facilitar el acceso abierto al acervo
          digital.
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Link href="/museo">
            <button
              style={{
                padding: "1em 2.5em",
                fontSize: "1.3em",
                borderRadius: 10,
                background: "#222",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 2px 12px #0002",
              }}
            >
              Entrar al Museo 3D
            </button>
          </Link>
        </nav>
      </main>
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

"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import AuthModal from "./components/AuthModal";
import { motion } from "framer-motion";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
  const fileInputRef = useRef();

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

  return (
    <>
      {/* Menú superior sticky */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          background: "rgba(34, 34, 34, 0.97)",
          color: "#fff",
          zIndex: 100,
          boxShadow: "0 2px 12px #0002",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.7em 2.5em",
          fontSize: 18,
          fontWeight: "bold",
          letterSpacing: 0.5,
          backdropFilter: "blur(4px)",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: "bold",
            letterSpacing: 1,
            color: "#ffe082",
          }}
        >
          Acervo 68
        </span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <button
            onClick={() => setAuthModal("login")}
            style={{
              color: "#fff",
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setAuthModal("register")}
            style={{
              color: "#fff",
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Crear cuenta
          </button>
          <Link href="#about" style={{ color: "#fff", textDecoration: "none" }}>
            Acerca de nosotros
          </Link>
          <Link
            href="/subir-archivo"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            <button
              style={{
                background: "#3949ab",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.5em 1.2em",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 16,
                boxShadow: "0 2px 8px #0002",
              }}
            >
              Subir tu archivo
            </button>
          </Link>
          <Link
            href="/museo"
            style={{
              color: "#fff",
              textDecoration: "none",
              background: "#222",
              padding: "0.5em 1.2em",
              borderRadius: 8,
              fontWeight: "bold",
              boxShadow: "0 2px 8px #0002",
            }}
          >
            Museo 3D
          </Link>
        </div>
      </nav>
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
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            width: "100%",
            maxHeight: 320,
            overflow: "hidden",
            marginBottom: 32,
            boxShadow: "0 4px 32px #0002",
            borderRadius: "0 0 32px 32px",
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/assets/banner68.jpg"
            alt="Banner Movimiento Estudiantil 68"
            style={{
              width: "100%",
              objectFit: "cover",
              opacity: 0.92,
              minHeight: 180,
              maxHeight: 320,
            }}
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            fontSize: "2.5rem",
            marginBottom: 16,
            color: "#1a237e",
            letterSpacing: 1,
            textShadow: "0 2px 12px #fff8",
          }}
        >
          Acervo Virtual del Movimiento Estudiantil de 1968
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
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
        </motion.p>
        <motion.nav
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
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
        </motion.nav>
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

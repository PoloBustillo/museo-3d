"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import AuthModal from "./AuthModal";

export default function MainMenu({ onSubirArchivo, onNavigate }) {
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'
  const fileInputRef = useRef();

  return (
    <>
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
          <a
            href="#about"
            style={{ color: "#fff", textDecoration: "none" }}
            onClick={onNavigate ? (e) => onNavigate(e, "#about") : undefined}
          >
            Acerca de nosotros
          </a>
          <button
            onClick={onSubirArchivo}
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
          <a
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
            onClick={onNavigate ? (e) => onNavigate(e, "/museo") : undefined}
          >
            Museo 3D
          </a>
        </div>
      </nav>
      <AuthModal
        open={!!authModal}
        mode={authModal}
        onClose={() => setAuthModal(null)}
      />
    </>
  );
}

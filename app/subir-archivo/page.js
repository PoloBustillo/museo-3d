"use client";
import { useRef, useState } from "react";
import Link from "next/link";

export default function SubirArchivo() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "2em 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 32px #0001",
          padding: "2.5em 2em",
          marginTop: 32,
        }}
      >
        <h2 style={{ color: "#1a237e", marginBottom: 24, textAlign: "center" }}>
          Subir archivo al acervo
        </h2>
        <form style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <label style={{ fontWeight: "bold", color: "#222" }}>
            Nombre del autor/a
            <input
              type="text"
              placeholder="Ej: Elena Poniatowska"
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #bbb",
                width: "100%",
                marginTop: 4,
              }}
            />
          </label>
          <label style={{ fontWeight: "bold", color: "#222" }}>
            Título del archivo
            <input
              type="text"
              placeholder="Ej: Volante original 1968"
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #bbb",
                width: "100%",
                marginTop: 4,
              }}
            />
          </label>
          <label style={{ fontWeight: "bold", color: "#222" }}>
            Año
            <input
              type="number"
              placeholder="Ej: 1968"
              min="1900"
              max="2100"
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #bbb",
                width: 120,
                marginTop: 4,
              }}
            />
          </label>
          <label style={{ fontWeight: "bold", color: "#222" }}>
            Descripción, contexto, etc.
            <textarea
              placeholder="Breve descripción del archivo, contexto histórico, etc."
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #bbb",
                width: "100%",
                minHeight: 60,
                marginTop: 4,
                resize: "vertical",
              }}
            />
          </label>
          <label style={{ fontWeight: "bold", color: "#222" }}>
            Selecciona uno o más archivos
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: "block", marginTop: 8 }}
              onChange={handleFileChange}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "0.7em 2em",
              fontSize: "1.1em",
              borderRadius: 8,
              background: "#222",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              marginTop: 8,
            }}
          >
            Subir
          </button>
        </form>
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: 18, textAlign: "left" }}>
            <b>Archivos seleccionados:</b>
            <ul
              style={{
                margin: "8px 0 0 0",
                padding: 0,
                listStyle: "none",
                fontSize: 15,
              }}
            >
              {uploadedFiles.map((file, idx) => (
                <li key={idx} style={{ marginBottom: 4, color: "#222" }}>
                  <span style={{ fontWeight: "bold", color: "#3949ab" }}>
                    {file.name}
                  </span>{" "}
                  <span style={{ color: "#888", fontSize: 13 }}>
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "#3949ab",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

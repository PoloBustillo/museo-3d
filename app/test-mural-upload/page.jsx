"use client";
import { useState } from "react";

export default function TestMuralUpload() {
  const [form, setForm] = useState({
    nombre: "",
    tecnica: "",
    anio: "",
    ubicacion: "",
    autor: "",
    colaboradores: "",
    medidas: "",
    salaId: "",
    imagen: null,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    const res = await fetch("/api/murales", {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    setResult(json);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Test Crear Mural (con upload)</h2>
      <form onSubmit={handleSubmit}>
        <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input name="tecnica" placeholder="Técnica" onChange={handleChange} required />
        <input name="anio" placeholder="Año" type="number" onChange={handleChange} required />
        <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} required />
        <input name="autor" placeholder="Autor" onChange={handleChange} />
        <input name="colaboradores" placeholder="Colaboradores" onChange={handleChange} />
        <input name="medidas" placeholder="Medidas" onChange={handleChange} />
        <input name="salaId" placeholder="Sala ID" type="number" onChange={handleChange} />
        <input name="imagen" type="file" accept="image/*" onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Cargando..." : "Crear mural"}</button>
      </form>
      {result && (
        <pre style={{ marginTop: 16, background: "#f6f6f6", padding: 12, borderRadius: 4 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre de la sala es obligatorio"),
  murales: yup.array().of(yup.number()),
});

export default function CrearSala() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { murales: [] },
  });

  const [files, setFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [addingMural, setAddingMural] = useState(false);
  const [muralForm, setMuralForm] = useState({
    nombre: "",
    tecnica: "",
    anio: "",
    autor: "",
    imagen: null,
  });
  const [view, setView] = useState("crear");
  const [selectedSala, setSelectedSala] = useState(null);
  const [loadingSalas, setLoadingSalas] = useState(false);
  const [murales, setMurales] = useState([]);
  const [loadingMurales, setLoadingMurales] = useState(false);

  const selectedMurales = watch("murales") || [];

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [setFiles]
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
  });

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Subir mural a la API
  const uploadMural = async (muralData) => {
    const formData = new FormData();
    Object.entries(muralData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    // Asegurar que ubicacion siempre esté presente
    if (!formData.has("ubicacion")) formData.append("ubicacion", "");
    if (muralData.imagen) formData.append("imagen", muralData.imagen);
    const res = await fetch("/api/murales", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Error al subir mural");
    return res.json();
  };

  // Crear sala y asociar murales
  const onSubmit = async (data) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Debes iniciar sesión para crear una sala");
      return;
    }
    try {
      // Subir murales nuevos primero
      let nuevosMuralesIds = [];
      for (const file of files) {
        const muralData = { ...muralForm, imagen: file, nombre: file.name };
        const mural = await uploadMural(muralData);
        nuevosMuralesIds.push(mural.id);
      }
      // Combinar con murales seleccionados existentes
      const allMurales = [...(data.murales || []), ...nuevosMuralesIds];
      // Crear sala
      const response = await fetch("/api/salas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.nombre,
          ownerId: user.id,
          murales: allMurales,
        }),
      });
      if (response.ok) {
        toast.success("¡Sala creada exitosamente!");
        reset();
        setFiles([]);
        setMuralForm({
          nombre: "",
          tecnica: "",
          anio: "",
          autor: "",
          imagen: null,
        });
        if (view === "mis-salas") setView("mis-salas");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al crear la sala");
      }
    } catch (error) {
      toast.error("Error al crear la sala o subir murales");
    }
  };

  // Función para agregar o quitar murales a una sala existente
  const addMuralesToSala = async (salaId, muralesIds) => {
    try {
      const response = await fetch(`/api/salas/${salaId}/murales`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ murales: muralesIds }),
      });
      if (!response.ok)
        throw new Error("Error al actualizar murales de la sala");
      toast.success("Murales actualizados en la sala");
    } catch (error) {
      toast.error("Error al actualizar murales en la sala");
    }
  };

  // Cargar murales disponibles
  useEffect(() => {
    const fetchMurales = async () => {
      setLoadingMurales(true);
      try {
        const res = await fetch("/api/murales");
        if (res.ok) {
          const data = await res.json();
          setMurales(data.murales || []);
        }
      } catch (error) {
        toast.error("Error al cargar murales");
      } finally {
        setLoadingMurales(false);
      }
    };
    fetchMurales();
  }, []);

  // Alternar selección de murales existentes
  const handleMuralToggle = (muralId) => {
    const currentMurales = selectedMurales || [];
    const isSelected = currentMurales.includes(muralId);
    if (isSelected) {
      setValue(
        "murales",
        currentMurales.filter((id) => id !== muralId)
      );
    } else {
      setValue("murales", [...currentMurales, muralId]);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 mt-10 border border-indigo-100"
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-900 mb-8 tracking-tight drop-shadow">
          Crear nueva sala y añadir murales
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Nombre de la sala
            </label>
            <input
              {...register("nombre")}
              className="w-full border border-indigo-200 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition placeholder-gray-400"
              placeholder="Ej: Sala de Murales Modernos"
            />
            {errors.nombre && (
              <p className="text-red-600 text-sm mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Selecciona murales existentes para añadir
            </label>
            <div className="flex flex-wrap gap-2">
              {murales.map((mural) => (
                <button
                  type="button"
                  key={mural.id}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium shadow-sm transition-all duration-150 ${
                    selectedMurales.includes(mural.id)
                      ? "bg-indigo-600 text-white border-indigo-600 scale-105"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-400"
                  }`}
                  onClick={() => handleMuralToggle(mural.id)}
                >
                  {mural.nombre}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Sube nuevos murales (imágenes)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              {files && files.length > 0 ? (
                <ul className="mt-2 text-left text-sm">
                  {files.map((file, idx) => (
                    <li
                      key={idx}
                      className="text-gray-800 flex items-center gap-2 mb-1"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded shadow border border-gray-200"
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      />
                      <span className="font-semibold text-indigo-700">
                        {file.name}
                      </span>
                      <span className="text-gray-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">
                  Arrastra imágenes aquí o haz click para seleccionar
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Técnica"
              value={muralForm.tecnica}
              onChange={(e) =>
                setMuralForm((f) => ({ ...f, tecnica: e.target.value }))
              }
              className="border border-indigo-200 bg-white text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
            />
            <input
              type="number"
              placeholder="Año"
              value={muralForm.anio}
              onChange={(e) =>
                setMuralForm((f) => ({ ...f, anio: e.target.value }))
              }
              className="border border-indigo-200 bg-white text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Autor"
              value={muralForm.autor}
              onChange={(e) =>
                setMuralForm((f) => ({ ...f, autor: e.target.value }))
              }
              className="border border-indigo-200 bg-white text-gray-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-500 text-white font-bold shadow-lg hover:from-indigo-800 hover:to-indigo-600 transition disabled:opacity-60 text-lg tracking-wide"
          >
            {isSubmitting ? "Enviando..." : "Crear sala y subir murales"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-700 underline font-bold">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
      {/* Sección para modificar salas existentes */}
      {view === "mis-salas" && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 mt-12 border border-indigo-100"
        >
          <h2 className="text-2xl font-bold text-indigo-900 mb-6">Mis salas</h2>
          {loadingSalas ? (
            <div className="text-center text-gray-500">Cargando salas...</div>
          ) : salas.length === 0 ? (
            <div className="text-center text-gray-500">
              No tienes salas creadas.
            </div>
          ) : (
            <div className="space-y-8">
              {salas.map((sala) => (
                <div
                  key={sala.id}
                  className="border border-indigo-100 rounded-2xl p-6 bg-white/80 shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-indigo-800">
                      {sala.nombre}
                    </span>
                    <button
                      className="text-sm text-indigo-600 underline hover:text-indigo-900 transition"
                      onClick={() =>
                        setSelectedSala(
                          selectedSala === sala.id ? null : sala.id
                        )
                      }
                    >
                      {selectedSala === sala.id ? "Ocultar" : "Editar murales"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {sala.murales.map((mural) => (
                      <span
                        key={mural.id}
                        className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-semibold shadow-sm"
                      >
                        {mural.nombre}
                      </span>
                    ))}
                  </div>
                  {selectedSala === sala.id && (
                    <div className="mt-2">
                      <div className="mb-2 font-semibold">
                        Añadir o quitar murales:
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {murales.map((mural) => {
                          const isInSala = sala.murales.some(
                            (m) => m.id === mural.id
                          );
                          return (
                            <button
                              key={mural.id}
                              type="button"
                              className={`px-4 py-2 rounded-xl border text-sm font-medium shadow-sm transition-all duration-150 ${
                                isInSala
                                  ? "bg-indigo-600 text-white border-indigo-600 scale-105"
                                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-400"
                              }`}
                              onClick={async () => {
                                let nuevosMurales;
                                if (isInSala) {
                                  nuevosMurales = sala.murales
                                    .filter((m) => m.id !== mural.id)
                                    .map((m) => m.id);
                                } else {
                                  nuevosMurales = [
                                    ...sala.murales.map((m) => m.id),
                                    mural.id,
                                  ];
                                }
                                await addMuralesToSala(sala.id, nuevosMurales);
                              }}
                            >
                              {mural.nombre}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          className="px-5 py-2 rounded-xl bg-indigo-100 text-indigo-900 font-bold shadow hover:bg-indigo-200 transition"
          onClick={() => setView("crear")}
        >
          Crear nueva sala
        </button>
        <button
          className="px-5 py-2 rounded-xl bg-indigo-700 text-white font-bold shadow hover:bg-indigo-800 transition"
          onClick={() => setView("mis-salas")}
        >
          Ver y editar mis salas
        </button>
      </div>
    </main>
  );
}

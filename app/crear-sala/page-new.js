"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { YearPicker } from "../components/ui/date-picker";
import { X } from "lucide-react";

// Componentes de fondo animado (copiados de acerca-de)
function AnimatedBlobsBackground() {
  return (
    <>
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-orange-300/60 dark:bg-orange-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-pink-300/60 dark:bg-pink-700/30 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe-delayed" />
      <div
        className="absolute top-1/2 left-1/2 w-[340px] h-[340px] bg-fuchsia-200/50 dark:bg-fuchsia-800/20 rounded-full mix-blend-multiply filter blur-[100px] animate-breathe"
        style={{ transform: "translate(-50%,-50%) scale(1.2)" }}
      />
    </>
  );
}

function DotsPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden dark:block"
      width="100%"
      height="100%"
      style={{ opacity: 0.13 }}
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre de la sala es obligatorio"),
  murales: yup.array().of(yup.number()),
});

export default function CrearSala() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();
  const [globalMousePosition, setGlobalMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [hasActiveGlow, setHasActiveGlow] = useState(false);

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
  const [selectedMurales, setSelectedMurales] = useState([]);
  const [selectedMuralForAdd, setSelectedMuralForAdd] = useState("");
  const [salas, setSalas] = useState([]);

  // Manejar posición global del mouse para el glow
  const handleGlobalMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlobalMousePosition({ x, y });

    // Actualizar las variables CSS para la posición del glow
    document.documentElement.style.setProperty("--global-mouse-x", `${x}%`);
    document.documentElement.style.setProperty("--global-mouse-y", `${y}%`);
  }, []);

  const handleGlobalMouseEnter = useCallback(() => {
    setHasActiveGlow(true);
  }, []);

  const handleGlobalMouseLeave = useCallback(() => {
    setHasActiveGlow(false);
  }, []);

  // Añadir mural seleccionado del dropdown
  const handleAddMural = () => {
    if (
      selectedMuralForAdd &&
      !selectedMurales.includes(parseInt(selectedMuralForAdd))
    ) {
      const newMurales = [...selectedMurales, parseInt(selectedMuralForAdd)];
      setSelectedMurales(newMurales);
      setValue("murales", newMurales);
      setSelectedMuralForAdd("");
    }
  };

  // Remover mural seleccionado
  const handleRemoveMural = (muralId) => {
    const newMurales = selectedMurales.filter((id) => id !== muralId);
    setSelectedMurales(newMurales);
    setValue("murales", newMurales);
  };

  const watchedMurales = watch("murales");

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

  useEffect(() => {
    if (!session) {
      toast.error("Debes iniciar sesión para crear una sala");
      router.push("/");
      return;
    }
  }, [session, router]);

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

  // Función para agregar murales a una sala existente
  const addMuralesToSala = async (salaId, nuevosMurales) => {
    try {
      const response = await fetch(`/api/salas/${salaId}/murales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          murales: nuevosMurales,
        }),
      });

      if (response.ok) {
        toast.success("Murales actualizados en la sala");
        // Recargar salas para mostrar cambios
        fetchSalas();
      } else {
        toast.error("Error al actualizar murales");
      }
    } catch (error) {
      console.error("Error updating murales:", error);
      toast.error("Error de conexión");
    }
  };

  // Función para cargar salas del usuario
  const fetchSalas = async () => {
    if (!session?.user?.id) return;

    setLoadingSalas(true);
    try {
      const res = await fetch(`/api/salas?creadorId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSalas(data.salas || []);
      }
    } catch (error) {
      toast.error("Error al cargar salas");
    } finally {
      setLoadingSalas(false);
    }
  };

  // Cargar salas cuando se cambia a la vista mis-salas
  useEffect(() => {
    if (view === "mis-salas") {
      fetchSalas();
    }
  }, [view, session]);

  const onSubmit = async (data) => {
    if (!session?.user?.id) {
      toast.error("Debes iniciar sesión para crear una sala");
      return;
    }

    setLoadingSalas(true);
    try {
      // Crear la sala
      const response = await fetch("/api/salas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: data.nombre,
          descripcion: data.descripcion,
          publica: data.publica || false,
          creadorId: session.user.id,
          murales: selectedMurales,
          colaboradores: [],
        }),
      });

      if (response.ok) {
        const salaData = await response.json();
        toast.success("Sala creada exitosamente");

        // Si hay murales seleccionados, agregarlos a la sala
        if (selectedMurales.length > 0) {
          const muralResponse = await fetch(
            `/api/salas/${salaData.id}/murales`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                murales: selectedMurales,
              }),
            }
          );

          if (muralResponse.ok) {
            toast.success(
              `${selectedMurales.length} murales agregados a la sala`
            );
          }
        }

        router.push(`/museo`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al crear la sala");
      }
    } catch (error) {
      console.error("Error creating sala:", error);
      toast.error("Error de conexión");
    } finally {
      setLoadingSalas(false);
    }
  };

  if (!session) {
    return (
      <div className="relative min-h-screen">
        {/* Fondo animado y patrones */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AnimatedBlobsBackground />
          <DotsPattern />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fondo animado y patrones */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBlobsBackground />
        <DotsPattern />
      </div>

      <div
        className={`gallery-grid relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-24 md:pt-28 pb-8 md:pb-12 ${
          hasActiveGlow ? "has-active-glow" : ""
        }`}
        onMouseMove={handleGlobalMouseMove}
        onMouseEnter={handleGlobalMouseEnter}
        onMouseLeave={handleGlobalMouseLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-2xl mx-auto mb-12"
        >
          <div className="gallery-card-glow bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border p-8">
            <h2 className="text-3xl font-extrabold text-center text-foreground mb-8 tracking-tight">
              Crear nueva sala y añadir murales
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div>
                <label className="block font-semibold text-foreground dark:text-gray-200 mb-2">
                  Nombre de la sala
                </label>
                <input
                  {...register("nombre")}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Ej: Sala de Murales Modernos"
                />
                {errors.nombre && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground dark:text-gray-200 mb-2">
                  Seleccionar murales existentes
                </label>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <Select
                      value={selectedMuralForAdd}
                      onValueChange={setSelectedMuralForAdd}
                      placeholder="Selecciona un mural..."
                    >
                      <SelectContent>
                        {murales
                          .filter((m) => !selectedMurales.includes(m.id))
                          .map((mural) => (
                            <SelectItem
                              key={mural.id}
                              value={mural.id.toString()}
                            >
                              {mural.titulo}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMural}
                    disabled={!selectedMuralForAdd}
                    className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Añadir
                  </button>
                </div>

                {/* Murales seleccionados como badges */}
                {selectedMurales.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMurales.map((muralId) => {
                      const mural = murales.find((m) => m.id === muralId);
                      return mural ? (
                        <Badge
                          key={muralId}
                          variant="blue"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {mural.titulo}
                          <button
                            type="button"
                            onClick={() => handleRemoveMural(muralId)}
                            className="ml-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground dark:text-gray-200 mb-2">
                  Sube nuevos murales (imágenes)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {files && files.length > 0 ? (
                    <ul className="mt-2 text-left text-sm">
                      {files.map((file, idx) => (
                        <li
                          key={idx}
                          className="text-foreground flex items-center gap-2 mb-1"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded shadow border border-gray-200 dark:border-gray-600"
                            onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                          />
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                            {file.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
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
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-foreground rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <YearPicker
                  value={muralForm.anio}
                  onChange={(anio) => setMuralForm((f) => ({ ...f, anio }))}
                  placeholder="Año"
                />
                <input
                  type="text"
                  placeholder="Autor"
                  value={muralForm.autor}
                  onChange={(e) =>
                    setMuralForm((f) => ({ ...f, autor: e.target.value }))
                  }
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800 text-foreground rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500 col-span-2"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 py-3 px-8 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-500 text-white font-bold shadow-lg hover:from-indigo-800 hover:to-indigo-600 hover:shadow-xl transition-all duration-200 disabled:opacity-60 text-lg tracking-wide transform hover:scale-105"
              >
                {isSubmitting ? "Enviando..." : "Crear sala y subir murales"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-indigo-700 dark:text-indigo-300 underline font-bold hover:text-indigo-800 dark:hover:text-indigo-200 transition"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Sección para modificar salas existentes */}
        {view === "mis-salas" && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="gallery-card-glow bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Mis salas
              </h2>
              {loadingSalas ? (
                <div className="text-center text-muted-foreground">
                  Cargando salas...
                </div>
              ) : salas?.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No tienes salas creadas.
                </div>
              ) : (
                <div className="space-y-8">
                  {salas?.map((sala) => (
                    <div
                      key={sala.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-2xl p-6 bg-white/50 dark:bg-neutral-800/50 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg text-foreground">
                          {sala.nombre}
                        </span>
                        <button
                          className="text-sm text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-900 dark:hover:text-indigo-200 transition"
                          onClick={() =>
                            setSelectedSala(
                              selectedSala === sala.id ? null : sala.id
                            )
                          }
                        >
                          {selectedSala === sala.id
                            ? "Ocultar"
                            : "Editar murales"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {sala.murales?.map((mural) => (
                          <Badge
                            key={mural.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {mural.titulo}
                          </Badge>
                        ))}
                      </div>
                      {selectedSala === sala.id && (
                        <div className="mt-2">
                          <div className="mb-2 font-semibold text-foreground">
                            Añadir o quitar murales:
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {murales.map((mural) => {
                              const isInSala = sala.murales?.some(
                                (m) => m.id === mural.id
                              );
                              return (
                                <button
                                  key={mural.id}
                                  type="button"
                                  className={`px-4 py-2 rounded-xl border text-sm font-medium shadow-sm transition-all duration-200 ${
                                    isInSala
                                      ? "bg-indigo-600 text-white border-indigo-600 scale-105 shadow-lg"
                                      : "bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 hover:scale-102"
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
                                    await addMuralesToSala(
                                      sala.id,
                                      nuevosMurales
                                    );
                                  }}
                                >
                                  {mural.titulo}
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
            </div>
          </motion.div>
        )}

        <div className="mt-12 flex gap-4 justify-center">
          <button
            className="gallery-card-glow px-6 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 text-indigo-900 dark:text-white font-bold shadow-lg hover:bg-white dark:hover:bg-neutral-700 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            onClick={() => setView("crear")}
          >
            Crear nueva sala
          </button>
          <button
            className="gallery-card-glow px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-500 text-white font-bold shadow-lg hover:from-indigo-800 hover:to-indigo-600 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            onClick={() => setView("mis-salas")}
          >
            Ver y editar mis salas
          </button>
        </div>
      </div>
    </div>
  );
}

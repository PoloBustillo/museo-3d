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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { DatePicker } from "../components/ui/date-picker";
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
    fecha: "",
    autor: "",
    imagen: null,
  });
  const [salaConfig, setSalaConfig] = useState({
    textura: "moderna",
    colorParedes: "blanco",
    tipoIluminacion: "natural",
    musica: "ninguna",
    ambiente: "minimalista",
    archivoPersonalizado: null,
  });
  const [view, setView] = useState("crear");
  const [murales, setMurales] = useState([]);
  const [loadingMurales, setLoadingMurales] = useState(false);
  const [selectedMurales, setSelectedMurales] = useState([]);
  const [selectedMuralForAdd, setSelectedMuralForAdd] = useState("");

  // Manejar archivo personalizado para características de sala
  const handleCustomFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSalaConfig((prev) => ({ ...prev, archivoPersonalizado: file }));
    }
  };

  // Remover archivo personalizado
  const removeCustomFile = () => {
    setSalaConfig((prev) => ({ ...prev, archivoPersonalizado: null }));
  };

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

  const onSubmit = async (data) => {
    if (!session?.user?.id) {
      toast.error("Debes iniciar sesión para crear una sala");
      return;
    }

    setLoadingMurales(true);
    try {
      // Preparar la configuración de la sala incluyendo el archivo personalizado
      const salaConfigToSend = { ...salaConfig };

      // Si hay un archivo personalizado, convertirlo a base64 o manejarlo de manera apropiada
      if (salaConfig.archivoPersonalizado) {
        // Aquí podrías subir el archivo a Cloudinary o manejarlo según tu backend
        salaConfigToSend.archivoPersonalizado = {
          name: salaConfig.archivoPersonalizado.name,
          size: salaConfig.archivoPersonalizado.size,
          type: salaConfig.archivoPersonalizado.type,
        };
      }

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
          configuracion: salaConfigToSend,
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
      setLoadingMurales(false);
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
          className="w-full max-w-7xl mx-auto mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Formulario principal */}
            <div className="lg:col-span-2">
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
                          {murales
                            .filter((m) => !selectedMurales.includes(m.id))
                            .map((mural) => (
                              <SelectItem
                                key={mural.id}
                                value={mural.id.toString()}
                                image={mural.url_imagen}
                                description={`${
                                  mural.autor || "Autor desconocido"
                                } • ${mural.tecnica || "Técnica desconocida"}`}
                              >
                                {mural.titulo || `Mural ${mural.id}`}
                              </SelectItem>
                            ))}
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
                                onLoad={(e) =>
                                  URL.revokeObjectURL(e.target.src)
                                }
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
                    <DatePicker
                      value={muralForm.fecha}
                      onChange={(fecha) =>
                        setMuralForm((f) => ({ ...f, fecha }))
                      }
                      placeholder="Fecha de creación"
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
                    {isSubmitting
                      ? "Enviando..."
                      : "Crear sala y subir murales"}
                  </button>
                </form>

                <div className="mt-8 text-center space-y-2">
                  <Link
                    href="/mis-obras"
                    className="text-indigo-700 dark:text-indigo-300 underline font-medium hover:text-indigo-800 dark:hover:text-indigo-200 transition block"
                  >
                    Ver mis salas existentes
                  </Link>
                  <Link
                    href="/"
                    className="text-gray-600 dark:text-gray-400 underline font-medium hover:text-gray-800 dark:hover:text-gray-200 transition block"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar de características de la sala */}
            <div className="lg:col-span-1">
              <div className="gallery-card-glow bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border p-6">
                <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                  Características de la Sala
                </h3>

                <div className="space-y-4">
                  {/* Textura de paredes con preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Textura de paredes
                    </label>
                    <select
                      value={salaConfig.textura}
                      onChange={(e) =>
                        setSalaConfig((prev) => ({
                          ...prev,
                          textura: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-neutral-700 text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    >
                      <option value="moderna">🏢 Moderna lisa</option>
                      <option value="ladrillo">🧱 Ladrillo expuesto</option>
                      <option value="concreto">🏭 Concreto industrial</option>
                      <option value="madera">🌳 Paneles de madera</option>
                      <option value="marmol">💎 Mármol</option>
                      <option value="rustica">🪨 Textura rústica</option>
                    </select>
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Vista previa:{" "}
                        <span className="font-medium capitalize">
                          {salaConfig.textura.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Color de paredes con preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color de paredes
                    </label>
                    <select
                      value={salaConfig.colorParedes}
                      onChange={(e) =>
                        setSalaConfig((prev) => ({
                          ...prev,
                          colorParedes: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-neutral-700 text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    >
                      <option value="blanco">⚪ Blanco puro</option>
                      <option value="gris-claro">🔘 Gris claro</option>
                      <option value="gris-oscuro">⚫ Gris oscuro</option>
                      <option value="negro">⚫ Negro</option>
                      <option value="beige">🟤 Beige</option>
                      <option value="azul-marino">🔵 Azul marino</option>
                    </select>
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-neutral-700 rounded-lg flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border border-gray-300 ${
                          salaConfig.colorParedes === "blanco"
                            ? "bg-white"
                            : salaConfig.colorParedes === "gris-claro"
                            ? "bg-gray-300"
                            : salaConfig.colorParedes === "gris-oscuro"
                            ? "bg-gray-600"
                            : salaConfig.colorParedes === "negro"
                            ? "bg-black"
                            : salaConfig.colorParedes === "beige"
                            ? "bg-yellow-100"
                            : "bg-blue-900"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {salaConfig.colorParedes.replace("-", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Iluminación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Iluminación
                    </label>
                    <select
                      value={salaConfig.tipoIluminacion}
                      onChange={(e) =>
                        setSalaConfig((prev) => ({
                          ...prev,
                          tipoIluminacion: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-neutral-700 text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    >
                      <option value="natural">☀️ Luz natural</option>
                      <option value="led-calida">💡 LED cálida</option>
                      <option value="led-fria">🔆 LED fría</option>
                      <option value="neon">🌈 Neón colorido</option>
                      <option value="dramatica">🎭 Dramática (spots)</option>
                      <option value="tenue">🕯️ Tenue y suave</option>
                    </select>
                  </div>

                  {/* Música ambiente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Música ambiente
                    </label>
                    <select
                      value={salaConfig.musica}
                      onChange={(e) =>
                        setSalaConfig((prev) => ({
                          ...prev,
                          musica: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-neutral-700 text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    >
                      <option value="ninguna">🔇 Sin música</option>
                      <option value="clasica">🎼 Clásica suave</option>
                      <option value="jazz">🎷 Jazz instrumental</option>
                      <option value="ambient">🌊 Música ambient</option>
                      <option value="electronica">🎧 Electrónica suave</option>
                      <option value="naturaleza">
                        🍃 Sonidos de naturaleza
                      </option>
                    </select>
                  </div>

                  {/* Ambiente general */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ambiente general
                    </label>
                    <select
                      value={salaConfig.ambiente}
                      onChange={(e) =>
                        setSalaConfig((prev) => ({
                          ...prev,
                          ambiente: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-neutral-700 text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    >
                      <option value="minimalista">
                        ✨ Minimalista y limpio
                      </option>
                      <option value="industrial">🏭 Industrial urbano</option>
                      <option value="clasico">🏛️ Clásico elegante</option>
                      <option value="bohemio">🎨 Bohemio artístico</option>
                      <option value="futurista">
                        🚀 Futurista y tecnológico
                      </option>
                      <option value="rustico">🌿 Rústico y acogedor</option>
                    </select>
                  </div>

                  {/* Archivo personalizado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Archivo personalizado (opcional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      {salaConfig.archivoPersonalizado ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {salaConfig.archivoPersonalizado.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(
                                salaConfig.archivoPersonalizado.size / 1024
                              )}{" "}
                              KB
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCustomFile}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id="customFile"
                            onChange={handleCustomFileUpload}
                            accept=".jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.mov"
                            className="hidden"
                          />
                          <label
                            htmlFor="customFile"
                            className="cursor-pointer text-center block"
                          >
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              📁 Subir imagen, audio o video
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Para personalizar tu sala
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen visual */}
                  <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                      Resumen de tu sala:
                    </h4>
                    <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                      <div>
                        • Paredes: {salaConfig.textura}{" "}
                        {salaConfig.colorParedes}
                      </div>
                      <div>• Luz: {salaConfig.tipoIluminacion}</div>
                      <div>• Sonido: {salaConfig.musica}</div>
                      <div>• Estilo: {salaConfig.ambiente}</div>
                      {salaConfig.archivoPersonalizado && (
                        <div>
                          • Archivo: {salaConfig.archivoPersonalizado.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

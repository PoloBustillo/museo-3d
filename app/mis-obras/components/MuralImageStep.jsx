"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Upload, X, Edit, ImageIcon, Smartphone, Monitor } from "lucide-react";
import Image from "next/image";
import CanvasEditor from "./CanvasEditor";
import { useFileUpload } from "../hooks/useFileUpload";
import { useRouter } from "next/navigation";
import useIsMobile from "../../hooks/useIsMobile";

export default function MuralImageStep({ value, onChange, muralData = {}, editMode = false, obraId = null }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState(0);
  const [localImage, setLocalImage] = useState(null); // base64 o File
  const [canvasImage, setCanvasImage] = useState(null);
  const canvasRef = useRef();

  // Cargar imagen del canvas desde localStorage si existe
  useEffect(() => {
    const savedCanvasImage = localStorage.getItem("canvasImage");
    if (savedCanvasImage) {
      setCanvasImage(savedCanvasImage);
      onChange?.(savedCanvasImage);
      // No limpiar localStorage aquí, dejar que el stepper lo maneje
    }
  }, [onChange]);

  // Configuración de React Dropzone
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLocalImage(ev.target.result);
        setCanvasImage(null);
        onChange?.(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Subida de imagen (solo local, no Cloudinary) - Mantener para compatibilidad
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLocalImage(ev.target.result);
        setCanvasImage(null);
        onChange?.(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar imagen del canvas (base64)
  const handleCanvasSave = (imgDataUrl) => {
    setCanvasImage(imgDataUrl);
    setLocalImage(null);
    onChange?.(imgDataUrl);
  };

  // Función para eliminar imagen
  const handleRemoveImage = () => {
    setLocalImage(null);
    setCanvasImage(null);
    onChange?.(null);
  };

  // Preview: prioriza canvas sobre upload
  const previewUrl = canvasImage || localImage || value;

  // Info de archivo (siempre que haya preview)
  let fileName = null;
  let fileSize = null;
  if (previewUrl) {
    if (typeof previewUrl === "string" && previewUrl.startsWith("data:")) {
      // Imagen generada o seleccionada (base64)
      fileName = canvasImage ? "Imagen generada" : "Imagen seleccionada";
      const b64 = previewUrl.split(",")[1] || "";
      fileSize = Math.round(
        (b64.length * 3) / 4 -
          (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0)
      );
    } else if (
      typeof previewUrl === "object" &&
      previewUrl.name &&
      previewUrl.size
    ) {
      fileName = previewUrl.name;
      fileSize = previewUrl.size;
    } else {
      // Si es una URL (ejemplo: edición de mural existente)
      fileName = "Imagen existente";
      fileSize = null;
    }
  }

  // Custom Tabs UI
  const tabList = [
    {
      label: "Subir imagen",
      icon: <Upload size={20} />,
    },
    {
      label: "Dibujar mural",
      icon: (
        <span role="img" aria-label="Dibujar">
          🎨
        </span>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: 480 }}>
      {/* Custom Tabs */}
      <div className="flex justify-center gap-4 mb-4">
        {tabList.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all font-semibold text-base focus:outline-none
              ${
                tab === i
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-md dark:bg-indigo-500 dark:text-white"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-neutral-800 dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-indigo-300"
              }
            `}
            type="button"
            aria-selected={tab === i}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      
      {tab === 0 && (
        <div>
          {!previewUrl ? (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 mb-2 w-full transition-all cursor-pointer min-h-[300px]
                ${isDragActive && !isDragReject
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                  : isDragReject
                  ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                  : "border-gray-300 bg-gray-50 dark:bg-neutral-900/70 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-400 dark:hover:bg-neutral-800/80"
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 transition-colors ${
                  isDragActive && !isDragReject
                    ? "bg-indigo-100 dark:bg-indigo-800"
                    : isDragReject
                    ? "bg-red-100 dark:bg-red-800"
                    : "bg-gray-100 dark:bg-neutral-800"
                }`}>
                  <Upload size={48} className={`${
                    isDragActive && !isDragReject
                      ? "text-indigo-600"
                      : isDragReject
                      ? "text-red-600"
                      : "text-gray-400"
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDragActive && !isDragReject
                    ? "text-indigo-700 dark:text-indigo-300"
                    : isDragReject
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-100"
                }`}>
                  {isDragActive && !isDragReject
                    ? "¡Suelta la imagen aquí!"
                    : isDragReject
                    ? "Archivo no válido"
                    : "Arrastra y suelta tu imagen"
                  }
                </h3>
                <p className={`mb-4 max-w-md ${
                  isDragActive && !isDragReject
                    ? "text-indigo-600 dark:text-indigo-400"
                    : isDragReject
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {isDragReject
                    ? "Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)"
                    : "O haz clic para seleccionar desde tu dispositivo"
                  }
                </p>
                {!isDragActive && (
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    <span className="font-medium">Formatos soportados:</span> JPG, PNG, GIF, WebP
                    <br />
                    <span className="font-medium">Tamaño máximo:</span> 10MB
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-4">
              {/* Contenedor de imagen con overlay de acciones */}
              <div className="relative group">
                {/* Imagen */}
                <div className="relative overflow-hidden rounded-xl shadow-lg bg-white dark:bg-neutral-800">
                  {previewUrl.startsWith("data:") ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-[400px] max-h-[300px] object-contain"
                    />
                  ) : (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="object-contain"
                    />
                  )}
                  
                  {/* Overlay con acciones al hacer hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                    {/* Botón reemplazar */}
                    <button
                      {...getRootProps()}
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input {...getInputProps()} />
                      <Edit size={16} />
                      Reemplazar
                    </button>
                    
                    {/* Botón eliminar */}
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <X size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Info del archivo */}
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {fileName && <span>{fileName}</span>}
                  {fileName && fileSize !== null && fileSize !== undefined && " · "}
                  {fileSize !== null && fileSize !== undefined && (
                    <span>{(fileSize / 1024).toFixed(1)} KB</span>
                  )}
                </div>
                
                {/* Botones de acción adicionales */}
                <div className="mt-3 flex gap-3 justify-center">
                  <button
                    {...getRootProps()}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    <input {...getInputProps()} />
                    <Edit size={16} />
                    Cambiar imagen
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg transition-colors text-sm font-medium"
                    onClick={handleRemoveImage}
                  >
                    <X size={16} />
                    Quitar imagen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === 1 && (
        <div>
          {/* Botón del editor de dibujo - siempre disponible */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 mb-4 w-full transition-all min-h-[300px]
            border-gray-300 bg-gray-50 dark:bg-neutral-900/70
            hover:border-indigo-400 hover:bg-indigo-50 dark:hover:border-indigo-400 dark:hover:bg-neutral-800/80
          "
          >
            <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
                  <span role="img" aria-label="Dibujar" className="text-4xl">
                    🎨
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-100">
                  {isMobile ? "Editor de dibujo (Solo PC)" : "Editor de dibujo profesional"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
                  {isMobile ? (
                    "El editor de dibujo requiere un ordenador de escritorio o laptop para la mejor experiencia. No está optimizado para dispositivos táctiles."
                  ) : previewUrl ? (
                    "Modifica la imagen actual, dibuja encima o crea una completamente nueva con herramientas profesionales."
                  ) : (
                    "Accede a un editor de dibujo completo con pinceles, capas, y herramientas avanzadas para crear tu obra maestra."
                  )}
                </p>
                
                {isMobile ? (
                  // Mensaje informativo para móviles
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 max-w-md">
                    <div className="flex items-start gap-3 text-amber-700 dark:text-amber-300 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        <Smartphone className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">No disponible en móvil</div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          Para usar el editor de dibujo, accede desde un ordenador o laptop. 
                          Puedes completar el resto de tu obra desde aquí y agregar el dibujo después.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Información normal para desktop
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 max-w-md">
                    <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300 text-sm">
                      <span className="text-amber-500 mt-0.5">ℹ️</span>
                      <div>
                        <strong>Se abrirá en una nueva pantalla.</strong><br />
                        Tus datos del formulario se guardarán automáticamente y podrás continuar aquí cuando termines de dibujar.
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (isMobile) {
                      // En móvil, mostrar mensaje en lugar de navegar
                      alert("El editor de dibujo no está disponible en dispositivos móviles. Por favor, usa un ordenador de escritorio o laptop para acceder a esta función.");
                      return;
                    }
                    
                    // Lógica normal para desktop
                    const currentData = {
                      ...muralData,
                      titulo: muralData.titulo || "",
                      tecnica: muralData.tecnica || "",
                      year: muralData.anio || muralData.year || undefined,
                      descripcion: muralData.descripcion || "",
                      dimensiones: muralData.dimensiones || "",
                      ubicacion: muralData.ubicacion || "",
                      latitud: muralData.latitud || "",
                      longitud: muralData.longitud || "",
                      salaId: muralData.salaId || "",
                      estado: muralData.estado || "",
                      autor: muralData.autor || "",
                      artistId: muralData.artistId || "",
                      colaboradores: muralData.colaboradores || [],
                      tags: muralData.tags || [],
                      publica: muralData.publica,
                      destacada: muralData.destacada,
                      orden: muralData.orden,
                      userId: muralData.userId,
                    };
                    
                    localStorage.setItem(
                      "muralDraftData",
                      JSON.stringify(currentData)
                    );
                    
                    localStorage.setItem("fromStepper", "true");
                    localStorage.setItem("stepperReturnStep", "1");

                    if (editMode && obraId) {
                      router.push(`/mis-obras/editar/${obraId}/canvas`);
                    } else {
                      router.push("/mis-obras/crear/canvas");
                    }
                  }}
                  disabled={isMobile}
                  className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg ${
                    isMobile 
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 cursor-pointer"
                  }`}
                >
                  {isMobile ? (
                    <>
                      <Smartphone size={20} />
                      <span>No disponible en móvil</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={20} />
                      {previewUrl ? "🎨 Editar en canvas" : "🎨 Abrir editor de dibujo"}
                      <span className="text-xs opacity-75 ml-1">↗</span>
                    </>
                  )}
                </button>
            </div>
          </div>

        </div>
      )}
    </Box>
  );
}

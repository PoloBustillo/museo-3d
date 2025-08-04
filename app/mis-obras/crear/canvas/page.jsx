"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Download } from "lucide-react";
import CanvasEditorPage from "../../components/CanvasEditorPage";
import { AnimatedBackground } from "../../../../components/shared";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function CanvasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener datos del mural - inicializar vacío y esperar localStorage
  const [muralData, setMuralData] = useState(null); // Inicializar como null para indicar "cargando"

  const [canvasImage, setCanvasImage] = useState(null);

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("muralDraftData");

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Usar los datos de localStorage completos
        setMuralData(parsed);
      } catch (error) {
        console.error("Error parsing saved mural data:", error);
        // Si hay error, inicializar con datos vacíos
        setMuralData({
          titulo: "",
          tecnica: "",
          descripcion: "",
          anio: new Date().getFullYear(),
        });
      }
    } else {
      // Si no hay datos, inicializar vacío
      setMuralData({
        titulo: "",
        tecnica: "",
        descripcion: "",
        anio: new Date().getFullYear(),
      });
    }
  }, []); // Solo ejecutar una vez al montar

  // Guardar datos en localStorage solo si tiene contenido significativo
  useEffect(() => {
    // Solo guardar si muralData no es null y tiene datos reales para evitar sobrescribir con datos vacíos
    if (
      muralData &&
      (muralData.titulo || muralData.tecnica || muralData.descripcion)
    ) {
      localStorage.setItem("muralDraftData", JSON.stringify(muralData));
    }
  }, [muralData]);

  const handleCanvasSave = (imageDataUrl) => {
    setCanvasImage(imageDataUrl);
    toast.success("Dibujo guardado correctamente");
  };

  const handleContinue = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!canvasImage) {
      toast.error("Debes guardar tu dibujo antes de continuar");
      return;
    }

    try {
      // Guardar la imagen del canvas en localStorage
      localStorage.setItem("canvasImage", canvasImage);

      // Regresar al stepper en el paso 1 (imágenes)
      router.push("/mis-obras/crear");
    } catch (error) {
      console.error("❌ Error en handleContinue:", error);
      toast.error("Error al continuar");
    }
  };

  const handleBack = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    try {
      router.push("/mis-obras/crear");
    } catch (error) {
      console.error("❌ Error en handleBack:", error);
      toast.error("Error al regresar");
    }
  };

  const handleDownload = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!canvasImage) {
      toast.error("No hay dibujo para descargar");
      return;
    }

    const link = document.createElement("a");
    link.download = `${muralData?.titulo || "obra"}.png`;
    link.href = canvasImage;
    link.click();
    toast.success("Dibujo descargado");
  };

  // Mostrar loading mientras se cargan los datos
  if (!muralData) {
    return (
      <ProtectedRoute>
        <div className="relative min-h-screen flex items-center justify-center">
          <AnimatedBackground />
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos del mural...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen">
        <AnimatedBackground />

        {/* Header */}
        <div
          className="z-50 fixed top-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-border px-4 py-3"
          style={{ pointerEvents: "auto" }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-muted-foreground hover:text-foreground bg-transparent border border-border rounded-md hover:bg-accent transition-colors text-sm sm:text-base"
                style={{ cursor: "pointer", pointerEvents: "auto" }}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Volver</span>
                <span className="sm:hidden">←</span>
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-foreground">
                  Crear obra - Editor de dibujo
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {muralData?.titulo ? `"${muralData.titulo}"` : "Sin título"}
                  {muralData?.tecnica && ` • ${muralData.tecnica}`}
                  {muralData?.year && ` • ${muralData.year}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canvasImage && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    <span className="hidden sm:inline">Dibujo guardado</span>
                    <span className="sm:hidden">Guardado</span>
                  </span>
                </div>
              )}

              {canvasImage && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors text-sm sm:text-base"
                  style={{ cursor: "pointer", pointerEvents: "auto" }}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar</span>
                  <span className="sm:hidden">↓</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!canvasImage}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
                  canvasImage
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={{
                  cursor: canvasImage ? "pointer" : "not-allowed",
                  pointerEvents: "auto",
                }}
              >
                <Save className="h-4 w-4" />
                {canvasImage ? (
                  <>
                    <span className="hidden sm:inline">Continuar</span>
                    <span className="sm:hidden">→</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Guardar dibujo primero
                    </span>
                    <span className="sm:hidden">Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Editor */}
        <div className="relative z-10 pt-20 pb-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="bg-white/90 dark:bg-neutral-900/90 rounded-2xl shadow-xl border border-border overflow-hidden p-6">
              <CanvasEditorPage
                onSave={handleCanvasSave}
                editingMural={muralData}
              />
            </div>
          </motion.div>
        </div>

        {/* Indicador de progreso mejorado */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-border">
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  <span className="hidden sm:inline">Datos básicos</span>
                  <span className="sm:hidden">Datos</span>
                </span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${canvasImage ? "bg-green-500" : "bg-blue-500"}`}
                ></div>
                <span className="font-medium text-foreground">
                  <span className="hidden sm:inline">Editor de dibujo</span>
                  <span className="sm:hidden">Editor</span>
                  {canvasImage && (
                    <span className="text-green-600 ml-1 sm:ml-2">✓</span>
                  )}
                </span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  <span className="hidden sm:inline">Confirmar</span>
                  <span className="sm:hidden">Final</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

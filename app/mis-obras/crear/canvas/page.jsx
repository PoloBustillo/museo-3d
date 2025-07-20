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

  // Obtener datos del mural desde URL params o localStorage
  const [muralData, setMuralData] = useState({
    titulo: searchParams.get("titulo") || "",
    tecnica: searchParams.get("tecnica") || "",
    year: searchParams.get("year")
      ? parseInt(searchParams.get("year"))
      : undefined,
    descripcion: searchParams.get("descripcion") || "",
  });

  const [canvasImage, setCanvasImage] = useState(null);

  // Cargar datos desde localStorage si no están en URL
  useEffect(() => {
    const savedData = localStorage.getItem("muralDraftData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log("📋 Cargando datos completos en canvas:", parsed);
        // Si no hay datos en URL, usar todos los datos de localStorage
        if (!searchParams.get("titulo")) {
          setMuralData(parsed);
        } else {
          // Si hay datos en URL, combinar con localStorage preservando URL
          setMuralData((prev) => ({
            ...parsed, // Datos completos de localStorage
            ...prev,   // Datos de URL (tienen prioridad)
          }));
        }
      } catch (error) {
        console.error("Error parsing saved mural data:", error);
      }
    }
  }, [searchParams]);

  // Guardar datos en localStorage
  useEffect(() => {
    localStorage.setItem("muralDraftData", JSON.stringify(muralData));
  }, [muralData]);

  const handleCanvasSave = (imageDataUrl) => {
    console.log("📸 Guardando imagen del canvas:", !!imageDataUrl);
    setCanvasImage(imageDataUrl);
    toast.success("Dibujo guardado correctamente");
  };

  const handleContinue = (e) => {
    console.log("🔥 handleContinue EJECUTADO!", e);
    e?.preventDefault();
    e?.stopPropagation();
    console.log("▶️ Intentando continuar:", { hasImage: !!canvasImage });
    
    if (!canvasImage) {
      console.log("❌ No hay imagen del canvas");
      toast.error("Debes guardar tu dibujo antes de continuar");
      return;
    }

    try {
      console.log("💾 Guardando imagen en localStorage...");
      // Guardar la imagen del canvas en localStorage
      localStorage.setItem("canvasImage", canvasImage);
      console.log("✅ Imagen guardada en localStorage");

      console.log("🔄 Navegando de vuelta al stepper...");
      // Regresar al stepper en el paso 1 (imágenes)
      router.push("/mis-obras/crear");
      console.log("✅ Navegación iniciada");
    } catch (error) {
      console.error("❌ Error en handleContinue:", error);
      toast.error("Error al continuar");
    }
  };

  const handleBack = (e) => {
    console.log("🔥 handleBack EJECUTADO!", e);
    e?.preventDefault();
    e?.stopPropagation();
    console.log("⬅️ Regresando sin guardar imagen");
    
    try {
      router.push("/mis-obras/crear");
      console.log("✅ Navegación de regreso iniciada");
    } catch (error) {
      console.error("❌ Error en handleBack:", error);
      toast.error("Error al regresar");
    }
  };

  const handleDownload = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("⬇️ Intentando descargar:", { hasImage: !!canvasImage });
    if (!canvasImage) {
      toast.error("No hay dibujo para descargar");
      return;
    }

    const link = document.createElement("a");
    link.download = `${muralData.titulo || "obra"}.png`;
    link.href = canvasImage;
    link.click();
    toast.success("Dibujo descargado");
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen">
        <AnimatedBackground />

        {/* Header */}
        <div className="z-50 fixed top-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-border px-4 py-3" style={{ pointerEvents: "auto" }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                onMouseDown={(e) => console.log("🖱️ Volver mouseDown", e)}
                onMouseUp={(e) => console.log("🖱️ Volver mouseUp", e)}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground bg-transparent border border-border rounded-md hover:bg-accent transition-colors"
                style={{ cursor: "pointer", pointerEvents: "auto" }}
              >
                <ArrowLeft className="h-5 w-5" />
                Volver
              </button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Crear obra - Editor de dibujo
                </h1>
                <p className="text-sm text-muted-foreground">
                  {muralData.titulo ? `"${muralData.titulo}"` : "Sin título"}
                  {muralData.tecnica && ` • ${muralData.tecnica}`}
                  {muralData.year && ` • ${muralData.year}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón de test */}
              <button
                type="button"
                onClick={() => {
                  console.log("🧪 BOTÓN DE TEST FUNCIONANDO!");
                  toast.success("¡Los botones funcionan!");
                }}
                className="px-2 py-1 bg-yellow-500 text-white text-xs rounded"
              >
                Test
              </button>
              
              {canvasImage && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Dibujo guardado
                  </span>
                </div>
              )}
              
              {canvasImage && (
                <button
                  type="button"
                  onClick={handleDownload}
                  onMouseDown={(e) => console.log("🖱️ Descargar mouseDown", e)}
                  onMouseUp={(e) => console.log("🖱️ Descargar mouseUp", e)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                  style={{ cursor: "pointer", pointerEvents: "auto" }}
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
              )}

              <button
                type="button"
                onClick={handleContinue}
                onMouseDown={(e) => console.log("🖱️ Continuar mouseDown", e)}
                onMouseUp={(e) => console.log("🖱️ Continuar mouseUp", e)}
                disabled={!canvasImage}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  canvasImage
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                style={{ 
                  cursor: canvasImage ? "pointer" : "not-allowed",
                  pointerEvents: "auto"
                }}
              >
                <Save className="h-4 w-4" />
                {canvasImage ? "Continuar" : "Guardar dibujo primero"}
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
            {/* Instrucciones para el usuario */}
            {!canvasImage && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    ℹ
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                      ¿Cómo usar el editor?
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      1. Dibuja tu obra usando las herramientas disponibles • 
                      2. Haz clic en el botón verde "Guardar" • 
                      3. Una vez guardada, podrás continuar
                    </p>
                  </div>
                </div>
              </div>
            )}
            
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
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Datos básicos</span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${canvasImage ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="font-medium text-foreground">
                  Editor de dibujo
                  {canvasImage && <span className="text-green-600 ml-2">✓</span>}
                </span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <span className="text-muted-foreground">Confirmar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

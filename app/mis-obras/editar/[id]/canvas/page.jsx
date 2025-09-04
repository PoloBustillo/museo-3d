"use client";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Download, Smartphone, Monitor } from "lucide-react";
import CanvasEditorPage from "../../../components/CanvasEditorPage";
import { AnimatedBackground } from "../../../../../components/shared";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import useIsMobile from "../../../../hooks/useIsMobile";
import toast from "react-hot-toast";

export default function EditarCanvasPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Obtener datos del mural - inicializar vacío y esperar localStorage
  const [muralData, setMuralData] = useState(null); // Inicializar como null para indicar "cargando"
  const [canvasImage, setCanvasImage] = useState(null);

  // Cargar datos desde localStorage o API
  useEffect(() => {
    async function loadMuralData() {
      try {
        // Intentar cargar desde localStorage primero
        const savedData = localStorage.getItem("muralDraftData");
        
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setMuralData(parsed);
          } catch (error) {
            console.error("Error parsing saved mural data:", error);
          }
        }

        // Si no hay datos en localStorage o necesitamos los datos completos, cargar desde API
        if (!savedData && id) {
          const res = await fetch(`/api/murales/${id}`);
          if (res.ok) {
            const data = await res.json();
            setMuralData(data);
          } else {
            throw new Error("No se pudo cargar la obra");
          }
        }

        // Si aún no tenemos datos, inicializar vacío
        if (!savedData && !id) {
          setMuralData({
            titulo: "",
            tecnica: "",
            descripcion: "",
            anio: new Date().getFullYear()
          });
        }
      } catch (error) {
        console.error("Error loading mural data:", error);
        toast.error("Error al cargar los datos de la obra");
        // Inicializar con datos vacíos en caso de error
        setMuralData({
          titulo: "",
          tecnica: "",
          descripcion: "",
          anio: new Date().getFullYear()
        });
      }
    }

    loadMuralData();
  }, [id]); // Ejecutar cuando cambie el ID

  // Guardar datos en localStorage solo si tiene contenido significativo
  useEffect(() => {
    // Solo guardar si muralData no es null y tiene datos reales para evitar sobrescribir con datos vacíos
    if (muralData && (muralData.titulo || muralData.tecnica || muralData.descripcion)) {
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

      // Configurar indicadores para el stepper
      localStorage.setItem("fromStepper", "true");
      localStorage.setItem("stepperReturnStep", "1"); // Regresar al paso de imágenes

      // Regresar al stepper de edición
      router.push(`/mis-obras/editar/${id}`);
    } catch (error) {
      console.error("❌ Error en handleContinue:", error);
      toast.error("Error al continuar");
    }
  };

  const handleBack = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      // Configurar indicadores para el stepper
      localStorage.setItem("fromStepper", "true");
      localStorage.setItem("stepperReturnStep", "1"); // Regresar al paso de imágenes

      router.push(`/mis-obras/editar/${id}`);
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
    link.download = `${(muralData?.titulo) || "obra"}.png`;
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

        {/* Mobile Restriction Notice */}
        {isMobile && (
          <div className="relative z-50 min-h-screen flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-border p-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Smartphone className="h-16 w-16 text-muted-foreground" />
                    <div className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Editor no disponible en móvil
                </h1>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  El editor de dibujo en canvas no está optimizado para dispositivos táctiles. 
                  Para la mejor experiencia, por favor usa un ordenador de escritorio o laptop.
                </p>
                
                <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-300">
                    Recomendado: PC o laptop con mouse
                  </span>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleBack}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a la obra
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    Puedes editar otros datos de tu obra y agregar dibujo después desde un ordenador
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Desktop Canvas Editor */}
        {!isMobile && (
          <>
            {/* Header */}
            <div className="z-50 fixed top-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-border px-4 py-3" style={{ pointerEvents: "auto" }}>
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground bg-transparent border border-border rounded-md hover:bg-accent transition-colors"
                    style={{ cursor: "pointer", pointerEvents: "auto" }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Volver
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">
                      Editar obra - Editor de dibujo
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {muralData?.titulo ? `"${muralData.titulo}"` : "Sin título"}
                      {muralData?.tecnica && ` • ${muralData.tecnica}`}
                      {muralData?.anio && ` • ${muralData.anio}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  
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
                    {canvasImage ? "Continuar con el formulario" : "Guardar dibujo primero"}
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
                    <span className="text-muted-foreground">Actualizar</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Stepper from "@/components/ui/Stepper";
import {
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Navigation,
  Eye,
  Users,
  Image as ImageIcon,
  Trash2,
  Globe,
  EyeOff,
  Star,
  Archive,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  HelpCircle,
} from "lucide-react";
import MuralImageStep from "./MuralImageStep";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState as useLocalState } from "react";
import { Icon } from "leaflet";
import { Brush } from "lucide-react";
import ReactSelect from "react-select";
import { SimpleModal } from "@/components/ui/SimpleModal";
// BYPASS: Import Fast version for performance
import {
  generateMuralGLB,
  generateMuralGLBFallback,
} from "../../../utils/generateMuralGLBFast";
import { uploadModelToCloudinary } from "../../../utils/uploadToCloudinary";
import { validateGLB, diagnoseModel } from "../../../utils/validateGLB";

// Estilos CSS para el mapa
const mapStyles = `
  .leaflet-location-icon {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    transition: all 0.2s ease;
  }
  
  .leaflet-location-icon:hover {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
    transform: scale(1.1);
  }
  
  .leaflet-container {
    font-family: inherit;
  }
  
  .leaflet-control-zoom {
    border: none !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }
  
  .leaflet-control-zoom a {
    border: none !important;
    background: white !important;
    color: #374151 !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
  }
  
  .leaflet-control-zoom a:hover {
    background: #f3f4f6 !important;
    color: #1f2937 !important;
    transform: scale(1.05);
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
  }
  
  .dark .leaflet-control-zoom a {
    background: #374151 !important;
    color: #f9fafb !important;
  }
  
  .dark .leaflet-control-zoom a:hover {
    background: #4b5563 !important;
    color: white !important;
  }
  
  /* Prevenir scroll automático durante actualizaciones de estado */
  .form-updating {
    scroll-behavior: auto !important;
    overflow-anchor: none !important;
  }
  
  .form-updating * {
    scroll-behavior: auto !important;
    overflow-anchor: none !important;
  }
  
  /* Estabilizar el contenedor del formulario */
  .form-container {
    scroll-behavior: smooth;
    overflow-anchor: auto;
  }
  
  .form-container.updating {
    scroll-behavior: auto !important;
    overflow-anchor: none !important;
  }
`;

// Inyectar estilos
if (typeof window !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = mapStyles;
  document.head.appendChild(styleElement);
}

export default function CrearMuralStepper({
  initialData = null,
  editMode = false,
  onSuccess,
  scrollParentRef = null,
}) {
  const searchParams = useSearchParams();
  const debugScroll = !!(searchParams?.get('debugScroll'));
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [showClearDraftModal, setShowClearDraftModal] = useState(false);

  // Steps dinámicos según el modo
  const STEPS_DYNAMIC = [
    {
      label: "Datos básicos",
      subtitle: "Información principal",
      icon: <User />,
    },
    {
      label: "Imágenes y medios",
      subtitle: "Sube o crea tu imagen",
      icon: <ImageIcon />,
    },
    {
      label: "Ubicación y sala",
      subtitle: "Dónde está el mural",
      icon: <Navigation />,
    },
    { label: "Estado", subtitle: "Visibilidad y configuración", icon: <Eye /> },
    { label: "Autores", subtitle: "Artistas y colaboradores", icon: <Users /> },
    {
      label: "Confirmar",
      subtitle: editMode ? "Revisa y actualiza" : "Revisa y crea",
      icon: <CheckCircle />,
    },
  ];
  const canvasImageLoaded = useRef(false);
  const localStorageLoaded = useRef(false);
  const formContainerRef = useRef(null);
  const headerBlockRef = useRef(null);
  const headerFixedHeightRef = useRef(null);
  const lastFieldRef = useRef("");
  const lastUpdateTsRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const jumpEventsRef = useRef([]);
  const scrollAnchorRef = useRef(null);
  const preUpdateAnchorTopRef = useRef(null);
  const pendingCompensationRef = useRef(false);

  // Función para comprimir imagen si es muy grande
  const compressImage = (dataUrl, maxSize = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen comprimida
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con calidad reducida
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    });
  };

  // Función de utilidad para manejar localStorage de forma segura
  const safeLSSet = (key, value) => {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      // Verificar tamaño (límite de ~5MB para estar seguros)
      if (stringValue.length > 5 * 1024 * 1024) {
        console.warn(
          `⚠️ Valor muy grande para localStorage (${key}):`,
          stringValue.length,
          "caracteres"
        );
        return false;
      }

      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`❌ Error guardando en localStorage (${key}):`, error);

      // Si es error de cuota, limpiar localStorage
      if (error.name === "QuotaExceededError") {
        console.warn("🧹 Limpiando localStorage por cuota excedida...");
        try {
          // Limpiar elementos relacionados con imágenes grandes
          localStorage.removeItem("canvasImage");
          const draftData = localStorage.getItem("muralDraftData");
          if (draftData) {
            try {
              const parsed = JSON.parse(draftData);
              const cleaned = {
                ...parsed,
                url_imagen: null,
                imagenesSecundarias: [],
                imagenUrlWebp: null,
              };
              localStorage.setItem("muralDraftData", JSON.stringify(cleaned));
            } catch (parseError) {
              localStorage.removeItem("muralDraftData");
            }
          }
        } catch (cleanError) {
          console.error("❌ Error limpiando localStorage:", cleanError);
        }
      }

      return false;
    }
  };

  // Estado global del mural
  const [mural, setMural] = useState({
    titulo: "",
    descripcion: "",
    tecnica: "",
    anio: undefined,
    dimensiones: "",
    tags: [],
    url_imagen: null,
    imagenesSecundarias: [],
    imagenUrlWebp: "",
    videoUrl: "",
    audioUrl: "",
    modelo3dUrl: "",
    ubicacion: "",
    latitud: "",
    longitud: "",
    salaId: "",
    exposiciones: [],
    estado: "",
    publica: true,
    destacada: false,
    orden: 0,
    autor: "",
    artistId: "",
    colaboradores: [],
    tagsInput: "",
    userId: "", // Agregar userId
  });
  const [errors, setErrors] = useState({});
  const [artistList, setArtistList] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [generatingModel, setGeneratingModel] = useState(false);
  const [modelGenerationStep, setModelGenerationStep] = useState("");
  const [showCanvasReturnMessage, setShowCanvasReturnMessage] = useState(false);

  const safeScrollParentRef = scrollParentRef && typeof scrollParentRef === 'object' ? scrollParentRef : { current: null };
  const updateMural = useCallback((updater) => {
    const scroller = safeScrollParentRef.current || (typeof window !== 'undefined' ? window : null);
    const getScrollY = () => scroller === window ? window.scrollY : (scroller?.scrollTop || 0);
    const setScrollY = (y) => {
      if (!scroller) return;
      if (scroller === window) window.scrollTo({ top: y, behavior: 'auto' }); else scroller.scrollTop = y;
    };
    const prevY = getScrollY();
    if (scrollAnchorRef.current) {
      preUpdateAnchorTopRef.current = scrollAnchorRef.current.getBoundingClientRect().top;
    } else {
      preUpdateAnchorTopRef.current = null;
    }
    setMural(prev => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
    pendingCompensationRef.current = { getScrollY, setScrollY, prevY };
    if (debugScroll) {
      // eslint-disable-next-line no-console
      console.log('[updateMural] scheduled', { prevY });
    }
  }, [debugScroll, safeScrollParentRef]);

  // Compensar desplazamiento después de cada render que siguió a un updateMural
  React.useLayoutEffect(() => {
    const context = pendingCompensationRef.current;
    if (!context || !context.getScrollY) return;
    pendingCompensationRef.current = false;
    if (preUpdateAnchorTopRef.current == null || !scrollAnchorRef.current) return;
    const newTop = scrollAnchorRef.current.getBoundingClientRect().top;
    const delta = newTop - preUpdateAnchorTopRef.current;
    if (Math.abs(delta) > 1) {
      const currentY = context.getScrollY();
      context.setScrollY(currentY - delta);
      if (debugScroll) {
        // eslint-disable-next-line no-console
        console.log('[scrollCompensation]', { pre: preUpdateAnchorTopRef.current, post: newTop, delta, adjustedTo: context.getScrollY() });
      }
    }
    preUpdateAnchorTopRef.current = null;
  });

  React.useEffect(() => {
    // Asegurar año por defecto si no está definido
    if (mural.anio === undefined || mural.anio === null || mural.anio === "") {
      setMural((prev) => ({ ...prev, anio: new Date().getFullYear() }));
    }
  }, [mural.anio]);

  // useEffect para cargar datos iniciales en modo edición
  React.useEffect(() => {
    if (editMode && initialData) {
  setMural({
        titulo: initialData.titulo || "",
        descripcion: initialData.descripcion || "",
        tecnica: initialData.tecnica || "",
        anio: initialData.anio || new Date().getFullYear(),
        dimensiones: initialData.dimensiones || "",
        tags: initialData.tags || [],
        url_imagen: initialData.url_imagen || null,
        imagenesSecundarias: initialData.imagenesSecundarias || [],
        imagenUrlWebp: initialData.imagenUrlWebp || "",
        videoUrl: initialData.videoUrl || "",
        audioUrl: initialData.audioUrl || "",
        modelo3dUrl: initialData.modelo3dUrl || "",
        ubicacion: initialData.ubicacion || "",
        latitud: initialData.latitud || "",
        longitud: initialData.longitud || "",
        salaId: initialData.salaId || "",
        exposiciones: initialData.exposiciones || [],
        estado: initialData.estado || "",
        publica: initialData.publica !== undefined ? initialData.publica : true,
        destacada:
          initialData.destacada !== undefined ? initialData.destacada : false,
        orden: initialData.orden || 0,
        autor: initialData.autor || "",
        artistId: initialData.artistId || "",
        colaboradores: initialData.colaboradores || [],
        tagsInput: "", // Se llenará dinámicamente si hay tags
        userId: initialData.userId || "",
      });
    }
  }, [editMode, initialData]);

  // Validación simple por step
  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!mural.titulo) e.titulo = "El título es requerido";
      if (!mural.tecnica) e.tecnica = "La técnica es requerida";
      if (!mural.anio) e.anio = "El año es requerido";
    }
    if (step === 1) {
      if (!mural.url_imagen) e.url_imagen = "Selecciona o crea una imagen";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Handlers
  const handleNext = () => {
    if (validateStep()) {
      // Guardar datos antes de avanzar
      const hasSignificantData =
        mural.titulo ||
        mural.descripcion ||
        mural.tecnica ||
        mural.anio !== new Date().getFullYear() ||
        mural.dimensiones ||
        mural.ubicacion ||
        (mural.tags && mural.tags.length > 0);

      if (hasSignificantData && session?.user?.id) {
        const muralWithoutImage = {
          ...mural,
          url_imagen: null, // No guardar la imagen en localStorage
        };

        safeLSSet("muralDraftData", muralWithoutImage);
        safeLSSet("muralStep", (step + 1).toString());
      }

      setStep((s) => s + 1);
    }
  };

  // Cargar datos del mural desde localStorage al montar el componente
  useEffect(() => {
    // Solo ejecutar si no estamos en modo edición y no hemos cargado ya
    if ((editMode && initialData) || localStorageLoaded.current) {
      return;
    }

    // Si es una nueva creación (no hay initialData), limpiar localStorage primero
    if (!editMode && !initialData) {
      // Verificar si venimos de una creación exitosa reciente
      const lastCreationTime = localStorage.getItem('lastMuralCreationTime');
      const now = Date.now();
      
      // Si fue hace menos de 10 segundos, limpiar todo para nueva creación
      if (!lastCreationTime || (now - parseInt(lastCreationTime)) < 10000) {
        console.log('🧹 Limpiando localStorage para nueva creación');
        localStorage.removeItem("muralDraftData");
        localStorage.removeItem("muralStep");
        localStorage.removeItem("canvasImage");
        localStorage.removeItem('lastMuralCreationTime');
        
        // Reiniciar estado a valores por defecto
        setMural({
          titulo: "",
          descripcion: "",
          tecnica: "",
          anio: new Date().getFullYear(),
          dimensiones: "",
          tags: [],
          url_imagen: null,
          imagenesSecundarias: [],
          imagenUrlWebp: "",
          videoUrl: "",
          audioUrl: "",
          modelo3dUrl: "",
          ubicacion: "",
          latitud: "",
          longitud: "",
          salaId: "",
          exposiciones: [],
          estado: "",
          publica: true,
          destacada: false,
          orden: 0,
          autor: "",
          artistId: "",
          colaboradores: [],
          tagsInput: "",
          userId: session?.user?.id || "",
        });
        setStep(0); // Comenzar desde el step 0 (primer step)
        localStorageLoaded.current = true;
        return;
      }
    }

    const savedData = localStorage.getItem("muralDraftData");
    const savedStep = localStorage.getItem("muralStep");

    if (savedData && session?.user?.id) {
      try {
        const parsed = JSON.parse(savedData);

        setMural((prev) => {
          // Solo actualizar si los datos guardados son diferentes o más completos
          const hasExistingData = prev.titulo || prev.tecnica || prev.descripcion;
          
          if (hasExistingData) {
            return {
              ...prev,
              // Solo actualizar userId si no está establecido
              userId: prev.userId || session.user.id,
            };
          }
          
          // Combinar datos de localStorage con estado actual, dando prioridad a localStorage
          const newMural = {
            // Base por defecto
            titulo: "",
            descripcion: "",
            tecnica: "",
            anio: new Date().getFullYear(),
            dimensiones: "",
            tags: [],
            url_imagen: null,
            imagenesSecundarias: [],
            imagenUrlWebp: "",
            videoUrl: "",
            audioUrl: "",
            modelo3dUrl: "",
            ubicacion: "",
            latitud: "",
            longitud: "",
            salaId: "",
            exposiciones: [],
            estado: "",
            publica: true,
            destacada: false,
            orden: 0,
            autor: "",
            artistId: "",
            colaboradores: [],
            tagsInput: "",
            userId: session?.user?.id || "",
            // Combinar con estado previo (mantener datos existentes)
            ...prev,
            // Sobrescribir con datos guardados de localStorage (prioridad máxima)
            ...parsed,
            // Asegurar que userId siempre esté actualizado con la sesión actual
            userId: session?.user?.id || parsed.userId || prev.userId,
          };

          return newMural;
        });
        
        // Marcar como cargado
        localStorageLoaded.current = true;
      } catch (error) {
        console.error("❌ Error parsing saved mural data:", error);
      }
    }

    if (savedStep && session?.user?.id) {
      const stepNumber = parseInt(savedStep);
      setStep(stepNumber);
    }
  }, [session?.user?.id, editMode, initialData]); // Añadir editMode e initialData como dependencias

  // Establecer userId cuando la sesión esté disponible (solo si no está ya establecido)
  useEffect(() => {
    if (session?.user?.id && !mural.userId) {
      // Usar updateMural para evitar scroll automático
      updateMural(prev => ({ ...prev, userId: session.user.id }));
    }
  }, [session?.user?.id, mural.userId, updateMural]);

  // Detectar si el usuario regresa del canvas y mostrar mensaje
  useEffect(() => {
    const fromStepper = localStorage.getItem("fromStepper");
    const stepperReturnStep = localStorage.getItem("stepperReturnStep");
    
    if (fromStepper === "true" && stepperReturnStep) {
      // El usuario regresó del canvas
      setShowCanvasReturnMessage(true);
      setStep(parseInt(stepperReturnStep));
      
      // Limpiar los indicadores inmediatamente para evitar interferencias
      localStorage.removeItem("fromStepper");
      localStorage.removeItem("stepperReturnStep");
      
      // Auto-ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowCanvasReturnMessage(false);
      }, 5000);
    }
  }, []); // Solo ejecutar una vez al montar el componente

  // Auto-guardar los datos del mural cada vez que cambien (excepto si estamos cargando)
  useEffect(() => {
  // (scroll guard removed)

    // Solo guardar si tenemos datos significativos y la sesión está lista
    const hasSignificantData =
      mural.titulo ||
      mural.descripcion ||
      mural.tecnica ||
      (mural.anio && mural.anio !== new Date().getFullYear());

    if (hasSignificantData && session?.user?.id) {
      // Usar un timeout para debounce y evitar guardados excesivos
      const saveTimeout = setTimeout(() => {
        // Crear una copia del mural sin las imágenes pesadas para localStorage
        const muralToSave = {
          ...mural,
          // Excluir campos que pueden ser muy grandes
          url_imagen:
            mural.url_imagen && mural.url_imagen.startsWith("data:")
              ? null
              : mural.url_imagen,
          imagenesSecundarias:
            mural.imagenesSecundarias?.filter(
              (img) => !img.startsWith("data:")
            ) || [],
          imagenUrlWebp:
            mural.imagenUrlWebp && mural.imagenUrlWebp.startsWith("data:")
              ? null
              : mural.imagenUrlWebp,
        };

        // Usar la función segura para guardar
        if (safeLSSet("muralDraftData", muralToSave)) {
          safeLSSet("muralStep", step.toString());
        }
      }, 500); // Debounce de 500ms

      return () => clearTimeout(saveTimeout);
    }
  }, [mural, step, session?.user?.id]);

  // Cargar lista de artistas
  useEffect(() => {
    fetch("/api/artists?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setArtistList(data.artists || []);
      })
      .catch((error) => {
        console.error("❌ Error cargando artistas:", error);
        setArtistList([]);
      });
  }, []);

  // Verificar si hay imagen del canvas al cargar el componente
  useEffect(() => {
    const savedCanvasImage = localStorage.getItem("canvasImage");

    if (savedCanvasImage && !canvasImageLoaded.current) {
      // Verificar si ya tenemos datos del mural antes de cargar la imagen
      const currentMuralData = localStorage.getItem("muralDraftData");
      let existingData = {};
      if (currentMuralData) {
        try {
          existingData = JSON.parse(currentMuralData);
        } catch (error) {
          console.error("❌ Error parsing existing data:", error);
        }
      }

      // Comprimir la imagen si es muy grande
      compressImage(savedCanvasImage)
        .then((compressedImage) => {
          setMural((currentMural) => {
            // Usar datos actuales del mural como base principal y completar con localStorage
            const updatedMural = {
              // Estado actual del mural como base principal
              ...currentMural,
              // Completar con datos de localStorage si existen
              ...existingData,
              // Agregar la nueva imagen del canvas
              url_imagen: compressedImage,
              // Asegurar que campos críticos del estado actual se mantengan
              userId: currentMural.userId || existingData.userId || session?.user?.id,
              // Preservar datos del formulario actual si existen
              titulo: currentMural.titulo || existingData.titulo || "",
              tecnica: currentMural.tecnica || existingData.tecnica || "",
              descripcion: currentMural.descripcion || existingData.descripcion || "",
              anio: currentMural.anio || existingData.anio || new Date().getFullYear(),
              // Asegurar que los arrays existen y se preservan
              colaboradores: currentMural.colaboradores || existingData.colaboradores || [],
              tags: currentMural.tags || existingData.tags || [],
              // Valores por defecto para campos booleanos
              publica:
                currentMural.publica !== undefined
                  ? currentMural.publica
                  : existingData.publica !== undefined
                  ? existingData.publica
                  : true,
              destacada:
                currentMural.destacada !== undefined
                  ? currentMural.destacada
                  : existingData.destacada !== undefined
                  ? existingData.destacada
                  : false,
              orden: 
                currentMural.orden !== undefined 
                  ? currentMural.orden 
                  : existingData.orden !== undefined 
                  ? existingData.orden 
                  : 0,
            };

            // Forzar un guardado inmediato para preservar los datos
            setTimeout(() => {
              const muralWithoutImage = {
                ...updatedMural,
                url_imagen: null, // No guardar la imagen en localStorage
              };
              if (safeLSSet("muralDraftData", muralWithoutImage)) {
                safeLSSet("muralStep", step.toString());
              }
            }, 100);

            return updatedMural;
          });
          // Solo cambiar al paso 1 si no estamos ya en un paso más avanzado
          if (step < 1) {
            setStep(1);
          }
        })
        .catch((error) => {
          console.error("❌ Error comprimiendo imagen:", error);
        });

      // Limpiar localStorage después de cargar
      localStorage.removeItem("canvasImage");
      canvasImageLoaded.current = true;
    }
  }, [step]); // Solo depender del step, no del titulo para evitar loops

  // Guardar estado del mural (sin imagen) y paso actual en localStorage
  useEffect(() => {
    if (!isCreating && session?.user?.id) {
      // Solo guardar si hay datos significativos
      const hasSignificantData =
        mural.titulo ||
        mural.descripcion ||
        mural.tecnica ||
        mural.anio !== new Date().getFullYear() || // Si no es el año por defecto
        mural.dimensiones ||
        mural.latitud ||
        mural.longitud ||
        mural.ubicacion ||
        mural.salaId ||
        mural.estado ||
        mural.autor ||
        mural.artistId ||
        (mural.colaboradores && mural.colaboradores.length > 0) ||
        (mural.tags && mural.tags.length > 0);

      // Siempre guardar si hay datos significativos, sin restricciones por step
      if (hasSignificantData) {
        // Crear una copia del mural sin la imagen para no exceder el límite de localStorage
        const muralWithoutImage = {
          ...mural,
          url_imagen: null, // No guardar la imagen en localStorage para evitar exceder límites
        };

        // Usar la función segura para guardar
        if (safeLSSet("muralDraftData", muralWithoutImage)) {
          safeLSSet("muralStep", step.toString());
        }
      }
    }
  }, [
    mural.titulo,
    mural.descripcion,
    mural.tecnica,
    mural.anio,
    mural.dimensiones,
    mural.latitud,
    mural.longitud,
    mural.ubicacion,
    mural.salaId,
    mural.estado,
    mural.publica,
    mural.destacada,
    mural.orden,
    mural.tags,
    mural.autor,
    mural.artistId,
    mural.colaboradores,
    step,
    isCreating,
    session?.user?.id,
  ]);

  // Eliminado el bloqueo agresivo de scroll: ya no necesario

  // Función para generar modelo 3D con fallbacks
  const generateAndValidateModel = async (imageUrl, title = "mural") => {
    setGeneratingModel(true);

    let glbBlob = null;
    let generationMethod = "";

    try {
      // Intentar primero con la imagen real
      setModelGenerationStep("Generando modelo 3D con imagen...");
      glbBlob = await generateMuralGLB(imageUrl);
      generationMethod = "imagen_real";

      // Validar el modelo generado
      setModelGenerationStep("Validando modelo generado...");
      const validation = await validateGLB(glbBlob);
      if (!validation.isValid) {
        throw new Error(`Modelo inválido: ${validation.error}`);
      }
    } catch (error) {
      try {
        // Fallback: generar con textura programática
        setModelGenerationStep("Generando modelo alternativo...");
        const fallbackColor = "#4A90E2"; // Azul atractivo
        const fallbackText = title.substring(0, 10).toUpperCase() || "OBRA";

        glbBlob = await generateMuralGLBFallback(fallbackColor, fallbackText);
        generationMethod = "fallback";

        // Validar el modelo fallback
        setModelGenerationStep("Validando modelo alternativo...");
        const validation = await validateGLB(glbBlob);
        if (!validation.isValid) {
          throw new Error(`Modelo fallback inválido: ${validation.error}`);
        }
      } catch (fallbackError) {
        // Último recurso: modelo simple
        setModelGenerationStep("Generando modelo básico...");
        const { generateSimpleGLB } = await import(
          "../../../utils/generateSimpleGLB"
        );
        glbBlob = await generateSimpleGLB(true);
        generationMethod = "simple";

        setModelGenerationStep("Validando modelo básico...");
        const validation = await validateGLB(glbBlob);
        if (!validation.isValid) {
          throw new Error(`Modelo simple inválido: ${validation.error}`);
        }
      }
    }

    // Diagnóstico del modelo final
    setModelGenerationStep("Analizando calidad del modelo...");
    const diagnostic = await diagnoseModel(glbBlob);

    setGeneratingModel(false);
    setModelGenerationStep("");

    return {
      blob: glbBlob,
      method: generationMethod,
      diagnostic,
    };
  };

  // Función para crear el mural
  const handleCreateMural = async () => {
    if (!mural.url_imagen) {
      alert("Debes seleccionar o crear una imagen");
      return;
    }

    if (!mural.titulo || !mural.titulo.trim()) {
      alert("El título es requerido. Por favor, completa el paso 1.");
      return;
    }

    if (!mural.tecnica || !mural.tecnica.trim()) {
      alert("La técnica es requerida. Por favor, completa el paso 1.");
      return;
    }

    if (!mural.anio) {
      alert("El año es requerido. Por favor, completa el paso 1.");
      return;
    }

    if (!mural.userId && !session?.user?.id) {
      alert(
        "No se ha cargado el perfil de usuario. Intenta de nuevo en unos segundos."
      );
      return;
    }

    setIsCreating(true);

    try {
      let url_imagen = null;

      // Solo subir imagen si es nueva (base64 o File), no si ya es una URL
      if (
        mural.url_imagen &&
        typeof mural.url_imagen === "string" &&
        mural.url_imagen.startsWith("http")
      ) {
        // Ya es una URL de imagen existente, no subir de nuevo
        url_imagen = mural.url_imagen;
      } else if (mural.url_imagen) {
        // Es imagen nueva que necesita ser subida
        let imgFile;
        if (mural.url_imagen.startsWith("data:")) {
          const res = await fetch(mural.url_imagen);
          const blob = await res.blob();
          imgFile = new File([blob], `${mural.titulo || "obra"}.png`, {
            type: "image/png",
          });
        } else {
          // Si es un archivo File
          imgFile = mural.url_imagen;
        }

        // Subir imagen nueva
        const formDataImage = new FormData();
        formDataImage.append("imagen", imgFile);

        const resImg = await fetch("/api/upload", {
          method: "POST",
          body: formDataImage,
        });

        if (!resImg.ok) {
          throw new Error("Error al subir la imagen");
        }

        const dataImg = await resImg.json();
        url_imagen = dataImg.url;
      } else {
        throw new Error("No hay imagen para procesar");
      }

      // Generar y subir modelo 3D
      let modelo3dUrl = null;
      let modelInfo = null;

      if (url_imagen) {
        try {
          // Usar la función mejorada para generar el modelo
          const modelResult = await generateAndValidateModel(
            url_imagen,
            mural.titulo
          );

          // Preparar nombre del archivo
          let safeFileName = `${mural.titulo || "mural"}`;
          if (!safeFileName.toLowerCase().endsWith(".glb")) {
            safeFileName += ".glb";
          }

          // Subir a Cloudinary
          setModelGenerationStep("Subiendo modelo a la nube...");
          modelo3dUrl = await uploadModelToCloudinary(
            modelResult.blob,
            safeFileName
          );

          modelInfo = {
            method: modelResult.method,
            size: Math.round(modelResult.blob.size / 1024), // KB
            diagnostic: modelResult.diagnostic,
          };
        } catch (err) {
          console.error("❌ Error completo en generación de modelo 3D:", err);
          // Continuar sin modelo 3D
          modelo3dUrl = null;
        } finally {
          setGeneratingModel(false);
          setModelGenerationStep("");
        }
      }

      // Crear FormData para el mural
      const formData = new FormData();
      formData.append("titulo", mural.titulo);
      formData.append("tecnica", mural.tecnica);
      formData.append("anio", mural.anio.toString());
      formData.append("descripcion", mural.descripcion || "");
      formData.append("autor", mural.autor || "");
      if (mural.artistId && mural.artistId.trim() !== "") {
        formData.append("artistId", mural.artistId);
      }
      formData.append("userId", mural.userId || session?.user?.id || "");
      formData.append("url_imagen", url_imagen);
      if (modelo3dUrl) {
        formData.append("modelo3dUrl", modelo3dUrl);
      }

      // Campos faltantes
      if (mural.dimensiones) {
        formData.append("dimensiones", mural.dimensiones);
      }
      if (mural.latitud) {
        formData.append("latitud", mural.latitud.toString());
      }
      if (mural.longitud) {
        formData.append("longitud", mural.longitud.toString());
      }
      if (mural.ubicacion) {
        formData.append("ubicacion", mural.ubicacion);
      }
      if (mural.salaId) {
        formData.append("salaId", mural.salaId.toString());
      }
      if (mural.estado) {
        formData.append("estado", mural.estado);
      }
      if (mural.publica !== undefined) {
        formData.append("publica", mural.publica.toString());
      }
      if (mural.destacada !== undefined) {
        formData.append("destacada", mural.destacada.toString());
      }
      if (mural.orden !== undefined) {
        formData.append("orden", mural.orden.toString());
      }
      if (mural.tags && mural.tags.length > 0) {
        formData.append("tags", JSON.stringify(mural.tags));
      }
      if (mural.colaboradores && mural.colaboradores.length > 0) {
        formData.append("colaboradores", JSON.stringify(mural.colaboradores));
      }

      // Enviar a la API
      const apiUrl = editMode
        ? `/api/murales/${initialData.id}`
        : "/api/murales";
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        // Mostrar mensaje de éxito
        setSuccessMessage(
          editMode
            ? "¡Obra actualizada exitosamente!"
            : "¡Obra creada exitosamente!"
        );

        // Limpiar localStorage solo si es creación nueva
        if (!editMode) {
          localStorage.removeItem("muralDraftData");
          localStorage.removeItem("muralStep");
          localStorage.removeItem("canvasImage");
          // Marcar timestamp de creación exitosa para limpiar en próxima sesión
          localStorage.setItem('lastMuralCreationTime', Date.now().toString());
        }

        // Redirigir después de un breve delay para mostrar el mensaje
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(result);
          } else {
            router.push("/mis-obras");
          }
        }, 1000);
      } else {
        let errorMsg = editMode
          ? "Error al actualizar la obra"
          : "Error al crear la obra";
        let errorDetails = "";
        try {
          const error = await response.json();
          console.error("❌ Error de la API:", error);
          if (error && error.message) errorMsg = error.message;
          if (error && error.details) errorDetails = error.details;
        } catch (e) {
          console.error("❌ Error parseando respuesta:", e);
        }
        console.error(
          "❌ Status:",
          response.status,
          "StatusText:",
          response.statusText
        );
        setApiError({ message: errorMsg, details: errorDetails });
      }
    } catch (error) {
      setApiError({
        message: "Error al crear la obra",
        details: error.message,
      });
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    // Guardar datos antes de retroceder solo si hay datos significativos
    const hasSignificantData =
      mural.titulo ||
      mural.descripcion ||
      mural.tecnica ||
      mural.anio !== new Date().getFullYear() ||
      mural.dimensiones ||
      mural.ubicacion ||
      (mural.tags && mural.tags.length > 0);

    if (hasSignificantData && session?.user?.id) {
      const muralWithoutImage = {
        ...mural,
        url_imagen: null, // No guardar la imagen en localStorage
      };

      safeLSSet("muralDraftData", muralWithoutImage);
      safeLSSet("muralStep", (step - 1).toString());
    } else {
      // Si no hay datos significativos, solo actualizar el step en localStorage
      safeLSSet("muralStep", (step - 1).toString());
    }

    setStep((s) => s - 1);
  };

  const handleClearDraft = () => {
    // Limpiar todo el localStorage relacionado con murales
    try {
      localStorage.removeItem("muralDraftData");
      localStorage.removeItem("muralStep");
      localStorage.removeItem("canvasImage");

      // Limpiar cualquier otro elemento que pueda contener imágenes
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("mural") ||
          key.includes("canvas") ||
          key.includes("image")
        ) {
          try {
            localStorage.removeItem(key);
          } catch (err) {
            console.warn(`No se pudo limpiar ${key}:`, err);
          }
        }
      });
    } catch (error) {
      console.error("❌ Error limpiando draft:", error);
    }

    setSuccessMessage(null);
    setApiError(null);
    setMural({
      titulo: "",
      descripcion: "",
      tecnica: "",
      anio: undefined,
      dimensiones: "",
      tags: [],
      url_imagen: null,
      imagenesSecundarias: [],
      imagenUrlWebp: "",
      videoUrl: "",
      audioUrl: "",
      modelo3dUrl: "",
      ubicacion: "",
      latitud: "",
      longitud: "",
      salaId: "",
      exposiciones: [],
      estado: "",
      publica: true,
      destacada: false,
      orden: 0,
      autor: "",
      artistId: "",
      colaboradores: [],
      tagsInput: "",
    });
    setStep(0);
    setErrors({});
    setShowClearDraftModal(false);
  };

  const handleEstadoChange = useCallback((estado) => {
    updateMural(m => ({ ...m, estado }));
  }, [updateMural]);

  const handlePublicaChange = useCallback((publica) => {
    updateMural(m => ({ ...m, publica }));
  }, [updateMural]);

  const handleDestacadaChange = useCallback((destacada) => {
    updateMural(m => ({ ...m, destacada }));
  }, [updateMural]);

  const handleOrdenChange = useCallback((orden) => {
    updateMural(m => ({ ...m, orden: parseInt(orden) || 0 }));
  }, [updateMural]);

  const handleOrdenIncrement = useCallback(() => {
    updateMural(m => ({ ...m, orden: (m.orden || 0) + 1 }));
  }, [updateMural]);

  const handleOrdenDecrement = useCallback(() => {
    updateMural(m => ({ ...m, orden: Math.max(0, (m.orden || 0) - 1) }));
  }, [updateMural]);

  // Funciones para campos básicos con prevención de scroll mejorada
  const handleTituloChange = useCallback((e) => {
  lastFieldRef.current = 'titulo';
  lastUpdateTsRef.current = performance.now();
    updateMural(m => ({ ...m, titulo: e.target.value }));
  }, [updateMural]);

  const handleTecnicaChange = useCallback((e) => {
  lastFieldRef.current = 'tecnica';
  lastUpdateTsRef.current = performance.now();
    updateMural(m => ({ ...m, tecnica: e.target.value }));
  }, [updateMural]);

  const handleAnioChange = useCallback((e) => {
  lastFieldRef.current = 'anio';
  lastUpdateTsRef.current = performance.now();
    updateMural(m => ({ ...m, anio: e.target.value }));
  }, [updateMural]);

  const handleDescripcionChange = useCallback((e) => {
    e.target.focus({ preventScroll: true });
    updateMural(m => ({ ...m, descripcion: e.target.value }));
  }, [updateMural]);

  const handleDimensionesChange = useCallback((e) => {
    e.target.focus({ preventScroll: true });
    updateMural(m => ({ ...m, dimensiones: e.target.value }));
  }, [updateMural]);

  const handleTagsInputChange = useCallback((e) => {
    e.target.focus({ preventScroll: true });
    updateMural(m => ({ ...m, tagsInput: e.target.value }));
  }, [updateMural]);

  const handleRemoveTag = useCallback((indexToRemove) => {
    updateMural(m => ({
      ...m,
      tags: m.tags.filter((_, idx) => idx !== indexToRemove)
    }));
  }, [updateMural]);

  const handleTagKeyDown = useCallback((e) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      const val = mural.tagsInput?.trim();
      if (val && !mural.tags.includes(val)) {
        updateMural(m => ({
          ...m,
          tags: [...m.tags, val],
          tagsInput: "",
        }));
      }
    } else if (
      e.key === "Backspace" &&
      !mural.tagsInput &&
      mural.tags.length > 0
    ) {
      updateMural(m => ({ ...m, tags: m.tags.slice(0, -1) }));
    }
  }, [updateMural, mural.tagsInput, mural.tags]);

  // Función optimizada para cambio de imagen
  const handleImageChange = useCallback((img) => {
    updateMural(m => ({ ...m, url_imagen: img }));
  }, [updateMural]);

  // Estilos inline para underline moderno
  const underlineInputClass =
    "block w-full bg-transparent border-0 border-b-2 border-gray-300 focus:border-indigo-600 transition-all duration-200 text-lg px-0 py-2 placeholder-gray-400 focus:outline-none";
  const labelClass =
    "block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200";
  const errorClass = "text-red-500 text-xs mt-1 block";

  // Generar años para el select
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );

  // Fix default marker icon for leaflet in React (otherwise no marker icon)
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  function LocationMarker({ lat, lng, setLatLng }) {
    useMapEvents({
      click(e) {
        setLatLng([e.latlng.lat, e.latlng.lng]);
      },
    });
    return lat && lng ? <Marker position={[lat, lng]} /> : null;
  }

  // Utilidad para generar SVG string de un icono Lucide
  function getLucideSvgUrl(iconName = "brush", color = "#4F46E5") {
    let svg = "";
    if (iconName === "brush") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' fill='none' stroke='${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-brush' viewBox='0 0 24 24'><path d='M9 7 17 15'/><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5a2.121 2.121 0 1 1-3-3Z'/></svg>`;
    } else if (iconName === "image") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' fill='none' stroke='${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-image' viewBox='0 0 24 24'><rect width='18' height='18' x='3' y='3' rx='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-4.586-4.586a2 2 0 0 0-2.828 0L3 21'/></svg>`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Determinar estados de los steps para feedback visual
  const stepStates = STEPS_DYNAMIC.map((stepObj, i) => {
    if (i < step)
      return {
        ...stepObj,
        status: "success",
        icon: <CheckCircle className="text-green-600 mx-auto" />,
      };
    if (i === step && Object.keys(errors).length > 0)
      return {
        ...stepObj,
        status: "error",
        icon: <AlertCircle className="text-red-500 mx-auto" />,
      };
    return {
      ...stepObj,
      icon: React.cloneElement(stepObj.icon, { className: "mx-auto" }),
    };
  });

  // Render steps
  return (
    <div className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-border p-0 md:p-8" ref={headerBlockRef}>
      {debugScroll && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/70 text-xs text-green-300 font-mono p-3 rounded-lg max-w-xs space-y-1">
          <div className="font-bold text-white">Scroll Debug</div>
          <div>Y: {typeof window !== 'undefined' ? window.scrollY : 0}</div>
          <div>Last Field: {lastFieldRef.current || '-'}</div>
          <div>Events: {jumpEventsRef.current.length}</div>
          <button
            type="button"
            className="mt-1 px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded"
            onClick={() => { /* force log dump */ console.log('Dump jumps', jumpEventsRef.current); }}
          >Dump</button>
        </div>
      )}
      <div>
        <Stepper
          steps={stepStates}
          activeStep={step}
          color="indigo"
          className="mb-8"
          onStepClick={(i) => {
            if (i < step) setStep(i);
          }}
        />

        {/* Separador visual */}
        <div className="w-full flex items-center justify-center mb-10">
          <div className="w-full h-[2px] bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900 rounded-full shadow-md" />
        </div>
      </div>
      {/* Formulario principal */}
      <div
        ref={formContainerRef}
        className="form-container bg-white/90 dark:bg-neutral-900/90 rounded-xl px-4 md:px-10 py-8 flex flex-col gap-12 shadow-lg border border-indigo-100 dark:border-indigo-900"
        style={{overflowAnchor:'none'}}
      >
  <div ref={scrollAnchorRef} style={{ position:'relative', height:1, marginTop:-1 }} />
        {/* Título del paso actual */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {STEPS_DYNAMIC[step].label}
          </h2>
          {step === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Completa los datos básicos de tu obra
            </p>
          )}
          {step === 3 && (
            <p className="text-sm text-muted-foreground mt-2">
              Configura cómo será visible tu obra en el museo virtual
            </p>
          )}
        </div>

        {/* Mensaje de regreso del canvas */}
        {showCanvasReturnMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-green-800 dark:text-green-200 font-semibold text-sm">
                  ¡Bienvenido de vuelta del editor! 🎨
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Tu imagen se ha guardado correctamente. Puedes continuar completando los demás pasos de tu obra.
                </p>
              </div>
              <button
                onClick={() => setShowCanvasReturnMessage(false)}
                className="text-green-500 hover:text-green-700 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Geolocalización automática para el paso de ubicación */}
        {step === 2 && <GeolocateIfNeeded mural={mural} setMural={setMural} />}
        {step === 0 && (
          <div className="flex flex-col gap-10 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label htmlFor="titulo" className={labelClass}>
                  Título*
                </label>
                <input
                  id="titulo"
                  className="input-stepper"
                  value={mural.titulo}
                  onChange={handleTituloChange}
                  aria-invalid={!!errors.titulo}
                  placeholder="Ej: Mural de la esperanza"
                  autoComplete="off"
                  // onFocus scroll override removed
                  style={{ scrollMargin: 0 }}
                />
                {errors.titulo && (
                  <span className={errorClass}>{errors.titulo}</span>
                )}
              </div>
              <div>
                <label htmlFor="tecnica" className={labelClass}>
                  Técnica*
                </label>
                <input
                  id="tecnica"
                  className="input-stepper"
                  value={mural.tecnica}
                  onChange={handleTecnicaChange}
                  aria-invalid={!!errors.tecnica}
                  placeholder="Ej: Acrílico sobre muro"
                  autoComplete="off"
                  // onFocus scroll override removed
                  style={{ scrollMargin: 0 }}
                />
                {errors.tecnica && (
                  <span className={errorClass}>{errors.tecnica}</span>
                )}
              </div>
              <div>
                <label htmlFor="anio" className={labelClass}>
                  Año*
                </label>
                <select
                  className="input-stepper"
                  value={String(mural.anio)}
                  onChange={handleAnioChange}
                  // onFocus scroll override removed
                  style={{ scrollMargin: 0 }}
                >
                  <option value="">Selecciona el año</option>
                  {years.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                {errors.anio && (
                  <span className={errorClass}>{errors.anio}</span>
                )}
              </div>
              <div>
                <label htmlFor="dimensiones" className={labelClass}>
                  Dimensiones
                </label>
                <input
                  id="dimensiones"
                  className="input-stepper"
                  value={mural.dimensiones}
                  onChange={handleDimensionesChange}
                  placeholder="Ej: 3m x 5m"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="descripcion" className={labelClass}>
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="input-stepper min-h-[80px] resize-y mt-1"
                value={mural.descripcion}
                onChange={handleDescripcionChange}
                placeholder="Describe brevemente el mural, su inspiración, etc."
              />
            </div>
            <div>
              <label htmlFor="tags" className={labelClass}>
                Tags
              </label>
              <input
                id="tags"
                className="input-stepper"
                value={mural.tagsInput || ""}
                onChange={handleTagsInputChange}
                placeholder="Escribe un tag y presiona Enter o coma"
                autoComplete="off"
                onKeyDown={handleTagKeyDown}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {mural.tags.map((tag, i) => (
                  <Badge key={tag} variant="blue" className="pr-2 pl-3">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-blue-700 hover:text-red-500 focus:outline-none"
                      onClick={() => handleRemoveTag(i)}
                      aria-label={`Eliminar tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Imágenes y medios */}
        {step === 1 && (
          <MuralImageStep
            value={mural.url_imagen}
            onChange={handleImageChange}
            muralData={mural}
            editMode={editMode}
            obraId={initialData?.id}
          />
        )}
        {/* Step 3: Ubicación y sala */}
        {step === 2 && <LocationPicker mural={mural} setMural={setMural} />}
        {/* Step 4: Estado y visibilidad */}
        {step === 3 && (
          <div className="flex flex-col gap-8 mb-8">
            {/* Encabezado explicativo */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-blue-800 dark:text-blue-200 font-semibold text-sm mb-1">
                    Configuración de visibilidad y orden
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Define cómo y cuándo será visible tu obra en el museo virtual. Estos ajustes afectan la experiencia de los visitantes.
                  </p>
                </div>
              </div>
            </div>

            {/* Estado de la obra */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Estado de la obra
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "Activo",
                    label: "Activo",
                    description: "La obra está disponible y visible",
                    icon: <Eye className="h-4 w-4" />,
                    color: "green"
                  },
                  {
                    value: "En restauración",
                    label: "En restauración",
                    description: "Obra en proceso de restauración",
                    icon: <RefreshCw className="h-4 w-4" />,
                    color: "yellow"
                  },
                  {
                    value: "Oculto",
                    label: "Oculto",
                    description: "No visible para el público",
                    icon: <EyeOff className="h-4 w-4" />,
                    color: "gray"
                  },
                  {
                    value: "Archivado",
                    label: "Archivado",
                    description: "Obra archivada permanentemente",
                    icon: <Archive className="h-4 w-4" />,
                    color: "red"
                  }
                ].map((estado) => (
                  <div
                    key={estado.value}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      mural.estado === estado.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleEstadoChange(estado.value)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        estado.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        estado.color === 'yellow' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        estado.color === 'gray' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {estado.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {estado.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {estado.description}
                        </p>
                      </div>
                      {mural.estado === estado.value && (
                        <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opciones de visibilidad */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Opciones de visibilidad
                </h3>
              </div>

              {/* Pública */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Obra pública
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Los visitantes pueden ver esta obra en el museo virtual y en búsquedas públicas
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mural.publica}
                      onChange={(e) => handlePublicaChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Destacada */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Obra destacada
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Esta obra aparecerá en la sección de obras destacadas y tendrá mayor visibilidad
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mural.destacada}
                      onChange={(e) => handleDestacadaChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Orden de aparición */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Orden de aparición
                </h3>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <ArrowUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="orden"
                      className="block font-medium text-gray-900 dark:text-white mb-2"
                    >
                      Prioridad de visualización
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        id="orden"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                        type="number"
                        value={mural.orden}
                        onChange={(e) => handleOrdenChange(e.target.value)}
                        placeholder="0"
                        min={0}
                        max={999}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={handleOrdenDecrement}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={handleOrdenIncrement}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <HelpCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Las obras con números menores aparecen primero. Usa 0 para máxima prioridad, 
                        números mayores para menor prioridad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de configuración */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Resumen de configuración:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    mural.estado === 'Activo' ? 'bg-green-500' :
                    mural.estado === 'En restauración' ? 'bg-yellow-500' :
                    mural.estado === 'Oculto' ? 'bg-gray-500' :
                    mural.estado === 'Archivado' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {mural.estado || 'Sin estado definido'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${mural.publica ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {mural.publica ? 'Pública' : 'Privada'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${mural.destacada ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {mural.destacada ? 'Destacada' : 'Normal'}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Orden de prioridad: {mural.orden || 0}
              </div>
            </div>
          </div>
        )}
        {/* Step 5: Autores y colaboradores */}
        {step === 4 && (
          <AutoresColaboradoresStep
            mural={mural}
            setMural={setMural}
            artistList={artistList}
          />
        )}
        {/* Step 6: Confirmación */}
        {step === 5 && (
          <div className="flex flex-col gap-10 mb-8">
            {successMessage ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-500 h-6 w-6" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">¡Éxito!</h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-4">{successMessage}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">Redirigiendo a tus obras...</p>
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Modelo 3D generado y listo para AR</span>
                  </div>
                </div>
              </div>
            ) : apiError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-red-500 h-6 w-6" />
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error al crear la obra</h3>
                </div>
                <p className="text-red-700 dark:text-red-300 mb-4">{apiError.message}</p>
                {apiError.details && <p className="text-sm text-red-600 dark:text-red-400 mb-4">Detalles: {apiError.details}</p>}
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={() => { setApiError(null); handleCreateMural(); }} className="bg-red-600 hover:bg-red-700 text-white">Reintentar</Button>
                  <Button onClick={() => setApiError(null)} variant="outline">Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
                  {/* Imagen */}
                  <div className="xl:col-span-2 flex flex-col gap-4">
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-neutral-800/60 p-4 shadow-md">
                      <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 tracking-wide uppercase">Vista previa</h3>
                      <div className="aspect-square w-full flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700">
                        {mural.url_imagen ? (
                          <img src={mural.url_imagen} alt="preview" className="object-contain w-full h-full" />
                        ) : (
                          <span className="text-gray-400 text-sm">Sin imagen</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setStep(1)} className="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition">Cambiar imagen</button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4 text-xs leading-relaxed text-blue-700 dark:text-blue-300">
                      Se generará automáticamente un modelo 3D optimizado. Puedes editarlo luego.
                    </div>
                  </div>
                  {/* Resumen */}
                  <div className="xl:col-span-3 flex flex-col gap-6">
                    {/* Básico */}
                    <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"><User className="w-4 h-4" />Datos básicos</h4>
                        <button type="button" onClick={() => setStep(0)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <SummaryRow label="Título" value={mural.titulo} full />
                        <SummaryRow label="Técnica" value={mural.tecnica} full />
                        <SummaryRow label="Año" value={mural.anio || '-'} full />
                        <SummaryRow label="Dimensiones" value={mural.dimensiones || '—'} full />
                        <SummaryRow label="Tags" value={mural.tags?.length ? mural.tags.join(', ') : '—'} full />
                        {mural.descripcion && <SummaryRow label="Descripción" value={mural.descripcion} full multiline />}
                      </div>
                    </div>
                    {/* Ubicación / Sala */}
                    <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Navigation className="w-4 h-4" />Ubicación</h4>
                        <button type="button" onClick={() => setStep(2)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <SummaryRow label="Dirección" value={mural.ubicacion || '—'} full />
                        <SummaryRow label="Latitud" value={mural.latitud || '—'} full />
                        <SummaryRow label="Longitud" value={mural.longitud || '—'} full />
                        <SummaryRow label="Sala" value={mural.salaId ? (salas.find(s => s.id === mural.salaId)?.nombre || mural.salaId) : '—'} full />
                      </div>
                    </div>
                    {/* Estado / Visibilidad */}
                    <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Eye className="w-4 h-4" />Estado y visibilidad</h4>
                        <button type="button" onClick={() => setStep(3)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <SummaryRow label="Estado" value={mural.estado || '—'} full />
                        <SummaryRow label="Pública" value={mural.publica ? 'Sí' : 'No'} />
                        <SummaryRow label="Destacada" value={mural.destacada ? 'Sí' : 'No'} />
                        <SummaryRow label="Orden" value={String(mural.orden || 0)} />
                      </div>
                    </div>
                    {/* Autoría */}
                    <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2"><Users className="w-4 h-4" />Autoría</h4>
                        <button type="button" onClick={() => setStep(4)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Editar</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <SummaryRow label="Autor libre" value={mural.autor || '—'} full />
                        <SummaryRow label="Artista ID" value={mural.artistId || '—'} />
                        <SummaryRow label="Colaboradores" value={mural.colaboradores?.length ? mural.colaboradores.length + ' seleccionado(s)' : '—'} full />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
                  <Button variant="secondary" onClick={() => setStep(4)}>Volver</Button>
                  <Button className="min-w-[180px]" onClick={handleCreateMural} disabled={isCreating || generatingModel}>
                    {isCreating ? (
                      generatingModel ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          {modelGenerationStep || 'Generando modelo 3D...'}
                        </div>
                      ) : editMode ? (
                        'Actualizando obra...'
                      ) : (
                        'Creando obra...'
                      )
                    ) : editMode ? 'Actualizar obra' : 'Crear obra'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        {/* Navegación */}
        <div className="flex gap-2 justify-end mt-8">
          <Button
            variant="ghost"
            onClick={() => setShowClearDraftModal(true)}
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar borrador
          </Button>
          {step > 0 && (
            <Button variant="secondary" onClick={handleBack}>
              Atrás
            </Button>
          )}
          {step < STEPS_DYNAMIC.length - 1 && (
            <Button onClick={handleNext}>Siguiente</Button>
          )}
        </div>
      </div>

      {/* Modal de confirmación para limpiar borrador */}
      <SimpleModal
        isOpen={showClearDraftModal}
        onClose={() => setShowClearDraftModal(false)}
        title="¿Limpiar borrador?"
      >
        <div className="flex flex-col gap-4 items-center text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <Trash2 className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Limpiar borrador</h3>
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Esta acción eliminará completamente todos los datos del borrador
            actual, incluyendo:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Toda la información ingresada</li>
            <li>• Imágenes subidas o creadas</li>
            <li>• Progreso del formulario</li>
            <li>• Datos guardados localmente</li>
          </ul>
          <p className="text-center text-red-600 dark:text-red-400 font-medium">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
              onClick={() => setShowClearDraftModal(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition flex items-center gap-2"
              onClick={handleClearDraft}
            >
              <Trash2 className="w-4 h-4" />
              Limpiar borrador
            </button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}

// Utilidad para reverse geocoding con Nominatim
async function fetchAddressFromLatLon(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.display_name || "";
  } catch {
    return "";
  }
}

// Utilidad para detectar dark mode
function isDarkMode() {
  if (typeof window !== "undefined") {
    return (
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
  return false;
}

// Componente auxiliar para geolocalización automática y reverse geocoding
function GeolocateIfNeeded({ mural, setMural }) {
  // Obtener coords iniciales si faltan
  useEffect(() => {
    if (!mural.latitud && !mural.longitud && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let ubicacion = mural.ubicacion;
          if (!ubicacion) {
            ubicacion = await fetchAddressFromLatLon(lat, lon);
          }
          setMural((m) => ({ ...m, latitud: lat, longitud: lon, ubicacion }));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [mural.latitud, mural.longitud, mural.ubicacion, setMural]);

  // Reverse geocoding si se escogieron coords manualmente sin dirección
  useEffect(() => {
    if (mural.latitud && mural.longitud && !mural.ubicacion) {
      let ignore = false;
      fetchAddressFromLatLon(mural.latitud, mural.longitud).then((address) => {
        if (!ignore && address) {
          setMural((m) => ({ ...m, ubicacion: address }));
        }
      });
      return () => { ignore = true; };
    }
  }, [mural.latitud, mural.longitud, mural.ubicacion, setMural]);
  return null;
}

// Hook para cargar salas desde la API
function useSalas() {
  const [salas, setSalas] = useState([]);
  useEffect(() => {
    fetch("/api/salas")
      .then((res) => res.json())
      .then((data) => setSalas(data.salas || []))
      .catch(() => setSalas([]));
  }, []);
  return salas;
}

// Hook para cargar usuarios desde la API
function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data.usuarios || []))
      .catch(() => setUsuarios([]));
  }, []);
  return usuarios;
}

// Componente para seleccionar ubicación con pin draggable y confirmación
function LocationPicker({ mural, setMural }) {
  const salas = useSalas();
  
  // Utilidad para generar SVG string de iconos Lucide mejorados
  function getLucideSvgUrl(iconName = "map-pin", color = "#DC2626", size = 32) {
    let svg = "";
    if (iconName === "map-pin") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' fill='${color}' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-map-pin' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='10' fill='${color}' stroke='white' stroke-width='2'/>
        <path d='M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0' fill='white'/>
        <path d='m21 21-6-6' stroke='white' stroke-width='2'/>
      </svg>`;
    } else if (iconName === "navigation") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' fill='${color}' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-navigation' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='10' fill='${color}' stroke='white' stroke-width='2'/>
        <polygon points='3,11 22,2 13,21 11,13 3,11' fill='white'/>
      </svg>`;
    } else if (iconName === "map-marker") {
      svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' fill='${color}' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='8' fill='${color}' stroke='white' stroke-width='2'/>
        <path d='m12 8-3 3 3 3 3-3-3-3' fill='white'/>
        <circle cx='12' cy='12' r='2' fill='${color}'/>
      </svg>`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const [tempLatLng, setTempLatLng] = useLocalState(() => [
    mural.latitud && !isNaN(Number(mural.latitud))
      ? Number(mural.latitud)
      : 18.9996,
    mural.longitud && !isNaN(Number(mural.longitud))
      ? Number(mural.longitud)
      : -98.2417,
  ]);
  const [showConfirm, setShowConfirm] = useLocalState(false);
  const [loading, setLoading] = useLocalState(false);
  const [mapKey, setMapKey] = useLocalState(0); // Para forzar re-render del mapa

  // Icono personalizado para el marcador
  const locationIcon = new Icon({
    iconUrl: getLucideSvgUrl("navigation", "#DC2626", 36),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    className: "leaflet-location-icon drop-shadow-lg",
  });

  function DraggableMarker() {
    const [position, setPosition] = useLocalState(tempLatLng);
    const eventHandlers = {
      dragend(e) {
        const marker = e.target;
        const latlng = marker.getLatLng();
        setPosition([latlng.lat, latlng.lng]);
        setTempLatLng([latlng.lat, latlng.lng]);
        setShowConfirm(true);
      },
    };
    return (
      <Marker
        position={position}
        icon={locationIcon}
        draggable={true}
        eventHandlers={eventHandlers}
      />
    );
  }

  // Componente para manejar clics en el mapa
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setTempLatLng([lat, lng]);
        setShowConfirm(true);
      },
    });
    return null;
  }

  // Centrar el mapa en la posición temporal
  const mapCenter = tempLatLng;

  // Confirmar ubicación: actualiza mural.lat/lon y hace reverse geocoding
  const handleConfirm = async () => {
    setLoading(true);
    const [lat, lon] = tempLatLng;
    const ubicacion = await fetchAddressFromLatLon(lat, lon);
    setMural((m) => ({ ...m, latitud: lat, longitud: lon, ubicacion }));
    setShowConfirm(false);
    setLoading(false);
  };

  // Función para centrar el mapa en una ubicación específica
  const centerMapOn = (coords, zoomLevel = 16) => {
    setTempLatLng(coords);
    setMapKey(prev => prev + 1); // Forzar re-render
  };

  // Obtener ubicación actual del usuario
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          centerMapOn(coords, 17);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener tu ubicación actual");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Tu navegador no soporta geolocalización");
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-gray-700 dark:text-gray-200">
          Selecciona la ubicación del mural en el mapa
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            title="Usar mi ubicación actual"
          >
            <Navigation className="w-4 h-4" />
            Mi ubicación
          </button>
          <button
            type="button"
            onClick={() => centerMapOn([19.0432, -98.1987], 15)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            title="Centrar en BUAP"
          >
            <Navigation className="w-4 h-4" />
            BUAP
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-neutral-700 shadow-lg">
          <MapContainer
            key={mapKey}
            center={mapCenter}
            zoom={15}
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
            dragging={true}
            zoomControl={true}
            attributionControl={true}
            minZoom={3}
            maxZoom={19}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker />
            <MapClickHandler />
          </MapContainer>
        </div>
        
        {/* Indicadores de ayuda */}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg p-3 shadow-md border border-gray-200 dark:border-neutral-700">
          <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Info className="w-3 h-3" />
            Arrastra el marcador o haz clic en el mapa
          </p>
        </div>
        
        {/* Coordenadas actuales */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 dark:border-neutral-700">
          <p className="text-xs text-gray-600 dark:text-gray-300 font-mono">
            {tempLatLng[0].toFixed(6)}, {tempLatLng[1].toFixed(6)}
          </p>
        </div>
      </div>
      {showConfirm && (
        <div className="flex items-center justify-center">
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Confirmando ubicación...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirmar ubicación
              </>
            )}
          </button>
        </div>
      )}
      {/* Inputs debajo del mapa */}
      <div>
        <label
          htmlFor="ubicacion"
          className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
        >
          Ubicación
        </label>
        <input
          id="ubicacion"
          type="text"
          placeholder="Ejemplo: Edificio A, Planta Baja, Pasillo 2"
          value={mural.ubicacion}
          onChange={(e) =>
            setMural((m) => ({ ...m, ubicacion: e.target.value }))
          }
          className="input-stepper"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label
            htmlFor="latitud"
            className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
          >
            Latitud
          </label>
          <input
            id="latitud"
            type="number"
            placeholder="Ejemplo: 19.0432"
            value={
              mural.latitud !== undefined && mural.latitud !== null
                ? String(mural.latitud)
                : ""
            }
            onChange={(e) =>
              setMural((m) => ({ ...m, latitud: e.target.value }))
            }
            className="input-stepper"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="longitud"
            className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
          >
            Longitud
          </label>
          <input
            id="longitud"
            type="number"
            placeholder="Ejemplo: -98.1987"
            value={
              mural.longitud !== undefined && mural.longitud !== null
                ? String(mural.longitud)
                : ""
            }
            onChange={(e) =>
              setMural((m) => ({ ...m, longitud: e.target.value }))
            }
            className="input-stepper"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="salaId"
          className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
        >
          Sala
        </label>
        <select
          id="salaId"
          className="input-stepper"
          value={mural.salaId || ""}
          onChange={(e) => setMural((m) => ({ ...m, salaId: e.target.value }))}
        >
          <option value="">Selecciona una sala (opcional)</option>
          {salas.map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.nombre ? `${sala.nombre} (ID: ${sala.id})` : sala.id}
            </option>
          ))}
        </select>
      </div>
      {/*
      <div>
        <label htmlFor="exposiciones" className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200">Exposiciones (JSON)</label>
        <input
          id="exposiciones"
          type="text"
          placeholder='Ejemplo: ["Expo 2023", "Muestra Digital"]'
          value={JSON.stringify(mural.exposiciones)}
          onChange={(e) => setMural((m) => ({
            ...m,
            exposiciones: e.target.value ? JSON.parse(e.target.value) : [],
          }))}
          className="input-stepper font-mono"
        />
      </div>
      */}
    </div>
  );
}

// Componente para autores, artista y colaboradores con selects
function AutoresColaboradoresStep({ mural, setMural, artistList }) {
  const usuarios = useUsuarios();

  // Opciones para react-select
  const userOptions = usuarios.map((u) => ({
    value: u.id,
    label: u.name ? `${u.name} (${u.email})` : u.email,
  }));

  // Opciones para artistas (usando artistList del componente padre)
  const artistOptions = artistList.map((artist) => ({
    value: artist.id,
    label: artist.user?.name
      ? `${artist.user.name} (Artista)`
      : `Artista ${artist.id}`,
  }));

  // Para autor principal, puedes usar name o id según tu modelo
  const autorOption =
    userOptions.find((opt) => opt.value === mural.autor) || null;
  const artistaOption =
    artistOptions.find((opt) => opt.value === mural.artistId) || null;
  const colaboradoresOptions = userOptions.filter((opt) =>
    (mural.colaboradores || []).includes(opt.value)
  );

  // Función para manejar cambios en autor (texto libre)
  const handleAutorChange = (opt) => {
    setMural((m) => ({
      ...m,
      autor: opt ? opt.value : "",
      // Limpiar artistId si se selecciona un autor
      artistId: opt ? "" : m.artistId,
    }));
  };

  // Función para manejar cambios en artista (referencia)
  const handleArtistChange = (opt) => {
    setMural((m) => ({
      ...m,
      artistId: opt ? opt.value : "",
      // Limpiar autor si se selecciona un artista
      autor: opt ? "" : m.autor,
    }));
  };

  // Modo de asignación (mutuamente excluyente) para claridad de UI
  const [mode, setMode] = React.useState(() => (mural.artistId ? 'artist' : 'autor'));
  React.useEffect(() => {
    if (mural.artistId && mode !== 'artist') setMode('artist');
    else if (!mural.artistId && mural.autor && mode !== 'autor') setMode('autor');
  }, [mural.artistId, mural.autor, mode]);

  const switchMode = (next) => {
    setMode(next);
    if (next === 'artist') {
      // Limpiar autor libre cuando se elige artista
      setMural(m => ({ ...m, autor: '' }));
    } else {
      // Limpiar artista cuando se elige autor libre
      setMural(m => ({ ...m, artistId: '' }));
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Autor / Artista</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">Elige si quieres escribir un autor libre o asociar un artista registrado. Son excluyentes.</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 w-fit">
            <button type="button" onClick={() => switchMode('autor')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode==='autor' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Autor libre</button>
            <button type="button" onClick={() => switchMode('artist')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600 ${mode==='artist' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Artista registrado</button>
          </div>
        </div>
        {mode === 'autor' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre del autor</label>
            <input
              type="text"
              placeholder="Ej: Diego Rivera"
              value={mural.autor || ''}
              onChange={(e) => setMural(m => ({ ...m, autor: e.target.value }))}
              className="input-stepper"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Escribe cualquier nombre. Si necesitas enlazar a un artista del sistema cambia al modo "Artista registrado".</p>
          </div>
        )}
        {mode === 'artist' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Seleccionar artista</label>
            <ReactSelect
              inputId="artistId"
              classNamePrefix="react-select"
              options={artistOptions}
              value={artistaOption}
              onChange={handleArtistChange}
              placeholder="Buscar artista..."
              isClearable
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              styles={
                isDarkMode()
                  ? {
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: '#18181b',
                        borderColor: state.isFocused ? '#6366f1' : '#27272a',
                        color: '#fff',
                        boxShadow: state.isFocused ? '0 0 0 1.5px #6366f1' : undefined,
                      }),
                      menu: (base) => ({ ...base, backgroundColor: '#222', color: '#fff' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? '#6366f1'
                          : state.isFocused
                            ? '#3730a3'
                            : '#222',
                        color: '#fff',
                      }),
                      placeholder: (base) => ({ ...base, color: '#a1a1aa' }),
                      singleValue: (base) => ({ ...base, color: '#fff' }),
                      input: (base) => ({ ...base, color: '#fff' }),
                    }
                  : { menuPortal: (base) => ({ ...base, zIndex: 9999 }) }
              }
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Lista de artistas vinculados a usuarios. Si no aparece, usa el modo "Autor libre".</p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="colaboradores"
          className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
        >
          Colaboradores
        </label>
        <ReactSelect
          inputId="colaboradores"
          classNamePrefix="react-select"
          options={userOptions}
          value={colaboradoresOptions}
          onChange={(opts) =>
            setMural((m) => ({
              ...m,
              colaboradores: opts ? opts.map((o) => o.value) : [],
            }))
          }
          isMulti
          placeholder="Selecciona uno o varios usuarios"
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
          styles={
            isDarkMode()
              ? {
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: "#18181b",
                    borderColor: state.isFocused ? "#6366f1" : "#27272a",
                    color: "#fff",
                    boxShadow: state.isFocused
                      ? "0 0 0 1.5px #6366f1"
                      : undefined,
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#222",
                    color: "#fff",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#6366f1"
                      : state.isFocused
                        ? "#3730a3"
                        : "#222",
                    color: state.isSelected ? "#fff" : "#fff",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#6366f1",
                    color: "#fff",
                  }),
                  multiValueLabel: (base) => ({ ...base, color: "#fff" }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#fff",
                    ":hover": { backgroundColor: "#3730a3", color: "#fff" },
                  }),
                  placeholder: (base) => ({ ...base, color: "#a1a1aa" }),
                  singleValue: (base) => ({ ...base, color: "#fff" }),
                  input: (base) => ({ ...base, color: "#fff" }),
                }
              : { menuPortal: (base) => ({ ...base, zIndex: 9999 }) }
          }
        />
      </div>
    </div>
  );
}

// Helper component for summary rows (after AutoresColaboradoresStep definition)
function SummaryRow({ label, value, full=false, multiline=false }) {
  return (
    <div className={`flex ${full ? 'sm:col-span-2' : 'col-span-1'} ${multiline ? 'items-start' : 'items-center'} gap-2`}>
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 w-28 shrink-0">{label}</span>
      <span className={`text-sm text-gray-800 dark:text-gray-100 ${multiline ? 'whitespace-pre-line leading-relaxed' : full ? 'break-words' : 'truncate'}`}>{value || '—'}</span>
    </div>
  );
}

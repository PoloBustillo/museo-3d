"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Stepper from "@/components/ui/Stepper";
import {
  CheckCircle,
  AlertCircle,
  Home,
  Brush,
  Music,
  ListChecks,
  Trash2,
  ChevronDown,
  Eye,
  Grid3x3,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { useCrearSalaStore } from "./crearSalaStore";

export default function CrearSalaStepper({ scrollParentRef = null }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [showClearDraftModal, setShowClearDraftModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Zustand store
  const {
    nombre,
    descripcion,
    murales,
    texturas,
    setNombre,
    setDescripcion,
    addMural,
    removeMural,
    setTextureFloor,
    setTextureWalls,
    reset,
  } = useCrearSalaStore();

  // State for textures
  const [availableTextures, setAvailableTextures] = useState([]);
  const [loadingTextures, setLoadingTextures] = useState(false);
  const [textureError, setTextureError] = useState(null);

  // Modal states
  const [showTextureModal, setShowTextureModal] = useState(false);
  const [selectedTextureType, setSelectedTextureType] = useState(null); // 'floor' or 'walls'
  const [textureFilter, setTextureFilter] = useState("all"); // 'all', 'floor', 'wall', 'generic'

  // Steps configuration
  const STEPS_DYNAMIC = [
    {
      label: "Datos básicos",
      subtitle: "Información principal",
      icon: <Home />,
    },
    {
      label: "Texturas",
      subtitle: "Personalización visual",
      icon: <Brush />,
    },
    {
      label: "Configuración",
      subtitle: "Audio y ambiente",
      icon: <Music />,
    },
    {
      label: "Murales",
      subtitle: "Seleccionar obras",
      icon: <ListChecks />,
    },
    {
      label: "Confirmar",
      subtitle: "Revisa y crea",
      icon: <CheckCircle />,
    },
  ];

  const hasMounted = useRef(false);
  const formContainerRef = useRef(null);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Load textures from API
  useEffect(() => {
    const loadTextures = async () => {
      setLoadingTextures(true);
      setTextureError(null);
      try {
        const response = await fetch("/api/textures");
        if (!response.ok) {
          throw new Error("Error al cargar las texturas");
        }
        const data = await response.json();
        setAvailableTextures(data.textures || []);
      } catch (error) {
        console.error("Error loading textures:", error);
        setTextureError(error.message);
      } finally {
        setLoadingTextures(false);
      }
    };

    loadTextures();
  }, []);

  // Validation for each step
  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!nombre.trim()) e.nombre = "El nombre es requerido";
      if (!descripcion.trim()) e.descripcion = "La descripción es requerida";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Texture helper functions
  const openTextureModal = (type) => {
    setSelectedTextureType(type);
    setTextureFilter(type === "floor" ? "floor" : "wall");
    setShowTextureModal(true);
  };

  const selectTexture = (texture) => {
    if (selectedTextureType === "floor") {
      setTextureFloor(texture);
    } else if (selectedTextureType === "walls") {
      setTextureWalls(texture);
    }
    setShowTextureModal(false);
  };

  const getFilteredTextures = () => {
    if (textureFilter === "all") return availableTextures;
    return availableTextures.filter(
      (texture) =>
        texture.category === textureFilter ||
        (textureFilter === "floor" && texture.category === "generic") ||
        (textureFilter === "wall" && texture.category === "generic")
    );
  };

  const formatTextureName = (name) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  // Create sala handler
  const handleCreateSala = async () => {
    if (!nombre.trim() || !descripcion.trim()) {
      alert("Por favor completa los datos básicos");
      return;
    }

    setIsCreating(true);

    try {
      const salaData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        murales: murales,
        texturas: {
          piso: texturas.piso,
          paredes: texturas.paredes,
        },
        userId: session?.user?.id,
      };

      const response = await fetch("/api/salas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(salaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la sala");
      }

      const result = await response.json();
      setSuccessMessage("¡Sala creada exitosamente!");

      // Clear the form
      reset();

      // Redirect after a delay
      setTimeout(() => {
        router.push("/mis-salas");
      }, 2000);
    } catch (error) {
      console.error("Error creating sala:", error);
      setApiError({
        message: error.message || "Error al crear la sala",
        details: error.details || "",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Clear draft handler
  const handleClearDraft = () => {
    reset();
    setStep(0);
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    setShowClearDraftModal(false);
  };

  // Step states for visual feedback
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

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-border p-0 md:p-8">
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

        {/* Visual separator */}
        <div className="w-full flex items-center justify-center mb-10">
          <div className="w-full h-[2px] bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900 rounded-full shadow-md" />
        </div>
      </div>

      {/* Main form */}
      <div
        ref={formContainerRef}
        className="form-container bg-white/90 dark:bg-neutral-900/90 rounded-xl px-4 md:px-10 py-8 flex flex-col gap-12 shadow-lg border border-indigo-100 dark:border-indigo-900"
      >
        {/* Current step title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {STEPS_DYNAMIC[step].label}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {STEPS_DYNAMIC[step].subtitle}
          </p>
        </div>

        {/* Step 0: Datos básicos */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div>
              <Label
                htmlFor="nombre"
                className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
              >
                Nombre de la sala *
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Mi galería personal"
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && (
                <span className="text-red-500 text-xs mt-1 block">
                  {errors.nombre}
                </span>
              )}
            </div>

            <div>
              <Label
                htmlFor="descripcion"
                className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-200"
              >
                Descripción *
              </Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu sala y qué tipo de obras contendrá..."
                rows={4}
                className={errors.descripcion ? "border-red-500" : ""}
              />
              {errors.descripcion && (
                <span className="text-red-500 text-xs mt-1 block">
                  {errors.descripcion}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Texturas */}
        {step === 1 && (
          <div className="flex flex-col gap-8">
            {loadingTextures ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Cargando texturas...
                </span>
              </div>
            ) : textureError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">
                  Error al cargar texturas: {textureError}
                </p>
              </div>
            ) : (
              <>
                {/* Selector compacto de texturas */}
                <div className="space-y-6">
                  {/* Textura del piso */}
                  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Home className="w-5 h-5 text-indigo-600" />
                        Textura del piso
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTextureModal("floor")}
                        className="flex items-center gap-2"
                      >
                        <Grid3x3 className="w-4 h-4" />
                        Explorar texturas
                      </Button>
                    </div>

                    {texturas.piso ? (
                      <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-4">
                          <img
                            src={texturas.piso.previewUrl}
                            alt={texturas.piso.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatTextureName(texturas.piso.name)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {texturas.piso.category === "generic"
                                ? "Textura universal"
                                : `Textura de ${texturas.piso.category}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTextureModal("floor")}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Cambiar
                          </Button>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                        onClick={() => openTextureModal("floor")}
                      >
                        <div className="text-center">
                          <Brush className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Seleccionar textura de piso
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Haz clic para explorar opciones
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Textura de las paredes */}
                  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Brush className="w-5 h-5 text-indigo-600" />
                        Textura de las paredes
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTextureModal("walls")}
                        className="flex items-center gap-2"
                      >
                        <Grid3x3 className="w-4 h-4" />
                        Explorar texturas
                      </Button>
                    </div>

                    {texturas.paredes ? (
                      <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-4">
                          <img
                            src={texturas.paredes.previewUrl}
                            alt={texturas.paredes.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatTextureName(texturas.paredes.name)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {texturas.paredes.category === "generic"
                                ? "Textura universal"
                                : `Textura de ${texturas.paredes.category}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTextureModal("walls")}
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Cambiar
                          </Button>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                        onClick={() => openTextureModal("walls")}
                      >
                        <div className="text-center">
                          <Brush className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Seleccionar textura de paredes
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Haz clic para explorar opciones
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consejos */}
                <div className="bg-blue-50/70 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-blue-700 dark:text-blue-300 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    💡 Consejos de texturas
                  </h3>
                  <ul className="text-blue-600 dark:text-blue-400 text-sm space-y-1">
                    <li>
                      • Usa el modal para explorar todas las texturas
                      disponibles
                    </li>
                    <li>
                      • Las texturas se pueden filtrar por categoría (piso,
                      pared, universal)
                    </li>
                    <li>
                      • Puedes cambiar las texturas en cualquier momento durante
                      o después de la creación
                    </li>
                    <li>
                      • Las texturas universales funcionan bien tanto en pisos
                      como en paredes
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Configuración */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="bg-green-50/70 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-green-700 dark:text-green-300 font-semibold mb-2">
                Audio y ambiente
              </h3>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Próximamente podrás agregar música de fondo y efectos de sonido
                para crear una experiencia inmersiva.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Murales */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="bg-purple-50/70 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="text-purple-700 dark:text-purple-300 font-semibold mb-2">
                Seleccionar obras
              </h3>
              <p className="text-purple-600 dark:text-purple-400 text-sm">
                Después de crear la sala, podrás agregar tus obras desde la
                sección "Mis Salas".
              </p>
            </div>
            {murales.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obras seleccionadas: {murales.length}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmación */}
        {step === 4 && (
          <div className="flex flex-col gap-10 mb-8">
            {successMessage ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-500 h-6 w-6" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    ¡Éxito!
                  </h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  {successMessage}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  Redirigiendo a tus salas...
                </p>
              </div>
            ) : apiError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-red-500 h-6 w-6" />
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Error al crear la sala
                  </h3>
                </div>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  {apiError.message}
                </p>
                {apiError.details && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Detalles: {apiError.details}
                  </p>
                )}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => {
                      setApiError(null);
                      handleCreateSala();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reintentar
                  </Button>
                  <Button onClick={() => setApiError(null)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Datos básicos */}
                  <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
                      <Home className="w-4 h-4" />
                      Datos básicos
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 w-20 shrink-0">
                          Nombre
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-100">
                          {nombre || "—"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 w-20 shrink-0">
                          Descripción
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed">
                          {descripcion || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Texturas */}
                  <div className="rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/70 p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
                      <Brush className="w-4 h-4" />
                      Texturas seleccionadas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Piso */}
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-2">
                          Piso
                        </span>
                        {texturas.piso ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={texturas.piso.previewUrl}
                              alt={texturas.piso.name}
                              className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-100">
                              {texturas.piso.name
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No seleccionado
                          </span>
                        )}
                      </div>

                      {/* Paredes */}
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 block mb-2">
                          Paredes
                        </span>
                        {texturas.paredes ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={texturas.paredes.previewUrl}
                              alt={texturas.paredes.name}
                              className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-100">
                              {texturas.paredes.name
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No seleccionado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    Volver
                  </Button>
                  <Button
                    className="min-w-[180px]"
                    onClick={handleCreateSala}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creando sala..." : "Crear sala"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 justify-end mt-8">
          <Button
            variant="ghost"
            onClick={() => setShowClearDraftModal(true)}
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
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

      {/* Texture selection modal */}
      <SimpleModal
        isOpen={showTextureModal}
        onClose={() => setShowTextureModal(false)}
        title={`Seleccionar textura ${selectedTextureType === "floor" ? "de piso" : "de paredes"}`}
        size="large"
      >
        <div className="flex flex-col gap-4">
          {/* Filter tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-800 rounded-lg">
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                textureFilter === "all"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setTextureFilter("all")}
            >
              Todas ({availableTextures.length})
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                textureFilter === "floor"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setTextureFilter("floor")}
            >
              Pisos (
              {availableTextures.filter((t) => t.category === "floor").length})
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                textureFilter === "wall"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setTextureFilter("wall")}
            >
              Paredes (
              {availableTextures.filter((t) => t.category === "wall").length})
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                textureFilter === "generic"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setTextureFilter("generic")}
            >
              Universales (
              {availableTextures.filter((t) => t.category === "generic").length}
              )
            </button>
          </div>

          {/* Texture grid */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {getFilteredTextures().map((texture) => (
                <div
                  key={texture.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    (selectedTextureType === "floor"
                      ? texturas.piso?.id
                      : texturas.paredes?.id) === texture.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 ring-opacity-50"
                      : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                  onClick={() => selectTexture(texture)}
                >
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={texture.previewUrl}
                      alt={texture.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {formatTextureName(texture.name)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {texture.category === "generic"
                        ? "Universal"
                        : texture.category}
                    </p>
                  </div>
                  {(selectedTextureType === "floor"
                    ? texturas.piso?.id
                    : texturas.paredes?.id) === texture.id && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}

                  {/* Quality indicators */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {texture.completeness.hasNormal && (
                      <div
                        className="bg-green-500 text-white rounded-full w-2 h-2"
                        title="Tiene normal map"
                      />
                    )}
                    {texture.completeness.hasRoughness && (
                      <div
                        className="bg-blue-500 text-white rounded-full w-2 h-2"
                        title="Tiene roughness map"
                      />
                    )}
                    {texture.completeness.hasMetalness && (
                      <div
                        className="bg-purple-500 text-white rounded-full w-2 h-2"
                        title="Tiene metalness map"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {getFilteredTextures().length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Brush className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No hay texturas disponibles
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Intenta con otro filtro
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info footer */}
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Indicadores de calidad:</strong>
              <span className="ml-2 inline-flex items-center gap-1">
                <div className="bg-green-500 rounded-full w-2 h-2"></div>Normal
              </span>
              <span className="ml-2 inline-flex items-center gap-1">
                <div className="bg-blue-500 rounded-full w-2 h-2"></div>
                Rugosidad
              </span>
              <span className="ml-2 inline-flex items-center gap-1">
                <div className="bg-purple-500 rounded-full w-2 h-2"></div>
                Metalizado
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <Button
              variant="outline"
              onClick={() => setShowTextureModal(false)}
            >
              Cancelar
            </Button>
            {(selectedTextureType === "floor"
              ? texturas.piso
              : texturas.paredes) && (
              <Button
                onClick={() => setShowTextureModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Usar textura seleccionada
              </Button>
            )}
          </div>
        </div>
      </SimpleModal>

      {/* Clear draft modal */}
      <SimpleModal
        isOpen={showClearDraftModal}
        onClose={() => setShowClearDraftModal(false)}
        title="¿Limpiar datos?"
      >
        <div className="flex flex-col gap-4 items-center text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <Trash2 className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Limpiar datos</h3>
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300">
            Esta acción eliminará todos los datos ingresados en el formulario.
          </p>
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
              Limpiar
            </button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Shield,
  Users,
  Globe,
  Lock,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { useCrearSalaStore } from "./crearSalaStore";

export default function CrearSalaStepper() {
  const router = useRouter();
  const { data: session } = useSession();
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
    privacidad,
    colaboradores,
    step,
    setNombre,
    setDescripcion,
    setStep,
    setTextureFloor,
    setTextureWalls,
    setPrivacidad,
    addColaborador,
    removeColaborador,
    reset,
  } = useCrearSalaStore();

  // Texture modal states
  const [showTextureModal, setShowTextureModal] = useState(false);
  const [selectedTextureType, setSelectedTextureType] = useState(null);
  const [textureFilter, setTextureFilter] = useState("all");
  const [availableTextures, setAvailableTextures] = useState([]);
  const [loadingTextures, setLoadingTextures] = useState(false);
  const [textureError, setTextureError] = useState(null);

  // User search states
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

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
      label: "Privacidad",
      subtitle: "Configuración de acceso",
      icon: <Shield />,
    },
    {
      label: "Colaboradores",
      subtitle: "Gestión de usuarios",
      icon: <Users />,
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

  // Load textures
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

  // Search users with debouncing
  useEffect(() => {
    const searchUsers = async () => {
      if (userSearchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(userSearchQuery)}&limit=10`
        );
        if (!response.ok) {
          throw new Error("Error al buscar usuarios");
        }
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [userSearchQuery]);

  // Validation
  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!nombre.trim()) e.nombre = "El nombre es requerido";
      if (!descripcion.trim()) e.descripcion = "La descripción es requerida";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Texture functions
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

  // Collaborator functions
  const addUserAsCollaborator = (user) => {
    addColaborador({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    });
    setUserSearchQuery("");
    setShowUserSearch(false);
  };

  // Create sala
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
        publica: privacidad.publica,
        esPrivada: privacidad.esPrivada,
        colaboradores: colaboradores.map((c) => c.id),
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

  // Clear draft
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
    <div className="w-full max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 rounded-2xl shadow-xl border border-border p-2 sm:p-4 md:p-8">
      <div className="mb-4 sm:mb-8">
        <Stepper
          steps={stepStates}
          activeStep={step}
          color="indigo"
          maxVisible={5}
          className="mb-4 sm:mb-8"
          onStepClick={(i) => {
            if (i < step) setStep(i);
          }}
        />

        {/* Visual separator - only on desktop */}
        <div className="hidden sm:flex w-full items-center justify-center mb-6 md:mb-10">
          <div className="w-full h-[2px] bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900 rounded-full shadow-md" />
        </div>
      </div>

      {/* Main form */}
      <div className="form-container bg-white/90 dark:bg-neutral-900/90 rounded-xl px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 flex flex-col gap-6 sm:gap-8 md:gap-12 shadow-lg border border-indigo-100 dark:border-indigo-900">
        {/* Current step title */}
        <div className="mb-3 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {STEPS_DYNAMIC[step].label}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 sm:mt-2">
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
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
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
                placeholder="Describe tu sala..."
                rows={4}
                className={errors.descripcion ? "border-red-500" : ""}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.descripcion}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Texturas */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            {loadingTextures ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Cargando texturas...
                </span>
              </div>
            ) : textureError ? (
              <div className="text-center py-8">
                <p className="text-red-500">
                  Error al cargar texturas: {textureError}
                </p>
              </div>
            ) : (
              <>
                {/* Selector compacto de texturas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Textura del piso */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Textura del piso
                    </h3>
                    <button
                      onClick={() => openTextureModal("floor")}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 transition-colors"
                    >
                      {texturas.piso ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={texturas.piso.previewUrl}
                            alt={texturas.piso.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatTextureName(texturas.piso.name)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {texturas.piso.category === "generic"
                                ? "Universal"
                                : `Textura de ${texturas.piso.category}`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-gray-400">
                            Seleccionar textura de piso
                          </p>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Textura de las paredes */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Textura de las paredes
                    </h3>
                    <button
                      onClick={() => openTextureModal("walls")}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 transition-colors"
                    >
                      {texturas.paredes ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={texturas.paredes.previewUrl}
                            alt={texturas.paredes.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatTextureName(texturas.paredes.name)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {texturas.paredes.category === "generic"
                                ? "Universal"
                                : `Textura de ${texturas.paredes.category}`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-gray-400">
                            Seleccionar textura de paredes
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Privacidad */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Tipo de sala
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sala pública */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    privacidad.publica
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                  }`}
                  onClick={() =>
                    setPrivacidad({ publica: true, esPrivada: false })
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Sala Pública
                      </h4>
                    </div>
                    {privacidad.publica && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visible para todos los usuarios. Aparece en búsquedas
                    públicas.
                  </p>
                </div>

                {/* Sala privada */}
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    privacidad.esPrivada
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                  }`}
                  onClick={() =>
                    setPrivacidad({ publica: false, esPrivada: true })
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Sala Privada
                      </h4>
                    </div>
                    {privacidad.esPrivada && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Solo tú y los colaboradores que invites pueden acceder. No
                    aparece en búsquedas públicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Colaboradores */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Colaboradores de la sala
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserSearch(!showUserSearch)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar colaborador
                </Button>
              </div>

              {/* Search users */}
              {showUserSearch && (
                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg space-y-3">
                  <Input
                    placeholder="Buscar usuarios por nombre o email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />

                  {searchLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Buscando usuarios...
                      </span>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors"
                            onClick={() => addUserAsCollaborator(user)}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={user.image || "/placeholder-image.jpg"}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder-image.jpg";
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <UserPlus className="w-4 h-4 text-indigo-600" />
                          </div>
                        ))
                      ) : userSearchQuery.length >= 2 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                          No se encontraron usuarios con "{userSearchQuery}"
                        </p>
                      ) : userSearchQuery.length > 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                          Escribe al menos 2 caracteres
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                          Escribe para buscar usuarios
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Current collaborators */}
              {colaboradores.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Colaboradores agregados ({colaboradores.length})
                  </h4>
                  {colaboradores.map((colaborador) => (
                    <div
                      key={colaborador.id}
                      className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={colaborador.image || "/placeholder-image.jpg"}
                          alt={colaborador.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {colaborador.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {colaborador.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeColaborador(colaborador.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No hay colaboradores agregados
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Los colaboradores pueden ayudar a gestionar la sala
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Configuración */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div className="bg-blue-50/70 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-blue-700 dark:text-blue-300 font-semibold mb-2">
                Configuraciones adicionales
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                Las configuraciones de audio y ambiente estarán disponibles
                después de crear la sala.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Murales */}
        {step === 5 && (
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

        {/* Step 6: Confirmación */}
        {step === 6 && (
          <div className="flex flex-col gap-6">
            {successMessage ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  {successMessage}
                </p>
              </div>
            ) : apiError ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-400 font-medium">
                  {apiError.message}
                </p>
                {apiError.details && (
                  <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                    Detalles: {apiError.details}
                  </p>
                )}
                <Button
                  onClick={() => setApiError(null)}
                  variant="outline"
                  className="mt-3"
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-gray-50 dark:bg-neutral-800 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Resumen de la sala
                  </h3>

                  {/* Datos básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nombre
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {nombre || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Descripción
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {descripcion || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Texturas */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Texturas
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Piso */}
                      <div className="flex items-center gap-3">
                        {texturas.piso ? (
                          <>
                            <img
                              src={texturas.piso.previewUrl}
                              alt={texturas.piso.name}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {texturas.piso.name
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No seleccionado
                          </span>
                        )}
                      </div>

                      {/* Paredes */}
                      <div className="flex items-center gap-3">
                        {texturas.paredes ? (
                          <>
                            <img
                              src={texturas.paredes.previewUrl}
                              alt={texturas.paredes.name}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {texturas.paredes.name
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </span>
                          </>
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
                  <Button variant="secondary" onClick={() => setStep(5)}>
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-between sm:justify-end mt-6 sm:mt-8">
          <Button
            variant="ghost"
            onClick={() => setShowClearDraftModal(true)}
            className="text-red-600 hover:text-red-700 flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar borrador
          </Button>
          <div className="flex gap-2 order-1 sm:order-2">
            {step > 0 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex-1 sm:flex-initial"
              >
                Atrás
              </Button>
            )}
            {step < STEPS_DYNAMIC.length - 1 && (
              <Button onClick={handleNext} className="flex-1 sm:flex-initial">
                Siguiente
              </Button>
            )}
          </div>
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
                </div>
              ))}
            </div>
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

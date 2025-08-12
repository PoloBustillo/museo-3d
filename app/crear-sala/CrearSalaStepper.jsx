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
  Play,
  Pause,
  Volume2,
  Upload,
  Image,
  Search,
  Eye,
  Plus,
  Minus,
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
    audio,
    step,
    setNombre,
    setDescripcion,
    addMural,
    removeMural,
    setStep,
    setTextureFloor,
    setTextureWalls,
    setPrivacidad,
    addColaborador,
    removeColaborador,
    setSelectedAudio,
    setAudioVolume,
    setAudioAutoplay,
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

  // Audio states
  const [availableAudios, setAvailableAudios] = useState([]);
  const [loadingAudios, setLoadingAudios] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [uploadingCustomAudio, setUploadingCustomAudio] = useState(false);

  // Murales states
  const [availableMurales, setAvailableMurales] = useState([]);
  const [loadingMurales, setLoadingMurales] = useState(false);
  const [muralesError, setMuralesError] = useState(null);
  const [muralesQuery, setMuralesQuery] = useState("");
  const [showMuralesModal, setShowMuralesModal] = useState(false);
  const [selectedMuralForPreview, setSelectedMuralForPreview] = useState(null);
  const [includePublicMurales, setIncludePublicMurales] = useState(true);
  const [muralesFilter, setMuralesFilter] = useState("all"); // all, own, public

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

  // Load audios
  useEffect(() => {
    const loadAudios = async () => {
      setLoadingAudios(true);
      setAudioError(null);
      try {
        const response = await fetch("/api/audios");
        if (!response.ok) {
          throw new Error("Error al cargar los audios");
        }
        const data = await response.json();
        setAvailableAudios(data.audios || []);
      } catch (error) {
        console.error("Error loading audios:", error);
        setAudioError(error.message);
      } finally {
        setLoadingAudios(false);
      }
    };

    loadAudios();
  }, []);

  // Load available murales (own + public)
  useEffect(() => {
    const loadMurales = async () => {
      setLoadingMurales(true);
      setMuralesError(null);
      try {
        const response = await fetch(`/api/murales/available?includePublic=${includePublicMurales}&limit=100`);
        if (!response.ok) {
          throw new Error("Error al cargar las obras");
        }
        const data = await response.json();
        setAvailableMurales(data.murales || []);
      } catch (error) {
        console.error("Error loading murales:", error);
        setMuralesError(error.message);
      } finally {
        setLoadingMurales(false);
      }
    };

    loadMurales();
  }, [includePublicMurales]);

  // Search murales with debouncing
  useEffect(() => {
    const searchMurales = async () => {
      if (muralesQuery.trim().length < 2) {
        // Reload all murales
        try {
          const response = await fetch(`/api/murales/available?includePublic=${includePublicMurales}&limit=100`);
          if (response.ok) {
            const data = await response.json();
            setAvailableMurales(data.murales || []);
          }
        } catch (error) {
          console.error("Error reloading murales:", error);
        }
        return;
      }

      setLoadingMurales(true);
      try {
        const response = await fetch(`/api/murales/available?q=${encodeURIComponent(muralesQuery)}&includePublic=${includePublicMurales}&limit=100`);
        if (response.ok) {
          const data = await response.json();
          setAvailableMurales(data.murales || []);
        }
      } catch (error) {
        console.error("Error searching murales:", error);
      } finally {
        setLoadingMurales(false);
      }
    };

    const debounceTimer = setTimeout(searchMurales, 500);
    return () => clearTimeout(debounceTimer);
  }, [muralesQuery, includePublicMurales]);

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

  // Audio functions
  const playAudio = (audio) => {
    if (currentPlayingAudio && audioRef) {
      audioRef.pause();
    }

    const newAudio = new Audio(audio.url);
    newAudio.volume = audio.volume || 0.5;
    newAudio.play();
    
    setCurrentPlayingAudio(audio.id);
    setAudioRef(newAudio);

    newAudio.onended = () => {
      setCurrentPlayingAudio(null);
      setAudioRef(null);
    };
  };

  const stopAudio = () => {
    if (audioRef) {
      audioRef.pause();
      setCurrentPlayingAudio(null);
      setAudioRef(null);
    }
  };

  const selectAudio = (audio) => {
    setSelectedAudio({
      id: audio.id,
      name: audio.name,
      url: audio.url,
      isCustom: false
    });
    setShowAudioModal(false);
    stopAudio();
  };

  const handleCustomAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea un archivo de audio
    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio válido');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB permitido.');
      return;
    }

    setUploadingCustomAudio(true);
    
    try {
      // Crear URL temporal para el archivo
      const audioUrl = URL.createObjectURL(file);
      
      // Agregar audio personalizado
      setSelectedAudio({
        id: 'custom-' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: audioUrl,
        isCustom: true,
        file: file
      });
      
      setShowAudioModal(false);
    } catch (error) {
      console.error('Error al subir audio:', error);
      alert('Error al procesar el archivo de audio');
    } finally {
      setUploadingCustomAudio(false);
    }
  };

  const getAudiosByCategory = (category) => {
    return availableAudios.filter(audio => audio.category === category);
  };

  const formatAudioDuration = (audio) => {
    // Esta función se podría expandir para mostrar duración real
    return "Audio ambiente";
  };

  // Murales functions
  const toggleMural = (mural) => {
    if (murales.includes(mural.id)) {
      removeMural(mural.id);
    } else {
      addMural(mural.id);
    }
  };

  const isMuralSelected = (muralId) => {
    return murales.includes(muralId);
  };

  const getSelectedMuralesData = () => {
    return availableMurales.filter(mural => murales.includes(mural.id));
  };

  const openMuralPreview = (mural) => {
    setSelectedMuralForPreview(mural);
  };

  const closeMuralPreview = () => {
    setSelectedMuralForPreview(null);
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
        audio: {
          selectedAudio: audio.selectedAudio,
          volume: audio.volume,
          autoplay: audio.autoplay,
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
            {loadingAudios ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando audios...</span>
              </div>
            ) : audioError ? (
              <div className="text-center py-8">
                <p className="text-red-500">Error al cargar audios: {audioError}</p>
              </div>
            ) : (
              <>
                {/* Audio ambiente */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Music className="w-5 h-5 text-indigo-600" />
                    Audio ambiente de la sala
                  </h3>
                  
                  {/* Audio seleccionado */}
                  <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg border">
                    {audio.selectedAudio ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                            <Music className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {audio.selectedAudio.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {audio.selectedAudio.isCustom ? "Audio personalizado" : "Audio del catálogo"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (currentPlayingAudio === audio.selectedAudio.id) {
                                stopAudio();
                              } else {
                                playAudio(audio.selectedAudio);
                              }
                            }}
                          >
                            {currentPlayingAudio === audio.selectedAudio.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAudioModal(true)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAudioModal(true)}
                        className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 transition-colors text-center"
                      >
                        <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Seleccionar audio ambiente</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Elige del catálogo o sube tu propio audio</p>
                      </button>
                    )}
                  </div>

                  {/* Configuraciones de audio */}
                  {audio.selectedAudio && (
                    <div className="space-y-4 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Configuraciones de reproducción</h4>
                      
                      {/* Volumen */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            Volumen
                          </label>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{audio.volume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={audio.volume}
                          onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Autoplay */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reproducir automáticamente al entrar
                        </label>
                        <input
                          type="checkbox"
                          checked={audio.autoplay}
                          onChange={(e) => setAudioAutoplay(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Murales */}
        {step === 5 && (
          <div className="flex flex-col gap-6">
            {loadingMurales ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando obras...</span>
              </div>
            ) : muralesError ? (
              <div className="text-center py-8">
                <p className="text-red-500">Error al cargar obras: {muralesError}</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-indigo-600" />
                      Seleccionar obras para la sala
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Elige las obras que quieres mostrar en tu sala
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMuralesModal(true)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Explorar obras
                  </Button>
                </div>

                {/* Selected murales */}
                {murales.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Obras seleccionadas ({murales.length})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          murales.forEach(id => removeMural(id));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpiar selección
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getSelectedMuralesData().map((mural) => (
                        <div
                          key={mural.id}
                          className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                            <img
                              src={mural.imagen}
                              alt={mural.titulo}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openMuralPreview(mural)}
                                className="bg-white/90 hover:bg-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMural(mural.id)}
                                className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-3">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {mural.titulo}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {mural.tecnica} {mural.anio && `(${mural.anio})`}
                            </p>
                            {mural.enSala && (
                              <span className="inline-block mt-1 text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full">
                                En otra sala
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No hay obras seleccionadas</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      Haz clic en "Explorar obras" para seleccionar las obras de tu sala
                    </p>
                    <Button onClick={() => setShowMuralesModal(true)}>
                      <Search className="w-4 h-4 mr-2" />
                      Explorar obras
                    </Button>
                  </div>
                )}

                {/* Quick stats */}
                {availableMurales.length > 0 && (
                  <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">{availableMurales.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Obras disponibles</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{murales.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Seleccionadas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">
                          {availableMurales.filter(m => m.enSala).length}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">En otras salas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          {availableMurales.filter(m => m.destacada).length}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Destacadas</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
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

                  {/* Audio */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Audio ambiente</p>
                    <div className="flex items-center gap-3">
                      {audio.selectedAudio ? (
                        <>
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded object-cover flex items-center justify-center">
                            <Music className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {audio.selectedAudio.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Volumen: {audio.volume}%
                              </span>
                              {audio.autoplay && (
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                                  Autoplay
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No seleccionado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Murales */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Obras seleccionadas</p>
                    {murales.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {murales.length} obra{murales.length !== 1 ? 's' : ''} seleccionada{murales.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {getSelectedMuralesData().slice(0, 6).map((mural) => (
                            <div key={mural.id} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                              <img
                                src={mural.imagen}
                                alt={mural.titulo}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder-image.jpg";
                                }}
                              />
                            </div>
                          ))}
                          {murales.length > 6 && (
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                +{murales.length - 6}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        No hay obras seleccionadas
                      </span>
                    )}
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

      {/* Murales selection modal */}
      <SimpleModal
        isOpen={showMuralesModal}
        onClose={() => setShowMuralesModal(false)}
        title="Explorar y seleccionar obras"
        size="large"
      >
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por título, técnica o descripción..."
              value={muralesQuery}
              onChange={(e) => setMuralesQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar:</span>
            <div className="flex gap-2">
              <Button
                variant={!includePublicMurales ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludePublicMurales(false)}
                className="text-xs"
              >
                Mis obras
              </Button>
              <Button
                variant={includePublicMurales ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludePublicMurales(true)}
                className="text-xs"
              >
                Todas las obras
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{availableMurales.length} obras encontradas</span>
            <span>{murales.length} seleccionadas</span>
          </div>

          {/* Murales grid */}
          <div className="max-h-96 overflow-y-auto">
            {loadingMurales ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Buscando obras...</span>
              </div>
            ) : availableMurales.length === 0 ? (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {muralesQuery.length >= 2 
                    ? `No se encontraron obras con "${muralesQuery}"` 
                    : !includePublicMurales 
                      ? "No tienes obras disponibles" 
                      : "No hay obras disponibles"
                  }
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {muralesQuery.length >= 2 
                    ? "Intenta con otros términos de búsqueda" 
                    : !includePublicMurales 
                      ? "Crea tu primera obra para agregarla a la sala" 
                      : "Aún no hay obras públicas disponibles"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableMurales.map((mural) => (
                  <div
                    key={mural.id}
                    className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                      isMuralSelected(mural.id)
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 ring-opacity-50"
                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                    onClick={() => toggleMural(mural)}
                  >
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                      <img
                        src={mural.imagen}
                        alt={mural.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {isMuralSelected(mural.id) && (
                          <div className="bg-indigo-500 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMuralPreview(mural);
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      {mural.enSala && (
                        <div className="absolute bottom-2 left-2">
                          <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                            En sala
                          </span>
                        </div>
                      )}
                      {mural.destacada && (
                        <div className="absolute bottom-2 right-2">
                          <span className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-full">
                            ⭐ Destacada
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {mural.titulo}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {mural.tecnica} {mural.anio && `(${mural.anio})`}
                      </p>
                      {mural.author && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                          Por {mural.author.name}
                        </p>
                      )}
                      {mural.dimensiones && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {mural.dimensiones}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {mural.visitas} visitas
                        </span>
                        <Button
                          variant={isMuralSelected(mural.id) ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMural(mural);
                          }}
                        >
                          {isMuralSelected(mural.id) ? (
                            <>
                              <Minus className="w-4 h-4 mr-1" />
                              Quitar
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Agregar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {murales.length} obras seleccionadas
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMuralesModal(false)}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => setShowMuralesModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Continuar con selección
              </Button>
            </div>
          </div>
        </div>
      </SimpleModal>

      {/* Mural preview modal */}
      <SimpleModal
        isOpen={!!selectedMuralForPreview}
        onClose={closeMuralPreview}
        title={selectedMuralForPreview?.titulo || "Vista previa"}
        size="large"
      >
        {selectedMuralForPreview && (
          <div className="flex flex-col gap-4">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={selectedMuralForPreview.imagen}
                alt={selectedMuralForPreview.titulo}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedMuralForPreview.titulo}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedMuralForPreview.tecnica} {selectedMuralForPreview.anio && `(${selectedMuralForPreview.anio})`}
                </p>
              </div>
              {selectedMuralForPreview.descripcion && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Descripción</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMuralForPreview.descripcion}
                  </p>
                </div>
              )}
              {selectedMuralForPreview.dimensiones && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Dimensiones</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMuralForPreview.dimensiones}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>👁️ {selectedMuralForPreview.visitas} visitas</span>
                {selectedMuralForPreview.destacada && <span>⭐ Destacada</span>}
                {selectedMuralForPreview.enSala && <span>🏛️ En sala</span>}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeMuralPreview}>
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  toggleMural(selectedMuralForPreview);
                  closeMuralPreview();
                }}
                variant={isMuralSelected(selectedMuralForPreview.id) ? "destructive" : "default"}
              >
                {isMuralSelected(selectedMuralForPreview.id) ? (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Quitar de la sala
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar a la sala
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </SimpleModal>

      {/* Audio selection modal */}
      <SimpleModal
        isOpen={showAudioModal}
        onClose={() => {
          setShowAudioModal(false);
          stopAudio();
        }}
        title="Seleccionar audio ambiente"
        size="large"
      >
        <div className="flex flex-col gap-6">
          {/* Upload custom audio */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Subir audio personalizado
            </h4>
            <div className="space-y-3">
              <input
                type="file"
                accept="audio/*"
                onChange={handleCustomAudioUpload}
                disabled={uploadingCustomAudio}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Formatos soportados: MP3, WAV, OGG, M4A. Máximo 10MB.
              </p>
              {uploadingCustomAudio && (
                <div className="flex items-center gap-2 text-sm text-indigo-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Procesando archivo...
                </div>
              )}
            </div>
          </div>

          {/* Audio catalog */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Catálogo de audios</h4>
            
            {availableAudios.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No hay audios disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {availableAudios.map((audio) => (
                  <div
                    key={audio.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer hover:border-indigo-400 ${
                      audio.selectedAudio?.id === audio.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onClick={() => selectAudio(audio)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {audio.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {audio.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full capitalize">
                              {audio.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPlayingAudio === audio.id) {
                              stopAudio();
                            } else {
                              playAudio(audio);
                            }
                          }}
                        >
                          {currentPlayingAudio === audio.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        {audio.selectedAudio?.id === audio.id && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowAudioModal(false);
                stopAudio();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowAudioModal(false);
                stopAudio();
              }}
              disabled={!audio.selectedAudio}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Confirmar selección
            </Button>
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

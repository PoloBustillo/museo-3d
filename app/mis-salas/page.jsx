"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SalaIcon from "@/components/ui/icons/SalaIcon";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Unauthorized from "../../components/Unauthorized";
import AnimatedBackground from "../../components/shared/AnimatedBackground";
import AvatarTooltip from "@/components/ui/AvatarTooltip";
import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { Trash2, Plus, Search, Filter, Grid, List, Building, Eye, UserPlus, Calendar, Palette } from "lucide-react";
import { motion } from "framer-motion";

// Componente Tooltip para mostrar murales con portal
const MuralesToolTip = ({ murales, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  
  if (!murales || murales.length === 0) {
    return children;
  }

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setPosition({
        top: rect.top + scrollY - 10, // Posición arriba del elemento
        left: rect.left + scrollX + rect.width / 2, // Centrado horizontalmente
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const tooltipContent = showTooltip && typeof window !== 'undefined' ? createPortal(
    <div 
      className="fixed z-[99999] pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="p-3 bg-black/95 text-white rounded-lg shadow-2xl backdrop-blur-sm min-w-[200px] max-w-[300px] border border-white/10">
        <div className="text-xs font-semibold mb-2 text-center">
          Murales en esta sala ({murales.length})
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {murales.slice(0, 6).map((sm, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <img
                src={sm.mural?.url_imagen || '/placeholder-image.jpg'}
                alt={sm.mural?.titulo || 'Mural'}
                className="w-8 h-8 object-cover rounded"
              />
              <span className="truncate flex-1">
                {sm.mural?.titulo || 'Sin título'}
              </span>
            </div>
          ))}
          {murales.length > 6 && (
            <div className="col-span-2 text-center text-xs text-gray-300 mt-1">
              +{murales.length - 6} más...
            </div>
          )}
        </div>
        {/* Flecha del tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/95"></div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  );
};

export default function MisSalas() {
  const { data: session, status } = useSession();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaToDelete, setSalaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [muralesDisponibles, setMuralesDisponibles] = useState([]);
  const [showAddMuralModal, setShowAddMuralModal] = useState(false);
  const [selectedSalaId, setSelectedSalaId] = useState(null);
  const [selectedMuralIds, setSelectedMuralIds] = useState([]);
  const [isAddingMurales, setIsAddingMurales] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [triggerSalaElement, setTriggerSalaElement] = useState(null);
  
  // Estados para filtros y vista (similar a mis-obras)
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState("grid"); // 'grid' o 'list'
  const [sortBy, setSortBy] = useState("nombre"); // 'nombre', 'fecha', 'murales'
  
  const router = useRouter();

  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchSalas = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/salas");
        if (!res.ok) throw new Error("No se pudieron cargar las salas");
        const data = await res.json();
        let allSalas = data.salas || [];
        // Si no es admin, filtra solo las salas donde es creador o colaborador
        if (!isAdmin && userId) {
          allSalas = allSalas.filter(
            (sala) =>
              sala.creadorId === userId ||
              (sala.colaboradores && sala.colaboradores.some((c) => c.userId === userId))
          );
        }
        setSalas(allSalas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchSalas();
    }
  }, [isAdmin, userId, status]);

  // Cargar murales disponibles para añadir
  useEffect(() => {
    const fetchMurales = async () => {
      try {
        const res = await fetch("/api/murales");
        if (res.ok) {
          const data = await res.json();
          setMuralesDisponibles(data.murales || []);
        }
      } catch (err) {
        console.error("Error al cargar murales:", err);
      }
    };
    fetchMurales();
  }, []);

  const handleRemoveMural = async (salaId, muralId) => {
    try {
      const res = await fetch(`/api/salas/${salaId}/murales`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ murales: [muralId] }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "No se pudo eliminar el mural de la sala");
      }
      
      // Actualizar el estado local
      setSalas((prev) =>
        prev.map((sala) =>
          sala.id === salaId
            ? {
                ...sala,
                murales: sala.murales.filter((sm) => sm.mural.id !== muralId),
                _count: {
                  ...sala._count,
                  murales: sala._count.murales - 1
                }
              }
            : sala
        )
      );
      
      toast.success("Mural eliminado de la sala exitosamente");
      
    } catch (e) {
      console.error("Error al eliminar mural:", e);
      toast.error(e.message || "Error al eliminar mural de la sala");
    }
  };

  const handleAddMural = async () => {
    if (!selectedSalaId || selectedMuralIds.length === 0) return;
    
    setIsAddingMurales(true);
    try {
      const res = await fetch(`/api/salas/${selectedSalaId}/murales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ murales: selectedMuralIds }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "No se pudo agregar el mural a la sala");
      }
      
      // Actualizar el estado local correctamente
      setSalas((prev) =>
        prev.map((sala) => {
          if (sala.id === selectedSalaId) {
            // Agregar los nuevos murales con la estructura correcta {mural: {...}}
            const nuevosEnlaces = selectedMuralIds.map((muralId) => {
              const muralData = muralesDisponibles.find(m => m.id === muralId);
              return {
                mural: muralData
              };
            });
            
            return { 
              ...sala, 
              murales: [...sala.murales, ...nuevosEnlaces],
              _count: {
                ...sala._count,
                murales: sala._count.murales + selectedMuralIds.length
              }
            };
          }
          return sala;
        })
      );
      
      // Cerrar modal y limpiar selección
      setShowAddMuralModal(false);
      setSelectedMuralIds([]);
      setSelectedSalaId(null);
      
      // Mostrar mensaje de éxito
      toast.success(`${selectedMuralIds.length} mural${selectedMuralIds.length > 1 ? 'es' : ''} agregado${selectedMuralIds.length > 1 ? 's' : ''} exitosamente`);
      
      // Scroll suave de regreso a la sala si tenemos la referencia
      if (triggerSalaElement) {
        setTimeout(() => {
          triggerSalaElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // Pequeño delay para que se cierre el modal primero
      }
      
    } catch (e) {
      console.error("Error al agregar murales:", e);
      toast.error(e.message || "Error al agregar murales a la sala");
    } finally {
      setIsAddingMurales(false);
    }
  };

  // Funciones de filtrado y ordenamiento
  const filteredSalas = salas.filter(sala => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        sala.nombre?.toLowerCase().includes(search) ||
        sala.descripcion?.toLowerCase().includes(search) ||
        sala.creador?.name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const sortedSalas = [...filteredSalas].sort((a, b) => {
    switch (sortBy) {
      case "nombre":
        return (a.nombre || "").localeCompare(b.nombre || "");
      case "fecha":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "murales":
        return (b._count?.murales || 0) - (a._count?.murales || 0);
      default:
        return 0;
    }
  });

  // Navegación a crear sala
  const goToCrearSala = () => router.push("/crear-sala");

  // Función para abrir modal con posicionamiento
  const openAddMuralModal = (salaId, triggerElement) => {
    setSelectedSalaId(salaId);
    setTriggerSalaElement(triggerElement);
    
    if (triggerElement) {
      const rect = triggerElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Calcular posición óptima del modal (más pequeño)
      const modalWidth = 400; // Reducido de 600 a 400
      const modalHeight = 500; // Reducido de 600 a 500
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Centrar horizontalmente en la pantalla, no en el elemento
      let left = (viewportWidth - modalWidth) / 2 + scrollX;
      let top = rect.top + scrollY - modalHeight / 2;
      
      // Ajustar si se sale de la pantalla (con más margen)
      const margin = 20;
      if (left < margin + scrollX) left = margin + scrollX;
      if (left + modalWidth > viewportWidth - margin + scrollX) left = viewportWidth - modalWidth - margin + scrollX;
      if (top < margin + scrollY) top = margin + scrollY;
      if (top + modalHeight > viewportHeight + scrollY - margin) top = viewportHeight + scrollY - modalHeight - margin;
      
      setModalPosition({ top, left });
    }
    
    setShowAddMuralModal(true);
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Cargando tus salas...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Unauthorized />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 md:pt-28 pb-2 md:pb-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Building className="h-10 w-10 text-indigo-600" />
              Mis Salas
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Crea y administra tus salas de exposición virtual
            </p>

            {/* Botones de acción principales */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={goToCrearSala}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
              >
                <Plus className="h-5 w-5" /> Crear sala
              </button>
            </div>
          </div>

          {/* Controles de filtros y vista */}
          <div className="mb-16 md:mb-20">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 sm:gap-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-4 border border-border overflow-hidden min-w-0 w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-4 w-full sm:w-auto min-w-0">
                {/* Barra de búsqueda */}
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar salas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                  />
                </div>

                {/* Botón de filtros */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto min-w-0 overflow-hidden break-words"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </button>
              </div>

              {/* Controles de vista y estadísticas */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {sortedSalas.length} sala{sortedSalas.length !== 1 ? 's' : ''}
                </span>
                
                {/* Selectores de vista */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 ${view === "grid" ? "bg-indigo-600 text-white" : "bg-white dark:bg-neutral-700 text-gray-600 dark:text-gray-300"} transition-colors`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 ${view === "list" ? "bg-indigo-600 text-white" : "bg-white dark:bg-neutral-700 text-gray-600 dark:text-gray-300"} transition-colors`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl p-4 border border-border mt-4"
              >
                <div className="flex flex-wrap gap-4">
                  {/* Ordenar por */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Ordenar por:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="nombre">Nombre</option>
                      <option value="fecha">Fecha de creación</option>
                      <option value="murales">Número de murales</option>
                    </select>
                  </div>

                  {/* Botón para limpiar filtros */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSortBy("nombre");
                      }}
                      className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Contenido principal - Lista de salas */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Vista Grid */}
          {view === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSalas.map((sala) => (
                <motion.div
                  key={sala.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border"
                  data-sala-card
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <SalaIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">
                              {sala.nombre}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {sala._count?.murales || 0} murales
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => setSalaToDelete(sala)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar sala"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {sala.descripcion}
                      </p>
                      
                      {/* Preview de murales mejorado */}
                      {sala.murales && sala.murales.length > 0 ? (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Murales ({sala.murales.length})
                            </span>
                            <MuralesToolTip murales={sala.murales}>
                              <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
                                Ver todos
                              </button>
                            </MuralesToolTip>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {sala.murales.slice(0, 3).map((sm, index) => (
                              <div key={index} className="aspect-square rounded-lg overflow-hidden relative group">
                                <img
                                  src={sm.mural?.url_imagen || '/placeholder-image.jpg'}
                                  alt={sm.mural?.titulo || 'Mural'}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center p-1">
                                    {sm.mural?.titulo || 'Sin título'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {sala.murales.length > 3 && (
                            <div className="mt-2 text-center">
                              <span className="text-xs text-muted-foreground">
                                +{sala.murales.length - 3} más
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4 text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            Sin murales
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <span>Por:</span>
                          <span className="font-medium">{sala.creador?.name || "Anónimo"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(sala.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {/* Botón principal - Ver sala */}
                        <Button asChild className="w-full" size="sm">
                          <Link href={`/galeria?salaId=${sala.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Ver sala
                          </Link>
                        </Button>
                        
                        {/* Botones secundarios */}
                        <div className="flex gap-2">
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                openAddMuralModal(sala.id, e.currentTarget.closest('[data-sala-card]'));
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                              title="Añadir murales"
                            >
                              <UserPlus className="h-4 w-4" />
                              Añadir
                            </button>
                          )}
                          <button
                            className="flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                            title="Más opciones"
                          >
                            <span className="text-lg leading-none">⋯</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Vista Lista */}
          {view === "list" && (
            <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sala
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Murales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Creador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                    {sortedSalas.map((sala) => (
                      <tr key={sala.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50" data-sala-card>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                <SalaIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {sala.nombre}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {sala.descripcion}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <MuralesToolTip murales={sala.murales}>
                            <div className="flex items-center gap-2 cursor-pointer">
                              <Badge variant="secondary" className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                {sala._count?.murales || 0} murales
                              </Badge>
                              {sala.murales && sala.murales.length > 0 && (
                                <div className="flex -space-x-1">
                                  {sala.murales.slice(0, 3).map((sm, index) => (
                                    <img
                                      key={index}
                                      src={sm.mural?.url_imagen || '/placeholder-image.jpg'}
                                      alt={sm.mural?.titulo || 'Mural'}
                                      className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 object-cover"
                                    />
                                  ))}
                                  {sala.murales.length > 3 && (
                                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-800 bg-gray-200 dark:bg-neutral-600 flex items-center justify-center text-xs font-medium">
                                      +{sala.murales.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </MuralesToolTip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {sala.creador?.name || "Anónimo"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(sala.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild size="sm" variant="outline" className="flex items-center gap-1">
                              <Link href={`/galeria?salaId=${sala.id}`}>
                                <Eye className="h-3 w-3" />
                                Ver
                              </Link>
                            </Button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={(e) => {
                                    openAddMuralModal(sala.id, e.currentTarget.closest('tr'));
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                  title="Añadir murales"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  Añadir
                                </button>
                                <button
                                  onClick={() => setSalaToDelete(sala)}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Eliminar sala"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {sortedSalas.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Building className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm ? "No se encontraron salas" : "No tienes salas creadas"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda"
                  : "Crea tu primera sala para empezar a organizar tus obras"
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={goToCrearSala}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
                >
                  <Plus className="h-5 w-5" />
                  Crear primera sala
                </button>
              )}
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* Modales */}
      {/* Modal para añadir murales */}
      {showAddMuralModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bg-white dark:bg-neutral-900 border border-border rounded-2xl shadow-2xl p-4 w-full max-w-sm"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
              maxHeight: '70vh',
              width: '400px'
            }}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-300">
                Añadir obras
              </h3>
              <button
                onClick={() => setShowAddMuralModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <span className="text-lg">&times;</span>
              </button>
            </div>

            {/* Lista de murales */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-xl p-2">
              {muralesDisponibles
                .filter((mural) => {
                  const sala = salas.find((s) => s.id === selectedSalaId);
                  return (
                    mural &&
                    sala &&
                    !sala.murales.some((sm) => sm.mural && sm.mural.id === mural.id)
                  );
                })
                .map((mural) => (
                  <motion.button
                    key={mural.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-row items-center border rounded-lg p-2 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      selectedMuralIds.includes(mural.id) 
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-400" 
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                    onClick={() => {
                      setSelectedMuralIds((prev) =>
                        prev.includes(mural.id)
                          ? prev.filter((id) => id !== mural.id)
                          : [...prev, mural.id]
                      );
                    }}
                  >
                    <img
                      src={mural.url_imagen || '/placeholder-image.jpg'}
                      alt={mural.titulo}
                      className="w-10 h-10 object-cover rounded-lg mr-2 flex-shrink-0"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm text-left truncate">
                        {mural.titulo}
                      </span>
                      <span className="text-xs text-muted-foreground text-left truncate">
                        {mural.tecnica}
                      </span>
                    </div>
                    {selectedMuralIds.includes(mural.id) && (
                      <div className="ml-2 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              {muralesDisponibles.filter((mural) => {
                const sala = salas.find((s) => s.id === selectedSalaId);
                return (
                  mural &&
                  sala &&
                  !sala.murales.some((sm) => sm.mural && sm.mural.id === mural.id)
                );
              }).length === 0 && (
                <div className="text-center text-muted-foreground py-6">
                  <Palette className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No hay obras disponibles.</p>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => setShowAddMuralModal(false)}
              >
                Cancelar
              </button>
              <button
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                onClick={handleAddMural}
                disabled={
                  isAddingMurales ||
                  selectedMuralIds.length === 0 ||
                  muralesDisponibles.filter((mural) => {
                    const sala = salas.find((s) => s.id === selectedSalaId);
                    return (
                      mural &&
                      sala &&
                      !sala.murales.some((sm) => sm.mural && sm.mural.id === mural.id)
                    );
                  }).length === 0
                }
              >
                {isAddingMurales && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                {isAddingMurales ? "Agregando..." : "Añadir"}
                {!isAddingMurales && selectedMuralIds.length > 0
                  ? ` (${selectedMuralIds.length})`
                  : ""}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {salaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-border rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs">
            <h3 className="font-semibold mb-4 text-lg text-red-700 dark:text-red-300">
              ¿Eliminar sala?
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-200">
              Se eliminará "{salaToDelete.nombre}" y todas sus configuraciones.
            </p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-neutral-700 transition"
                onClick={() => setSalaToDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const res = await fetch(`/api/salas/${salaToDelete.id}`, {
                    method: "DELETE",
                  });
                  if (res.ok) {
                    setSalas(salas.filter((s) => s.id !== salaToDelete.id));
                    toast.success("Sala eliminada exitosamente");
                  } else {
                    toast.error("Error al eliminar la sala");
                  }
                  setSalaToDelete(null);
                  setIsDeleting(false);
                }}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

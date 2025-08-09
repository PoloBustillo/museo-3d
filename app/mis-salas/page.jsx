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
import { Trash2, Plus, Search, Filter, Grid, List, Building } from "lucide-react";
import { motion } from "framer-motion";

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
                      
                      {/* Preview de murales */}
                      {sala.murales && sala.murales.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {sala.murales.slice(0, 3).map((sm, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                              <img
                                src={sm.mural?.url_imagen || '/placeholder-image.jpg'}
                                alt={sm.mural?.titulo || 'Mural'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>Por: {sala.creador?.name || "Anónimo"}</span>
                        <span>{new Date(sala.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button asChild className="flex-1" size="sm">
                          <Link href={`/galeria?salaId=${sala.id}`}>
                            Ver sala
                          </Link>
                        </Button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedSalaId(sala.id);
                              setShowAddMuralModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Añadir murales"
                          >
                            + Murales
                          </button>
                        )}
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
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                    {sortedSalas.map((sala) => (
                      <tr key={sala.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
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
                          <Badge variant="secondary">
                            {sala._count?.murales || 0} murales
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {sala.creador?.name || "Anónimo"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(sala.createdAt).toLocaleDateString()}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/galeria?salaId=${sala.id}`}>
                                  Ver
                                </Link>
                              </Button>
                              <button
                                onClick={() => {
                                  setSelectedSalaId(sala.id);
                                  setShowAddMuralModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                title="Añadir murales"
                              >
                                + Murales
                              </button>
                              <button
                                onClick={() => setSalaToDelete(sala)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar sala"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
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
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-10 pb-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-border rounded-2xl shadow-2xl p-4 md:p-8 flex flex-col items-center w-full max-w-xs md:max-w-lg mx-auto">
            <h3 className="font-semibold mb-4 text-lg md:text-2xl text-indigo-700 dark:text-indigo-300">
              Añadir mural a la sala
            </h3>
            <div className="flex flex-col gap-4 max-h-80 md:max-h-[32rem] overflow-y-auto w-full mb-6 border border-gray-200 dark:border-gray-700 dark:border-2 rounded-xl p-2 md:p-4">
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
                  <button
                    key={mural.id}
                    type="button"
                    className={`flex flex-row items-center border rounded-lg p-2 md:p-4 transition shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${selectedMuralIds.includes(mural.id) ? "border-indigo-600 ring-2 ring-indigo-400" : "border-gray-300 dark:border-gray-700 dark:border-2"}`}
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
                      className="w-14 h-14 md:w-24 md:h-24 object-cover rounded mr-3 md:mr-6"
                    />
                    <div className="flex flex-col flex-1 max-w-[10rem] md:max-w-[18rem] overflow-hidden">
                      <span className="font-medium text-sm md:text-lg text-left truncate w-full">
                        {mural.titulo}
                      </span>
                      <span className="text-xs md:text-base text-muted-foreground text-left truncate w-full">
                        {mural.tecnica}
                      </span>
                    </div>
                    {selectedMuralIds.includes(mural.id) && (
                      <span className="ml-2 text-indigo-600 font-bold text-lg md:text-2xl">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              {muralesDisponibles.filter((mural) => {
                const sala = salas.find((s) => s.id === selectedSalaId);
                return (
                  mural &&
                  sala &&
                  !sala.murales.some((sm) => sm.mural && sm.mural.id === mural.id)
                );
              }).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No hay murales disponibles para agregar.
                </div>
              )}
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-neutral-700 transition w-1/2"
                onClick={() => setShowAddMuralModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition w-1/2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isAddingMurales ? "Agregando..." : "Añadir"}
                {!isAddingMurales && selectedMuralIds.length > 0
                  ? ` (${selectedMuralIds.length})`
                  : ""}
              </button>
            </div>
          </div>
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

"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { PageLoader, SectionLoader } from "../../components/LoadingSpinner";

export default function GaleriaPage() {
  const { data: session } = useSession();
  const [salas, setSalas] = useState([]);
  const [murales, setMurales] = useState([]);
  const [allMurales, setAllMurales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMurales, setLoadingMurales] = useState(false);
  const [selectedSala, setSelectedSala] = useState(null);
  const [viewMode, setViewMode] = useState("salas"); // "salas" o "archivo"

  // Filtros para el modo archivo
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTecnica, setFilterTecnica] = useState("");
  const [filterAnio, setFilterAnio] = useState("");
  const [sortBy, setSortBy] = useState("titulo");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Cargar salas y murales en paralelo
        const [salasResponse, muralesResponse] = await Promise.all([
          fetch("/api/salas"),
          fetch("/api/murales"),
        ]);

        if (salasResponse.ok) {
          const salasData = await salasResponse.json();
          setSalas(salasData.salas || []);
        } else {
          toast.error("Error al cargar las salas");
        }

        if (muralesResponse.ok) {
          const muralesData = await muralesResponse.json();
          setAllMurales(muralesData.murales || []);
        } else {
          toast.error("Error al cargar los murales");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSalaSelect = async (salaId) => {
    try {
      setSelectedSala(salaId);
      setLoadingMurales(true);
      const response = await fetch(`/api/salas/${salaId}/murales`);
      if (response.ok) {
        const data = await response.json();
        setMurales(data.murales || []);
      } else {
        toast.error("Error al cargar los murales de la sala");
      }
    } catch (error) {
      console.error("Error fetching murales:", error);
      toast.error("Error de conexión");
    } finally {
      setLoadingMurales(false);
    }
  };

  // Filtrar y ordenar murales para el modo archivo
  const filteredMurales = allMurales
    .filter((mural) => {
      const matchesSearch =
        mural.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mural.artista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mural.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTecnica = !filterTecnica || mural.tecnica === filterTecnica;
      const matchesAnio = !filterAnio || mural.anio === parseInt(filterAnio);

      return matchesSearch && matchesTecnica && matchesAnio;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "titulo":
          return (a.titulo || "").localeCompare(b.titulo || "");
        case "artista":
          return (a.artista || "").localeCompare(b.artista || "");
        case "anio":
          return (b.anio || 0) - (a.anio || 0);
        case "tecnica":
          return (a.tecnica || "").localeCompare(b.tecnica || "");
        default:
          return 0;
      }
    });

  // Obtener técnicas y años únicos para los filtros
  const tecnicasUnicas = [
    ...new Set(allMurales.map((m) => m.tecnica).filter(Boolean)),
  ];
  const aniosUnicos = [
    ...new Set(allMurales.map((m) => m.anio).filter(Boolean)),
  ].sort((a, b) => b - a);

  if (loading) {
    return <PageLoader text="Cargando galería..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Galería Virtual
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora las obras de arte organizadas por salas temáticas o navega
            por el archivo completo
          </p>
        </div>

        {/* Selector de modo de vista */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-2xl shadow-lg p-2 border border-border">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("salas")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === "salas"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                🏛️ Por Salas
              </button>
              <button
                onClick={() => setViewMode("archivo")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === "archivo"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                📚 Archivo Completo
              </button>
            </div>
          </div>
        </div>

        {viewMode === "salas" ? (
          // Vista por salas
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar con salas */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-4 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Salas
                </h2>
                <div className="space-y-3">
                  {salas.map((sala) => (
                    <button
                      key={sala.id}
                      onClick={() => handleSalaSelect(sala.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                        selectedSala === sala.id
                          ? "bg-primary/10 border-2 border-primary text-primary"
                          : "bg-muted/50 hover:bg-muted border-2 border-transparent text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{sala.nombre}</h3>
                          <p className="text-sm text-muted-foreground">
                            {sala._count.murales} obras
                          </p>
                        </div>
                        <span className="text-2xl">🎨</span>
                      </div>
                      {sala.creador && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Por: {sala.creador.name || sala.creador.email}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              {selectedSala ? (
                <div>
                  <div className="bg-card rounded-2xl shadow-lg p-6 mb-6 border border-border">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {salas.find((s) => s.id === selectedSala)?.nombre}
                    </h2>
                    <p className="text-muted-foreground">
                      {salas.find((s) => s.id === selectedSala)?.descripcion}
                    </p>
                  </div>

                  {loadingMurales ? (
                    <SectionLoader text="Cargando murales..." />
                  ) : murales.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {murales.map((mural) => (
                        <div
                          key={mural.id}
                          className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border"
                        >
                          <div className="relative h-48">
                            <img
                              src={mural.imagenUrl || mural.imagenUrlWebp}
                              alt={mural.titulo}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {mural.titulo}
                            </h3>
                            <p className="text-muted-foreground mb-3">
                              {mural.artista || "Artista desconocido"}
                            </p>
                            {mural.tecnica && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Técnica: {mural.tecnica}
                              </p>
                            )}
                            {mural.anio && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Año: {mural.anio}
                              </p>
                            )}
                            {mural.descripcion && (
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {mural.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border">
                      <div className="text-6xl mb-4">🎨</div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        Sala vacía
                      </h3>
                      <p className="text-muted-foreground">
                        Esta sala aún no tiene obras de arte.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border">
                  <div className="text-6xl mb-4">🏛️</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Selecciona una sala
                  </h3>
                  <p className="text-muted-foreground">
                    Elige una sala del menú lateral para ver sus obras de arte.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Vista de archivo completo
          <div>
            {/* Filtros y búsqueda */}
            <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Título, artista, descripción..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                {/* Filtro por técnica */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Técnica
                  </label>
                  <select
                    value={filterTecnica}
                    onChange={(e) => setFilterTecnica(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="">Todas las técnicas</option>
                    {tecnicasUnicas.map((tecnica) => (
                      <option key={tecnica} value={tecnica}>
                        {tecnica}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por año */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Año
                  </label>
                  <select
                    value={filterAnio}
                    onChange={(e) => setFilterAnio(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="">Todos los años</option>
                    {aniosUnicos.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="titulo">Título</option>
                    <option value="artista">Artista</option>
                    <option value="anio">Año (más reciente)</option>
                    <option value="tecnica">Técnica</option>
                  </select>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span>
                    📊 {filteredMurales.length} de {allMurales.length} obras
                  </span>
                  <span>🎨 {tecnicasUnicas.length} técnicas diferentes</span>
                  <span>📅 {aniosUnicos.length} años representados</span>
                </div>
              </div>
            </div>

            {/* Lista de murales */}
            {filteredMurales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMurales.map((mural) => (
                  <div
                    key={mural.id}
                    className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border"
                  >
                    <div className="relative h-48">
                      <img
                        src={mural.imagenUrl || mural.imagenUrlWebp}
                        alt={mural.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      {mural.anio && (
                        <div className="absolute top-3 right-3 bg-background/90 rounded-full px-2 py-1 text-xs font-bold text-foreground">
                          {mural.anio}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                        {mural.titulo}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {mural.artista || "Artista desconocido"}
                      </p>
                      {mural.tecnica && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {mural.tecnica}
                        </p>
                      )}
                      {mural.descripcion && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {mural.descripcion}
                        </p>
                      )}
                      {mural.ubicacion && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 {mural.ubicacion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-lg p-12 text-center border border-border">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No se encontraron obras
                </h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

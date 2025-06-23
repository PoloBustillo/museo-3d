"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { PageLoader, SectionLoader } from "../../components/LoadingSpinner";

export default function GaleriaPage() {
  const { data: session } = useSession();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSala, setSelectedSala] = useState(null);
  const [murales, setMurales] = useState([]);
  const [loadingMurales, setLoadingMurales] = useState(false);

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/salas");
        if (response.ok) {
          const data = await response.json();
          setSalas(data.salas || []);
        } else {
          toast.error("Error al cargar las salas");
        }
      } catch (error) {
        console.error("Error fetching salas:", error);
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
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
            Explora las obras de arte organizadas por salas temáticas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con salas */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-4 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Salas</h2>
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
      </div>
    </div>
  );
}

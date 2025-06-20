"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function GaleriaPage() {
  const { data: session } = useSession();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSala, setSelectedSala] = useState(null);
  const [murales, setMurales] = useState([]);

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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando galería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Galería Virtual
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora las obras de arte organizadas por salas temáticas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con salas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Salas</h2>
              <div className="space-y-3">
                {salas.map((sala) => (
                  <button
                    key={sala.id}
                    onClick={() => handleSalaSelect(sala.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      selectedSala === sala.id
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {sala.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {sala._count.murales} obras
                        </p>
                      </div>
                      <span className="text-2xl">🎨</span>
                    </div>
                    {sala.creador && (
                      <p className="text-xs text-gray-500 mt-1">
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
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {salas.find((s) => s.id === selectedSala)?.nombre}
                  </h2>
                  <p className="text-gray-600">
                    {salas.find((s) => s.id === selectedSala)?.descripcion}
                  </p>
                </div>

                {murales.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {murales.map((mural) => (
                      <div
                        key={mural.id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
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
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {mural.titulo}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {mural.artista || "Artista desconocido"}
                          </p>
                          {mural.tecnica && (
                            <p className="text-sm text-gray-500 mb-2">
                              Técnica: {mural.tecnica}
                            </p>
                          )}
                          {mural.anio && (
                            <p className="text-sm text-gray-500 mb-2">
                              Año: {mural.anio}
                            </p>
                          )}
                          {mural.descripcion && (
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {mural.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Sala vacía
                    </h3>
                    <p className="text-gray-600">
                      Esta sala aún no tiene obras de arte.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Selecciona una sala
                </h3>
                <p className="text-gray-600">
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

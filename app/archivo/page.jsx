"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Search from "../../components/archive/Search";
import Carousel from "../../components/archive/Carousel";
import Gallery from "../../components/archive/Galery";
import styles from "./archive.module.css";

function agruparMuralesPorFiltrosNumericos(murales, filtrosSeleccionados) {
  const resultado = {};
  const final = [];

  murales.forEach((mural) => {
    const posiblesFiltros = {
      anio: mural.anio,
      salaId: mural.salaId,
    };

    Object.values(posiblesFiltros).forEach((valor) => {
      const clave = valor?.toString();
      if (filtrosSeleccionados.includes(clave) && !isNaN(Number(clave))) {
        if (!resultado[clave]) {
          resultado[clave] = [];
        }
        resultado[clave].push(mural);
      }
    });
  });
  Object.entries(resultado).forEach(([clave, lista]) => {
    if (lista.length > 1) {
      final.push({ [clave]: lista });
    }
  });

  return final;
}

const parsedPhotos = (dataImg) => {
  return dataImg.map((item) => {
    let width = 200;
    let height = 300;

    if (typeof item.medidas === "string") {
      // Extraer todas las dimensiones numéricas del string
      const dimensiones = item.medidas
        .replace(/m/g, "") // quitar unidad "m"
        .split("x") // separar por 'x'
        .map((d) => parseFloat(d.trim()))
        .filter((n) => !isNaN(n));

      // Si al menos hay dos dimensiones válidas
      if (dimensiones.length >= 2) {
        width = dimensiones[0] * 10;
        height = dimensiones[1] * 10;
      }
    }

    return {
      src: item.imagenUrl,
      autor: item.autor,
      colab: item.colaboradores,
      medidas: item.medidas,
      anio: item.anio,
      tecnica: item.tecnica,
      width,
      height,
      title: item.titulo,
    };
  });
};

export default function ArchivoPage() {
  const [murales, setMurales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTecnica, setFilterTecnica] = useState("");
  const [filterAnio, setFilterAnio] = useState("");
  const [sortBy, setSortBy] = useState("titulo");

  useEffect(() => {
    const fetchMurales = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/murales");
        if (res.ok) {
          const data = await res.json();
          setMurales(data.murales || []);
        } else {
          toast.error("Error al cargar los murales");
        }
      } catch (error) {
        console.error("Error fetching murales:", error);
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchMurales();
  }, []);

  // Filtrar y ordenar murales
  const filteredMurales = murales
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

  // Obtener técnicas únicas para el filtro
  const tecnicasUnicas = [
    ...new Set(murales.map((m) => m.tecnica).filter(Boolean)),
  ];
  const aniosUnicos = [
    ...new Set(murales.map((m) => m.anio).filter(Boolean)),
  ].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando archivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Archivo Digital
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Catálogo completo de todas las obras de arte del museo
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Título, artista, descripción..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por técnica */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnica
              </label>
              <select
                value={filterTecnica}
                onChange={(e) => setFilterTecnica(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                value={filterAnio}
                onChange={(e) => setFilterAnio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="titulo">Título</option>
                <option value="artista">Artista</option>
                <option value="anio">Año (más reciente)</option>
                <option value="tecnica">Técnica</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span>
                📊 {filteredMurales.length} de {murales.length} obras
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
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={mural.imagenUrl || mural.imagenUrlWebp}
                    alt={mural.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  {mural.anio && (
                    <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 text-xs font-bold">
                      {mural.anio}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {mural.titulo}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {mural.artista || "Artista desconocido"}
                  </p>
                  {mural.tecnica && (
                    <p className="text-sm text-gray-500 mb-2">
                      {mural.tecnica}
                    </p>
                  )}
                  {mural.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {mural.descripcion}
                    </p>
                  )}
                  {mural.ubicacion && (
                    <p className="text-xs text-gray-500 mt-2">
                      📍 {mural.ubicacion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No se encontraron obras
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

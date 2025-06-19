"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useCollection } from "../../providers/CollectionProvider";
import { useModal } from "../../providers/ModalProvider";
import { useUser } from "../../providers/UserProvider";
import { ModalWrapper } from "../../components/ui/Modal";

export default function MisDocumentos() {
  const { data: session, status } = useSession();
  const {
    user,
    userProfile,
    isAuthenticated,
    isAdmin,
    isModerator,
    getUserRole,
    getUserSetting,
  } = useUser();
  const {
    collection: personalCollection,
    removeFromCollection: handleRemoveFromCollection,
    clearCollection: handleClearCollection,
    isLoading: collectionLoading,
    lastSync,
    isAuthenticated: collectionAuthenticated,
  } = useCollection();
  const { openModal, closeModal } = useModal();
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [collectionStats, setCollectionStats] = useState({});

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    technique: "",
    artist: "",
    year: "",
    sortBy: "newest", // newest, oldest, title, artist, year, technique, sala
    sala: "",
    yearFrom: "",
    yearTo: "",
  });

  // Estados para opciones de filtros y estadísticas
  const [filterOptions, setFilterOptions] = useState({
    techniques: [],
    artists: [],
    years: [],
    salas: [],
    yearRange: { min: null, max: null },
  });

  const [filterStats, setFilterStats] = useState({
    totalFiltered: 0,
    totalOriginal: 0,
    percentage: 100,
    uniqueArtists: 0,
    uniqueTechniques: 0,
    uniqueSalas: 0,
    yearRange: null,
  });

  // Estado para controlar la vista de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para importación/exportación
  const [showExportOptions, setShowExportOptions] = useState(false);

  const userId = session?.user?.id || null;

  // Calcular estadísticas de la colección
  useEffect(() => {
    if (personalCollection.length > 0) {
      const stats = {
        totalArtworks: personalCollection.length,
        uniqueArtists: new Set(personalCollection.map((item) => item.artist))
          .size,
        uniqueTechniques: new Set(
          personalCollection.map((item) => item.technique)
        ).size,
        oldestYear: Math.min(
          ...personalCollection.map((item) => parseInt(item.year) || 0)
        ),
        newestYear: Math.max(
          ...personalCollection.map((item) => parseInt(item.year) || 0)
        ),
        mostRecentAddition:
          personalCollection[personalCollection.length - 1]?.addedAt,
      };
      setCollectionStats(stats);

      // Calcular opciones de filtros
      const options = {
        techniques: [
          ...new Set(
            personalCollection.map((item) => item.technique).filter(Boolean)
          ),
        ],
        artists: [
          ...new Set(
            personalCollection.map((item) => item.artist).filter(Boolean)
          ),
        ],
        years: [
          ...new Set(
            personalCollection.map((item) => item.year).filter(Boolean)
          ),
        ].sort((a, b) => b - a),
        salas: [
          ...new Set(
            personalCollection.map((item) => item.sala).filter(Boolean)
          ),
        ],
        yearRange: {
          min: Math.min(
            ...personalCollection.map((item) => parseInt(item.year) || 0)
          ),
          max: Math.max(
            ...personalCollection.map((item) => parseInt(item.year) || 0)
          ),
        },
      };
      setFilterOptions(options);
    }
  }, [personalCollection]);

  // Filtrar y ordenar colección
  useEffect(() => {
    if (personalCollection.length > 0) {
      let filtered = [...personalCollection];

      // Aplicar filtros
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title?.toLowerCase().includes(searchLower) ||
            item.artist?.toLowerCase().includes(searchLower) ||
            item.technique?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.technique) {
        filtered = filtered.filter(
          (item) => item.technique === filters.technique
        );
      }

      if (filters.artist) {
        filtered = filtered.filter((item) => item.artist === filters.artist);
      }

      if (filters.year) {
        filtered = filtered.filter((item) => item.year === filters.year);
      }

      if (filters.sala) {
        filtered = filtered.filter((item) => item.sala === filters.sala);
      }

      if (filters.yearFrom || filters.yearTo) {
        filtered = filtered.filter((item) => {
          const year = parseInt(item.year);
          const from = filters.yearFrom ? parseInt(filters.yearFrom) : 0;
          const to = filters.yearTo ? parseInt(filters.yearTo) : 9999;
          return year >= from && year <= to;
        });
      }

      // Aplicar ordenamiento
      switch (filters.sortBy) {
        case "newest":
          filtered.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
          break;
        case "oldest":
          filtered.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt));
          break;
        case "title":
          filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
          break;
        case "artist":
          filtered.sort((a, b) =>
            (a.artist || "").localeCompare(b.artist || "")
          );
          break;
        case "year":
          filtered.sort((a, b) => parseInt(b.year) - parseInt(a.year));
          break;
        case "technique":
          filtered.sort((a, b) =>
            (a.technique || "").localeCompare(b.technique || "")
          );
          break;
        case "sala":
          filtered.sort((a, b) => (a.sala || "").localeCompare(b.sala || ""));
          break;
      }

      setFilteredCollection(filtered);

      // Calcular estadísticas de filtros
      const stats = {
        totalFiltered: filtered.length,
        totalOriginal: personalCollection.length,
        percentage: Math.round(
          (filtered.length / personalCollection.length) * 100
        ),
        uniqueArtists: new Set(filtered.map((item) => item.artist)).size,
        uniqueTechniques: new Set(filtered.map((item) => item.technique)).size,
        uniqueSalas: new Set(filtered.map((item) => item.sala)).size,
        yearRange:
          filtered.length > 0
            ? {
                min: Math.min(
                  ...filtered.map((item) => parseInt(item.year) || 0)
                ),
                max: Math.max(
                  ...filtered.map((item) => parseInt(item.year) || 0)
                ),
              }
            : null,
      };
      setFilterStats(stats);
    } else {
      setFilteredCollection([]);
      setFilterStats({
        totalFiltered: 0,
        totalOriginal: 0,
        percentage: 100,
        uniqueArtists: 0,
        uniqueTechniques: 0,
        uniqueSalas: 0,
        yearRange: null,
      });
    }
  }, [personalCollection, filters]);

  // Funciones para manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      technique: "",
      artist: "",
      year: "",
      sortBy: "newest",
      sala: "",
      yearFrom: "",
      yearTo: "",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.technique ||
      filters.artist ||
      filters.year ||
      filters.sala ||
      filters.yearFrom ||
      filters.yearTo
    );
  };

  const handleExportCollection = () => {
    const dataStr = JSON.stringify(personalCollection, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mi-coleccion-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCollection = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (Array.isArray(importedData)) {
        // Aquí podrías implementar la lógica para fusionar con la colección actual
        alert(`Archivo cargado con ${importedData.length} obras`);
      } else {
        alert("Formato de archivo inválido");
      }
    } catch (error) {
      alert("Error al procesar el archivo");
    }

    event.target.value = "";
  };

  const handleShareCollection = () => {
    const summary = `Mi colección del Museo Virtual 3D\n\nTotal de obras: ${personalCollection.length}\nArtistas únicos: ${collectionStats.uniqueArtists}\nTécnicas únicas: ${collectionStats.uniqueTechniques}\n\n${window.location.origin}`;

    if (navigator.share) {
      navigator.share({
        title: "Mi Colección del Museo Virtual 3D",
        text: summary,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard
        .writeText(summary)
        .then(() => {
          alert("¡Resumen copiado al portapapeles!");
        })
        .catch(() => {
          alert(summary);
        });
    }
  };

  const handleExportToPDF = async () => {
    try {
      console.log("Exporting to PDF. Collection data:", filteredCollection);

      // Mostrar mensaje de carga
      const loadingMessage = document.createElement("div");
      loadingMessage.id = "pdf-loading";
      loadingMessage.className =
        "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50";
      loadingMessage.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-800">Generando PDF...</p>
          <p class="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
        </div>
      `;
      document.body.appendChild(loadingMessage);

      // Crear el PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Título del documento
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Mi Colección Personal", margin, 30);

      // Información del usuario
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Usuario: ${session?.user?.name || "Usuario"}`, margin, 45);
      pdf.text(`Total de obras: ${filteredCollection.length}`, margin, 55);
      pdf.text(
        `Fecha de exportación: ${new Date().toLocaleDateString("es-ES")}`,
        margin,
        65
      );

      let currentY = 80;

      // Procesar cada obra
      for (let i = 0; i < filteredCollection.length; i++) {
        const artwork = filteredCollection[i];

        // Verificar si necesitamos una nueva página
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = 30;
        }

        try {
          // Cargar la imagen
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              // Si falla, usar una imagen placeholder
              img.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlbjwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjU1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPm5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPgo=";
              img.onload = resolve;
              img.onerror = reject;
            };
            img.src = artwork.src || artwork.url_imagen || "";
          });

          // Calcular dimensiones de la imagen
          const imgWidth = 60;
          const imgHeight = (img.height * imgWidth) / img.width;
          const textX = margin + imgWidth + 10;

          // Agregar imagen al PDF
          pdf.addImage(img, "JPEG", margin, currentY, imgWidth, imgHeight);

          // Agregar información de la obra
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(artwork.title || "Sin título", textX, currentY + 8);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `Artista: ${artwork.artist || "Desconocido"}`,
            textX,
            currentY + 18
          );
          pdf.text(
            `Técnica: ${artwork.technique || "No especificada"}`,
            textX,
            currentY + 28
          );
          pdf.text(
            `Año: ${artwork.year || "No especificado"}`,
            textX,
            currentY + 38
          );

          if (artwork.sala) {
            pdf.text(`Sala: ${artwork.sala}`, textX, currentY + 48);
          }

          if (artwork.dimensions) {
            pdf.text(
              `Dimensiones: ${artwork.dimensions}`,
              textX,
              currentY + 58
            );
          }

          currentY += Math.max(imgHeight, 50) + 15;
        } catch (error) {
          console.error(
            "Error processing image for artwork:",
            artwork.title,
            error
          );

          // Si falla la imagen, agregar solo el texto
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(artwork.title || "Sin título", margin, currentY + 8);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text(
            `Artista: ${artwork.artist || "Desconocido"}`,
            margin,
            currentY + 18
          );
          pdf.text(
            `Técnica: ${artwork.technique || "No especificada"}`,
            margin,
            currentY + 28
          );
          pdf.text(
            `Año: ${artwork.year || "No especificado"}`,
            margin,
            currentY + 38
          );

          if (artwork.sala) {
            pdf.text(`Sala: ${artwork.sala}`, margin, currentY + 48);
          }

          if (artwork.dimensions) {
            pdf.text(
              `Dimensiones: ${artwork.dimensions}`,
              margin,
              currentY + 58
            );
          }

          pdf.text("[Imagen no disponible]", margin, currentY + 68);

          currentY += 80;
        }
      }

      // Guardar el PDF
      const fileName = `mi-coleccion-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      // Remover mensaje de carga
      document.body.removeChild(loadingMessage);

      alert(`¡PDF generado exitosamente! Se ha descargado como "${fileName}"`);
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Remover mensaje de carga si existe
      const loadingMessage = document.getElementById("pdf-loading");
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }

      alert("Error al generar el PDF. Inténtalo de nuevo.");
    }
  };

  const handleClearCollectionLocal = () => {
    openModal("confirm-clear", {
      title: "Limpiar Colección",
      message:
        "¿Estás seguro de que quieres eliminar toda tu colección? Esta acción no se puede deshacer.",
      onConfirm: () => {
        handleClearCollection();
        closeModal();
      },
    });
  };

  const handleRemoveFromCollectionLocal = (artworkId) => {
    const artwork = personalCollection.find((item) => item.id === artworkId);
    openModal("confirm-remove", {
      title: "Eliminar Obra",
      message: `¿Estás seguro de que quieres eliminar "${
        artwork?.title || "esta obra"
      }" de tu colección?`,
      artwork,
      onConfirm: () => {
        handleRemoveFromCollection(artworkId);
        closeModal();
      },
    });
  };

  const handleShowArtworkDetails = (artwork) => {
    openModal("artwork-details", { artwork });
  };

  const handleShowCollectionStats = () => {
    openModal("collection-stats", {
      stats: collectionStats,
      collection: personalCollection,
    });
  };

  // Renderizar la página
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 opacity-20">🔒</div>
          <h2 className="text-2xl font-light text-gray-600 mb-4">
            Acceso Requerido
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Necesitas iniciar sesión para acceder a tus documentos personales.
          </p>
          <Link
            href="/"
            className="inline-block bg-slate-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300"
          >
            🏠 Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  Mis Documentos
                </h1>
                <p className="text-gray-600 mt-2">
                  Tu colección personal de obras de arte
                </p>
                {userProfile && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">
                      Usuario: {user?.name || user?.email}
                    </span>
                    {userProfile.roles && (
                      <div className="flex gap-1">
                        {userProfile.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              role === "admin"
                                ? "bg-red-100 text-red-800"
                                : role === "moderator"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleShowCollectionStats}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📊 Ver Estadísticas
                </button>
                <Link
                  href="/museo"
                  className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  🏛️ Explorar Museo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {personalCollection.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm p-16 rounded-2xl border border-white/50 shadow-xl text-center">
              <div className="text-8xl mb-6 opacity-20">📄</div>
              <h3 className="text-2xl font-light text-gray-600 mb-4">
                No tienes documentos aún
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                Comienza agregando obras a tu colección personal desde el museo
                virtual.
              </p>
              <Link
                href="/museo"
                className="inline-block bg-slate-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🏛️ Explorar Museo
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Panel de gestión y exportación */}
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-light text-gray-800 flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    Gestión de Colección
                  </h2>

                  <div className="flex items-center gap-2">
                    {collectionLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Sincronizando...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          {personalCollection.length} obras
                        </span>
                      </div>
                    )}
                    {lastSync && (
                      <span className="text-xs text-gray-500">
                        Última sincronización:{" "}
                        {new Date(lastSync).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50">
                    <div className="text-3xl font-light text-slate-700 mb-1">
                      {collectionStats.totalArtworks || 0}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Total obras
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                    <div className="text-3xl font-light text-gray-700 mb-1">
                      {collectionStats.uniqueArtists || 0}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Artistas
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-b from-stone-50 to-stone-100/50 rounded-xl border border-stone-200/50">
                    <div className="text-3xl font-light text-stone-700 mb-1">
                      {collectionStats.uniqueTechniques || 0}
                    </div>
                    <div className="text-sm text-stone-600 font-medium">
                      Técnicas
                    </div>
                  </div>

                  {collectionStats.oldestYear && (
                    <div className="text-center p-4 bg-gradient-to-b from-zinc-50 to-zinc-100/50 rounded-xl border border-zinc-200/50">
                      <div className="text-lg font-light text-zinc-700 mb-1">
                        {collectionStats.oldestYear} -{" "}
                        {collectionStats.newestYear}
                      </div>
                      <div className="text-sm text-zinc-600 font-medium">
                        Período
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones de gestión */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="bg-slate-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {showExportOptions
                      ? "📁 Ocultar Opciones"
                      : "📤 Opciones de Gestión"}
                  </button>
                </div>

                {/* Opciones de exportación */}
                {showExportOptions && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Herramientas de gestión
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        onClick={handleExportCollection}
                        className="bg-slate-500 text-white px-4 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                      >
                        💾 Exportar JSON
                      </button>

                      <button
                        onClick={handleExportToPDF}
                        className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        📄 Exportar PDF
                      </button>

                      <label className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer text-center">
                        📁 Importar colección
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportCollection}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={handleShareCollection}
                        className="bg-stone-500 text-white px-4 py-3 rounded-lg hover:bg-stone-600 transition-colors font-medium"
                      >
                        📋 Compartir resumen
                      </button>
                    </div>

                    <div className="mt-4 p-4 bg-white/50 rounded-lg border border-gray-200/30">
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          • <strong>Exportar JSON:</strong> Descarga tu
                          colección en formato JSON
                        </p>
                        <p>
                          • <strong>Exportar PDF:</strong> Genera un documento
                          PDF con imágenes y detalles
                        </p>
                        <p>
                          • <strong>Importar:</strong> Carga una colección desde
                          un archivo JSON
                        </p>
                        <p>
                          • <strong>Compartir:</strong> Genera un resumen de tu
                          colección
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleClearCollectionLocal}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                      >
                        🗑️ Limpiar toda la colección
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Galería de obras con filtros integrados */}
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                    <span className="text-xl">🎨</span>
                    Galería de Documentos
                    <span className="text-lg font-normal text-gray-500 ml-2">
                      ({filterStats.totalFiltered} de{" "}
                      {filterStats.totalOriginal})
                    </span>
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                      {showAdvancedFilters
                        ? "Filtros básicos"
                        : "Filtros avanzados"}
                    </button>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtros básicos */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Buscar por título, artista o técnica..."
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      />
                    </div>

                    {/* Ordenamiento */}
                    <div className="min-w-[150px]">
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          handleFilterChange("sortBy", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                      >
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguos</option>
                        <option value="title">Por título</option>
                        <option value="artist">Por artista</option>
                        <option value="year">Por año</option>
                        <option value="technique">Por técnica</option>
                        <option value="sala">Por sala</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtros avanzados */}
                {showAdvancedFilters && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/30">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      Filtros Avanzados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Técnica */}
                      {filterOptions.techniques.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Técnica
                          </label>
                          <select
                            value={filters.technique}
                            onChange={(e) =>
                              handleFilterChange("technique", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todas las técnicas</option>
                            {filterOptions.techniques.map((technique) => (
                              <option key={technique} value={technique}>
                                {technique}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Artista */}
                      {filterOptions.artists.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Artista
                          </label>
                          <select
                            value={filters.artist}
                            onChange={(e) =>
                              handleFilterChange("artist", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todos los artistas</option>
                            {filterOptions.artists.map((artist) => (
                              <option key={artist} value={artist}>
                                {artist}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Año */}
                      {filterOptions.years.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Año
                          </label>
                          <select
                            value={filters.year}
                            onChange={(e) =>
                              handleFilterChange("year", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todos los años</option>
                            {filterOptions.years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Sala */}
                      {filterOptions.salas.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sala
                          </label>
                          <select
                            value={filters.sala}
                            onChange={(e) =>
                              handleFilterChange("sala", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                          >
                            <option value="">Todas las salas</option>
                            {filterOptions.salas.map((sala) => (
                              <option key={sala} value={sala}>
                                {sala}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Rango de años */}
                      {filterOptions.yearRange.min &&
                        filterOptions.yearRange.max && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Año desde
                              </label>
                              <select
                                value={filters.yearFrom}
                                onChange={(e) =>
                                  handleFilterChange("yearFrom", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                              >
                                <option value="">Desde...</option>
                                {filterOptions.years.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Año hasta
                              </label>
                              <select
                                value={filters.yearTo}
                                onChange={(e) =>
                                  handleFilterChange("yearTo", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                              >
                                <option value="">Hasta...</option>
                                {filterOptions.years.map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                )}

                {/* Estadísticas de filtros */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-200/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-blue-800 font-medium">
                        📊 Mostrando {filterStats.totalFiltered} de{" "}
                        {filterStats.totalOriginal} obras
                        {filterStats.percentage < 100 && (
                          <span className="text-blue-600 ml-1">
                            ({filterStats.percentage}%)
                          </span>
                        )}
                      </span>

                      {filterStats.totalFiltered > 0 && (
                        <div className="flex gap-3 text-blue-700">
                          <span>🎨 {filterStats.uniqueArtists} artistas</span>
                          <span>
                            🛠️ {filterStats.uniqueTechniques} técnicas
                          </span>
                          {filterStats.uniqueSalas > 0 && (
                            <span>🏛️ {filterStats.uniqueSalas} salas</span>
                          )}
                        </div>
                      )}
                    </div>

                    {hasActiveFilters() && (
                      <span className="text-blue-600 font-medium text-xs">
                        Filtros activos:{" "}
                        {[
                          filters.search && "Búsqueda",
                          filters.technique && "Técnica",
                          filters.artist && "Artista",
                          filters.year && "Año",
                          filters.sala && "Sala",
                          (filters.yearFrom || filters.yearTo) &&
                            "Rango de años",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid de obras */}
                {filteredCollection.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6 opacity-30">🔍</div>
                    <h4 className="text-xl font-light text-gray-600 mb-4">
                      No se encontraron obras
                    </h4>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      No hay obras que coincidan con los filtros aplicados.
                      Prueba ajustando los criterios de búsqueda.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCollection.map((artwork, index) => (
                      <div
                        key={artwork.id}
                        className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                      >
                        <div className="relative">
                          <img
                            src={artwork.src}
                            alt={artwork.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 hidden items-center justify-center">
                            <div className="text-center text-gray-500">
                              <div className="text-3xl mb-2">🎨</div>
                              <span className="text-sm">
                                Imagen no disponible
                              </span>
                            </div>
                          </div>

                          {/* Indicador de sala */}
                          {artwork.sala && (
                            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                              🏛️ {artwork.sala}
                            </div>
                          )}

                          {/* Overlay con información adicional */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <div className="text-white text-sm">
                              {artwork.dimensions && (
                                <p className="mb-1">📏 {artwork.dimensions}</p>
                              )}
                              <p>
                                ➕{" "}
                                {new Date(artwork.addedAt).toLocaleDateString(
                                  "es-ES"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <h4 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                            {artwork.title}
                          </h4>
                          <p className="text-gray-600 font-medium text-sm">
                            {artwork.artist}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span>📅</span>
                              {artwork.year}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="flex items-center gap-1">
                              <span>🛠️</span>
                              {artwork.technique}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-400">
                              #{index + 1}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleShowArtworkDetails(artwork)
                                }
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              >
                                👁️ Ver
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoveFromCollectionLocal(artwork.id)
                                }
                                className="text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                              >
                                🗑️ Quitar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <ModalWrapper
        modalName="confirm-clear"
        title="Confirmar Acción"
        size="sm"
      >
        {(data) => (
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {data?.title || "Confirmar Acción"}
            </h3>
            <p className="text-gray-600 mb-6">
              {data?.message ||
                "¿Estás seguro de que quieres realizar esta acción?"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={data?.onConfirm}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      <ModalWrapper modalName="confirm-remove" title="Eliminar Obra" size="sm">
        {(data) => (
          <div className="text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {data?.title || "Eliminar Obra"}
            </h3>
            <p className="text-gray-600 mb-6">
              {data?.message ||
                "¿Estás seguro de que quieres eliminar esta obra?"}
            </p>
            {data?.artwork && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <img
                  src={data.artwork.src}
                  alt={data.artwork.title}
                  className="w-16 h-16 object-cover rounded mx-auto mb-2"
                />
                <p className="text-sm font-medium text-gray-800">
                  {data.artwork.title}
                </p>
                <p className="text-xs text-gray-600">{data.artwork.artist}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={data?.onConfirm}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      <ModalWrapper
        modalName="artwork-details"
        title="Detalles de la Obra"
        size="lg"
      >
        {(data) => (
          <div className="space-y-6">
            {data?.artwork && (
              <>
                <div className="flex gap-6">
                  <img
                    src={data.artwork.src}
                    alt={data.artwork.title}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {data.artwork.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      {data.artwork.artist}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Año:</span>{" "}
                        {data.artwork.year}
                      </p>
                      <p>
                        <span className="font-medium">Técnica:</span>{" "}
                        {data.artwork.technique}
                      </p>
                      {data.artwork.sala && (
                        <p>
                          <span className="font-medium">Sala:</span>{" "}
                          {data.artwork.sala}
                        </p>
                      )}
                      {data.artwork.dimensions && (
                        <p>
                          <span className="font-medium">Dimensiones:</span>{" "}
                          {data.artwork.dimensions}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Agregado:</span>{" "}
                        {new Date(data.artwork.addedAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {data.artwork.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Descripción
                    </h4>
                    <p className="text-gray-600">{data.artwork.description}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </ModalWrapper>

      <ModalWrapper
        modalName="collection-stats"
        title="Estadísticas de la Colección"
        size="xl"
      >
        {(data) => (
          <div className="space-y-6">
            {data?.stats && data?.collection && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.stats.totalArtworks}
                    </div>
                    <div className="text-sm text-blue-800">Total Obras</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.stats.uniqueArtists}
                    </div>
                    <div className="text-sm text-green-800">
                      Artistas Únicos
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.stats.uniqueTechniques}
                    </div>
                    <div className="text-sm text-purple-800">
                      Técnicas Únicas
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {data.stats.oldestYear} - {data.stats.newestYear}
                    </div>
                    <div className="text-sm text-orange-800">Período</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Distribución por Técnica
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      data.collection.reduce((acc, artwork) => {
                        acc[artwork.technique] =
                          (acc[artwork.technique] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([technique, count]) => (
                      <div
                        key={technique}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-700">
                          {technique}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Artistas Más Representados
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      data.collection.reduce((acc, artwork) => {
                        acc[artwork.artist] = (acc[artwork.artist] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([artist, count]) => (
                        <div
                          key={artist}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-700">
                            {artist}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {count} obras
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ModalWrapper>
    </>
  );
}

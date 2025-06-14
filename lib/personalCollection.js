// Funciones utilitarias para manejar la colección personal de cada usuario
// Usando localStorage con el ID del usuario para persistencia

/**
 * Obtiene la colección personal de un usuario específico
 * @param {string|null} userId - ID del usuario (null para invitado)
 * @returns {Array} Array de obras en la colección
 */
export const getPersonalCollection = (userId = null) => {
  try {
    if (!userId) {
      userId = "guest";
    }
    const collectionKey = `personalCollection_${userId}`;
    const collection = localStorage.getItem(collectionKey);
    return collection ? JSON.parse(collection) : [];
  } catch (error) {
    console.error("Error al obtener la colección personal:", error);
    return [];
  }
};

/**
 * Añade una obra a la colección personal de un usuario
 * @param {Object} artwork - Objeto con datos de la obra
 * @param {string|null} userId - ID del usuario
 * @returns {boolean} true si se añadió exitosamente, false si ya existía
 */
export const addToPersonalCollection = (artwork, userId = null) => {
  try {
    if (!userId) {
      userId = "guest";
    }

    const collection = getPersonalCollection(userId);
    const artworkData = {
      id: `${artwork.title}-${artwork.artist}`,
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.year,
      technique: artwork.technique,
      description: artwork.description,
      dimensions: artwork.dimensions,
      src: artwork.src,
      addedAt: new Date().toISOString(),
      userId: userId,
      // Información contextual adicional
      sala: artwork.sala || artwork.salaName || null,
      salaId: artwork.salaId || null,
      location: artwork.location || artwork.ubicacion || null,
    };

    // Verificar si ya existe
    const exists = collection.some((item) => item.id === artworkData.id);
    if (!exists) {
      collection.push(artworkData);
      const collectionKey = `personalCollection_${userId}`;
      localStorage.setItem(collectionKey, JSON.stringify(collection));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error al añadir a la colección:", error);
    return false;
  }
};

/**
 * Remueve una obra de la colección personal de un usuario
 * @param {string} artworkId - ID único de la obra
 * @param {string|null} userId - ID del usuario
 * @returns {boolean} true si se removió exitosamente
 */
export const removeFromPersonalCollection = (artworkId, userId = null) => {
  try {
    if (!userId) {
      userId = "guest";
    }

    const collection = getPersonalCollection(userId);
    const filteredCollection = collection.filter(
      (item) => item.id !== artworkId
    );
    const collectionKey = `personalCollection_${userId}`;
    localStorage.setItem(collectionKey, JSON.stringify(filteredCollection));
    return true;
  } catch (error) {
    console.error("Error al remover de la colección:", error);
    return false;
  }
};

/**
 * Verifica si una obra está en la colección personal de un usuario
 * @param {Object} artwork - Objeto con datos de la obra
 * @param {string|null} userId - ID del usuario
 * @returns {boolean} true si la obra está en la colección
 */
export const isInPersonalCollection = (artwork, userId = null) => {
  const collection = getPersonalCollection(userId);
  const artworkId = `${artwork.title}-${artwork.artist}`;
  return collection.some((item) => item.id === artworkId);
};

/**
 * Limpia la colección personal de un usuario (para casos especiales)
 * @param {string|null} userId - ID del usuario
 * @returns {boolean} true si se limpió exitosamente
 */
export const clearPersonalCollection = (userId = null) => {
  try {
    if (!userId) {
      userId = "guest";
    }
    const collectionKey = `personalCollection_${userId}`;
    localStorage.removeItem(collectionKey);
    return true;
  } catch (error) {
    console.error("Error al limpiar la colección:", error);
    return false;
  }
};

/**
 * Obtiene estadísticas de la colección de un usuario
 * @param {string|null} userId - ID del usuario
 * @returns {Object} Objeto con estadísticas de la colección
 */
export const getCollectionStats = (userId = null) => {
  try {
    const collection = getPersonalCollection(userId);
    const totalArtworks = collection.length;
    const artists = [...new Set(collection.map((item) => item.artist))];
    const techniques = [...new Set(collection.map((item) => item.technique))];
    const years = collection
      .map((item) => parseInt(item.year))
      .filter((year) => !isNaN(year));

    return {
      totalArtworks,
      uniqueArtists: artists.length,
      uniqueTechniques: techniques.length,
      oldestYear: years.length > 0 ? Math.min(...years) : null,
      newestYear: years.length > 0 ? Math.max(...years) : null,
      mostRecentAddition:
        collection.length > 0
          ? collection.sort(
              (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
            )[0]
          : null,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de la colección:", error);
    return {
      totalArtworks: 0,
      uniqueArtists: 0,
      uniqueTechniques: 0,
      oldestYear: null,
      newestYear: null,
      mostRecentAddition: null,
    };
  }
};

/**
 * Filtra la colección personal según los criterios especificados
 * @param {Array} collection - Array de obras de la colección
 * @param {Object} filters - Objeto con los filtros a aplicar
 * @returns {Array} Array filtrado de obras
 */
export const filterPersonalCollection = (collection, filters) => {
  try {
    let filtered = [...collection];

    // Filtrar por búsqueda de texto (título, artista, descripción)
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const artist = (item.artist || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const technique = (item.technique || "").toLowerCase();
        const year = (item.year || "").toString();

        return (
          title.includes(searchLower) ||
          artist.includes(searchLower) ||
          description.includes(searchLower) ||
          technique.includes(searchLower) ||
          year.includes(searchLower)
        );
      });
    }

    // Filtrar por técnica
    if (filters.technique && filters.technique !== "") {
      filtered = filtered.filter(
        (item) => item.technique === filters.technique
      );
    }

    // Filtrar por artista
    if (filters.artist && filters.artist !== "") {
      filtered = filtered.filter((item) => item.artist === filters.artist);
    }

    // Filtrar por año
    if (filters.year && filters.year !== "") {
      filtered = filtered.filter((item) => item.year === filters.year);
    }

    // Filtrar por sala
    if (filters.sala && filters.sala !== "") {
      filtered = filtered.filter((item) => item.sala === filters.sala);
    }

    // Filtrar por rango de años
    if (filters.yearFrom && filters.yearTo) {
      const yearFrom = parseInt(filters.yearFrom);
      const yearTo = parseInt(filters.yearTo);
      filtered = filtered.filter((item) => {
        const itemYear = parseInt(item.year);
        return itemYear >= yearFrom && itemYear <= yearTo;
      });
    }

    // Ordenar según el criterio especificado
    if (filters.sortBy) {
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
          filtered.sort(
            (a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0)
          );
          break;
        case "technique":
          filtered.sort((a, b) =>
            (a.technique || "").localeCompare(b.technique || "")
          );
          break;
        case "sala":
          filtered.sort((a, b) => (a.sala || "").localeCompare(b.sala || ""));
          break;
        default:
          break;
      }
    }

    return filtered;
  } catch (error) {
    console.error("Error al filtrar la colección:", error);
    return collection;
  }
};

/**
 * Obtiene opciones únicas para los filtros basadas en la colección del usuario
 * @param {string|null} userId - ID del usuario
 * @returns {Object} Objeto con arrays de opciones para cada filtro
 */
export const getFilterOptions = (userId = null) => {
  try {
    const collection = getPersonalCollection(userId);

    // Extraer valores únicos para cada filtro
    const techniques = [
      ...new Set(collection.map((item) => item.technique).filter(Boolean)),
    ].sort();
    const artists = [
      ...new Set(collection.map((item) => item.artist).filter(Boolean)),
    ].sort();
    const years = [
      ...new Set(collection.map((item) => item.year).filter(Boolean)),
    ].sort((a, b) => b - a);
    const salas = [
      ...new Set(collection.map((item) => item.sala).filter(Boolean)),
    ].sort();

    // Calcular rango de años
    const numericYears = years
      .map((year) => parseInt(year))
      .filter((year) => !isNaN(year));
    const minYear = numericYears.length > 0 ? Math.min(...numericYears) : null;
    const maxYear = numericYears.length > 0 ? Math.max(...numericYears) : null;

    return {
      techniques,
      artists,
      years,
      salas,
      yearRange: {
        min: minYear,
        max: maxYear,
      },
    };
  } catch (error) {
    console.error("Error al obtener opciones de filtros:", error);
    return {
      techniques: [],
      artists: [],
      years: [],
      salas: [],
      yearRange: { min: null, max: null },
    };
  }
};

/**
 * Obtiene estadísticas de los resultados filtrados
 * @param {Array} filteredCollection - Array filtrado de obras
 * @param {Array} fullCollection - Array completo de la colección
 * @returns {Object} Objeto con estadísticas de los filtros
 */
export const getFilterStats = (filteredCollection, fullCollection) => {
  try {
    const filtered = filteredCollection.length;
    const total = fullCollection.length;
    const percentage = total > 0 ? Math.round((filtered / total) * 100) : 0;

    // Estadísticas de la colección filtrada
    const artists = [...new Set(filteredCollection.map((item) => item.artist))];
    const techniques = [
      ...new Set(filteredCollection.map((item) => item.technique)),
    ];
    const salas = [...new Set(filteredCollection.map((item) => item.sala))];
    const years = filteredCollection
      .map((item) => parseInt(item.year))
      .filter((year) => !isNaN(year));

    return {
      totalFiltered: filtered,
      totalOriginal: total,
      percentage,
      uniqueArtists: artists.length,
      uniqueTechniques: techniques.length,
      uniqueSalas: salas.length,
      yearRange:
        years.length > 0
          ? {
              min: Math.min(...years),
              max: Math.max(...years),
            }
          : null,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de filtros:", error);
    return {
      totalFiltered: 0,
      totalOriginal: 0,
      percentage: 0,
      uniqueArtists: 0,
      uniqueTechniques: 0,
      uniqueSalas: 0,
      yearRange: null,
    };
  }
};

/**
 * Exporta la colección personal a un archivo JSON
 * @param {string|null} userId - ID del usuario
 * @returns {boolean} true si se exportó exitosamente
 */
export const exportPersonalCollection = (userId = null) => {
  try {
    const collection = getPersonalCollection(userId);
    const stats = getCollectionStats(userId);
    const exportData = {
      userId: userId || "guest",
      exportDate: new Date().toISOString(),
      totalArtworks: collection.length,
      stats,
      collection,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mi-coleccion-${userId || "guest"}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    return true;
  } catch (error) {
    console.error("Error al exportar la colección:", error);
    return false;
  }
};

/**
 * Importa una colección desde un archivo JSON
 * @param {File} file - Archivo JSON con la colección
 * @param {string|null} userId - ID del usuario
 * @param {boolean} merge - Si fusionar con la colección existente o reemplazarla
 * @returns {Promise<Object>} Resultado de la importación
 */
export const importPersonalCollection = async (
  file,
  userId = null,
  merge = true
) => {
  try {
    const fileContent = await file.text();
    const importData = JSON.parse(fileContent);

    if (!importData.collection || !Array.isArray(importData.collection)) {
      throw new Error("Formato de archivo inválido");
    }

    const existingCollection = merge ? getPersonalCollection(userId) : [];
    const importedArtworks = importData.collection;

    // Evitar duplicados por ID
    const existingIds = new Set(existingCollection.map((item) => item.id));
    const newArtworks = importedArtworks.filter(
      (artwork) => !existingIds.has(artwork.id)
    );

    const finalCollection = [...existingCollection, ...newArtworks];

    const collectionKey = `personalCollection_${userId || "guest"}`;
    localStorage.setItem(collectionKey, JSON.stringify(finalCollection));

    return {
      success: true,
      imported: newArtworks.length,
      duplicates: importedArtworks.length - newArtworks.length,
      total: finalCollection.length,
    };
  } catch (error) {
    console.error("Error al importar la colección:", error);
    return {
      success: false,
      error: error.message,
      imported: 0,
      duplicates: 0,
      total: 0,
    };
  }
};

/**
 * Genera un resumen de la colección para compartir
 * @param {string|null} userId - ID del usuario
 * @returns {string} Texto del resumen
 */
export const generateCollectionSummary = (userId = null) => {
  try {
    const collection = getPersonalCollection(userId);
    const stats = getCollectionStats(userId);

    if (collection.length === 0) {
      return "Mi colección del Museo Virtual está vacía. ¡Es hora de explorar y guardar algunas obras!";
    }

    const artistsList = [
      ...new Set(collection.map((item) => item.artist)),
    ].slice(0, 5);
    const techniquesList = [
      ...new Set(collection.map((item) => item.technique)),
    ].slice(0, 3);

    let summary = `🎨 Mi Colección del Museo Virtual 3D\n\n`;
    summary += `📊 Estadísticas:\n`;
    summary += `• ${stats.totalArtworks} obras en total\n`;
    summary += `• ${stats.uniqueArtists} artistas diferentes\n`;
    summary += `• ${stats.uniqueTechniques} técnicas distintas\n`;

    if (stats.oldestYear && stats.newestYear) {
      summary += `• Período: ${stats.oldestYear} - ${stats.newestYear}\n`;
    }

    summary += `\n🎨 Artistas destacados:\n`;
    artistsList.forEach((artist) => {
      const count = collection.filter((item) => item.artist === artist).length;
      summary += `• ${artist} (${count} obra${count > 1 ? "s" : ""})\n`;
    });

    summary += `\n🛠️ Técnicas favoritas:\n`;
    techniquesList.forEach((technique) => {
      const count = collection.filter(
        (item) => item.technique === technique
      ).length;
      summary += `• ${technique} (${count})\n`;
    });

    if (stats.mostRecentAddition) {
      summary += `\n🆕 Última obra añadida:\n`;
      summary += `"${stats.mostRecentAddition.title}" de ${stats.mostRecentAddition.artist}\n`;
    }

    summary += `\n---\nGenerado el ${new Date().toLocaleDateString(
      "es-ES"
    )} desde el Museo Virtual 3D`;

    return summary;
  } catch (error) {
    console.error("Error al generar resumen:", error);
    return "Error al generar el resumen de la colección.";
  }
};

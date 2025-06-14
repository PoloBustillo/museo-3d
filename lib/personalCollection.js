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

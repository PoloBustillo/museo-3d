import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

/**
 * Gestor global de texturas GPU - Evita exceder el límite de 16 texturas
 */

const MAX_GPU_TEXTURES = 14; // Límite seguro (deja 2 para sistema)

// Prioridades de texturas (mayor número = mayor prioridad)
const TEXTURE_PRIORITIES = {
  // Obras de arte - MÁXIMA PRIORIDAD
  artwork: 10,
  "artwork-frame": 9,

  // Estructura importante
  wall: 5,
  floor: 4,

  // Decoración
  ceiling: 2,
  molding: 1,
  furniture: 1,
};

const TextureManagerContext = createContext();

export function TextureManagerProvider({ children }) {
  const [activeTextures, setActiveTextures] = useState(new Map());
  const textureCountRef = useRef(0);

  // Registrar una nueva textura
  const registerTexture = useCallback(
    (id, texture, type = "generic", priority = 1) => {
      const texturePriority = TEXTURE_PRIORITIES[type] || priority;

      setActiveTextures((prev) => {
        const newMap = new Map(prev);

        // Si ya estamos en el límite, remover texturas de menor prioridad
        if (newMap.size >= MAX_GPU_TEXTURES) {
          // Encontrar textura de menor prioridad
          let lowestPriority = Infinity;
          let lowestId = null;

          for (const [existingId, data] of newMap) {
            if (
              data.priority < lowestPriority &&
              data.priority < texturePriority
            ) {
              lowestPriority = data.priority;
              lowestId = existingId;
            }
          }

          // Remover la textura de menor prioridad si encontramos una
          if (lowestId) {
            newMap.delete(lowestId);
          } else {
            // No podemos agregar esta textura - no hay espacio
            console.warn(
              `GPU texture limit reached. Cannot add texture: ${id}`
            );
            return prev;
          }
        }

        newMap.set(id, { texture, type, priority: texturePriority });
        textureCountRef.current = newMap.size;

        return newMap;
      });

      return texture;
    },
    []
  );

  // Desregistrar una textura
  const unregisterTexture = useCallback((id) => {
    setActiveTextures((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      textureCountRef.current = newMap.size;
      return newMap;
    });
  }, []);

  // Verificar si podemos cargar más texturas
  const canLoadTexture = useCallback(
    (priority = 1) => {
      if (textureCountRef.current < MAX_GPU_TEXTURES) {
        return true;
      }

      // Verificar si hay texturas de menor prioridad que podemos reemplazar
      for (const [, data] of activeTextures) {
        if (data.priority < priority) {
          return true;
        }
      }

      return false;
    },
    [activeTextures]
  );

  // Obtener estadísticas
  const getStats = useCallback(() => {
    return {
      active: textureCountRef.current,
      max: MAX_GPU_TEXTURES,
      available: MAX_GPU_TEXTURES - textureCountRef.current,
      breakdown: Array.from(activeTextures.entries()).reduce(
        (acc, [id, data]) => {
          acc[data.type] = (acc[data.type] || 0) + 1;
          return acc;
        },
        {}
      ),
    };
  }, [activeTextures]);

  const value = {
    registerTexture,
    unregisterTexture,
    canLoadTexture,
    getStats,
    activeCount: textureCountRef.current,
  };

  return (
    <TextureManagerContext.Provider value={value}>
      {children}
    </TextureManagerContext.Provider>
  );
}

export function useTextureManager() {
  const context = useContext(TextureManagerContext);
  if (!context) {
    throw new Error(
      "useTextureManager must be used within TextureManagerProvider"
    );
  }
  return context;
}

/**
 * Hook optimizado para cargar texturas con gestión automática de GPU
 */
export function useManagedTexture(textureUrl, type = "generic", priority = 1) {
  const { registerTexture, unregisterTexture, canLoadTexture } =
    useTextureManager();

  // Solo cargar si podemos y si la URL es válida
  if (!textureUrl || !canLoadTexture(priority)) {
    return null;
  }

  try {
    // Aquí iría la lógica de carga real usando useTexture
    // Por ahora retornamos null para evitar cargas
    return null;
  } catch (e) {
    return null;
  }
}

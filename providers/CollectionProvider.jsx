"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CollectionContext = createContext();

export function CollectionProvider({ children }) {
  const { data: session, status } = useSession();
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Cargar colección desde la API al iniciar sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      loadCollectionFromAPI();
    } else if (status === "unauthenticated") {
      // Cargar de localStorage si no hay sesión
      loadCollectionFromLocalStorage();
    }
  }, [status, session?.user?.id]);

  // Función para cargar desde la API
  const loadCollectionFromAPI = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/collection");

      if (response.ok) {
        const data = await response.json();
        setCollection(data);
        setLastSync(new Date());

        // También guardar en localStorage como caché
        localStorage.setItem("collection", JSON.stringify(data));
        localStorage.setItem("collection_last_sync", new Date().toISOString());
      } else {
        console.error("Error al cargar colección desde API:", response.status);
        // Fallback a localStorage si la API falla
        loadCollectionFromLocalStorage();
      }
    } catch (error) {
      console.error("Error al cargar colección:", error);
      // Fallback a localStorage si hay error de red
      loadCollectionFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar desde localStorage
  const loadCollectionFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("collection");
      if (stored) {
        const data = JSON.parse(stored);
        setCollection(data);
        setLastSync(
          new Date(localStorage.getItem("collection_last_sync") || Date.now())
        );
      }
    } catch (error) {
      console.error("Error al cargar colección desde localStorage:", error);
      setCollection([]);
    }
  };

  // Función para guardar en la API
  const saveCollectionToAPI = async (newCollection) => {
    if (status !== "authenticated" || !session?.user?.id) {
      return false;
    }

    try {
      const response = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollection),
      });

      if (response.ok) {
        setLastSync(new Date());
        localStorage.setItem("collection_last_sync", new Date().toISOString());
        return true;
      } else {
        console.error("Error al guardar colección en API:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error al guardar colección:", error);
      return false;
    }
  };

  // Función para actualizar la colección
  const updateCollection = async (newCollection) => {
    setCollection(newCollection);

    // Guardar en localStorage inmediatamente
    localStorage.setItem("collection", JSON.stringify(newCollection));

    // Intentar guardar en la API (asíncrono)
    if (status === "authenticated") {
      saveCollectionToAPI(newCollection);
    }
  };

  // Función para agregar una obra
  const addToCollection = async (artwork) => {
    const newCollection = [
      ...collection,
      {
        ...artwork,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
      },
    ];
    await updateCollection(newCollection);
  };

  // Función para remover una obra
  const removeFromCollection = async (artworkId) => {
    const newCollection = collection.filter((item) => item.id !== artworkId);
    await updateCollection(newCollection);
  };

  // Función para limpiar la colección
  const clearCollection = async () => {
    await updateCollection([]);
  };

  // Función para sincronizar manualmente
  const syncCollection = async () => {
    if (status === "authenticated") {
      await loadCollectionFromAPI();
    }
  };

  return (
    <CollectionContext.Provider
      value={{
        collection,
        setCollection: updateCollection,
        addToCollection,
        removeFromCollection,
        clearCollection,
        syncCollection,
        isLoading,
        lastSync,
        isAuthenticated: status === "authenticated",
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
};

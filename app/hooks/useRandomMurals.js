"use client";

import { useState, useEffect } from "react";

// Cache para almacenar los murales aleatorios
let cachedMurals = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useRandomMurals(count = 4) {
  const [murals, setMurals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomMurals = async () => {
      try {
        // Verificar si hay cache válido
        if (
          cachedMurals &&
          cacheTimestamp &&
          Date.now() - cacheTimestamp < CACHE_DURATION
        ) {
          setMurals(cachedMurals);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        // Fetch de todos los murales
        const response = await fetch("/api/murales");
        if (!response.ok) {
          throw new Error("Error al cargar los murales");
        }

        const data = await response.json();
        const allMurals = data.murales || [];

        // Filtrar murales que tengan imagen
        const muralsWithImages = allMurals.filter((mural) => mural.url_imagen);

        if (muralsWithImages.length === 0) {
          throw new Error("No se encontraron murales con imágenes");
        }

        // Seleccionar murales aleatorios
        const shuffled = [...muralsWithImages].sort(() => 0.5 - Math.random());
        const selectedMurals = shuffled.slice(
          0,
          Math.min(count, muralsWithImages.length)
        );

        // Cachear el resultado
        cachedMurals = selectedMurals;
        cacheTimestamp = Date.now();

        setMurals(selectedMurals);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching random murals:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRandomMurals();
  }, [count]);

  return { murals, loading, error };
}

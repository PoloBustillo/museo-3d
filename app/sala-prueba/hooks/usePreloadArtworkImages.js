"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Preload artwork images via HTMLImageElement to warm the browser cache before R3F loads textures.
 * Returns simple progress information.
 */
export function usePreloadArtworkImages(artworks = [], enabled = true, { concurrency = 3 } = {}) {
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const queueRef = useRef([]);
  const inFlightRef = useRef(0);
  const doneRef = useRef(false);

  const urls = useMemo(() => {
    const set = new Set();
    for (const a of artworks) {
      const u = a?.imagenUrlWebp || a?.url_imagen || a?.imageUrl;
      if (u) set.add(u);
    }
    return Array.from(set);
  }, [artworks]);

  useEffect(() => {
    if (!enabled || urls.length === 0) return;
    queueRef.current = urls.slice();
    inFlightRef.current = 0;
    doneRef.current = false;
    setLoaded(0);
    setTotal(urls.length);

    const preloadNext = () => {
      if (!enabled) return; // guard if disabled mid-way
      if (doneRef.current) return;
      if (queueRef.current.length === 0) {
        if (inFlightRef.current === 0) doneRef.current = true;
        return;
      }
      if (inFlightRef.current >= concurrency) return;

      const url = queueRef.current.shift();
      if (!url) return;
      inFlightRef.current += 1;
      const img = new Image();
      img.crossOrigin = "anonymous";
      const settle = () => {
        inFlightRef.current -= 1;
        setLoaded((v) => v + 1);
        // schedule next tick to keep stack small
        queueMicrotask(preloadNext);
      };
      img.onload = settle;
      img.onerror = settle;
      img.src = url;

      // Fill pipeline
      queueMicrotask(preloadNext);
    };

    // Prime initial batch
    for (let i = 0; i < concurrency; i++) preloadNext();

    return () => {
      doneRef.current = true;
      queueRef.current = [];
    };
  }, [urls, enabled, concurrency]);

  return { loaded, total, progress: total > 0 ? loaded / total : 0 };
}

import { useEffect, useState } from "react";

/**
 * Hook para detectar proximidad a zonas específicas de la galería
 * @param {Object} cameraRef - Referencia a la cámara
 * @param {Object} galleryDimensions - Dimensiones de la galería
 * @param {number} threshold - Distancia mínima para activar la detección
 * @returns {Object} Estado de proximidad a diferentes zonas
 */
export function useProximityDetection(
  cameraRef,
  galleryDimensions,
  threshold = 2
) {
  const [proximityState, setProximityState] = useState({
    nearEndWall: false,
    nearStartWall: false,
    distanceToEnd: Infinity,
    distanceToStart: Infinity,
  });

  useEffect(() => {
    if (!cameraRef || !galleryDimensions) return;

    const checkProximity = () => {
      const camera = cameraRef;
      if (!camera || !camera.position) return;

      const { firstX, lastX, wallMarginInitial, wallMarginFinal } =
        galleryDimensions;

      // Posiciones de las paredes
      const startWallX = firstX - wallMarginInitial;
      const endWallX = lastX + wallMarginFinal;

      // Distancias actuales
      const distanceToStart = Math.abs(camera.position.x - startWallX);
      const distanceToEnd = Math.abs(camera.position.x - endWallX);

      // Estados de proximidad
      const nearStartWall = distanceToStart < threshold;
      const nearEndWall = distanceToEnd < threshold;

      setProximityState({
        nearEndWall,
        nearStartWall,
        distanceToEnd,
        distanceToStart,
      });
    };

    // Verificar proximidad cada frame
    const intervalId = setInterval(checkProximity, 100); // Cada 100ms

    return () => clearInterval(intervalId);
  }, [cameraRef, galleryDimensions, threshold]);

  return proximityState;
}

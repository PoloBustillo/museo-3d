/**
 * Componente de puntos de anclaje para obras de arte
 * Distribuye obras en las paredes según configuración de anchorPoints
 */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { anchorPoints, getAnchorById } from '../config/anchorPoints';
import Artwork3D from './Artwork3D';

const AnchorPoints = React.memo(function AnchorPoints({ 
  artworks = [], 
  debug = false 
}) {
  // Material para visualización de debug
  const debugMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ff6b6b',
    transparent: true,
    opacity: 0.7
  }), []);

  // Renderizar obras de arte en sus posiciones asignadas
  const artworkMeshes = useMemo(() => {
    return artworks.map((artwork, index) => {
      const anchor = getAnchorById(artwork.anchorId);
      if (!anchor) {
        console.warn(`Anchor point ${artwork.anchorId} not found for artwork:`, artwork);
        return null;
      }

      const [x, y, z] = anchor.position;
      const [nx, ny, nz] = anchor.normal;
      
      // Calcular rotación basada en la normal de la pared
      let rotation = [0, 0, 0];
      if (nx > 0) rotation = [0, Math.PI/2, 0]; // pared izquierda
      else if (nx < 0) rotation = [0, -Math.PI/2, 0]; // pared derecha
      else if (nz > 0) rotation = [0, 0, 0]; // pared trasera
      else if (nz < 0) rotation = [0, Math.PI, 0]; // pared frontal

      return (
        <group key={`artwork-${index}`} position={[x, y, z]} rotation={rotation}>
          <Artwork3D
            artwork={artwork}
            width={artwork.width || 4}
            height={artwork.height || 3}
            showPlaque={!debug} // Ocultar placas en modo debug para clarity
            interactive={true}
          />
        </group>
      );
    }).filter(Boolean);
  }, [artworks, debug]);

  // Puntos de debug para visualizar anclajes disponibles
  const debugPoints = useMemo(() => {
    if (!debug) return [];
    
    const usedAnchorIds = artworks.map(artwork => artwork.anchorId);
    
    return anchorPoints.map((point, index) => {
      const isUsed = usedAnchorIds.includes(point.id);
      const material = new THREE.MeshBasicMaterial({
        color: isUsed ? '#4ecdc4' : '#ff6b6b',
        transparent: true,
        opacity: 0.8
      });

      return (
        <mesh 
          key={`debug-${point.id}`} 
          position={point.position}
          material={material}
        >
          <sphereGeometry args={[0.15, 8, 6]} />
        </mesh>
      );
    });
  }, [debug, artworks]);

  return (
    <group name="anchor-points-system">
      {/* Obras de arte */}
      {artworkMeshes}
      
      {/* Puntos de debug */}
      {debug && debugPoints}
      
      {/* Información de debug en consola */}
      {debug && console.log('AnchorPoints Debug:', {
        totalAnchors: anchorPoints.length,
        usedAnchors: artworks.length,
        availableAnchors: anchorPoints.length - artworks.length
      })}
    </group>
  );
});

export default AnchorPoints;

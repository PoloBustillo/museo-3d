/**
 * Componente de puntos de anclaje para obras de arte
 * Distribuye obras en las paredes según configuración de anchorPoints
 */
import React, { useMemo, useEffect } from 'react';
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

  // Debug especializado: mostrar información de distribución en consola
  useEffect(() => {
    if (debug && artworks.length > 0) {
      console.log('🏛️ DISTRIBUCIÓN DE OBRAS DESDE LA ENTRADA:');
      console.log('==========================================');
      
      // Agrupar obras por pared
      const obrasPorPared = {
        'Pared Derecha (desde entrada)': [],
        'Pared Izquierda (desde entrada)': [],
        'Pared Trasera': [],
        'Pared Frontal': [],
        'Paredes Internas': []
      };

      artworks.forEach((artwork, index) => {
        const anchor = getAnchorById(artwork.anchorId);
        if (!anchor) return;

        let paredTipo = 'Desconocida';
        if (anchor.wall === 'right') paredTipo = 'Pared Derecha (desde entrada)';
        else if (anchor.wall === 'left') paredTipo = 'Pared Izquierda (desde entrada)';
        else if (anchor.wall === 'back') paredTipo = 'Pared Trasera';
        else if (anchor.wall?.includes('front')) paredTipo = 'Pared Frontal';
        else if (anchor.wall?.includes('internal')) paredTipo = 'Paredes Internas';

        obrasPorPared[paredTipo].push({
          orden: index + 1,
          titulo: artwork.titulo || 'Sin título',
          autor: artwork.autor || 'Autor desconocido',
          anchorId: artwork.anchorId,
          posicion: anchor.position,
          paredEspecifica: anchor.wall
        });
      });

      // Mostrar distribución ordenada
      Object.entries(obrasPorPared).forEach(([pared, obras]) => {
        if (obras.length > 0) {
          console.log(`\n📍 ${pared}:`);
          obras.forEach(obra => {
            console.log(`  ${obra.orden}. "${obra.titulo}" - ${obra.autor}`);
            console.log(`     Anchor: ${obra.anchorId} | Pos: [${obra.posicion.map(p => p.toFixed(1)).join(', ')}]`);
          });
        }
      });

      // Verificar posición de placas
      artworks.forEach(artwork => {
        const anchor = getAnchorById(artwork.anchorId);
        if (!anchor) return;

        const [x, y, z] = anchor.position;
        const [nx, ny, nz] = anchor.normal;
        
        // Calcular posición de la placa (debajo de la obra)
        const plaqueY = y - (artwork.height || 3) / 2 - 0.8; // ~0.8 unidades debajo
        const plaqueX = x + nx * 0.1; // Ligeramente hacia el interior
        const plaqueZ = z + nz * 0.1;
        
        const plaqueWarnings = [];
        
        // Verificar si la placa está demasiado cerca del suelo
        if (plaqueY < 0.5) plaqueWarnings.push('Placa muy cerca del suelo');
        
        // Verificar si la placa está dentro de los límites del museo
        if (Math.abs(plaqueX) > 19.5) plaqueWarnings.push('Placa fuera de límites X');
        if (plaqueZ < -50 || plaqueZ > 50) plaqueWarnings.push('Placa fuera de límites Z');
        
        // Verificar orientación de la placa según la pared
        let plaqueOrientation = 'Desconocida';
        if (nx > 0) plaqueOrientation = 'Hacia pared derecha';
        else if (nx < 0) plaqueOrientation = 'Hacia pared izquierda';
        else if (nz > 0) plaqueOrientation = 'Hacia pared trasera';
        else if (nz < 0) plaqueOrientation = 'Hacia pared frontal';

        if (plaqueWarnings.length > 0) {
          console.log(`🏷️  Placa "${artwork.titulo}": ${plaqueWarnings.join(', ')}`);
        }
        
        console.log(`📋 "${artwork.titulo}" - Placa en [${plaqueX.toFixed(1)}, ${plaqueY.toFixed(1)}, ${plaqueZ.toFixed(1)}] ${plaqueOrientation}`);
      });

      // Generar recorrido virtual desde la entrada
      console.log('\n🚶‍♂️ RECORRIDO VIRTUAL DESDE LA ENTRADA:');
      console.log('======================================');
      
      // Simular entrada desde z = 50 (puerta principal)
      const entradaZ = 47; // Posición de la puerta
      const visitante = { x: 0, z: entradaZ, direccion: 'norte' };
      
      console.log(`1. 🚪 Visitante entra por la puerta principal en [0, 0, ${entradaZ}]`);
      console.log('2. 👀 Desde la entrada, el visitante puede ver:');
      
      // Obras visibles desde la entrada
      const obrasVisiblesEntrada = artworks.filter(artwork => {
        const anchor = getAnchorById(artwork.anchorId);
        if (!anchor) return false;
        
        const [x, y, z] = anchor.position;
        // Obras en paredes laterales de la sala frontal
        return (z > 30 && z < 48) && (Math.abs(x) > 15); // Paredes laterales frontales
      });

      obrasVisiblesEntrada.forEach((artwork, index) => {
        const anchor = getAnchorById(artwork.anchorId);
        const direccion = anchor.position[0] > 0 ? 'derecha' : 'izquierda';
        console.log(`   ${index + 1}. "${artwork.titulo}" - ${artwork.autor} (pared ${direccion})`);
      });

      // Recorrido sugerido
      console.log('\n📍 RECORRIDO SUGERIDO:');
      console.log('3. ➡️  Girar a la derecha - Pared derecha de sala frontal');
      console.log('4. ⬅️  Cruzar a la pared izquierda de sala frontal');
      console.log('5. ⬆️  Avanzar hacia el pasillo central');
      console.log('6. ➡️  Pared derecha de sala trasera');
      console.log('7. ⬅️  Pared izquierda de sala trasera');
      console.log('8. ⬆️  Pared del fondo (final del recorrido)');
    }
  }, [debug, artworks]);

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
      
      // CORRECCIÓN: Colocar la obra ligeramente separada de la pared
      const artworkPosition = [
        x + nx * 0.1, // Separar de la pared según la normal
        y,             // Mantener altura del anchor
        z + nz * 0.1   // Separar según la normal en Z
      ];
      
      // Verificar si la obra está en una posición problemática
      const isProblematic = Math.abs(artworkPosition[0]) > 19.5 || 
                            artworkPosition[2] < -50 || artworkPosition[2] > 50 || 
                            (artworkPosition[2] > 45 && Math.abs(artworkPosition[0]) < 5) ||  // zona de entrada
                            Math.abs(artworkPosition[2] - 15) < 1 || Math.abs(artworkPosition[2] + 15) < 1; // cerca de divisores
      
      // Calcular rotación basada en la normal de la pared
      let rotation = [0, 0, 0];
      if (nx > 0) rotation = [0, -Math.PI/2, 0]; // pared izquierda - girar hacia la derecha
      else if (nx < 0) rotation = [0, Math.PI/2, 0]; // pared derecha - girar hacia la izquierda  
      else if (nz > 0) rotation = [0, Math.PI, 0]; // pared trasera - girar 180°
      else if (nz < 0) rotation = [0, 0, 0]; // pared frontal - sin rotación

      console.log(`🖼️ Obra "${artwork.titulo}": Pos=[${artworkPosition.map(p => p.toFixed(1)).join(', ')}], Rot=[${rotation.map(r => (r * 180 / Math.PI).toFixed(0)).join(', ')}]°`);

      // Si está en modo debug y es problemática, añadir indicador visual
      const groupElements = [
        <Artwork3D
          key="artwork"
          artwork={artwork}
          width={artwork.width || 6} // Tamaño aumentado
          height={artwork.height || 4.5} // Tamaño aumentado
          showPlaque={true} // Siempre mostrar placas para verificar posición
          interactive={true}
        />
      ];

      // Añadir indicador de problema en modo debug
      if (debug && isProblematic) {
        groupElements.push(
          <mesh key="warning-indicator" position={[0, artwork.height/2 + 1, 0.5]}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
          </mesh>
        );
      }

      return (
        <group key={`artwork-${index}`} position={artworkPosition} rotation={rotation}>
          {groupElements}
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

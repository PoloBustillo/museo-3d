/**
 * Lámparas específicas para galería de arte
 * Sistema de iluminación profesional para museos
 */
import React from 'react';
import * as THREE from 'three';

const GallerySpotlight = React.memo(function GallerySpotlight({ 
  position, 
  targetPosition = [0, 0, 0],
  intensity = 1.2, 
  color = "#ffffff",
  focused = false 
}) {
  return (
    <group position={position}>
      {/* Carcasa del foco */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.25, 12]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Lente frontal */}
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
        <meshStandardMaterial 
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={focused ? 0.2 : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Soporte articulado */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Base de montaje */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.04, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Luz principal - foco direccional */}
      <spotLight
        position={[0, -0.2, 0]}
        target-position={targetPosition}
        intensity={intensity}
        color={color}
        distance={12}
        angle={focused ? Math.PI / 8 : Math.PI / 6}
        penumbra={focused ? 0.1 : 0.3}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
      />
    </group>
  );
});

const GalleryTrackLight = React.memo(function GalleryTrackLight({ 
  position, 
  intensity = 0.8,
  color = "#ffffff" 
}) {
  return (
    <group position={position}>
      {/* Riel de montaje */}
      <mesh>
        <boxGeometry args={[0.4, 0.03, 0.06]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Múltiples focos en el riel */}
      <GallerySpotlight 
        position={[-0.15, -0.05, 0]}
        targetPosition={[-3, -6, 0]}
        intensity={intensity}
        color={color}
      />
      <GallerySpotlight 
        position={[0, -0.05, 0]}
        targetPosition={[0, -6, 0]}
        intensity={intensity}
        color={color}
      />
      <GallerySpotlight 
        position={[0.15, -0.05, 0]}
        targetPosition={[3, -6, 0]}
        intensity={intensity}
        color={color}
      />
    </group>
  );
});

const GalleryLightingSystem = React.memo(function GalleryLightingSystem({ 
  roomConfig, 
  artworkPositions = [],
  showInstructions = false 
}) {
  const { width, height, length } = roomConfig;
  
  // Posiciones de rieles de luz - distribución profesional
  const trackPositions = [
    // Riel central longitudinal
    [0, height - 0.3, 0],
    // Rieles laterales para obras
    [-width * 0.3, height - 0.3, 0],
    [width * 0.3, height - 0.3, 0],
    // Rieles frontales y traseros
    [0, height - 0.3, length * 0.3],
    [0, height - 0.3, -length * 0.3],
  ];
  
  // Focos dedicados para obras de arte
  const artworkLights = artworkPositions.map((pos, index) => (
    <GallerySpotlight
      key={`artwork-light-${index}`}
      position={[pos.position[0], height - 0.5, pos.position[2]]}
      targetPosition={pos.position}
      intensity={1.4}
      focused={true}
    />
  ));
  
  return (
    <group>
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.3} color="#f8f8ff" />
      
      {/* Rieles de luz principales */}
      {trackPositions.map((position, index) => (
        <GalleryTrackLight
          key={`track-light-${index}`}
          position={position}
          intensity={0.7}
        />
      ))}
      
      {/* Focos dedicados para obras */}
      {artworkLights}
      
      {/* Luz direccional principal (más suave) */}
      <directionalLight
        position={[0, height + 3, 0]}
        intensity={0.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-width}
        shadow-camera-right={width}
        shadow-camera-top={length}
        shadow-camera-bottom={-length}
      />
      
      {/* Luces de acento en esquinas (más tenues) */}
      <pointLight position={[-width/2 + 1, height - 1, -length/2 + 1]} intensity={0.2} color="#fff8dc" />
      <pointLight position={[width/2 - 1, height - 1, -length/2 + 1]} intensity={0.2} color="#fff8dc" />
      <pointLight position={[-width/2 + 1, height - 1, length/2 - 1]} intensity={0.2} color="#fff8dc" />
      <pointLight position={[width/2 - 1, height - 1, length/2 - 1]} intensity={0.2} color="#fff8dc" />
    </group>
  );
});

export { GallerySpotlight, GalleryTrackLight, GalleryLightingSystem };

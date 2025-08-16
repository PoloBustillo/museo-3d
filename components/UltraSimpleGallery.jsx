import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

// Artwork SIN TEXTURAS - solo colores planos
function SimpleArtwork({ artwork, position, onClick }) {
  return (
    <group position={position} onClick={onClick}>
      {/* Marco simple - solo color */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 2.7, 0.1]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>

      {/* "Artwork" - solo un rectángulo de color */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshBasicMaterial color={artwork.color || "#ffffff"} />
      </mesh>

      {/* Texto simple del título */}
      <mesh position={[0, -1.5, 0.01]}>
        <planeGeometry args={[2.8, 0.3]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Sala ULTRA SIMPLE - solo geometrías básicas
function UltraSimpleRoom({ children }) {
  return (
    <group>
      {/* Pared izquierda */}
      <mesh position={[-5, 2.5, 0]}>
        <boxGeometry args={[0.1, 5, 10]} />
        <meshBasicMaterial color="#f0f0f0" />
      </mesh>

      {/* Pared derecha */}
      <mesh position={[5, 2.5, 0]}>
        <boxGeometry args={[0.1, 5, 10]} />
        <meshBasicMaterial color="#f0f0f0" />
      </mesh>

      {/* Pared trasera */}
      <mesh position={[0, 2.5, -5]}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshBasicMaterial color="#f0f0f0" />
      </mesh>

      {/* Piso */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#e0e0e0" />
      </mesh>

      {/* Techo */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {children}
    </group>
  );
}

// Controles básicos sin complicaciones
function BasicControls() {
  return null; // Dejamos que PointerLockControls maneje todo
}

// Componente principal ULTRA MEGA SIMPLE
export default function UltraSimpleGallery({ artworks = [], onExitGallery }) {
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const controlsRef = useRef();

  // Posiciones fijas para artworks (sin cálculos complejos)
  const positions = [
    [-3, 1.5, -4.9], // Pared trasera izquierda
    [0, 1.5, -4.9], // Pared trasera centro
    [3, 1.5, -4.9], // Pared trasera derecha
    [-4.9, 1.5, -2], // Pared izquierda
    [-4.9, 1.5, 2], // Pared izquierda
    [4.9, 1.5, -2], // Pared derecha
    [4.9, 1.5, 2], // Pared derecha
  ];

  return (
    <div className="w-full h-screen relative bg-black">
      {/* UI minimalista */}
      <div className="absolute top-4 left-4 z-10">
        <Button onClick={onExitGallery} variant="outline" size="sm">
          <ChevronLeft className="w-4 h-4" />
          Salir
        </Button>
      </div>

      {/* Info del artwork seleccionado */}
      {selectedArtwork && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded max-w-xs">
          <h3 className="font-bold">{selectedArtwork.title}</h3>
          <p className="text-sm text-gray-600">{selectedArtwork.artist}</p>
          <Button
            onClick={() => setSelectedArtwork(null)}
            size="sm"
            className="mt-2 w-full"
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Canvas 3D ULTRA SIMPLE */}
      <Canvas
        camera={{ position: [0, 1.7, 3], fov: 75 }}
        gl={{ antialias: false }} // Sin antialiasing para más velocidad
      >
        {/* Luz básica sin sombras */}
        <ambientLight intensity={0.8} />

        <UltraSimpleRoom>
          {/* Artworks sin texturas */}
          {artworks.slice(0, 7).map((artwork, index) => (
            <SimpleArtwork
              key={artwork.id || index}
              artwork={artwork}
              position={positions[index]}
              onClick={() => setSelectedArtwork(artwork)}
            />
          ))}
        </UltraSimpleRoom>

        <BasicControls />
        <PointerLockControls ref={controlsRef} />
      </Canvas>
    </div>
  );
}

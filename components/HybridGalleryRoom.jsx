"use client";

import React, { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useTexture, Html, useGLTF } from "@react-three/drei";
import { IntelligentPBRMaterial as FastPBRMaterial } from "./gallery/core/SmartMigrationMaterial.jsx";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import BackGroundSound from "./BackGroundSound.jsx";
import { useSound } from "../providers/SoundProvider";
import { getRoomConfig, calculateSlots } from "./gallery/hybridConfig.js";
import {
  getPersonalCollection,
  addToPersonalCollection,
  removeFromPersonalCollection,
  isInPersonalCollection,
} from "../lib/personalCollection.js";
import { Button } from './ui/button';
import { ChevronLeft, Settings } from 'lucide-react';

// Componente para renderizar una obra de arte
function Artwork({ artwork, slot, onClick, showPlaque, selected }) {
  const texture = useTexture(artwork.src);
  const [imageDimensions, setImageDimensions] = useState({ width: 3, height: 2.5 }); // Tamaño base más grande
  
  console.log('Artwork renderizando:', artwork.title, 'con src:', artwork.src);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.width > 0 && img.height > 0) {
        const aspectRatio = img.width / img.height;
        const maxWidth = 4; // Tamaño máximo más grande
        const maxHeight = 3.5; // Tamaño máximo más grande
        const minWidth = 2.5; // Tamaño mínimo
        const minHeight = 2; // Tamaño mínimo
        
        let width = maxWidth;
        let height = maxWidth / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
        
        // Asegurar tamaño mínimo
        if (width < minWidth) {
          width = minWidth;
          height = minWidth / aspectRatio;
        }
        if (height < minHeight) {
          height = minHeight;
          width = minHeight * aspectRatio;
        }
        
        if (isFinite(width) && isFinite(height)) {
          setImageDimensions({ width, height });
        }
      }
    };
    img.onerror = () => {
      console.warn(`Failed to load image, using default dimensions: ${artwork.src}`);
      setImageDimensions({ width: 3, height: 2.5 });
    };
    img.crossOrigin = "anonymous";
    img.src = artwork.src;
  }, [artwork.src]);
  
  const w = imageDimensions.width;
  const h = imageDimensions.height;
  
  console.log('Artwork renderizando:', artwork.title, 'con src:', artwork.src, 'tamaño:', [w, h]);
  
  return (
    <group position={slot.position} rotation={slot.rotation}>
      {/* Marco de la obra */}
      <mesh 
        onClick={() => onClick(artwork)}
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[w, h, 0.1]} />
        <FastPBRMaterial 
          color={selected ? "#ffd700" : "#8b4513"} 
          metalness={0.3} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Imagen de la obra */}
      <mesh position={[0, 0, 0.06]} castShadow receiveShadow>
        <planeGeometry args={[w - 0.1, h - 0.1]} />
        <FastPBRMaterial map={texture} />
      </mesh>
      
      {/* Placa informativa */}
      {showPlaque && (
        <Html position={[0, -h/2 - 0.3, 0]} center>
          <div style={{
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "0.8em",
            whiteSpace: "nowrap",
            pointerEvents: "none"
          }}>
            <div style={{ fontSize: "1.2em", fontWeight: "bold", marginBottom: 4 }}>{artwork.title}</div>
            <div style={{ fontWeight: "bold", color: "#ffe082", marginBottom: 2 }}>{artwork.artist} ({artwork.year})</div>
            <div style={{ fontSize: "0.98em", color: "#bdbdbd", marginBottom: 2 }}><b>Técnica:</b> {artwork.technique}</div>
            <div style={{ fontSize: "0.98em", color: "#bdbdbd", marginBottom: 2 }}><b>Dimensiones:</b> {artwork.dimensions}</div>
            <div style={{ fontSize: "0.97em", color: "#e0e0e0", marginTop: 6 }}>{artwork.description}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Componente para la sala base
const BaseRoom = ({ roomConfig, materials, lighting }) => {
  return (
    <group>
      {/* Pared izquierda */}
      <mesh 
        position={[-roomConfig.width / 2, roomConfig.height / 2, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[roomConfig.wallThickness, roomConfig.height, roomConfig.length]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="wall"
          color="#e8e8e8" 
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      
      {/* Pared derecha */}
      <mesh 
        position={[roomConfig.width / 2, roomConfig.height / 2, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[roomConfig.wallThickness, roomConfig.height, roomConfig.length]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="wall"
          color="#e8e8e8" 
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      
      {/* Pared trasera */}
      <mesh 
        position={[0, roomConfig.height / 2, -roomConfig.length / 2]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[roomConfig.width, roomConfig.height, roomConfig.wallThickness]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="wall"
          color="#f0f0f0" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Pared frontal (con entrada) */}
      <mesh 
        position={[0, roomConfig.height / 2, roomConfig.length / 2]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[roomConfig.width, roomConfig.height, roomConfig.wallThickness]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="wall"
          color="#f0f0f0" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Piso */}
      <mesh 
        position={[0, -roomConfig.floorThickness / 2, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[roomConfig.width + 0.6, roomConfig.floorThickness, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="floor"
          color="#d4d4d4" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Molduras del piso */}
      {/* Moldura frontal */}
      <mesh position={[0, -roomConfig.floorThickness - 0.05, roomConfig.length/2 + 0.3]} receiveShadow>
        <boxGeometry args={[roomConfig.width + 0.6, 0.1, 0.1]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Moldura trasera */}
      <mesh position={[0, -roomConfig.floorThickness - 0.05, -roomConfig.length/2 - 0.3]} receiveShadow>
        <boxGeometry args={[roomConfig.width + 0.6, 0.1, 0.1]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Moldura izquierda */}
      <mesh position={[-roomConfig.width/2 - 0.3, -roomConfig.floorThickness - 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.1, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Moldura derecha */}
      <mesh position={[roomConfig.width/2 + 0.3, -roomConfig.floorThickness - 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.1, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Molduras decorativas a lo largo del piso */}
      {/* Moldura central longitudinal */}
      <mesh position={[0, -roomConfig.floorThickness - 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.05, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Molduras laterales longitudinales */}
      <mesh position={[-roomConfig.width/4, -roomConfig.floorThickness - 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.05, 0.05, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      <mesh position={[roomConfig.width/4, -roomConfig.floorThickness - 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.05, 0.05, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Techo con molduras */}
      <mesh 
        position={[0, roomConfig.height + roomConfig.ceilingThickness / 2, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[roomConfig.width + 0.6, roomConfig.ceilingThickness, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="ceiling"
          color="#f8f8f8" 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      {/* Molduras del techo */}
      {/* Moldura frontal */}
      <mesh position={[0, roomConfig.height + roomConfig.ceilingThickness + 0.1, roomConfig.length/2 + 0.3]} receiveShadow>
        <boxGeometry args={[roomConfig.width + 0.6, 0.2, 0.1]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#e0e0e0" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Moldura trasera */}
      <mesh position={[0, roomConfig.height + roomConfig.ceilingThickness + 0.1, -roomConfig.length/2 - 0.3]} receiveShadow>
        <boxGeometry args={[roomConfig.width + 0.6, 0.2, 0.1]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#e0e0e0" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Moldura izquierda */}
      <mesh position={[-roomConfig.width/2 - 0.3, roomConfig.height + roomConfig.ceilingThickness + 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.2, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#e0e0e0" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Moldura derecha */}
      <mesh position={[roomConfig.width/2 + 0.3, roomConfig.height + roomConfig.ceilingThickness + 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.2, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#e0e0e0" 
          roughness={0.3} 
          metalness={0.2} 
        />
      </mesh>
      
      {/* Molduras decorativas a lo largo del techo */}
      {/* Moldura central longitudinal */}
      <mesh position={[0, roomConfig.height + roomConfig.ceilingThickness + 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.1, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Molduras laterales longitudinales */}
      <mesh position={[-roomConfig.width/4, roomConfig.height + roomConfig.ceilingThickness + 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.05, 0.1, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      
      <mesh position={[roomConfig.width/4, roomConfig.height + roomConfig.ceilingThickness + 0.15, 0]} receiveShadow>
        <boxGeometry args={[0.05, 0.1, roomConfig.length + 0.6]} />
        <FastPBRMaterial 
          salaId={salaId}
          materialType="decoration"
          color="#d4af37" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </mesh>
      

      
      {/* Iluminación ambiental */}
      <ambientLight intensity={0.4} />
      
      {/* Luz principal desde arriba */}
      <directionalLight
        position={[0, roomConfig.height + 2, 0]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Luces puntuales en las esquinas */}
      <pointLight position={[-roomConfig.width/2 + 1, roomConfig.height - 1, -roomConfig.length/2 + 1]} intensity={0.3} color="#ffffff" />
      <pointLight position={[roomConfig.width/2 - 1, roomConfig.height - 1, -roomConfig.length/2 + 1]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-roomConfig.width/2 + 1, roomConfig.height - 1, roomConfig.length/2 - 1]} intensity={0.3} color="#ffffff" />
      <pointLight position={[roomConfig.width/2 - 1, roomConfig.height - 1, roomConfig.length/2 - 1]} intensity={0.3} color="#ffffff" />
      
      {/* Lámparas en cada esquina */}
      {/* Esquina trasera izquierda */}
      <group position={[-roomConfig.width/2 + 2, 0, -roomConfig.length/2 + 2]}>
        {/* Base */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Poste */}
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Lámpara */}
        <mesh position={[0, 3, 0]} receiveShadow castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.05} 
          />
        </mesh>
        {/* Luz de la lámpara */}
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#FFD700" />
      </group>
      
      {/* Esquina trasera derecha */}
      <group position={[roomConfig.width/2 - 2, 0, -roomConfig.length/2 + 2]}>
        {/* Base */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Poste */}
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Lámpara */}
        <mesh position={[0, 3, 0]} receiveShadow castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.05} 
          />
        </mesh>
        {/* Luz de la lámpara */}
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#FFD700" />
      </group>
      
      {/* Esquina frontal izquierda */}
      <group position={[-roomConfig.width/2 + 2, 0, roomConfig.length/2 - 2]}>
        {/* Base */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Poste */}
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Lámpara */}
        <mesh position={[0, 3, 0]} receiveShadow castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.05} 
          />
        </mesh>
        {/* Luz de la lámpara */}
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#FFD700" />
      </group>
      
      {/* Esquina frontal derecha */}
      <group position={[roomConfig.width/2 - 2, 0, roomConfig.length/2 - 2]}>
        {/* Base */}
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Poste */}
        <mesh position={[0, 1.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#2F4F4F" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        {/* Lámpara */}
        <mesh position={[0, 3, 0]} receiveShadow castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <FastPBRMaterial 
            salaId={salaId}
            materialType="decoration"
            color="#FFD700" 
            metalness={0.9} 
            roughness={0.05} 
          />
        </mesh>
        {/* Luz de la lámpara */}
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#FFD700" />
      </group>
    </group>
  );
};

// Componente para los controles del jugador
function PlayerControls({ roomConfig, onPassInitialWall }) {
  const passedWallRef = useRef(false);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const { width, length } = roomConfig;
    const minX = -width / 2 + 0.7;
    const maxX = width / 2 - 0.7;
    const minZ = -length / 2 + 0.7;
    const maxZ = length / 2 - 0.7;

    direction.current.set(0, 0, 0);
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;
    
    direction.current.normalize().applyEuler(camera.rotation).y = 0;
    velocity.current.copy(direction.current).multiplyScalar(5 * delta);
    camera.position.add(velocity.current);
    
    // Limitar movimiento dentro de la sala
    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
    
    // Detectar cuando pasa la pared inicial
    if (!passedWallRef.current && onPassInitialWall && camera.position.z > minZ + 0.2) {
      onPassInitialWall();
      passedWallRef.current = true;
    }
  });
  
  return null;
}

// Componente principal de la sala
function Room({ artworks, slots, roomConfig, materials, lighting, passedInitialWall, setSelectedArtwork, selectedArtwork, showInstructions }) {
  const { width, length } = roomConfig;
  
  // Función simplificada para calcular posiciones de obras
  const calculateArtworkPositions = (artworks) => {
    if (artworks.length === 0) return [];
    
    const positions = [];
    
    console.log('Calculando posiciones para', artworks.length, 'obras');
    console.log('Dimensiones sala:', { width, length });
    
    // Calcular espaciado uniforme
    const usableLength = length - 8; // Margen para lámparas
    const totalSlots = Math.ceil(artworks.length / 2);
    
    // Mejorar el espaciado para que sea más uniforme
    let spacing;
    if (totalSlots <= 1) {
      spacing = 0;
    } else if (totalSlots <= 2) {
      spacing = usableLength / 2; // Espaciado máximo para 2 obras
    } else if (totalSlots <= 4) {
      spacing = usableLength / (totalSlots - 1);
    } else {
      // Para más obras, usar un espaciado mínimo para evitar que se peguen
      spacing = Math.max(usableLength / (totalSlots - 1), 4);
    }
    
    console.log(`Espaciado calculado: ${spacing}, slots totales: ${totalSlots}, longitud usable: ${usableLength}`);
    
    for (let i = 0; i < artworks.length; i++) {
      const wall = i % 2 === 0 ? 'left' : 'right';
      const wallIndex = Math.floor(i / 2);
      
      // Posición Z: distribuir uniformemente desde el centro
      const startZ = -usableLength / 2;
      const z = startZ + (wallIndex * spacing);
      
      // Posición X: dentro del room, cerca de las paredes pero no dentro
      const x = wall === 'left' ? -width/2 + 0.3 : width/2 - 0.3; // Mucho más pegadas a la pared
      
      // Altura - centrada en la pared
      const y = 3;
      
      console.log(`Obra ${i}: ${wall} wall, index ${wallIndex}, pos [${x}, ${y}, ${z}], spacing: ${spacing}`);
      
      positions.push({
        position: [x, y, z],
        rotation: wall === 'left' ? [0, Math.PI/2, 0] : [0, -Math.PI/2, 0],
        wall,
        index: wallIndex,
        // Agregar información para las luces
        artworkId: i,
        wallSide: wall
      });
    }
    
    return positions;
  };
  
  const artworkPositions = calculateArtworkPositions(artworks);
  
  const handleArtworkClick = (art) => setSelectedArtwork(art);

  return (
    <>
      <BaseRoom roomConfig={roomConfig} materials={materials} lighting={lighting} />
      
      {/* Renderizar obras con sus luces */}
      {artworkPositions.map((artworkPos, index) => {
        const artwork = artworks[index];
        if (!artwork) return null;
        
        console.log(`Renderizando obra: ${artwork.titulo} en posición:`, artworkPos.position, 'con rotación:', artworkPos.rotation);
        
        return (
          <group key={`artwork-${artwork.id}-${index}`}>
            {/* Luz arriba del cuadro - más intensa y focalizada */}
            <pointLight 
              position={[artworkPos.position[0], artworkPos.position[1] + 2.5, artworkPos.position[2]]} 
              intensity={0.8} 
              color="#ffffff"
              distance={4}
              decay={2}
            />
            
            {/* Luz abajo del cuadro - para eliminar sombras */}
            <pointLight 
              position={[artworkPos.position[0], artworkPos.position[1] - 1.5, artworkPos.position[2]]} 
              intensity={0.4} 
              color="#ffffff"
              distance={3}
              decay={1.5}
            />
            
            {/* Luz frontal para resaltar detalles */}
            <pointLight 
              position={[
                artworkPos.wallSide === 'left' ? artworkPos.position[0] + 1 : artworkPos.position[0] - 1, 
                artworkPos.position[1], 
                artworkPos.position[2]
              ]} 
              intensity={0.6} 
              color="#ffffff"
              distance={2.5}
              decay={1.8}
            />
            
            {/* Obra de arte */}
            <Artwork
              artwork={artwork}
              slot={artworkPos}
              onClick={handleArtworkClick}
              showPlaque={passedInitialWall && !selectedArtwork && !showInstructions}
              selected={selectedArtwork && selectedArtwork.id === artwork.id}
            />
          </group>
        );
      })}
    </>
  );
}

// Modal para zoom de obra
function ZoomModal({ artwork, onClose, onCollectionUpdate, userId }) {
  const modalRef = useRef(null);
  const [isInCollection, setIsInCollection] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsInCollection(isInPersonalCollection(artwork, onCollectionUpdate.collection));
  }, [artwork, onCollectionUpdate.collection]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCollectionAction = useCallback(async (e) => {
    e.stopPropagation();
    if (!userId) {
      setCollectionMessage("⚠️ Inicia sesión para guardar");
      setTimeout(() => setCollectionMessage(""), 3000);
      return;
    }

    setIsUpdating(true);
    try {
      if (isInCollection) {
        await removeFromPersonalCollection(artwork);
        setCollectionMessage("🗑️ Removido de tu colección");
      } else {
        await addToPersonalCollection(artwork);
        setCollectionMessage("✅ ¡Añadido a tu colección!");
      }
      if (onCollectionUpdate?.update) {
        onCollectionUpdate.update();
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      setCollectionMessage("❌ Error al actualizar");
    } finally {
      setIsUpdating(false);
      setTimeout(() => setCollectionMessage(""), 3000);
    }
  }, [artwork, isInCollection, onCollectionUpdate, userId]);

  if (!artwork) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1c1c1c] text-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
        >
          <div className="md:w-1/2 w-full p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-amber-300">{artwork.title}</h2>
              <h3 className="text-xl font-semibold mb-4">{artwork.artist} ({artwork.year})</h3>
              <p className="text-gray-300 mb-2"><b>Técnica:</b> {artwork.technique}</p>
              <p className="text-gray-300 mb-4"><b>Dimensiones:</b> {artwork.dimensions}</p>
              <p className="text-gray-200 leading-relaxed">{artwork.description}</p>
            </div>
            <div className="mt-6">
              {collectionMessage ? (
                <p className="text-center font-semibold text-lg h-[52px] flex items-center justify-center">{collectionMessage}</p>
              ) : (
                <button
                  onClick={handleCollectionAction}
                  disabled={isUpdating}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isUpdating
                      ? "bg-neutral-600 cursor-not-allowed"
                      : isInCollection
                      ? "bg-red-700 hover:bg-red-800 text-white"
                      : "bg-amber-400 hover:bg-amber-500 text-black"
                  }`}
                >
                  {isUpdating ? "Guardando..." : isInCollection ? "Eliminar de la colección" : "Añadir a mi colección"}
                </button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 w-full relative bg-black">
            <img src={artwork.src} alt={artwork.title} className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Componente principal
export default function HybridGalleryRoom({ 
  salaId = 1, 
  murales = [], 
  onRoomChange, 
  availableRooms = [] 
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [passedInitialWall, setPassedInitialWall] = useState(false);
  const { isMuted } = useSound();
  const [personalCollection, setPersonalCollection] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('standard');
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  // Obtener configuración de la sala
  const roomConfig = getRoomConfig(selectedRoomType);
  const { materials, lighting } = roomConfig;
  
  // Configuraciones disponibles para el selector
  const roomConfigs = {
    standard: { name: "Sala Estándar", description: "Distribución clásica", icon: "🏛️" },
    contemporary: { name: "Sala Contemporánea", description: "Espacio amplio", icon: "🖼️" },
    intimate: { name: "Sala Íntima", description: "Espacio acogedor", icon: "🎨" },
    digital: { name: "Sala Digital", description: "Arte moderno", icon: "💻" }
  };

  console.log('Room Config:', {
    roomType: roomConfig.roomType,
    roomConfig: {
      width: roomConfig.width,
      length: roomConfig.length,
      height: roomConfig.height
    },
    materials: materials,
    lighting: lighting
  });

  const fetchCollection = useCallback(async () => {
    if (userId) {
      const collection = await getPersonalCollection();
      setPersonalCollection(collection);
    }
  }, [userId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // Preparar obras de arte
  const validArtworks = murales
    .filter((art) => art && art.url_imagen)
    .map((art) => ({
      ...art,
      src: art.url_imagen,
      title: art.titulo || "Sin título",
      artist: art.autor || "Desconocido",
      year: art.anio || "N/A",
      description: art.descripcion || "Sin descripción",
      technique: art.tecnica || "No especificada",
      dimensions: "Dimensiones no especificadas",
    }));

  console.log('Murales recibidos:', murales);
  console.log('Obras válidas:', validArtworks);

  // Calcular slots para las obras
  const slots = calculateSlots(validArtworks.length, roomConfig);
  
  // Debug: verificar slots y obras
  console.log('HybridGalleryRoom Debug:', {
    artworkCount: validArtworks.length,
    roomConfig: roomConfig,
    slots: slots,
    artworks: validArtworks.slice(0, 3) // Primeras 3 obras
  });

  const handleSelectArtwork = (art) => setSelectedArtwork(art);
  const handleCloseModal = () => setSelectedArtwork(null);

  return (
    <div className="relative w-full h-screen">
      {/* Selector de salas */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={() => setShowRoomSelector(!showRoomSelector)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          {roomConfigs[selectedRoomType].name}
        </Button>
        
        {showRoomSelector && (
          <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-2 min-w-[200px]">
            <div className="text-sm font-medium mb-2 text-gray-700">Seleccionar Sala</div>
            {Object.entries(roomConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedRoomType(key);
                  setShowRoomSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedRoomType === key 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{config.icon}</span>
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Botón volver */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        camera={{ 
          position: [0, 4, 8], // Bajado de 8 a 4 para no estar pegado al techo
          fov: 50 // Campo de visión más natural
        }} 
        shadows
      >
        <Suspense fallback={null}>
          <Room 
            artworks={validArtworks}
            slots={slots}
            roomConfig={roomConfig}
            materials={materials}
            lighting={lighting}
            passedInitialWall={passedInitialWall}
            setSelectedArtwork={handleSelectArtwork}
            selectedArtwork={selectedArtwork}
            showInstructions={showInstructions}
          />
          <PlayerControls 
            roomConfig={roomConfig}
            onPassInitialWall={() => setPassedInitialWall(true)} 
          />
          {!selectedArtwork && <PointerLockControls />}
        </Suspense>
        {!isMuted && <BackGroundSound url="/assets/audio.mp3" />}
      </Canvas>
      
      <AnimatePresence>
        {selectedArtwork && (
          <ZoomModal
            artwork={selectedArtwork}
            onClose={handleCloseModal}
            userId={userId}
            onCollectionUpdate={{
              collection: personalCollection,
              update: fetchCollection
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 

"use client";

import React, { useEffect, useRef, useState, useCallback, Suspense, useMemo } from "react";
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
import { createCeilingTileTexture } from '../utils/proceduralTextures.js';
import { GalleryLightingSystem } from './lighting/GalleryLightingSystem.jsx';
import './artwork-styles.css';

// Componente optimizado para renderizar obras de arte
const Artwork = React.memo(function Artwork({ artwork, slot, onClick, showPlaque, selected }) {
  const texture = useTexture(artwork.src);
  const [imageDimensions, setImageDimensions] = useState({ width: 3, height: 2.5 });
  
  const calculateDimensions = useCallback((imgWidth, imgHeight) => {
    if (imgWidth <= 0 || imgHeight <= 0) return { width: 3, height: 2.5 };
    
    const aspectRatio = imgWidth / imgHeight;
    const constraints = { maxWidth: 4, maxHeight: 3.5, minWidth: 2.5, minHeight: 2 };
    
    let { width, height } = constraints;
    height = width / aspectRatio;
    
    if (height > constraints.maxHeight) {
      height = constraints.maxHeight;
      width = height * aspectRatio;
    }
    
    width = Math.max(constraints.minWidth, width);
    height = Math.max(constraints.minHeight, height);
    
    return isFinite(width) && isFinite(height) ? { width, height } : { width: 3, height: 2.5 };
  }, []);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageDimensions(calculateDimensions(img.width, img.height));
    img.onerror = () => setImageDimensions({ width: 3, height: 2.5 });
    img.crossOrigin = "anonymous";
    img.src = artwork.src;
  }, [artwork.src, calculateDimensions]);
  
  const { width: w, height: h } = imageDimensions;
  
  return (
    <group position={slot.position} rotation={slot.rotation}>
      {/* Marco de la obra */}
      <mesh onClick={() => onClick(artwork)} castShadow receiveShadow>
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
      
      {/* Placa informativa optimizada */}
      {showPlaque && (
        <Html position={[0, -h/2 - 0.3, 0]} center>
          <div className="artwork-plaque">
            <div className="artwork-title">{artwork.title}</div>
            <div className="artwork-artist">{artwork.artist} ({artwork.year})</div>
            <div className="artwork-technique"><b>Técnica:</b> {artwork.technique}</div>
            <div className="artwork-dimensions"><b>Dimensiones:</b> {artwork.dimensions}</div>
            <div className="artwork-description">{artwork.description}</div>
          </div>
        </Html>
      )}
    </group>
  );
});

// Componente para la sala base
// Componente optimizado para texturas procedurales de techo
const ProceduralCeilingMaterial = React.memo(function ProceduralCeilingMaterial(){
  const material = useMemo(() => {
    const { material } = createCeilingTileTexture();
    return material;
  }, []);
  return <primitive object={material} attach="material" />;
});

const BaseRoom = ({ roomConfig, materials, lighting, proceduralCeiling=true }) => {
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
      
      {/* Techo (plano interior) con opción procedural */}
      <mesh
        position={[0, roomConfig.height + roomConfig.ceilingThickness - 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]} // flip normal downward into room
        receiveShadow
      >
        <planeGeometry args={[roomConfig.width + 0.6, roomConfig.length + 0.6]} />
        {proceduralCeiling ? (
          <ProceduralCeilingMaterial />
        ) : (
          <FastPBRMaterial
            salaId={salaId}
            materialType="ceiling"
            color="#f8f8f8"
            roughness={0.2}
            metalness={0.1}
          />
        )}
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
      

      
      {/* Sistema de iluminación profesional para galería */}
      <GalleryLightingSystem 
        roomConfig={roomConfig}
        artworkPositions={artworkPositions}
        showInstructions={showInstructions}
      />
      
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
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.current.w = true; break;
        case 'a': keys.current.a = true; break;
        case 's': keys.current.s = true; break;
        case 'd': keys.current.d = true; break;
        default: break;
      }
    };
    const onKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.current.w = false; break;
        case 'a': keys.current.a = false; break;
        case 's': keys.current.s = false; break;
        case 'd': keys.current.d = false; break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
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
  
// Función optimizada para calcular posiciones de obras
const calculateArtworkPositions = useMemo(() => (artworks, roomDimensions) => {
  if (!artworks?.length) return [];
  
  const { width, length } = roomDimensions;
  const usableLength = length - 8; // Margen para lámparas
  const totalSlots = Math.ceil(artworks.length / 2);
  
  // Cálculo de espaciado optimizado
  const spacing = totalSlots <= 1 ? 0 
    : totalSlots <= 2 ? usableLength / 2
    : totalSlots <= 4 ? usableLength / (totalSlots - 1)
    : Math.max(usableLength / (totalSlots - 1), 4);
  
  const startZ = -usableLength / 2;
  
  return artworks.map((artwork, i) => {
    const wall = i % 2 === 0 ? 'left' : 'right';
    const wallIndex = Math.floor(i / 2);
    const x = wall === 'left' ? -width/2 + 0.3 : width/2 - 0.3;
    const z = startZ + (wallIndex * spacing);
    
    return {
      position: [x, 3, z],
      rotation: wall === 'left' ? [0, Math.PI/2, 0] : [0, -Math.PI/2, 0],
      wall,
      index: wallIndex,
      artworkId: i,
      wallSide: wall
    };
  });
}, []);
  const artworkPositions = useMemo(() => 
    calculateArtworkPositions(artworks, { width, length }), 
    [artworks, width, length, calculateArtworkPositions]
  );
  
  const handleArtworkClick = (art) => setSelectedArtwork(art);

  return (
    <>
  <BaseRoom roomConfig={roomConfig} materials={materials} lighting={lighting} proceduralCeiling />
      
      {/* Renderizar obras sin luces redundantes */}
      {artworkPositions.map((artworkPos, index) => {
        const artwork = artworks[index];
        if (!artwork) return null;
        
        return (
          <Artwork
            key={`artwork-${artwork.id}-${index}`}
            artwork={artwork}
            slot={artworkPos}
            onClick={handleArtworkClick}
            showPlaque={showInstructions}
            selected={selectedArtwork?.id === artwork.id}
          />
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

  // Configuración optimizada de la sala
  const roomConfigMemo = useMemo(() => roomConfig || {
    roomType: 'default',
    width: 12,
    length: 16,
    height: 6
  }, [roomConfig]);

  const fetchCollection = useCallback(async () => {
    if (userId) {
      const collection = await getPersonalCollection();
      setPersonalCollection(collection);
    }
  }, [userId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // Procesamiento optimizado de obras de arte
  const validArtworks = useMemo(() => {
    if (!murales?.length) return [];
    return murales
      .filter(art => art?.url_imagen && art?.titulo)
      .map(art => ({
        ...art,
        src: art.url_imagen,
        title: art.titulo || "Sin título",
        artist: art.autor || "Desconocido", 
        year: art.anio || "N/A",
        description: art.descripcion || "Sin descripción",
        technique: art.tecnica || "No especificada",
        dimensions: "Dimensiones no especificadas"
      }));
  }, [murales]);

  // Cálculo de slots optimizado
  const slots = useMemo(() => 
    calculateSlots(validArtworks.length, roomConfigMemo), 
    [validArtworks.length, roomConfigMemo]
  );

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

'use client'

// --- Limpieza de imports y organización ---
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Html } from '@react-three/drei';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import BackGroundSound from './BackGroundSound.jsx';
import { motion, AnimatePresence } from "framer-motion";

// --- Configuración y utilidades ---
const artworkImages = [
  {
    src: '/assets/artworks/cuadro1.jpg',
    title: 'Abstract Composition I',
    artist: 'Maria Rodriguez',
    year: '2023',
    description: 'Composición abstracta con formas geométricas y colores vibrantes.',
    technique: 'Óleo sobre lienzo',
    dimensions: '120 x 90 cm'
  },
  {
    src: '/assets/artworks/cuadro2.jpg',
    title: 'Urban Landscape',
    artist: 'John Smith',
    year: '2022',
    description: 'Paisaje urbano contemporáneo con perspectiva dinámica.',
    technique: 'Acrílico sobre madera',
    dimensions: '100 x 80 cm'
  },
  {
    src: '/assets/artworks/cuadro3.jpg',
    title: 'Portrait in Blue',
    artist: 'Anna Chen',
    year: '2024',
    description: 'Retrato expresivo en tonos azules.',
    technique: 'Mixta sobre papel',
    dimensions: '70 x 100 cm'
  },
  {
    src: '/assets/artworks/cuadro4.jpg',
    title: 'Nature Study',
    artist: 'Carlos Rivera',
    year: '2023',
    description: 'Estudio detallado de elementos naturales.',
    technique: 'Acuarela sobre papel',
    dimensions: '60 x 80 cm'
  },
  {
    src: '/assets/artworks/cuadro5.jpg',
    title: 'Digital Dreams',
    artist: 'Sarah Johnson',
    year: '2024',
    description: 'Obra digital que explora el subconsciente.',
    technique: 'Arte digital',
    dimensions: '90 x 90 cm'
  },
  {
    src: '/assets/artworks/cuadro1.jpg',
    title: 'Abstract Composition I',
    artist: 'Maria Rodriguez',
    year: '2023',
    description: 'Composición abstracta con formas geométricas y colores vibrantes.',
    technique: 'Óleo sobre lienzo',
    dimensions: '120 x 90 cm'
  },
  {
    src: '/assets/artworks/cuadro2.jpg',
    title: 'Urban Landscape',
    artist: 'John Smith',
    year: '2022',
    description: 'Paisaje urbano contemporáneo con perspectiva dinámica.',
    technique: 'Acrílico sobre madera',
    dimensions: '100 x 80 cm'
  },
  {
    src: '/assets/artworks/cuadro3.jpg',
    title: 'Portrait in Blue',
    artist: 'Anna Chen',
    year: '2024',
    description: 'Retrato expresivo en tonos azules.',
    technique: 'Mixta sobre papel',
    dimensions: '70 x 100 cm'
  },
  {
    src: '/assets/artworks/cuadro4.jpg',
    title: 'Nature Study',
    artist: 'Carlos Rivera',
    year: '2023',
    description: 'Estudio detallado de elementos naturales.',
    technique: 'Acuarela sobre papel',
    dimensions: '60 x 80 cm'
  },
  {
    src: '/assets/artworks/cuadro5.jpg',
    title: 'Digital Dreams',
    artist: 'Sarah Johnson',
    year: '2024',
    description: 'Obra digital que explora el subconsciente.',
    technique: 'Arte digital',
    dimensions: '90 x 90 cm'
  },
  // Puedes agregar más obras siguiendo este formato
];

// Colecciones de obras por sala
const artworkSalas = {
  1: [ // Sala Principal
    {
      src: '/assets/artworks/cuadro1.jpg',
      title: 'Abstract Composition I',
      artist: 'Maria Rodriguez',
      year: '2023',
      description: 'Composición abstracta con formas geométricas y colores vibrantes.',
      technique: 'Óleo sobre lienzo',
      dimensions: '120 x 90 cm'
    },
    {
      src: '/assets/artworks/cuadro2.jpg',
      title: 'Urban Landscape',
      artist: 'John Smith',
      year: '2022',
      description: 'Paisaje urbano contemporáneo con perspectiva dinámica.',
      technique: 'Acrílico sobre madera',
      dimensions: '100 x 80 cm'
    }
  ],
  2: [ // Sala Contemporánea
    {
      src: '/assets/artworks/cuadro3.jpg',
      title: 'Portrait in Blue',
      artist: 'Anna Chen',
      year: '2024',
      description: 'Retrato expresivo en tonos azules.',
      technique: 'Mixta sobre papel',
      dimensions: '70 x 100 cm'
    },
    {
      src: '/assets/artworks/cuadro4.jpg',
      title: 'Nature Study',
      artist: 'Carlos Rivera',
      year: '2023',
      description: 'Estudio detallado de elementos naturales.',
      technique: 'Acuarela sobre papel',
      dimensions: '60 x 80 cm'
    }
  ],
  3: [ // Sala Digital
    {
      src: '/assets/artworks/cuadro5.jpg',
      title: 'Digital Dreams',
      artist: 'Sarah Johnson',
      year: '2024',
      description: 'Obra digital que explora el subconsciente.',
      technique: 'Arte digital',
      dimensions: '90 x 90 cm'
    }
  ],
  4: [ // Sala ARPA - aquí podrías agregar los murales de la base de datos
    {
      src: '/assets/artworks/cuadro1.jpg',
      title: 'Saturnino-Moon',
      artist: 'Miguel Fernando Lima Rodríguez, Pamela Sánchez Hernández',
      year: '2024',
      description: 'Mural colaborativo con temática lunar y saturnina.',
      technique: 'Acrílico sobre muro',
      dimensions: '2.46 x 3.8m'
    },
    {
      src: '/assets/artworks/cuadro2.jpg',
      title: 'Metamorfosis Marina',
      artist: 'Vanessa Flores "Flores en el Mar"',
      year: '2024',
      description: 'Transformación marina en el arte mural.',
      technique: 'Pintura vinílica sobre muro',
      dimensions: '5 m x 4.30 m'
    }
  ]
};

const HALL_LENGTH = 40;
const HALL_WIDTH = 14; // ancho del pasillo aumentado
const WALL_HEIGHT = 2;
const PICTURE_SPACING = 6;
const FLOOR_EXTRA = 10;
const CEILING_HEIGHT = 5.5;
const PICTURE_WIDTH = 3;
const WALL_MARGIN_INITIAL = 4;
const WALL_MARGIN_FINAL = 2;

// --- Texturas ---
const floorTextureUrl = '/assets/textures/floor.jpg';
const wallTextureUrl = '/assets/textures/wall.jpg';
const benchTextureUrl = '/assets/textures/bench.jpg';

function getHallwayArtworks(images, firstX, pictureSpacing) {
  const positions = [];
  const n = images.length;
  const pairs = Math.ceil(n / 2);
  
  // Calcular el espaciado para centrar las obras
  const totalContentWidth = (pairs - 1) * pictureSpacing;
  const startX = firstX;
  
  for (let i = 0; i < n; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const index = Math.floor(i / 2);
    const x = startX + index * pictureSpacing;
    const cuadroProfundidad = 0.15;
    const z = side === 1
      ? (HALL_WIDTH / 2 - cuadroProfundidad / 2)
      : -(HALL_WIDTH / 2 - cuadroProfundidad / 2);
    const rot = [0, side === 1 ? 0 : Math.PI, 0];
    positions.push({ ...images[i], position: [x, WALL_HEIGHT, z], rotation: rot });
  }
  return positions;
}

function Picture({ src, title, artist, year, description, technique, dimensions, position, rotation = [0, 0, 0], onClick, showPlaque, selected }) {
  const texture = useTexture(src);
  const [hovered, setHovered] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 3, height: 2 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Cargar dimensiones reales de la imagen
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const maxWidth = 4; // Ancho máximo para cuadros
      const maxHeight = 3; // Alto máximo para cuadros
      
      let width = maxWidth;
      let height = maxWidth / aspectRatio;
      
      // Si la altura excede el máximo, ajustar por altura
      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }
      
      setImageDimensions({ width, height });
      setImageLoaded(true);
    };
    img.crossOrigin = "anonymous";
    img.src = src;
  }, [src]);
  
  // Usar dimensiones calculadas o por defecto
  const w = imageDimensions.width;
  const h = imageDimensions.height;
  const thickness = 0.15;
  const depth = 0.07;
  return (
    <motion.group
      position={position}
      rotation={rotation}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: selected ? 1.15 : hovered ? 1.04 : 1, opacity: 1, z: selected ? 0.5 : 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Marco negro 3D alrededor de la imagen */}
      <mesh position={[0, h/2 + thickness/2, depth]}>
        <boxGeometry args={[w + thickness*2, thickness, thickness]} />
        <meshStandardMaterial color={hovered ? '#d4af37' : '#111'} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -h/2 - thickness/2, depth]}>
        <boxGeometry args={[w + thickness*2, thickness, thickness]} />
        <meshStandardMaterial color={hovered ? '#d4af37' : '#111'} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-w/2 - thickness/2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness*2, thickness]} />
        <meshStandardMaterial color={hovered ? '#d4af37' : '#111'} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[w/2 + thickness/2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness*2, thickness]} />
        <meshStandardMaterial color={hovered ? '#d4af37' : '#111'} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Imagen */}
      <mesh position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick({ src, title, artist, year, description, technique, dimensions }); }}
        scale={1}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* Placa informativa solo si showPlaque es true */}
      {showPlaque && (
        <Html position={[0, -h/2 - 0.25, depth]} center style={{ pointerEvents: 'none', textAlign: 'left', background: 'rgba(30,30,30,0.97)', color: '#fff', borderRadius: 12, padding: '18px 28px', fontSize: 15, minWidth: 340, maxWidth: 480, boxShadow: hovered ? '0 0 16px #d4af37' : '0 2px 16px #000a', border: hovered ? '2px solid #d4af37' : 'none', transition: 'all 0.2s', lineHeight: 1.5 }}>
          <div style={{fontSize:'1.2em', fontWeight:'bold', marginBottom:4}}>{title}</div>
          <div style={{fontWeight:'bold', color:'#ffe082', marginBottom:2}}>{artist} ({year})</div>
          <div style={{fontSize:'0.98em', color:'#bdbdbd', marginBottom:2}}><b>Técnica:</b> {technique}</div>
          <div style={{fontSize:'0.98em', color:'#bdbdbd', marginBottom:2}}><b>Dimensiones:</b> {dimensions}</div>
          <div style={{fontSize:'0.97em', color:'#e0e0e0', marginTop:6}}>{description}</div>
        </Html>
      )}
    </motion.group>
  )
}

function Bench({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[2, 0.5, 0.5]} />
        <meshStandardMaterial color="saddlebrown" />
      </mesh>
      <mesh position={[-0.75, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.75, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  )
}

function PlayerControls({ moveTo, onArrive, mobileDir, onPassInitialWall, setCameraX, FIRST_X, LAST_X, WALL_MARGIN_INITIAL, WALL_MARGIN_FINAL }) {
  const passedWallRef = useRef(false);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // Restricción en el ancho (Z)
    const minZ = -HALL_WIDTH/2 + 0.7;
    const maxZ = HALL_WIDTH/2 - 0.7;
    direction.current.set(0, 0, 0);
    if (keys.current.w || mobileDir === 'forward') direction.current.z -= 1;
    if (keys.current.s || mobileDir === 'back') direction.current.z += 1;
    if (keys.current.a || mobileDir === 'left') direction.current.x -= 1;
    if (keys.current.d || mobileDir === 'right') direction.current.x += 1;
    direction.current.normalize();
    direction.current.applyEuler(camera.rotation);
    direction.current.y = 0;
    velocity.current.copy(direction.current).multiplyScalar(5 * delta);
    camera.position.add(velocity.current);
    
    // Límites de movimiento en Z (paredes laterales)
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
    
    // Límites de movimiento en X (paredes del inicio y final)
    const minX = FIRST_X - WALL_MARGIN_INITIAL + 1;
    const maxX = LAST_X + WALL_MARGIN_FINAL - 1;
    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    
    if (typeof setCameraX === 'function') setCameraX(camera.position.x);
    if (!passedWallRef.current && onPassInitialWall && camera.position.x > FIRST_X - WALL_MARGIN_INITIAL + 0.5) {
      onPassInitialWall();
      passedWallRef.current = true;
    }
  });
  return null
}

// --- Cálculo de largo dinámico para techo y paredes ---
const WALL_MARGIN = 2; // margen visual al inicio y final

function Room({ passedInitialWall, setSelectedArtwork, selectedArtwork, showList, showInstructions, artworks, DYNAMIC_LENGTH, DYNAMIC_CENTER_X, FIRST_X, LAST_X, WALL_MARGIN_INITIAL, WALL_MARGIN_FINAL }) {
  // Cargar texturas
  const floorTexture = useTexture(floorTextureUrl);
  // Textura para paredes con repetición y anisotropía
  const wallTexture = useTexture('/assets/textures/wall.jpg');
  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(Math.ceil(DYNAMIC_LENGTH / 4), 2);
    wallTexture.anisotropy = 16;
  }

  // Piso con textura optimizada
  if (floorTexture) {
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(Math.ceil(DYNAMIC_LENGTH / 4), Math.ceil(HALL_WIDTH / 2));
    floorTexture.anisotropy = 16;
  }

  // Elimina objetos decorativos añadidos y corrige materiales
  return (
    <>
      {/* Iluminación mejorada */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[10, 12, 10]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      {/* Luces puntuales cálidas a lo largo del pasillo */}
      {Array.from({ length: Math.max(2, Math.floor(DYNAMIC_LENGTH / 6)) }).map((_, i) => (
        <pointLight
          key={`plight-${i}`}
          position={[DYNAMIC_CENTER_X - DYNAMIC_LENGTH/2 + 3 + i*6, CEILING_HEIGHT-0.7, 0]}
          intensity={1.5}
          distance={8}
          color="#ffe6b2"
          castShadow
        />
      ))}
      {/* Piso con textura optimizada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[DYNAMIC_CENTER_X, 0, 0]}>
        <planeGeometry args={[DYNAMIC_LENGTH, HALL_WIDTH]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>
      {/* Techo */}
      <mesh position={[DYNAMIC_CENTER_X, CEILING_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[DYNAMIC_LENGTH, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>
      {/* Paredes laterales con textura optimizada */}
      <mesh position={[DYNAMIC_CENTER_X, 2.5, HALL_WIDTH/2]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 5, 0.1]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" />
      </mesh>
      <mesh position={[DYNAMIC_CENTER_X, 2.5, -HALL_WIDTH/2]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 5, 0.1]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" />
      </mesh>

      {/* Molduras a lo largo del pasillo (ajustadas al largo dinámico) */}
      <mesh position={[DYNAMIC_CENTER_X, CEILING_HEIGHT-0.02, HALL_WIDTH/2 - 0.13]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[DYNAMIC_CENTER_X, CEILING_HEIGHT-0.02, -HALL_WIDTH/2 + 0.13]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>

      {/* Lámparas (opcional: puedes alinearlas a DYNAMIC_LENGTH si lo deseas) */}
      {Array.from({ length: Math.floor(DYNAMIC_LENGTH / 8) }).map((_, i) => (
        <>
          <mesh key={`lamp-mesh-${i}`} position={[DYNAMIC_CENTER_X - DYNAMIC_LENGTH/2 + 4 + i*8, CEILING_HEIGHT-0.2, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 24]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          <pointLight key={`lamp-light-${i}`} position={[DYNAMIC_CENTER_X - DYNAMIC_LENGTH/2 + 4 + i*8, CEILING_HEIGHT-0.5, 0]} intensity={1.2} distance={6} color="#fffbe6" />
          <mesh key={`lamp-ring-${i}`} position={[DYNAMIC_CENTER_X - DYNAMIC_LENGTH/2 + 4 + i*8, CEILING_HEIGHT-0.19, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.45, 0.035, 16, 32]} />
            <meshStandardMaterial color="#f8bbd0" />
          </mesh>
        </>
      ))}

      {/* Cuadros */}
      {artworks.map((art, i) => (
        <Picture key={i} {...art} onClick={setSelectedArtwork} showPlaque={passedInitialWall && !selectedArtwork && !showList && !showInstructions} selected={selectedArtwork && selectedArtwork.title === art.title} />
      ))}

      {/* Bancas pegadas a las paredes */}
      <Bench position={[-HALL_LENGTH/2 + 6, 0, HALL_WIDTH/2 - 1.2]} />
      <Bench position={[0, 0, HALL_WIDTH/2 - 1.2]} />
      <Bench position={[HALL_LENGTH/2 - 6, 0, HALL_WIDTH/2 - 1.2]} />
      <Bench position={[-HALL_LENGTH/2 + 6, 0, -HALL_WIDTH/2 + 1.2]} />
      <Bench position={[0, 0, -HALL_WIDTH/2 + 1.2]} />
      <Bench position={[HALL_LENGTH/2 - 6, 0, -HALL_WIDTH/2 + 1.2]} />

      {/* Pared inicial */}
      <mesh position={[FIRST_X - WALL_MARGIN_INITIAL, 2.5, 0]}>
        <boxGeometry args={[0.1, 10, 30]} />
        <meshStandardMaterial color="#f0f0f0" opacity={0.98} transparent />
      </mesh>
      
      {/* Pared final */}
      <mesh position={[LAST_X + WALL_MARGIN_FINAL + 0.5, 2.5, 0]}>
        <boxGeometry args={[0.1, 10, 30]} />
        <meshStandardMaterial color="#f0f0f0" opacity={0.98} transparent />
      </mesh>
    </>
  )
}

function CameraLerpTo({ target, cameraRef, onArrive }) {
  const arrivedRef = useRef(false);
  useFrame(() => {
    if (!target || !cameraRef) return;
    const cam = cameraRef;
    const { position, lookAt } = target;
    // Lerp posición
    cam.position.lerp(new THREE.Vector3(...position), 0.08);
    // Lerp lookAt
    const currentLook = new THREE.Vector3();
    cam.getWorldDirection(currentLook);
    const lookTarget = new THREE.Vector3(...lookAt).sub(cam.position).normalize();
    cam.lookAt(...lookAt);
    // Considerar "llegada" si está suficientemente cerca
    if (!arrivedRef.current && cam.position.distanceTo(new THREE.Vector3(...position)) < 0.1) {
      arrivedRef.current = true;
      if (onArrive) onArrive();
    }
    if (arrivedRef.current && cam.position.distanceTo(new THREE.Vector3(...position)) > 0.2) {
      arrivedRef.current = false;
    }
  });
  return null;
}

// Componente para animar la cámara suavemente usando useFrame
function CameraLerpController({ cameraRef, cameraTarget, setCameraTarget }) {
  const { camera } = useThree();
  useFrame(() => {
    if (cameraTarget) {
      const [tx, ty, tz] = cameraTarget.position;
      camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.08);
      camera.lookAt(...cameraTarget.lookAt);
      if (camera.position.distanceTo(new THREE.Vector3(tx, ty, tz)) < 0.05) {
        camera.position.set(tx, ty, tz);
        setCameraTarget(null);
      }
    }
  });
  return null;
}

// --- Checker procedural para el piso ---
function createCheckerTexture(size = 512, squares = 16) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const sq = size / squares;
  for (let y = 0; y < squares; y++) {
    for (let x = 0; x < squares; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#e0e0e0' : '#bdbdbd';
      ctx.fillRect(x * sq, y * sq, sq, sq);
    }
  }
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// Componente para modal con zoom avanzado
function ZoomModal({ artwork, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  const imageRef = useRef(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        startX: position.x,
        startY: position.y
      });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && scale > 1) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({
        x: dragStart.startX + deltaX,
        y: dragStart.startY + deltaY
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale(prev => Math.min(5, prev * 1.2));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev * 0.8));

  // Función mejorada para cerrar el modal
  const handleClose = useCallback(() => {
    console.log('Cerrando modal y reactivando controles de cámara...');
    
    // Limpiar todo el estado del modal
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    
    // Forzar liberación del pointer lock si está activo
    if (document.pointerLockElement) {
      document.exitPointerLock();
      console.log('Pointer lock liberado');
    }
    
    // Restaurar cursor y estilos del body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Cerrar el modal inmediatamente
    onClose();
    
    // Pequeño delay adicional para forzar reactivación de controles
    setTimeout(() => {
      console.log('Forzando reactivación de controles de cámara');
      // Disparar un evento personalizado para forzar reconexión
      window.dispatchEvent(new CustomEvent('reactivateCamera'));
    }, 100);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClose();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    // Prevenir el click derecho y otros eventos que puedan interferir
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Prevenir el arrastre de imágenes
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Prevenir cualquier intento de pointer lock mientras el modal está abierto
    const handlePointerLockChange = () => {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    // Forzar la liberación del pointer lock si está activo
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    
    // Asegurar que el cursor esté visible
    document.body.style.cursor = 'auto';
    
    // Desactivar selección de texto mientras el modal está abierto
    document.body.style.userSelect = 'none';
    
    // NO desactivar pointerEvents del body para mantener la funcionalidad del modal
    // document.body.style.pointerEvents = 'none';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      
      // Restaurar selección de texto y cursor
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      // document.body.style.pointerEvents = '';
    };
  }, [handleClose, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        pointerEvents: 'auto', // Asegurar que el modal capture eventos
        userSelect: 'none' // Prevenir selección de texto
      }}
      onClick={handleClose}
      onContextMenu={(e) => e.preventDefault()} // Prevenir menú contextual
    >
      {/* Controles de zoom */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1001
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '2px solid white',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          +
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '2px solid white',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          -
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); resetZoom(); }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '2px solid white',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          1:1
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '2px solid white',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          ×
        </button>
      </div>

      {/* Información de controles */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        color: 'rgba(255,255,255,0.9)',
        fontSize: '14px',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px 20px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: '250px'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ffe082' }}>
          � Controles de cámara desactivados
        </div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>�🖱️ Rueda: Zoom</div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>✋ Arrastrar: Mover imagen</div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>⌨️ +/- : Zoom in/out</div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>⌨️ 0 : Tamaño original</div>
        <div style={{ fontSize: '12px' }}>⌨️ ESC/C : Cerrar y reactivar cámara</div>
      </div>

      {/* Contenedor de imagen */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
        }}
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imageRef}
          src={artwork.src}
          alt={artwork.title}
          onMouseDown={handleMouseDown}
          style={{
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            userSelect: 'none',
            pointerEvents: 'auto',
            WebkitUserDrag: 'none', // Prevenir arrastre en Safari
            KhtmlUserDrag: 'none', // Prevenir arrastre en navegadores antiguos
            MozUserDrag: 'none', // Prevenir arrastre en Firefox
            OUserDrag: 'none', // Prevenir arrastre en Opera
            userDrag: 'none' // CSS estándar
          }}
          onDragStart={(e) => e.preventDefault()} // Prevenir arrastre de imagen
          onContextMenu={(e) => e.preventDefault()} // Prevenir menú contextual
        />
      </div>

      {/* Información de la obra */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>{artwork.title}</h2>
        <div style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#ffe082' }}>
          {artwork.artist} ({artwork.year})
        </div>
        <p style={{ margin: '10px 0', opacity: 0.9, lineHeight: '1.5' }}>
          {artwork.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9rem', opacity: 0.8 }}>
          <span><strong>Técnica:</strong> {artwork.technique}</span>
          <span><strong>Dimensiones:</strong> {artwork.dimensions}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GalleryRoom({ salaId = 1, murales = [] }) {
  // Usar los murales reales pasados como props, o fallback a obras estáticas
  const artworkImages = murales.length > 0 
    ? murales.map(mural => ({
        src: mural.url_imagen,
        title: mural.nombre,
        artist: mural.autor || 'Autor desconocido',
        year: mural.anio?.toString() || 'Sin fecha',
        description: `${mural.tecnica || 'Técnica mixta'} - Mural del programa ARPA`,
        technique: mural.tecnica || 'Técnica mixta',
        dimensions: 'Escala mural'
      }))
    : artworkSalas[salaId] || artworkSalas[1];

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showList, setShowList] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [menuValue, setMenuValue] = useState("");
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [cameraX, setCameraX] = useState();
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [passedInitialWall, setPassedInitialWall] = useState(true); // Empezar como si ya pasó la pared
  const [isClient, setIsClient] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [listIndex, setListIndex] = useState(0);

  // Constantes dinámicas basadas en la cantidad de obras de la sala con mínimo de 6 cuadros
  const MIN_CUADROS = 6; // Mínimo 6 cuadros
  const PAIRS = Math.ceil(artworkImages.length / 2);
  const MIN_PAIRS = Math.ceil(MIN_CUADROS / 2); // Mínimo 3 pares (6 cuadros)
  const EFFECTIVE_PAIRS = Math.max(MIN_PAIRS, PAIRS); // Usar el mayor entre el real y el mínimo
  
  // Calcular dimensiones basadas en los pares efectivos (reales o mínimo)
  const SPACING_TOTAL = (EFFECTIVE_PAIRS - 1) * PICTURE_SPACING;
  const CONTENT_LENGTH = SPACING_TOTAL + PICTURE_WIDTH;
  
  // Centrar las obras en la sala
  const FIRST_X = -CONTENT_LENGTH / 2;
  const LAST_X = FIRST_X + SPACING_TOTAL;
  
  // La sala se ajusta al contenido real pero con el mínimo de 6 cuadros
  const DYNAMIC_LENGTH = CONTENT_LENGTH + WALL_MARGIN_INITIAL + WALL_MARGIN_FINAL;
  const DYNAMIC_CENTER_X = 0; // Centrado en el origen

  // Crear las obras después de definir las constantes
  const artworks = getHallwayArtworks(artworkImages, FIRST_X, PICTURE_SPACING);

  // Hotkey para abrir/cerrar la lista de obras
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'l') {
        setShowList((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Activar audio cuando el usuario interactúe (navegadores bloquean audio automático)
  useEffect(() => {
    const enableAudioOnInteraction = () => {
      if (!soundEnabled) {
        console.log('Activando audio por interacción del usuario');
        setSoundEnabled(true);
      }
    };

    // Escuchar eventos de interacción
    const handleKeyDown = (e) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key.toLowerCase())) {
        enableAudioOnInteraction();
      }
    };

    const handleClick = () => {
      enableAudioOnInteraction();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [soundEnabled]);

  useEffect(() => { setIsClient(true); }, []);

  // Solicitar pantalla completa al entrar al museo
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          console.log('Pantalla completa activada');
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
          console.log('Pantalla completa activada (webkit)');
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
          console.log('Pantalla completa activada (ms)');
        }
      } catch (err) {
        console.log('No se pudo activar pantalla completa:', err);
      }
    };
    
    // Solo intentar si no estamos ya en pantalla completa
    if (!document.fullscreenElement) {
      enterFullscreen();
    }
  }, []);

  // Función para cerrar instrucciones manualmente
  const closeInstructions = useCallback(() => {
    console.log('Cerrando instrucciones manualmente y activando controles');
    setShowInstructions(false);
    
    // Forzar activación inmediata de controles
    setTimeout(() => {
      console.log('Disparando evento de activación inmediata de cámara tras cerrar instrucciones');
      window.dispatchEvent(new CustomEvent('reactivateCamera'));
    }, 50); // Delay muy corto para activación inmediata
  }, []);

  // Efecto para iniciar el movimiento suave al seleccionar una pintura
  useEffect(() => {
    if (moveTo !== null && artworks[moveTo]) {
      const { position, rotation } = artworks[moveTo];
      const offset = 4;
      let [x, y, z] = position;
      let lookAt = [x, y, z];
      if (rotation[1] === 0) {
        z = z - offset;
      } else {
        z = z + offset;
      }
      y = 2;
      setCameraTarget({ position: [x, y, z], lookAt });
      setMoveTo(null);
    }
  }, [moveTo]);
  // Elimina el useEffect que forzaba la posición inicial

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'c' || e.key === 'C') {
        if (selectedArtwork) setSelectedArtwork(null);
        if (showList) setShowList(false);
      }
      if (showList && artworks.length > 0) {
        if (e.key === 'ArrowDown') {
          setListIndex((prev) => (prev + 1) % artworks.length);
          e.preventDefault();
        }
        if (e.key === 'ArrowUp') {
          setListIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
          e.preventDefault();
        }
        if (e.key === 'Enter') {
          setMoveTo(listIndex);
          setShowList(false);
          setMenuValue("");
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showList, selectedArtwork, listIndex, artworks.length]);

  useEffect(() => {
    if (!showList) setListIndex(0);
  }, [showList]);

  if (!isClient) return null;

  return (
    <>
      {/* Botón de menú con ícono de pintura en vez de dropdown */}
      <div style={{ position: 'absolute', zIndex: 30, top: 80, left: 20 }}>
        <button 
          onClick={() => setShowList(!showList)}
          style={{
            background: showList ? '#ffe082' : '#fff',
            border: '2px solid #222',
            borderRadius: '50%',
            width: 54,
            height: 54,
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: showList ? '0 0 0 3px #ffd54f' : '0 2px 8px #0002',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
            outline: 'none',
            padding: 0
          }}
          aria-label="Mostrar lista de obras"
        >
          🎨
        </button>
      </div>
      {/* Overlay de lista de obras con navegación rápida e indicador visual */}
      {showList && (
        <div style={{ position: 'absolute', zIndex: 40, top: 60, left: 0, right: 0, background: 'rgba(255,255,255,0.97)', maxWidth: 400, margin: '0 auto', borderRadius: 12, boxShadow: '0 4px 24px #0002', padding: 24, color:'#222', fontWeight:'bold' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{marginTop:0, color:'#111'}}>Lista de obras</h3>
            <div style={{ fontSize: 12, color: '#666', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>Presiona <b>C</b> para cerrar</div>
          </div>
          <ul style={{listStyle:'none', padding:0, margin:0}}>
            {artworks.map((art, i) => (
              <li key={i} style={{
                marginBottom:12,
                display:'flex',
                alignItems:'center',
                gap:12,
                cursor:'pointer',
                background: (moveTo === i) ? '#ffe082' : (selectedArtwork && selectedArtwork.title === art.title ? '#b3e5fc' : (listIndex === i ? '#fffde7' : 'transparent')),
                borderRadius: 8,
                boxShadow: (moveTo === i) ? '0 0 0 2px #ffd54f' : (selectedArtwork && selectedArtwork.title === art.title ? '0 0 0 2px #4fc3f7' : (listIndex === i ? '0 0 0 2px #ffd54f' : 'none')),
                transition: 'background 0.2s, box-shadow 0.2s',
                fontWeight: (moveTo === i || listIndex === i) ? 'bold' : 'normal',
                outline: (listIndex === i) ? '2px solid #ffd54f' : 'none'
              }}
              onClick={() => { setMoveTo(i); setShowList(false); setMenuValue(""); }}
              >
                <img src={art.src} alt={art.title} style={{width:48, height:32, objectFit:'cover', borderRadius:4, border:'1px solid #ccc'}} />
                <span style={{color:'#111', fontWeight:'bold'}}>{art.title}</span>
                {moveTo === i && <span style={{marginLeft:8, color:'#ffb300', fontWeight:'bold'}}>&rarr;</span>}
                {selectedArtwork && selectedArtwork.title === art.title && <span style={{marginLeft:8, color:'#0288d1', fontWeight:'bold'}}>●</span>}
                {listIndex === i && !moveTo && <span style={{marginLeft:8, color:'#ffd54f', fontWeight:'bold'}}>⬅</span>}
              </li>
            ))}
          </ul>
          <button onClick={() => { setShowList(false); setMenuValue(""); }} style={{marginTop:16, padding:'0.5em 1.5em', borderRadius:6, background:'#222', color:'#fff', border:'none', cursor:'pointer'}}>Cerrar</button>
        </div>
      )}
      {/* Modal de detalle de obra con zoom mejorado */}
      <AnimatePresence>
      {selectedArtwork && (
        <ZoomModal 
          artwork={selectedArtwork} 
          onClose={() => setSelectedArtwork(null)} 
        />
      )}
      </AnimatePresence>
      {/* Indicador de controles de cámara desactivados - Posicionado en el centro superior */}
      {selectedArtwork && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          background: 'rgba(255, 87, 34, 0.95)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(255, 87, 34, 0.4)',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          🔒 <span>Controles de cámara desactivados</span>
        </div>
      )}
      
      {/* Botón de sonido con icono y hotkey visual */}
      <div style={{ position: 'fixed', zIndex: 1000, top: 80, right: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1em' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSoundEnabled((v) => !v);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          style={{
            background: soundEnabled ? '#ffe082' : '#fff',
            border: '2px solid #222',
            borderRadius: '50%',
            width: 54,
            height: 54,
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: soundEnabled ? '0 0 0 3px #ffd54f' : '0 2px 8px #0002',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
            outline: 'none',
            padding: 0,
            pointerEvents: 'all'
          }}
          aria-label={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
      {/* Hotkeys visuales en la esquina inferior izquierda */}
      <div style={{
        position: 'fixed',
        left: 24,
        bottom: 24,
        zIndex: 100,
        background: 'rgba(30,30,30,0.45)',
        color: '#fff',
        borderRadius: 12,
        padding: '10px 18px',
        fontSize: 15,
        opacity: 0.7,
        pointerEvents: 'none',
        userSelect: 'none',
        boxShadow: '0 2px 8px #0002',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div><span style={{background:'#222', borderRadius:4, padding:'2px 8px', marginRight:6, fontWeight:'bold'}}>L</span> Lista de obras</div>
        <div><span style={{background:'#222', borderRadius:4, padding:'2px 8px', marginRight:6, fontWeight:'bold'}}>🔊</span> Activar/desactivar sonido</div>
      </div>
      {isClient && (
        <>
          <Canvas
            camera={{ position: [0, 2, 0], fov: 60, rotation: [0, 0, 0] }}
            onCreated={({ camera, gl, scene }) => {
              setCameraRef(camera);
              // Asegurar que la cámara mire hacia adelante (eje Z negativo)
              camera.lookAt(0, 2, -5);
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              gl.setPixelRatio(window.devicePixelRatio);
              gl.setClearColor('#eaf6ff');
              scene.fog = new THREE.Fog('#eaf6ff', 18, 60);
            }}
            style={{ width: '100vw', height: '100vh', background: '#eaf6ff' }}
            dpr={[1, 2]}
            shadows
            antialias
          >
            {soundEnabled && <BackGroundSound url="/assets/audio.mp3" />}
            <Room 
              passedInitialWall={passedInitialWall} 
              setSelectedArtwork={setSelectedArtwork} 
              selectedArtwork={selectedArtwork} 
              showList={showList} 
              showInstructions={showInstructions}
              artworks={artworks}
              DYNAMIC_LENGTH={DYNAMIC_LENGTH}
              DYNAMIC_CENTER_X={DYNAMIC_CENTER_X}
              FIRST_X={FIRST_X}
              LAST_X={LAST_X}
              WALL_MARGIN_INITIAL={WALL_MARGIN_INITIAL}
              WALL_MARGIN_FINAL={WALL_MARGIN_FINAL}
            />
            <PlayerControls 
              moveTo={moveTo !== null ? artworks[moveTo].position : null} 
              onArrive={() => setMoveTo(null)} 
              onPassInitialWall={() => { setPassedInitialWall(true); }} 
              setCameraX={setCameraX}
              FIRST_X={FIRST_X}
              LAST_X={LAST_X}
              WALL_MARGIN_INITIAL={WALL_MARGIN_INITIAL}
              WALL_MARGIN_FINAL={WALL_MARGIN_FINAL}
            />
            <ConditionalPointerLockControls enabled={!selectedArtwork} />
            <CameraLerpController cameraRef={cameraRef} cameraTarget={cameraTarget} setCameraTarget={setCameraTarget} />
          </Canvas>
        </>
      )}
      {/* Instrucciones que solo se pueden cerrar con clic */}
      {showInstructions && !selectedArtwork && !showList && (
        <div 
          onClick={closeInstructions}
          style={{
            position:'fixed',
            top:0,
            left:0,
            width:'100vw',
            height:'100vh',
            background:'rgba(0,0,0,0.6)', // Un poco más transparente
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            zIndex:500, // Reducido de 1000 a 500 para no bloquear tanto
            backdropFilter:'blur(6px)', // Reducido de 8px
            cursor: 'pointer' // Indicar que es clickeable
          }}>
          <div style={{
            background:'rgba(255,255,255,0.98)',
            borderRadius:18,
            padding:'2.2em 2.5em',
            boxShadow:'0 4px 32px rgba(0,0,0,0.3)',
            fontSize:'1.25em',
            color:'#1a237e',
            fontWeight:'bold',
            maxWidth:540,
            margin:'0 auto',
            border:'1.5px solid #e3eafc',
            textAlign:'center',
            letterSpacing:0.2,
            lineHeight:1.6,
            pointerEvents: 'none' // El contenido no debe interceptar el clic
          }}>
            <div style={{fontSize:'2.2em', marginBottom:'0.4em'}}>� Museo Virtual 3D</div>
            <div style={{fontWeight:700, fontSize:'1.1em', marginBottom:'0.8em', color:'#3949ab'}}>Bienvenido/a al recorrido interactivo</div>
            <ul style={{textAlign:'left', color:'#222', fontWeight:400, fontSize:'0.95em', margin:'0 auto 1em auto', maxWidth:420, paddingLeft:24, lineHeight:1.6}}>
              <li><b>WASD</b> o <b>Flechas</b>: Moverse por el espacio</li>
              <li><b>Mouse</b>: Mirar alrededor</li>
              <li><b>Clic en cuadro</b>: Ver detalles y zoom</li>
              <li><b>L</b>: Abrir/cerrar lista de obras</li>
              <li><b>C</b>: Cerrar modales</li>
              <li><b>🔊</b>: Activar/desactivar sonido</li>
            </ul>
            <div style={{fontSize:'1.6em', color:'#2e7d32', marginBottom:'0.3em'}}>
              🖱️ <strong>Haz clic aquí para empezar</strong> 🎮
            </div>
            <div style={{fontSize:'0.85em', color:'#666', fontStyle:'italic'}}>
              Los controles se activarán al hacer clic
            </div>
          </div>
        </div>
      )}
      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}

// Componente personalizado para controles de cámara que se puede desactivar
function ConditionalPointerLockControls({ enabled = true }) {
  const controlsRef = useRef();
  
  // Efecto principal para manejar el estado de habilitación
  useEffect(() => {
    console.log('ConditionalPointerLockControls effect:', { enabled });
    
    if (controlsRef.current) {
      if (enabled) {
        // Reactivar controles con delay para asegurar limpieza completa
        const timer = setTimeout(() => {
          if (controlsRef.current) {
            try {
              // Asegurar que no hay pointer lock activo antes de conectar
              if (document.pointerLockElement) {
                document.exitPointerLock();
              }
              
              // Pequeño delay adicional después de salir del pointer lock
              setTimeout(() => {
                if (controlsRef.current && enabled) {
                  controlsRef.current.connect();
                  console.log('✅ PointerLockControls CONECTADOS');
                  
                  // Restaurar cursor normal
                  document.body.style.cursor = '';
                }
              }, 100);
            } catch (error) {
              console.error('Error conectando PointerLockControls:', error);
            }
          }
        }, 150); // Delay optimizado
        
        return () => clearTimeout(timer);
      } else {
        // Desactivar controles inmediatamente
        try {
          controlsRef.current.disconnect();
          console.log('❌ PointerLockControls DESCONECTADOS');
          
          // Forzar liberación del puntero
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          
          // Asegurar cursor visible
          document.body.style.cursor = 'auto';
        } catch (error) {
          console.error('Error desconectando PointerLockControls:', error);
        }
      }
    }
  }, [enabled]);

  // Inicialización al montar el componente - DESHABILITADA
  // Los controles solo se activan después del clic del usuario
  useEffect(() => {
    console.log('🚀 ConditionalPointerLockControls montado - esperando clic del usuario');
    // No inicializar automáticamente los controles
  }, []);

  // Listener para evento personalizado de reactivación forzada
  useEffect(() => {
    const handleReactivate = () => {
      if (enabled && controlsRef.current) {
        console.log('Reactivación forzada de controles de cámara');
        try {
          // Desconectar y reconectar para forzar reactivación
          controlsRef.current.disconnect();
          setTimeout(() => {
            if (controlsRef.current && enabled) {
              controlsRef.current.connect();
              console.log('Controles de cámara FORZADAMENTE reactivados');
            }
          }, 50);
        } catch (error) {
          console.error('Error en reactivación forzada:', error);
        }
      }
    };

    window.addEventListener('reactivateCamera', handleReactivate);
    
    return () => {
      window.removeEventListener('reactivateCamera', handleReactivate);
    };
  }, [enabled]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        try {
          controlsRef.current.disconnect();
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          document.body.style.cursor = '';
        } catch (error) {
          console.error('Error en cleanup:', error);
        }
      }
    };
  }, []);

  // Siempre renderizar los controles para mantener la referencia
  return <PointerLockControls ref={controlsRef} />;
}

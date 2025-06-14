'use client'

// --- Limpieza de imports y organización ---
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
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
  // Dimensiones
  const w = 3, h = 2, thickness = 0.15, depth = 0.07;
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

export default function GalleryRoom({ salaId = 1 }) {
  // Obtener las obras de la sala específica
  const artworkImages = artworkSalas[salaId] || artworkSalas[1];

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

  // Ocultar instrucciones después de 5 segundos
  useEffect(() => {
    console.log('Iniciando temporizador de instrucciones por 5 segundos');
    const timer = setTimeout(() => {
      console.log('Ocultando instrucciones después de 5 segundos');
      setShowInstructions(false);
    }, 5000);
    return () => {
      console.log('Limpiando temporizador de instrucciones');
      clearTimeout(timer);
    };
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
      {/* Modal de detalle de obra */}
      <AnimatePresence>
      {selectedArtwork && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: 32,
              maxWidth: 600,
              width: '100%',
              boxShadow: '0 8px 40px #0005',
              position: 'relative'
            }}
          >
            <button onClick={() => setSelectedArtwork(null)} style={{ position: 'absolute', top: 18, right: 18, fontSize: 28, background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}>×</button>
            <div style={{ position: 'absolute', top: 18, left: 18, fontSize: 14, color: '#666', background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>Presiona <b>C</b> para cerrar</div>
            <img src={selectedArtwork.src} alt={selectedArtwork.title} style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 12, marginBottom: 18, boxShadow: '0 2px 16px #0002' }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#222' }}>{selectedArtwork.title}</h2>
            <div style={{ color: '#666', fontWeight: 'bold', marginBottom: 8 }}>{selectedArtwork.artist} ({selectedArtwork.year})</div>
            <div style={{ color: '#444', marginBottom: 12 }}>{selectedArtwork.description}</div>
            <div style={{ color: '#555', fontSize: 15 }}><b>Técnica:</b> {selectedArtwork.technique}</div>
            <div style={{ color: '#555', fontSize: 15 }}><b>Dimensiones:</b> {selectedArtwork.dimensions}</div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      {/* Botón de sonido con icono y hotkey visual */}
      <div style={{ position: 'fixed', zIndex: 1000, top: 80, right: 20, display: 'flex', alignItems: 'center', gap: '1em' }}>
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
            <PointerLockControls />
            <CameraLerpController cameraRef={cameraRef} cameraTarget={cameraTarget} setCameraTarget={setCameraTarget} />
          </Canvas>
        </>
      )}
      {/* Instrucciones solo durante los primeros 5 segundos y cuando no hay placas visibles */}
      {showInstructions && !selectedArtwork && !showList && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          width:'100vw',
          height:'100vh',
          background:'rgba(0,0,0,0.7)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          zIndex:1000,
          backdropFilter:'blur(8px)'
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
            lineHeight:1.6
          }}>
            <div style={{fontSize:'2.5em', marginBottom:'0.3em'}}>🎓 Museo Virtual 3D</div>
            <div style={{fontWeight:700, fontSize:'1.15em', marginBottom:'0.7em', color:'#3949ab'}}>Bienvenido/a al recorrido interactivo</div>
            <ul style={{textAlign:'left', color:'#222', fontWeight:400, fontSize:'1em', margin:'0 auto 0.7em auto', maxWidth:420, paddingLeft:24, lineHeight:1.7}}>
              <li><b>WASD</b> o <b>Flechas</b>: Moverse por el espacio</li>
              <li><b>Click</b>: Activar cámara libre y mirar con el mouse</li>
              <li><b>L</b>: Abrir/cerrar lista de obras</li>
              <li><b>C</b>: Cerrar modales</li>
              <li><b>🔊</b>: Activar/desactivar sonido</li>
            </ul>
            <div style={{fontSize:'1.7em', color:'#3949ab'}}>¡Disfruta el recorrido! 🎨</div>
          </div>
        </div>
      )}
    </>
  )
}

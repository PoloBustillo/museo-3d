'use client'

// --- Limpieza de imports y organización ---
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useTexture, Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import BackGroundSound from './BackGroundSound.jsx';

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
  // Puedes agregar más obras siguiendo este formato
];

const HALL_LENGTH = 40;
const HALL_WIDTH = 14; // ancho del pasillo aumentado
const WALL_HEIGHT = 2;
const PICTURE_SPACING = 6;
const FLOOR_EXTRA = 10;
const CEILING_HEIGHT = 5.5;
const PICTURE_WIDTH = 3;
const WALL_MARGIN_INITIAL = 4;
const WALL_MARGIN_FINAL = 2;
const PAIRS = Math.ceil(artworkImages.length / 2);
const FIRST_X = -HALL_LENGTH / 2 + PICTURE_SPACING;
const LAST_X = FIRST_X + (PAIRS - 1) * PICTURE_SPACING;
const DYNAMIC_LENGTH = (LAST_X - FIRST_X) + PICTURE_WIDTH + WALL_MARGIN_INITIAL + WALL_MARGIN_FINAL;
const DYNAMIC_CENTER_X = (FIRST_X + LAST_X) / 2 - (WALL_MARGIN_FINAL - WALL_MARGIN_INITIAL) / 2;

// --- Texturas ---
const floorTextureUrl = '/assets/textures/floor.jpg';
const wallTextureUrl = '/assets/textures/wall.jpg';
const benchTextureUrl = '/assets/textures/bench.jpg';

function getHallwayArtworks(images) {
  const positions = [];
  const n = images.length;
  for (let i = 0; i < n; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const index = Math.floor(i / 2);
    const x = -HALL_LENGTH / 2 + PICTURE_SPACING + index * PICTURE_SPACING;
    const cuadroProfundidad = 0.15;
    const z = side === 1
      ? (HALL_WIDTH / 2 - cuadroProfundidad / 2)
      : -(HALL_WIDTH / 2 - cuadroProfundidad / 2);
    const rot = [0, side === 1 ? 0 : Math.PI, 0];
    positions.push({ ...images[i], position: [x, WALL_HEIGHT, z], rotation: rot });
  }
  return positions;
}

const artworks = getHallwayArtworks(artworkImages);

function Picture({ src, title, artist, year, description, technique, dimensions, position, rotation = [0, 0, 0], onClick, showPlaque }) {
  const texture = useTexture(src);
  const [hovered, setHovered] = useState(false);
  // Dimensiones
  const w = 3, h = 2, thickness = 0.15, depth = 0.07;
  return (
    <group position={position} rotation={rotation}>
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
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? [1.04, 1.04, 1] : [1, 1, 1]}
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
    </group>
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

function PlayerControls({ moveTo, onArrive, mobileDir, onPassInitialWall, setCameraX }) {
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
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
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

function Room({ passedInitialWall, setSelectedArtwork, selectedArtwork }) {
  // Cargar texturas
  const floorTexture = useTexture(floorTextureUrl);
  // Textura para paredes con repetición y anisotropía
  const wallTexture = useTexture('/assets/textures/wall.jpg');
  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(Math.ceil(DYNAMIC_LENGTH / 4), 2);
    wallTexture.anisotropy = 16;
  }

  // Piso con textura clara y repetición para mayor detalle
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
      {/* Piso con textura clara y repetición para mayor detalle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[DYNAMIC_CENTER_X, 0, 0]}>
        <planeGeometry args={[DYNAMIC_LENGTH, HALL_WIDTH]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>
      {/* Techo */}
      <mesh position={[DYNAMIC_CENTER_X, CEILING_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[DYNAMIC_LENGTH, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
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

      {/* Paredes laterales */}
      <mesh position={[DYNAMIC_CENTER_X, 2.5, HALL_WIDTH/2]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 5, 0.1]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" />
      </mesh>
      <mesh position={[DYNAMIC_CENTER_X, 2.5, -HALL_WIDTH/2]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 5, 0.1]} />
        <meshStandardMaterial map={wallTexture} color="#ffffff" />
      </mesh>

      {/* Cuadros */}
      {artworks.map((art, i) => (
        <Picture key={i} {...art} onClick={setSelectedArtwork} showPlaque={passedInitialWall && !selectedArtwork} />
      ))}

      {/* Bancas pegadas a las paredes */}
      <Bench position={[-HALL_LENGTH/2 + 6, 0, HALL_WIDTH/2 - 1.2]} />
      <Bench position={[0, 0, HALL_WIDTH/2 - 1.2]} />
      <Bench position={[HALL_LENGTH/2 - 6, 0, HALL_WIDTH/2 - 1.2]} />
      <Bench position={[-HALL_LENGTH/2 + 6, 0, -HALL_WIDTH/2 + 1.2]} />
      <Bench position={[0, 0, -HALL_WIDTH/2 + 1.2]} />
      <Bench position={[HALL_LENGTH/2 - 6, 0, -HALL_WIDTH/2 + 1.2]} />

      {/* Pared de bienvenida cubriendo toda la pantalla */}
      <mesh position={[FIRST_X - WALL_MARGIN_INITIAL - 2, 2.5, 0]}>
        <boxGeometry args={[0.1, 10, 30]} />
        <meshStandardMaterial color="#cce6ff" opacity={0.98} transparent />
      </mesh>
    </>
  )
}

export default function GalleryRoom() {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showList, setShowList] = useState(false)
  const [moveTo, setMoveTo] = useState(null)
  const [menuValue, setMenuValue] = useState("")
  const [tooltipIndex, setTooltipIndex] = useState(null)
  const [showInstructions, setShowInstructions] = useState(true) // Nuevo estado para instrucciones
  const [cameraX, setCameraX] = useState();
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [passedInitialWall, setPassedInitialWall] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  // Referencia a la cámara para overlays
  const [cameraRef, setCameraRef] = useState(null);
  if (!isClient) return null;

  return (
    <>
      {/* Menú desplegable */}
      <div style={{ position: 'absolute', zIndex: 30, top: 20, left: 20 }}>
        <select value={menuValue} onChange={e => {
          setMenuValue(e.target.value)
          setShowList(e.target.value === 'list')
        }} style={{ padding: '0.5em 1em', fontSize: '1em', borderRadius: 6, background:'#222', color:'#fff', fontWeight:'bold', boxShadow:'0 2px 8px #0002' }}>
          <option value="">Menú</option>
          <option value="list">Lista de obras</option>
        </select>
      </div>
      {/* Overlay de lista de obras */}
      {showList && (
        <div style={{ position: 'absolute', zIndex: 40, top: 60, left: 0, right: 0, background: 'rgba(255,255,255,0.97)', maxWidth: 400, margin: '0 auto', borderRadius: 12, boxShadow: '0 4px 24px #0002', padding: 24, color:'#222', fontWeight:'bold' }}>
          <h3 style={{marginTop:0, color:'#111'}}>Lista de obras</h3>
          <ul style={{listStyle:'none', padding:0, margin:0}}>
            {artworks.map((art, i) => (
              <li key={i} style={{marginBottom:12, display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={() => { setMoveTo(i); setShowList(false); setMenuValue(""); }}>
                <img src={art.src} alt={art.title} style={{width:48, height:32, objectFit:'cover', borderRadius:4, border:'1px solid #ccc'}} />
                <span style={{color:'#111', fontWeight:'bold'}}>{art.title}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => { setShowList(false); setMenuValue(""); }} style={{marginTop:16, padding:'0.5em 1.5em', borderRadius:6, background:'#222', color:'#fff', border:'none', cursor:'pointer'}}>Cerrar</button>
        </div>
      )}
      {/* Modal de detalle de obra */}
      {selectedArtwork && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            padding: 32,
            maxWidth: 600,
            width: '100%',
            boxShadow: '0 8px 40px #0005',
            position: 'relative'
          }}>
            <button onClick={() => setSelectedArtwork(null)} style={{ position: 'absolute', top: 18, right: 18, fontSize: 28, background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}>×</button>
            <img src={selectedArtwork.src} alt={selectedArtwork.title} style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 12, marginBottom: 18, boxShadow: '0 2px 16px #0002' }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#222' }}>{selectedArtwork.title}</h2>
            <div style={{ color: '#666', fontWeight: 'bold', marginBottom: 8 }}>{selectedArtwork.artist} ({selectedArtwork.year})</div>
            <div style={{ color: '#444', marginBottom: 12 }}>{selectedArtwork.description}</div>
            <div style={{ color: '#555', fontSize: 15 }}><b>Técnica:</b> {selectedArtwork.technique}</div>
            <div style={{ color: '#555', fontSize: 15 }}><b>Dimensiones:</b> {selectedArtwork.dimensions}</div>
          </div>
        </div>
      )}
      {/* Botón de sonido */}
      <div style={{ position: 'absolute', zIndex: 10, top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1em' }}>
        {!soundEnabled && (
          <button onClick={() => setSoundEnabled(true)} style={{ padding: '1em 2em', fontSize: '1.2em', borderRadius: '8px', background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Activar sonido
          </button>
        )}
        {soundEnabled && (
          <button onClick={() => setSoundEnabled(false)} style={{ padding: '1em 2em', fontSize: '1.2em', borderRadius: '8px', background: '#900', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Desactivar sonido
          </button>
        )}
      </div>
      {isClient && (
        <>
          <Canvas shadows camera={{ fov: 75, position: [FIRST_X - WALL_MARGIN_INITIAL - 4, 2, 0], near: 0.1, far: 1000 }} onCreated={({ camera }) => setCameraRef(camera)}>
            {soundEnabled && <BackGroundSound url="/assets/audio.mp3" />}
            <Room passedInitialWall={passedInitialWall} setSelectedArtwork={setSelectedArtwork} selectedArtwork={selectedArtwork} />
            <PlayerControls moveTo={moveTo !== null ? artworks[moveTo].position : null} onArrive={() => setMoveTo(null)} onPassInitialWall={() => { setShowInstructions(false); setPassedInitialWall(true); }} setCameraX={setCameraX} />
            <PointerLockControls />
          </Canvas>
        </>
      )}
      {/* Instrucciones solo si showInstructions es true y la cámara está ANTES de la pared inicial */}
      {showInstructions && (typeof cameraX === 'undefined' || cameraX <= FIRST_X - WALL_MARGIN_INITIAL + 0.5) && (
        <div style={{position:'fixed', bottom:120, left:0, right:0, zIndex:200, display:'flex', justifyContent:'center', pointerEvents:'none'}}>
          <div style={{background:'rgba(255,255,255,0.98)', borderRadius:18, padding:'1.5em 2em', boxShadow:'0 2px 32px #0003', fontSize:'1.3em', color:'#222', fontWeight:'bold', maxWidth:600, margin:'0 auto'}}>
            <div style={{fontSize:'2.2em', marginBottom:'0.2em'}}>🎨🖼️</div>
            <div><b>Bienvenido al museo virtual</b></div>
            <div style={{fontWeight:'bold', fontSize:'1.1em', marginTop:'1.2em'}}>
              Usa <b><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></b> o las flechas para moverte.<br/>
              Haz click para activar la cámara y mirar con el mouse.<br/>
              Avanza para atravesar esta pared e ingresar al pasillo.<br/>
              <span style={{fontSize:'1.5em'}}>➡️🚶‍♂️</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

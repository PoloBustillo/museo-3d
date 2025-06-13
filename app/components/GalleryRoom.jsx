'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, useTexture, Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import BackGroundSound from './BackGroundSound.jsx'

// Configuración del pasillo
const HALL_LENGTH = 40; // largo del pasillo
const HALL_WIDTH = 6; // ancho del pasillo
const WALL_HEIGHT = 2; // altura de los cuadros
const PICTURE_SPACING = 6; // separación entre cuadros
const FLOOR_EXTRA = 10; // margen extra para el piso, más grande
const CEILING_HEIGHT = 5.5; // altura del techo

const artworkImages = [
  '/assets/artworks/cuadro1.jpg',
  '/assets/artworks/cuadro2.jpg',
  '/assets/artworks/cuadro3.jpg',
  '/assets/artworks/cuadro4.jpg',
  '/assets/artworks/cuadro5.jpg',
  '/assets/artworks/cuadro1.jpg',
  '/assets/artworks/cuadro2.jpg',
  '/assets/artworks/cuadro3.jpg',
  '/assets/artworks/cuadro4.jpg',
  '/assets/artworks/cuadro5.jpg',
  '/assets/artworks/cuadro1.jpg',
  '/assets/artworks/cuadro2.jpg',
  '/assets/artworks/cuadro3.jpg',
  '/assets/artworks/cuadro4.jpg',
  '/assets/artworks/cuadro5.jpg',
  // Agrega más imágenes aquí
];

function getHallwayArtworks(images) {
  const positions = [];
  const n = images.length;
  for (let i = 0; i < n; i++) {
    // Alterna entre izquierda y derecha
    const side = i % 2 === 0 ? 1 : -1;
    const index = Math.floor(i / 2);
    const x = -HALL_LENGTH / 2 + PICTURE_SPACING + index * PICTURE_SPACING;
    // Pegados a la pared (ajustar para que el marco quede justo al ras)
    const cuadroProfundidad = 0.15; // grosor del marco 3D
    const z = side === 1
      ? (HALL_WIDTH / 2 - cuadroProfundidad / 2)
      : -(HALL_WIDTH / 2 - cuadroProfundidad / 2);
    // Rotación: lado derecho 0, lado izquierdo Math.PI
    const rot = [0, side === 1 ? 0 : Math.PI, 0];
    positions.push({ src: images[i], position: [x, WALL_HEIGHT, z], rotation: rot });
  }
  return positions;
}

const artworks = getHallwayArtworks(artworkImages);

function Picture({ src, position, rotation = [0, 0, 0], onClick }) {
  const texture = useTexture(src)
  // Dimensiones
  const w = 3, h = 2, thickness = 0.15, depth = 0.07
  return (
    <group position={position} rotation={rotation}>
      {/* Marco negro 3D alrededor de la imagen */}
      {/* Superior */}
      <mesh position={[0, h/2 + thickness/2, depth]}>
        <boxGeometry args={[w + thickness*2, thickness, thickness]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Inferior */}
      <mesh position={[0, -h/2 - thickness/2, depth]}>
        <boxGeometry args={[w + thickness*2, thickness, thickness]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Izquierda */}
      <mesh position={[-w/2 - thickness/2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness*2, thickness]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Derecha */}
      <mesh position={[w/2 + thickness/2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness*2, thickness]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Imagen */}
      <mesh position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onClick(src); }}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
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

function PlayerControls({ moveTo, onArrive }) {
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef({ w: false, a: false, s: false, d: false })

  useEffect(() => {
    const onKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true
    }
    const onKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    // Solo restricción en el ancho (Z)
    const minZ = -HALL_WIDTH/2 + 0.7
    const maxZ = HALL_WIDTH/2 - 0.7

    if (moveTo) {
      const target = new THREE.Vector3(...moveTo)
      const isRight = target.z > 0
      const zOffset = isRight ? 2.5 : -2.5
      let zTarget = target.z + zOffset
      if (zTarget > maxZ) zTarget = maxZ
      if (zTarget < minZ) zTarget = minZ
      target.setZ(zTarget)
      target.y = moveTo[1]
      camera.position.lerp(target, 0.08)
      camera.lookAt(moveTo[0], moveTo[1], moveTo[2])
      if (camera.position.distanceTo(target) < 0.2 && onArrive) onArrive()
      return
    }
    direction.current.set(0, 0, 0)
    if (keys.current.w) direction.current.z -= 1
    if (keys.current.s) direction.current.z += 1
    if (keys.current.a) direction.current.x -= 1
    if (keys.current.d) direction.current.x += 1
    direction.current.normalize()
    direction.current.applyEuler(camera.rotation)
    direction.current.y = 0
    velocity.current.copy(direction.current).multiplyScalar(5 * delta)
    camera.position.add(velocity.current)
    // Limitar solo la posición Z (ancho)
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z))
  })
  return null
}

// --- Cálculo de largo dinámico para techo y paredes ---
const PICTURE_WIDTH = 3; // igual que en Picture
const WALL_MARGIN = 2; // margen visual al inicio y final
const PAIRS = Math.ceil(artworkImages.length / 2);
const FIRST_X = -HALL_LENGTH / 2 + PICTURE_SPACING;
const LAST_X = FIRST_X + (PAIRS - 1) * PICTURE_SPACING;
const CENTER_X = (FIRST_X + LAST_X) / 2;
const DYNAMIC_LENGTH = (LAST_X - FIRST_X) + PICTURE_WIDTH + WALL_MARGIN * 2;

// Define WALL_MARGIN_INITIAL si no existe
const WALL_MARGIN_INITIAL = 2;

function Room() {
  return (
    <>
      {/* Luces generales */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />

      {/* Piso ajustado dinámicamente */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[CENTER_X, 0, 0]}>
        <planeGeometry args={[DYNAMIC_LENGTH, HALL_WIDTH]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Techo ajustado dinámicamente */}
      <mesh position={[CENTER_X, CEILING_HEIGHT, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[DYNAMIC_LENGTH, HALL_WIDTH + FLOOR_EXTRA]} />
        <meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>

      {/* Molduras a lo largo del pasillo (ajustadas al largo dinámico) */}
      <mesh position={[CENTER_X, CEILING_HEIGHT-0.02, HALL_WIDTH/2 - 0.13]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>
      <mesh position={[CENTER_X, CEILING_HEIGHT-0.02, -HALL_WIDTH/2 + 0.13]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 0.09, 0.09]} />
        <meshStandardMaterial color="#FFF" />
      </mesh>

      {/* Lámparas (opcional: puedes alinearlas a DYNAMIC_LENGTH si lo deseas) */}
      {Array.from({ length: Math.floor(DYNAMIC_LENGTH / 8) }).map((_, i) => (
        <>
          <mesh key={`lamp-mesh-${i}`} position={[CENTER_X - DYNAMIC_LENGTH/2 + 4 + i*8, CEILING_HEIGHT-0.2, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 24]} />
            <meshStandardMaterial color="#FFF" />
          </mesh>
          <pointLight key={`lamp-light-${i}`} position={[CENTER_X - DYNAMIC_LENGTH/2 + 4 + i*8, CEILING_HEIGHT-0.5, 0]} intensity={1.2} distance={6} color="#fffbe6" />
          <mesh key={`lamp-ring-${i}`} position={[CENTER_X - DYNAMIC_LENGTH/2 + 4 + i*8, CEILING_HEIGHT-0.19, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.45, 0.035, 16, 32]} />
            <meshStandardMaterial color="#f8bbd0" />
          </mesh>
        </>
      ))}

      {/* Paredes laterales ajustadas dinámicamente */}
      <mesh position={[CENTER_X, 2.5, HALL_WIDTH/2]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 5, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[CENTER_X, 2.5, -HALL_WIDTH/2]}>
        <boxGeometry args={[DYNAMIC_LENGTH, 5, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Cuadros */}
      {artworks.map((art, i) => (
        <Picture key={i} {...art} />
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
      {/* Instrucciones centradas en la parte baja de la pantalla, área más ancha */}
      <Html position={[FIRST_X - WALL_MARGIN_INITIAL - 1.6, 1.2, 0]} center style={{width:'700px', textAlign:'center'}}>
        <div style={{background:'rgba(255,255,255,0.98)', borderRadius:18, padding:'2.2em', boxShadow:'0 2px 32px #0003', fontSize:'1.5em', color:'#222', fontWeight:'bold', border:'2px solid #90caf9'}}>
          <div style={{fontSize:'2.2em', marginBottom:'0.2em'}}>🎨🖼️</div>
          <div><b>Bienvenido al museo virtual</b></div>
          <div style={{fontWeight:'bold', fontSize:'1.1em', marginTop:'1.2em'}}>
            Usa <b><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></b> o las flechas para moverte.<br/>
            Haz click para activar la cámara y mirar con el mouse.<br/>
            Avanza para atravesar esta pared e ingresar al pasillo de la galería.<br/>
            <span style={{fontSize:'1.5em'}}>➡️🚶‍♂️</span>
          </div>
        </div>
      </Html>
    </>
  )
}

function ProximityTooltip({ artworks, threshold = 3, setTooltipIndex }) {
  const { camera } = useThree()
  useFrame(() => {
    let found = null
    let minAngle = 0.26 // ~15 grados en radianes
    let minDist = threshold
    artworks.forEach((art, i) => {
      const artPos = new THREE.Vector3(...art.position)
      const toArt = artPos.clone().sub(camera.position)
      const dist = toArt.length()
      if (dist > threshold) return
      toArt.normalize()
      const camDir = new THREE.Vector3()
      camera.getWorldDirection(camDir)
      const angle = camDir.angleTo(toArt)
      if (angle < minAngle && dist < minDist) {
        found = i
        minDist = dist
      }
    })
    setTooltipIndex(found)
  })
  return null
}

export default function GalleryRoom() {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showList, setShowList] = useState(false)
  const [moveTo, setMoveTo] = useState(null)
  const [menuValue, setMenuValue] = useState("")
  const [tooltipIndex, setTooltipIndex] = useState(null)

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
                <img src={art.src} alt={art.info || art.src} style={{width:48, height:32, objectFit:'cover', borderRadius:4, border:'1px solid #ccc'}} />
                <span style={{color:'#111', fontWeight:'bold'}}>{art.info || art.src}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => { setShowList(false); setMenuValue(""); }} style={{marginTop:16, padding:'0.5em 1.5em', borderRadius:6, background:'#222', color:'#fff', border:'none', cursor:'pointer'}}>Cerrar</button>
        </div>
      )}
      {tooltipIndex !== null && (
        <div style={{position:'absolute', bottom:80, left:0, right:0, textAlign:'center', zIndex:20}}>
          <span style={{background:'#222', color:'#fff', padding:'0.7em 1.5em', borderRadius:8, fontSize:'1.1em', boxShadow:'0 2px 8px #0008'}}>
            {artworks[tooltipIndex].info || artworks[tooltipIndex].src}
          </span>
        </div>
      )}
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
      <Canvas shadows camera={{ fov: 75, position: [FIRST_X - WALL_MARGIN_INITIAL - 4, 2, 0], near: 0.1, far: 1000 }}>
        {soundEnabled && <BackGroundSound url="/assets/audio.mp3" />}
        <Room />
        <PlayerControls moveTo={moveTo !== null ? artworks[moveTo].position : null} onArrive={() => setMoveTo(null)} />
        <PointerLockControls />
        <ProximityTooltip artworks={artworks} threshold={3} setTooltipIndex={setTooltipIndex} />
      </Canvas>
    </>
  )
}

/**
 * Componente de obra de arte 3D con marco y detalles
 * Soporta diferentes tipos de obras: pintura, fotografía, relieve, etc.
 */
import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { RoundedPlaneGeometry } from 'maath/geometry';
import { useModal } from '../../../providers/ModalProvider';

// Registrar geometría personalizada
extend({ RoundedPlaneGeometry });

// Cache simple de texturas por URL para evitar recargas repetidas
const textureCache = new Map();

const ArtworkFrame = React.memo(function ArtworkFrame({ 
  width = 4, 
  height = 3, 
  depth = 0.1,
  frameWidth = 0.15,
  frameStyle = 'classic',
  material = 'wood',
  highlight = false
}) {
  const frameMaterials = useMemo(() => {
    const baseColors = {
      wood: '#8b4513',
      metal: '#2c2c2c',
      gold: '#ffd700',
      silver: '#c0c0c0'
    };
    const base = baseColors[material] || baseColors.wood;
    const hl = highlight ? new THREE.Color(base).offsetHSL(0, 0, 0.25) : new THREE.Color(base);
    return new THREE.MeshStandardMaterial({
      color: hl,
      roughness: material === 'metal' || material === 'silver' ? 0.3 : 0.8,
      metalness: material === 'metal' || material === 'silver' ? 0.9 : (material === 'gold' ? 0.8 : 0.1),
      emissive: highlight ? hl.clone().multiplyScalar(0.15) : new THREE.Color('#000'),
      emissiveIntensity: highlight ? 0.6 : 0.0
    });
  }, [material, highlight]);

  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Marco exterior
    shape.moveTo(-width/2 - frameWidth, -height/2 - frameWidth);
    shape.lineTo(width/2 + frameWidth, -height/2 - frameWidth);
    shape.lineTo(width/2 + frameWidth, height/2 + frameWidth);
    shape.lineTo(-width/2 - frameWidth, height/2 + frameWidth);
    shape.closePath();
    
    // Hueco interior
    const hole = new THREE.Path();
    hole.moveTo(-width/2, -height/2);
    hole.lineTo(width/2, -height/2);
    hole.lineTo(width/2, height/2);
    hole.lineTo(-width/2, height/2);
    hole.closePath();
    
    shape.holes.push(hole);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: depth,
      bevelEnabled: frameStyle !== 'minimal',
      bevelThickness: frameStyle === 'ornate' ? 0.02 : 0.01,
      bevelSize: frameStyle === 'ornate' ? 0.02 : 0.01,
      bevelSegments: frameStyle === 'ornate' ? 8 : 4
    });
  }, [width, height, depth, frameWidth, frameStyle]);

  return (
    <mesh geometry={frameGeometry} material={frameMaterials} castShadow />
  );
});

const ArtworkCanvas = React.memo(function ArtworkCanvas({
  width = 4,
  height = 3,
  artwork,
  artworkType = 'painting',
  onAspect = ()=>{}
}) {
  const canvasRef = useRef();
  
  const artworkMaterial = useMemo(() => {
    // Priorizar imagen real de la obra
    const imageUrl = artwork?.imagenUrlWebp || artwork?.url_imagen || artwork?.imageUrl;
    if (imageUrl) {
      let texture = textureCache.get(imageUrl);
      if (!texture) {
        const loader = new THREE.TextureLoader();
        texture = loader.load(
          imageUrl,
          (tx) => {
            // Calcular aspecto y avisar al padre
            if (tx.image && tx.image.width && tx.image.height) {
              const aspect = tx.image.width / tx.image.height;
              onAspect(aspect);
            }
            tx.wrapS = THREE.ClampToEdgeWrapping;
            tx.wrapT = THREE.ClampToEdgeWrapping;
            tx.generateMipmaps = false;
            tx.minFilter = THREE.LinearFilter;
            tx.magFilter = THREE.LinearFilter;
            tx.flipY = true;
            if (tx.colorSpace !== undefined) tx.colorSpace = THREE.SRGBColorSpace;
            textureCache.set(imageUrl, tx);
          }
        );
      } else {
        // Ya en caché: emitir aspecto si disponible
        if (texture.image && texture.image.width && texture.image.height) {
          onAspect(texture.image.width / texture.image.height);
        }
      }
      
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: artworkType === 'photo' ? 0.1 : 0.6,
        metalness: 0.0,
        transparent: false
      });
    }
    
    // Fallback: Placeholder procedural con información de la obra más visible
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = Math.floor(1024 * (height / width));
    const ctx = canvas.getContext('2d');
    
    // Color base más llamativo para indicar que es fallback
    const baseColor = artwork?.color || '#e8f4f8';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, adjustBrightness(baseColor, -0.3));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Mensaje de "Imagen no disponible" más visible
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillText('🖼️', canvas.width / 2, canvas.height / 2 - 100);
    
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('IMAGEN NO DISPONIBLE', canvas.width / 2, canvas.height / 2 - 20);
    
    if (artwork?.titulo) {
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = '#34495e';
      ctx.fillText(`"${artwork.titulo}"`, canvas.width / 2, canvas.height / 2 + 40);
    }
    
    if (artwork?.autor) {
      ctx.font = '20px Arial, sans-serif';
      ctx.fillStyle = '#7f8c8d';
      ctx.fillText(artwork.autor, canvas.width / 2, canvas.height / 2 + 80);
    }
    
    // Patrón según tipo de obra
    if (artworkType === 'painting') {
      // Textura de pinceladas más realista
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#000000';
      for (let i = 0; i < 200; i++) {
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        const x1 = Math.random() * canvas.width;
        const y1 = Math.random() * canvas.height;
        const length = Math.random() * 50 + 20;
        const angle = Math.random() * Math.PI * 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (artworkType === 'photo') {
      // Patrón fotográfico con grain
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 15;
        data[i] += noise;     // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (artworkType === 'relief') {
      // Patrón de relieve con sombras
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 20 + 5,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
    
    // Título centrado si no hay imagen
    if (artwork?.titulo || artwork?.title) {
      const title = artwork.titulo || artwork.title;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.font = `${Math.floor(canvas.width/20)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Fondo para el texto
      const textMetrics = ctx.measureText(title);
      const textWidth = textMetrics.width;
      const textHeight = parseInt(ctx.font);
      
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(
        (canvas.width - textWidth) / 2 - 20,
        canvas.height / 2 - textHeight / 2 - 10,
        textWidth + 40,
        textHeight + 20
      );
      
      ctx.fillStyle = '#2c3e50';
      ctx.fillText(title, canvas.width / 2, canvas.height / 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.flipY = true; // Mantener orientación correcta también en fallback
    if (texture.colorSpace !== undefined) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: artworkType === 'photo' ? 0.1 : 0.7,
      metalness: 0.0
    });
  }, [artwork, artworkType, width, height, onAspect]);

  // Función helper para ajustar brillo
  function adjustBrightness(color, amount) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0.100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Animación sutil para obras especiales
  useFrame((state) => {
    if (canvasRef.current && artwork?.animated) {
      canvasRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <mesh 
      ref={canvasRef}
      position={[0, 0, 0.08]}
      material={artworkMaterial}
      castShadow
      receiveShadow
    >
      <planeGeometry args={[width, height]} />
    </mesh>
  );
});

const Artwork3D = React.memo(function Artwork3D({
  artwork,
  width = 12,
  height = 8,
  interactive = true
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [aspect, setAspect] = useState(null); // ancho/alto real de la imagen
  const [dims, setDims] = useState({ w: width, h: height });
  const [focused, setFocused] = useState(false);
  const { openModal } = useModal();
  const { camera } = useThree();
  const lampSpotRef = useRef(null);
  const lampTargetRef = useRef(null);
  const lampHeadRef = useRef(null);

  // Actualizar dimensiones cuando se conoce aspecto
  useEffect(() => {
    if (!aspect) return;
    const targetHeight = Math.min(Math.max(height, 4.5), 6.5); // permitir crecer hasta 6.5
    let targetWidth = targetHeight * aspect;
    const maxWidth = 10; // ampliar límite
    const minWidth = 2.5;
    if (targetWidth > maxWidth) targetWidth = maxWidth;
    if (targetWidth < minWidth) targetWidth = minWidth;
    setDims({ w: targetWidth, h: targetHeight });
  }, [aspect, height]);

  // Detección de foco (cámara mirando al cuadro)
  useFrame(() => {
    if (!groupRef.current) return;
    // Escala hover
    if (interactive) {
      const targetScale = hovered ? 1.02 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale,targetScale,targetScale), 0.1);
    }
    // Cálculo de foco
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const toArtwork = worldPos.clone().sub(camera.position).normalize();
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const facing = camDir.dot(toArtwork); // 1 si exacto
    const dist = camera.position.distanceTo(worldPos);
    const isFocused = facing > 0.985 && dist < 40; // umbral ajustable
    if (isFocused !== focused) setFocused(isFocused);
  });

  useEffect(() => {
    if (lampSpotRef.current && lampTargetRef.current) {
      lampSpotRef.current.target = lampTargetRef.current;
      lampSpotRef.current.target.updateMatrixWorld();
    }
    // Ya no usamos orientación dinámica; la cabeza se rota manualmente para apuntar hacia abajo y atrás
  }, [dims.h, dims.w]);

  const handlePointerOver = () => interactive && setHovered(true);
  const handlePointerOut = () => interactive && setHovered(false);
  const handleClick = (e) => {
    e.stopPropagation();
    if (artwork) openModal('artwork-modal', { artwork: { ...artwork } });
  };

  return (
    <group 
      ref={groupRef}
      scale={dims.w > width ? width / dims.w : 1}
      position={[0, 0, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      dispose={null}
    >
      <ArtworkCanvas
        width={dims.w}
        height={dims.h}
        artwork={artwork}
        artworkType={artwork?.tipo || 'painting'}
        onAspect={setAspect}
      />
      <ArtworkFrame
        width={dims.w}
        height={dims.h}
        depth={0.15}
        frameWidth={0.15}
        frameStyle={'classic'}
        material={'wood'}
        highlight={focused}
      />
      {/* Lámpara con brazo visible perpendicular a la pared */}
      <group position={[0, dims.h/2 + 0.42, 0.0]}> {/* origen sobre el cuadro */}
        {/* Placa de soporte contra la pared */}
        <mesh position={[0,-0.15,0]}>
          <boxGeometry args={[0.18,0.18,0.04]} />
          <meshStandardMaterial color="#3f3f3f" metalness={0.45} roughness={0.55} />
        </mesh>
        {/* Brazo horizontal más largo (sale más hacia afuera) */}
        <mesh position={[0,-0.15,0.425]} rotation={[Math.PI/2,0,0]}> {/* longitud 0.85 => centro 0.425 */}
          <cylinderGeometry args={[0.02,0.02,0.85,18]} />
          <meshStandardMaterial color="#505050" metalness={0.55} roughness={0.45} />
        </mesh>
        {/* Cabezal: rotado 180° respecto arriba (eje +Y -> -Z) y un poco inclinado hacia abajo */}
        <mesh ref={lampHeadRef} position={[0,-0.07,0.85]} rotation={[Math.PI/2.3,0,0]}> {/* PI/2 apunta a -Z; /2.3 añade ligero down */}
          <coneGeometry args={[0.18,0.28,24,1,true]} />
          <meshStandardMaterial color="#5a5a5a" metalness={0.45} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* Bombilla ajustada cerca del borde interior del cabezal */}
        <mesh position={[0,-0.065,0.80]}>
          <sphereGeometry args={[0.06,24,24]} />
          <meshStandardMaterial emissive={focused || hovered ? '#fff7d1' : '#e8dfc2'} emissiveIntensity={focused || hovered ? 2.15 : 1.2} color="#f8f4e8" />
        </mesh>
        {/* Spot apuntando hacia abajo y atrás al centro del canvas */}
        <spotLight
          ref={lampSpotRef}
          position={[0,-0.065,0.80]}
          angle={Math.PI/10}
          penumbra={0.9}
          intensity={focused || hovered ? 1.55 : 1.15}
          distance={3.8}
          decay={2}
          color={focused || hovered ? '#ffe4b0' : '#f9f5e8'}
          castShadow={false}
        />
        <mesh
          ref={lampTargetRef}
          position={[0, -(dims.h/2 + 0.42), 0.08]} /* centro del canvas algo hacia atrás (-Z) relativo al cabezal */
          visible={false}
        />
      </group>
      {/* Wash superior suave (ligeramente reducido) */}
      <spotLight
        position={[0, dims.h/2 + 1.15, 0.55]}
        intensity={0.48}
        angle={Math.PI / 5}
        penumbra={0.6}
        distance={7.5}
        decay={2}
        color={focused || hovered ? '#ffdca0' : '#f2f2f2'}
        castShadow={false}
      />
      {/* Luz de relleno frontal muy tenue */}
      <pointLight
        position={[0,0,1.05]}
        intensity={focused || hovered ? 0.2 : 0.11}
        distance={3.0}
        decay={2}
        color={'#fff7e2'}
      />
    </group>
  );
});

export default Artwork3D;

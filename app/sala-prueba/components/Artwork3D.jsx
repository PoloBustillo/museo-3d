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
  // URL de imagen real priorizada (si existe)
  const imageUrl = artwork?.imagenUrlWebp || artwork?.url_imagen || artwork?.imageUrl;
  
  const artworkMaterial = useMemo(() => {
    // Priorizar imagen real de la obra
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
  }, [imageUrl, artworkType, width, height, onAspect]);

  // Si la textura ya estaba en caché, emite el aspecto después del render (evita setState durante render)
  useEffect(() => {
    if (!imageUrl) return;
    const tx = textureCache.get(imageUrl);
    if (tx && tx.image && tx.image.width && tx.image.height) {
      onAspect(tx.image.width / tx.image.height);
    }
  }, [imageUrl, onAspect]);

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
  const lampHaloRef = useRef(null);
  const lampFillRef = useRef(null);
  const topWashRef = useRef(null);
  const frontFillRef = useRef(null);
  const floorSpotMainRef = useRef(null);
  const floorHaloRef = useRef(null);
  const floorFillRef = useRef(null);
  const wallBulbRef = useRef(null);
  const floorBulbRef = useRef(null);
  const focusedRef = useRef(false);
  const distRef = useRef(999);
  // Reusar vectores temporales para evitar GC por frame
  const tmpWorldPosRef = useRef(new THREE.Vector3());
  const tmpToArtworkRef = useRef(new THREE.Vector3());
  const tmpCamDirRef = useRef(new THREE.Vector3());
  // Colores cálidos memorizados (no recrear por frame)
  const warmStrong = useMemo(() => new THREE.Color('#ffaa44'), []);
  const warmSoft = useMemo(() => new THREE.Color('#ff8c00'), []);
  const warmStrong2 = useMemo(() => new THREE.Color('#ffb347'), []);
  const warmSoft2 = useMemo(() => new THREE.Color('#ff9500'), []);
  const tmpScaleRef = useRef(new THREE.Vector3(1,1,1));

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

  // Animación por frame (sin setState): escala hover, luces y LOD por refs
  useFrame(() => {
    if (!groupRef.current) return;
    // Escala hover sutil
    if (interactive) {
      const targetScale = hovered ? 1.02 : 1.0;
  tmpScaleRef.current.set(targetScale, targetScale, targetScale);
  groupRef.current.scale.lerp(tmpScaleRef.current, 0.15);
    }
    // Usar flags precalculados (intervalo) para reducir costo por frame
    // Target según foco o hover
    const active = (focusedRef.current || hovered) ? 1 : 0;

    // Luces de pared (solo activas si hay foco/hover)
    if (lampSpotRef.current) {
      lampSpotRef.current.visible = !!active;
      if (active) {
        const cur = lampSpotRef.current.intensity;
        const tgt = 6.8;
        lampSpotRef.current.intensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
      }
    }
    if (lampHaloRef.current) {
      lampHaloRef.current.visible = !!active;
      if (active) {
        const cur = lampHaloRef.current.intensity;
        const tgt = 2.0;
        lampHaloRef.current.intensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
      }
    }
    if (lampFillRef.current) {
      lampFillRef.current.visible = !!active;
      if (active) {
        const cur = lampFillRef.current.intensity;
        const tgt = 0.9;
        lampFillRef.current.intensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
      }
    }
    if (topWashRef.current) {
      topWashRef.current.visible = !!active;
    }
    if (frontFillRef.current) {
      frontFillRef.current.visible = !!active;
    }

    // Luces de piso
    if (floorSpotMainRef.current) {
      floorSpotMainRef.current.visible = !!active;
      if (active) {
        const cur = floorSpotMainRef.current.intensity;
        const tgt = 12.0;
        floorSpotMainRef.current.intensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
      }
    }
    if (floorHaloRef.current) {
      floorHaloRef.current.visible = !!active;
      if (active) {
        const cur = floorHaloRef.current.intensity;
        const tgt = 3.8;
        floorHaloRef.current.intensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
      }
    }
    if (floorFillRef.current) {
      floorFillRef.current.visible = !!active;
      if (active) {
        const cur = floorFillRef.current.intensity;
        const tgt = 1.2;
        floorFillRef.current.intensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
      }
    }

    // Emisión de bombillas (usar colores memorizados)
    if (wallBulbRef.current?.material) {
      const mat = wallBulbRef.current.material;
      const targetColor = (focusedRef.current || hovered) ? warmStrong : warmSoft;
      mat.emissive.lerp(targetColor, 0.15);
      const cur = mat.emissiveIntensity;
      const tgt = (focusedRef.current || hovered) ? 5.5 : 3.8;
      mat.emissiveIntensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
    }
    if (floorBulbRef.current?.material) {
      const mat = floorBulbRef.current.material;
      const targetColor = (focusedRef.current || hovered) ? warmStrong2 : warmSoft2;
      mat.emissive.lerp(targetColor, 0.15);
      const cur = mat.emissiveIntensity;
      const tgt = (focusedRef.current || hovered) ? 6.0 : 4.2;
      mat.emissiveIntensity = THREE.MathUtils.lerp(cur, tgt, 0.12);
    }

    // LOD simple: ocultar detalles de piso si muy lejos
  const detailsVisible = active; // detalles solo si activo
    if (floorSpotMainRef.current) floorSpotMainRef.current.visible = detailsVisible;
    if (floorHaloRef.current) floorHaloRef.current.visible = detailsVisible;
    if (floorFillRef.current) floorFillRef.current.visible = detailsVisible;
    if (floorBulbRef.current) floorBulbRef.current.visible = detailsVisible;
  });

  // Cálculo de foco y distancia fuera de useFrame (cada ~300ms) para reducir carga
  useEffect(() => {
    const id = setInterval(() => {
      if (!groupRef.current) return;
      const worldPos = tmpWorldPosRef.current;
      groupRef.current.getWorldPosition(worldPos);
      const toArtwork = tmpToArtworkRef.current.copy(worldPos).sub(camera.position).normalize();
      camera.getWorldDirection(tmpCamDirRef.current);
      const facing = tmpCamDirRef.current.dot(toArtwork);
      const dist = camera.position.distanceTo(worldPos);
      distRef.current = dist;
      const isFocused = facing > 0.985 && dist < 40;
      setFocused(prev => (prev !== isFocused ? isFocused : prev));
      focusedRef.current = isFocused;
    }, 300);
    return () => clearInterval(id);
  }, [camera]);

  useEffect(() => {
    if (lampSpotRef.current && lampTargetRef.current) {
      lampSpotRef.current.target = lampTargetRef.current;
      lampSpotRef.current.target.updateMatrixWorld();
    }
    // Re-orientar cabeza: apuntar el eje +Y del cono hacia el target (centro canvas) = giro efectivo de 180° respecto a orientación hacia afuera
    if (lampHeadRef.current && lampTargetRef.current) {
      const headPos = new THREE.Vector3();
      const targetPos = new THREE.Vector3();
      lampHeadRef.current.getWorldPosition(headPos);
      lampTargetRef.current.getWorldPosition(targetPos);
      const dir = targetPos.sub(headPos).normalize();
      const from = new THREE.Vector3(0,1,0); // eje +Y geom del cono
      const q = new THREE.Quaternion().setFromUnitVectors(from, dir);
      lampHeadRef.current.quaternion.copy(q);
    }
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
          <meshStandardMaterial color="#3f3f3f" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Brazo aún más largo para separar la lámpara y permitir ángulo pronunciado */}
        <mesh position={[0,-0.15,0.62]} rotation={[Math.PI/2,0,0]}> {/* longitud 1.24 => centro 0.62 */}
          <cylinderGeometry args={[0.022,0.022,1.24,20]} />
          <meshStandardMaterial color="#525252" metalness={0.6} roughness={0.42} />
        </mesh>
        {/* Cabezal (orientación dinámica) */}
        <mesh ref={lampHeadRef} position={[0,-0.075,1.24]}> {/* lookAt en effect => boca hacia la obra */}
          <coneGeometry args={[0.2,0.32,26,1,true]} />
          <meshStandardMaterial color="#5c5c5c" metalness={0.5} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* Bombilla más brillante con luz cálida intensa */}
        <mesh ref={wallBulbRef} position={[0,-0.07,1.18]}>
          <sphereGeometry args={[0.065,26,26]} />
          <meshStandardMaterial emissive={'#ff8c00'} emissiveIntensity={3.8} color="#ffa500" />
        </mesh>
        {/* Spot principal MUY intensificado hacia la obra con luz cálida */}
        <spotLight
          ref={lampSpotRef}
          position={[0,-0.07,1.18]}
          angle={Math.PI/5.2}
          penumbra={0.95}
          intensity={4.5}
          distance={6.5}
          decay={2}
          color={'#ff8c00'}
          castShadow={false}
        />
        {/* Target centrado canvas (ligeramente por delante del plano para evitar z-fighting) */}
        <mesh
          ref={lampTargetRef}
          position={[0, -(dims.h/2 + 0.42), 0.09]}
          visible={false}
        />
        {/* Halo secundario más amplio con luz cálida */}
        <spotLight
          ref={lampHaloRef}
          position={[0,-0.07,1.18]}
          angle={Math.PI/3.2}
          penumbra={1}
          intensity={1.4}
          distance={5.0}
          decay={2}
          color={'#ffb347'}
          castShadow={false}
        />
        {/* Relleno difuso extra cálido */}
        <pointLight
          ref={lampFillRef}
          position={[0,-0.12,0.45]}
          intensity={0.6}
          distance={2.2}
          decay={2}
          color={'#ff8c00'}
        />
      </group>
      {/* Wash superior reducido aún más para no competir con la lámpara individual */}
      <spotLight
        ref={topWashRef}
        position={[0, dims.h/2 + 1.1, 0.55]}
        intensity={0.18}
        angle={Math.PI / 5.2}
        penumbra={0.5}
        distance={5.5}
        decay={2}
        color={'#ececec'}
        castShadow={false}
      />
      {/* Relleno frontal muy tenue */}
      <pointLight
        ref={frontFillRef}
        position={[0,0,1.05]}
        intensity={0.09}
        distance={2.6}
        decay={2}
        color={'#fff7e2'}
      />
      
      {/* Lámpara de piso en el suelo apuntando a la obra */}
      <group position={[0, -4.8, 1.8]}> {/* Y=-4.8 = nivel del piso, Z=1.8m separada de la pared */}
        {/* Base circular en el piso */}
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Poste vertical hasta altura media del cuadro */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3.0, 24]} />
          <meshStandardMaterial color="#2d2d2d" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Cabezal dirigible apuntando al cuadro */}
        <mesh position={[0, 3.0, 0]} rotation={[-Math.PI/4, 0, 0]}>
          <coneGeometry args={[0.35, 0.5, 32, 1, true]} />
          <meshStandardMaterial color="#404040" metalness={0.6} roughness={0.35} />
        </mesh>
        
        {/* Bombilla cálida intensa dentro del cabezal */}
        <mesh ref={floorBulbRef} position={[0, 2.85, 0.1]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial emissive={'#ff9500'} emissiveIntensity={4.2} color="#ffa500" />
        </mesh>
        
        {/* Spotlight principal muy intenso con luz cálida */}
        <spotLight
          ref={floorSpotMainRef}
          position={[0, 2.85, 0.1]}
          target-position={[0, 0, -1.8]} /* apunta al centro de la obra */
          angle={Math.PI/7}
          penumbra={0.7}
          intensity={8.5}
          distance={15}
          decay={1.8}
          color={'#ff8c00'}
          castShadow={false}
        />
        
        {/* Halo cálido amplio para envolver toda la obra */}
        <spotLight
          ref={floorHaloRef}
          position={[0, 2.85, 0.1]}
          target-position={[0, 0, -1.8]}
          angle={Math.PI/3.5}
          penumbra={1}
          intensity={2.8}
          distance={10}
          decay={2}
          color={'#ffb347'}
          castShadow={false}
        />
        
        {/* Luz de relleno cálida extra para eliminar sombras duras */}
        <pointLight
          ref={floorFillRef}
          position={[0, 2.5, 0]}
          intensity={0.8}
          distance={6}
          decay={2}
          color={'#ffa500'}
        />
      </group>
    </group>
  );
});

export default Artwork3D;

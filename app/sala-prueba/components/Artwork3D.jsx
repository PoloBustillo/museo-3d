/**
 * Componente de obra de arte 3D con marco y detalles
 * Soporta diferentes tipos de obras: pintura, fotografía, relieve, etc.
 */
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { RoundedPlaneGeometry } from 'maath/geometry';

// Registrar geometría personalizada
extend({ RoundedPlaneGeometry });

// Cache simple de texturas por URL para evitar recargas repetidas
const textureCache = new Map();

const ArtworkFrame = React.memo(function ArtworkFrame({ 
  width = 4, 
  height = 3, 
  depth = 0.1,
  frameWidth = 0.15,
  frameStyle = 'classic', // 'classic', 'modern', 'ornate', 'minimal'
  material = 'wood' // 'wood', 'metal', 'gold', 'silver'
}) {
  const frameMaterials = useMemo(() => {
    const materials = {
      wood: new THREE.MeshStandardMaterial({
        color: '#8b4513',
        roughness: 0.8,
        metalness: 0.1,
        normalScale: new THREE.Vector2(0.3, 0.3)
      }),
      metal: new THREE.MeshStandardMaterial({
        color: '#2c2c2c',
        roughness: 0.3,
        metalness: 0.9
      }),
      gold: new THREE.MeshStandardMaterial({
        color: '#ffd700',
        roughness: 0.2,
        metalness: 0.8
      }),
      silver: new THREE.MeshStandardMaterial({
        color: '#c0c0c0',
        roughness: 0.1,
        metalness: 0.9
      })
    };
    return materials[material] || materials.wood;
  }, [material]);

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
  artworkType = 'painting' // 'painting', 'photo', 'relief', 'mixed'
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
            tx.wrapS = THREE.ClampToEdgeWrapping;
            tx.wrapT = THREE.ClampToEdgeWrapping;
            tx.generateMipmaps = false;
            tx.minFilter = THREE.LinearFilter;
            tx.magFilter = THREE.LinearFilter;
            tx.flipY = true; // orientación correcta
            if (tx.colorSpace !== undefined) {
              tx.colorSpace = THREE.SRGBColorSpace;
            }
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
  }, [artwork, artworkType, width, height]);

  // Función helper para ajustar brillo
  function adjustBrightness(color, amount) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
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

const ArtworkPlaque = React.memo(function ArtworkPlaque({
  artwork,
  position = [0, -2.8, 0.18] // Un poco más al frente para evitar z-fighting con pared
}) {
  const textTexture = useMemo(() => {
    if (!artwork) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 896; // Resolución aumentada para mejor calidad
    canvas.height = 448;
    const ctx = canvas.getContext('2d');
    
    // Fondo con gradiente radial elegante
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width / 2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.7, '#fafafa');
    gradient.addColorStop(1, '#f0f0f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Marco exterior con sombra
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    
    // Marco principal
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
    
    // Borde dorado fino
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Configuración de texto mejorada
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let yOffset = 85;
    const maxWidth = canvas.width - 60;
    
    // Título principal con mejor espaciado
    if (artwork.titulo || artwork.title) {
      ctx.font = 'bold 38px "Playfair Display", "Times New Roman", serif';
      ctx.fillStyle = '#1a1a1a';
      const title = artwork.titulo || artwork.title;
      
      // Efecto de relieve en el texto
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 1;
      
      // Dividir título si es muy largo
      const words = title.split(' ');
      let lines = [];
      let currentLine = '';
      
      for (let word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, yOffset + (index * 45));
      });
      
      yOffset += lines.length * 45 + 20;
    }
    
    // Resetear sombra del texto
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Línea decorativa elegante
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 80, yOffset);
    ctx.lineTo(centerX + 80, yOffset);
    ctx.stroke();
    yOffset += 35;
    
    // Artista y año con mejor formato
    if (artwork.autor || artwork.artist) {
      ctx.font = '28px "Crimson Text", "Georgia", serif';
      ctx.fillStyle = '#2c3e50';
      const artist = artwork.autor || artwork.artist;
      const year = artwork.anio || artwork.year;
      const artistText = year ? `${artist}, ${year}` : artist;
      
      // Dividir si es muy largo
      const metrics = ctx.measureText(artistText);
      if (metrics.width > maxWidth) {
        ctx.fillText(artist, centerX, yOffset);
        yOffset += 35;
        if (year) {
          ctx.font = '24px "Crimson Text", "Georgia", serif';
          ctx.fillText(year.toString(), centerX, yOffset);
          yOffset += 35;
        }
      } else {
        ctx.fillText(artistText, centerX, yOffset);
        yOffset += 40;
      }
    }
    
    // Técnica con mejor estilo
    if (artwork.tecnica || artwork.technique) {
      ctx.font = 'italic 22px "Crimson Text", "Georgia", serif';
      ctx.fillStyle = '#7f8c8d';
      const technique = artwork.tecnica || artwork.technique;
      ctx.fillText(technique, centerX, yOffset);
      yOffset += 45;
    }
    
    // Descripción mejorada con mejor tipografía
    if (artwork.descripcion && artwork.descripcion.length < 120) {
      ctx.font = '16px "Open Sans", Arial, sans-serif';
      ctx.fillStyle = '#34495e';
      const words = artwork.descripcion.split(' ');
      let line = '';
      let lineHeight = 22;
      const maxWidth = canvas.width - 80;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, yOffset);
          line = words[i] + ' ';
          yOffset += lineHeight;
          
          // Limitar a 3 líneas máximo
          if (yOffset > canvas.height - 60) break;
        } else {
          line = testLine;
        }
      }
      
      if (line.trim()) {
        ctx.fillText(line, canvas.width / 2, yOffset);
      }
    }
    
  const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
  texture.flipY = true; // Mantener orientación correcta del texto en la placa
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    if (texture.colorSpace !== undefined) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    
    return texture;
  }, [
    artwork?.titulo, 
    artwork?.title, 
    artwork?.autor, 
    artwork?.artist, 
    artwork?.anio, 
    artwork?.year, 
    artwork?.tecnica, 
    artwork?.technique,
    artwork?.descripcion
  ]);

  if (!artwork || !textTexture) return null;

  return (
    <group position={position}>
      {/* Backplate sutil para separar del muro */}
      <mesh position={[0, 0, -0.03]} castShadow>
        <roundedPlaneGeometry args={[5.3, 3.0, 0.15]} />
        <meshStandardMaterial 
          color="#ececec"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Placa metálica moderna */}
      <mesh position={[0, 0, -0.015]} castShadow>
        <roundedPlaneGeometry args={[5.0, 2.8, 0.12]} />
        <meshStandardMaterial 
          color="#f6f2e7"
          roughness={0.35}
          metalness={0.35}
        />
      </mesh>
      
      {/* Texto principal de la placa */}
      <mesh position={[0, 0, -0.01]} castShadow>
        <planeGeometry args={[4.7, 2.5]} />
        <meshStandardMaterial 
          map={textTexture}
          transparent={false}
          side={THREE.FrontSide}
          roughness={0.5}
          metalness={0.0}
          toneMapped
        />
      </mesh>

      {/* Luz sutil dedicada a la placa */}
      <spotLight
        position={[0, 0.6, 0.2]}
        target-position={[0, 0, 0]}
        intensity={0.6}
        color="#fff6d5"
        angle={Math.PI / 6}
        penumbra={0.8}
        distance={3}
        decay={2}
        castShadow={false}
      />
    </group>
  );
});

const Artwork3D = React.memo(function Artwork3D({
  artwork,
  width = 6, // Aumentado de 4 a 6
  height = 4.5, // Aumentado de 3 a 4.5
  showPlaque = true,
  interactive = false,
  plaqueDistance = 12 // Mostrar placa cuando la cámara esté a < 12m
}) {
  const groupRef = useRef();
  const frameCounter = useRef(0);
  const plaqueVisibleRef = useRef(true);
  const [plaqueVisible, setPlaqueVisible] = useState(true);
  const [hovered, setHovered] = React.useState(false);
  const { camera } = useThree();
  
  const artworkType = artwork?.type || 'painting';
  const frameStyle = artwork?.frameStyle || 'classic';
  const frameMaterial = artwork?.frameMaterial || 'wood';
  
  // Efecto de hover + LOD de placa por distancia (con throttling)
  useFrame(() => {
    if (groupRef.current && interactive) {
      const targetScale = hovered ? 1.02 : 1.0;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale), 
        0.1
      );
    }
    if (!groupRef.current) return;
    // Reducir cálculos (cada ~6 frames)
    frameCounter.current = (frameCounter.current + 1) % 6;
    if (frameCounter.current !== 0) return;
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const dist = worldPos.distanceTo(camera.position);
    const shouldShow = hovered || dist < plaqueDistance;
    if (shouldShow !== plaqueVisibleRef.current) {
      plaqueVisibleRef.current = shouldShow;
      setPlaqueVisible(shouldShow);
    }
  });

  const handlePointerOver = () => interactive && setHovered(true);
  const handlePointerOut = () => interactive && setHovered(false);

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Marco */}
      <ArtworkFrame 
        width={width}
        height={height}
        frameStyle={frameStyle}
        material={frameMaterial}
      />
      
      {/* Lienzo/obra */}
      <ArtworkCanvas 
        width={width}
        height={height}
        artwork={artwork}
        artworkType={artworkType}
      />
      
  {/* Placa informativa con LOD por distancia */}
  {showPlaque && plaqueVisible && (
        <ArtworkPlaque 
          artwork={artwork}
          position={[0, -height/2 - 1.2, 0.1]} // Ajustada para obras más grandes
        />
      )}
      
      {/* Sombra del marco mejorada */}
      <mesh position={[0, 0, -0.05]} receiveShadow>
        <planeGeometry args={[width + 0.5, height + 0.5]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
      {/* Luz focal para la obra */}
      <spotLight
        position={[0, 0, 3]}
        target-position={[0, 0, 0]}
        intensity={0.5}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={10}
        decay={2}
        castShadow={false}
      />
    </group>
  );
});

export default Artwork3D;

/**
 * Componente de obra de arte 3D con marco y detalles
 * Soporta diferentes tipos de obras: pintura, fotografía, relieve, etc.
 */
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

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
    if (artwork?.imageUrl) {
      const loader = new THREE.TextureLoader();
      const texture = loader.load(artwork.imageUrl);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: artworkType === 'photo' ? 0.1 : 0.7,
        metalness: 0.0
      });
    }
    
    // Placeholder con color y patrón
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    
    // Color base
    ctx.fillStyle = artwork?.color || '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Patrón según tipo de obra
    if (artworkType === 'painting') {
      // Textura de pinceladas
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(
          Math.random() * canvas.width, 
          Math.random() * canvas.height
        );
        ctx.stroke();
      }
    } else if (artworkType === 'photo') {
      // Patrón fotográfico sutil
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] += noise;     // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B
      }
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Título de la obra
    if (artwork?.title) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(artwork.title, canvas.width/2, canvas.height - 30);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: artworkType === 'photo' ? 0.1 : 0.7,
      metalness: 0.0
    });
  }, [artwork, artworkType, width, height]);

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
  position = [0, -2, 0.1]
}) {
  const plaqueText = useMemo(() => {
    if (!artwork) return '';
    
    let text = '';
    if (artwork.title) text += artwork.title;
    if (artwork.artist) text += `\n${artwork.artist}`;
    if (artwork.year) text += `, ${artwork.year}`;
    if (artwork.technique) text += `\n${artwork.technique}`;
    
    return text;
  }, [artwork]);

  const textTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Fondo de la placa
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    // Texto
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    const lines = plaqueText.split('\n');
    const lineHeight = 16;
    const startY = (canvas.height - (lines.length * lineHeight)) / 2 + lineHeight;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [plaqueText]);

  if (!plaqueText) return null;

  return (
    <mesh position={position}>
      <planeGeometry args={[2, 1]} />
      <meshStandardMaterial 
        map={textTexture}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
});

const Artwork3D = React.memo(function Artwork3D({
  artwork,
  width = 4,
  height = 3,
  showPlaque = true,
  interactive = false
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  
  const artworkType = artwork?.type || 'painting';
  const frameStyle = artwork?.frameStyle || 'classic';
  const frameMaterial = artwork?.frameMaterial || 'wood';
  
  // Efecto de hover
  useFrame(() => {
    if (groupRef.current && interactive) {
      const targetScale = hovered ? 1.02 : 1.0;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale), 
        0.1
      );
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
      
      {/* Placa informativa */}
      {showPlaque && (
        <ArtworkPlaque 
          artwork={artwork}
          position={[0, -height/2 - 0.8, 0.1]}
        />
      )}
      
      {/* Sombra del marco */}
      <mesh position={[0, 0, -0.02]} receiveShadow>
        <planeGeometry args={[width + 0.3, height + 0.3]} />
        <shadowMaterial transparent opacity={0.3} />
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

/**
 * Lámparas profesionales optimizadas para ambiente oscuro
 * Sistema de iluminación direccional hacia el piso
 */
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

const ProfessionalCeilingLamp = React.memo(function ProfessionalCeilingLamp({ 
  position, 
  intensity = 6.0, 
  color = "#ffffff",
  distance = 30,
  size = 1.0
}) {
  // Materiales con texturas procedurales avanzadas
  const materials = useMemo(() => {
    // Generador de textura procedural para metal
    const createMetalTexture = (baseColor, size = 256, scratches = true) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Base color
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, size, size);
      
      // Noise pattern
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Scratches and wear
      if (scratches) {
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * size, Math.random() * size);
          ctx.lineTo(Math.random() * size, Math.random() * size);
          ctx.stroke();
        }
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    // Generador de textura para reflector
    const createReflectorTexture = (size = 512) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Base reflective surface
      const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.7, '#f0f0f0');
      gradient.addColorStop(1, '#e0e0e0');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Concentric circles for reflector pattern
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(size/2, size/2, (size/2) * (i/8), 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Subtle radial lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(size/2, size/2);
        ctx.lineTo(
          size/2 + Math.cos(angle) * size/2,
          size/2 + Math.sin(angle) * size/2
        );
        ctx.stroke();
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    // Crear texturas
    const metalTexture = createMetalTexture('#1a1a1a', 256, true);
    const chromeTexture = createMetalTexture('#e8e8e8', 256, false);
    const reflectorTexture = createReflectorTexture(512);
    
    // Configurar texturas
    [metalTexture, chromeTexture, reflectorTexture].forEach(tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
    });

    return {
      blackMetal: new THREE.MeshStandardMaterial({
        color: '#2a2a2a',
        metalness: 0.9,
        roughness: 0.4,
        map: metalTexture,
        bumpMap: metalTexture,
        bumpScale: 0.02,
        side: THREE.FrontSide
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: '#f0f0f0',
        metalness: 0.95,
        roughness: 0.08,
        map: chromeTexture,
        bumpMap: chromeTexture,
        bumpScale: 0.01,
        side: THREE.FrontSide
      }),
      reflector: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.9,
        roughness: 0.18,
        map: reflectorTexture,
        roughnessMap: reflectorTexture,
        side: THREE.DoubleSide
      }),
      led: new THREE.MeshStandardMaterial({
        color: '#fff9e6',
        emissive: '#ffecd1',
        emissiveIntensity: 1.1,
        roughness: 0.7,
        side: THREE.DoubleSide
      })
    };
  }, []);

  return (
    <group position={position}>
      {/* Soporte del techo mejorado */}
      <mesh position={[0, 0.1, 0]} material={materials.blackMetal}>
        <boxGeometry args={[0.8 * size, 0.1 * size, 0.1 * size]} />
      </mesh>
      
      {/* Detalle decorativo del soporte */}
      <mesh position={[0, 0.05, 0]} material={materials.chrome}>
        <cylinderGeometry args={[0.05 * size, 0.05 * size, 0.12 * size, 8]} />
      </mesh>
      
      {/* Cable de suspensión con más resolución */}
      <mesh position={[0, -0.3 * size, 0]} material={materials.chrome}>
        <cylinderGeometry args={[0.018 * size, 0.018 * size, 0.6 * size, 12]} />
      </mesh>
      
      {/* Conector superior */}
      <mesh position={[0, -0.05 * size, 0]} material={materials.blackMetal}>
        <cylinderGeometry args={[0.04 * size, 0.04 * size, 0.08 * size, 8]} />
      </mesh>
      
      {/* Cuerpo principal con más detalle */}
      <mesh position={[0, -0.8 * size, 0]} material={materials.blackMetal}>
        <cylinderGeometry args={[0.35 * size, 0.42 * size, 0.65 * size, 24]} />
      </mesh>
      
      {/* Anillo decorativo superior del cuerpo */}
      <mesh position={[0, -0.5 * size, 0]} material={materials.chrome}>
        <cylinderGeometry args={[0.44 * size, 0.44 * size, 0.04 * size, 24]} />
      </mesh>
      
      {/* Anillo decorativo inferior del cuerpo */}
      <mesh position={[0, -1.1 * size, 0]} material={materials.chrome}>
        <cylinderGeometry args={[0.36 * size, 0.36 * size, 0.03 * size, 24]} />
      </mesh>
      
      {/* Reflector interior principal */}
      <mesh position={[0, -0.95 * size, 0]} material={materials.reflector}>
        <cylinderGeometry args={[0.32 * size, 0.37 * size, 0.12 * size, 32]} />
      </mesh>
      
      {/* Reflector interior secundario (anillos concentricos) */}
      <mesh position={[0, -0.89 * size, 0]} material={materials.reflector}>
        <cylinderGeometry args={[0.28 * size, 0.33 * size, 0.05 * size, 32]} />
      </mesh>
      
      {/* LED central mejorado */}
      <mesh position={[0, -0.92 * size, 0]} material={materials.led}>
        <cylinderGeometry args={[0.22 * size, 0.22 * size, 0.03 * size, 16]} />
      </mesh>
      
      {/* LED anillo exterior */}
      <mesh position={[0, -0.94 * size, 0]} material={materials.led}>
        <ringGeometry args={[0.24 * size, 0.26 * size, 16]} />
      </mesh>

      {/* Luz sutil del LED para visibilidad interna */}
      <pointLight
        position={[0, -0.92 * size, 0]}
        intensity={0.6}
        distance={3.0}
        color={color}
        decay={2}
      />
      
      {/* SpotLight principal direccionado hacia abajo */}
      <spotLight
        position={[0, -1.1 * size, 0]}
        target-position={[0, -15, 0]}
        intensity={intensity}
        color={color}
        distance={distance}
        angle={Math.PI / 2.2}
        penumbra={0.5}
        decay={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={25}
        shadow-bias={-0.0001}
      />
      
      {/* PointLight para iluminación local */}
      <pointLight
        position={[0, -0.9 * size, 0]}
        intensity={intensity * 0.3}
        color={color}
        distance={distance * 0.4}
        decay={2}
      />
    </group>
  );
});

const ProfessionalCeilingLamps = React.memo(function ProfessionalCeilingLamps({ 
  hallDimensions, 
  exploring = false 
}) {
  const { width, height, length } = hallDimensions;
  
  // Configuración optimizada para ambiente oscuro con luces potentes
  const lampConfigs = [
    // Lámpara central principal - muy potente
    { 
      position: [0, height - 0.1, 0],
      size: 1.3,
      intensity: exploring ? 8.0 : 6.0,
      color: "#ffffff"
    },
    
    // Lámparas laterales frontales
    { 
      position: [-width * 0.35, height - 0.15, length * 0.3],
      size: 1.1,
      intensity: exploring ? 7.0 : 5.5,
      color: "#ffffff"
    },
    { 
      position: [width * 0.35, height - 0.15, length * 0.3],
      size: 1.1,
      intensity: exploring ? 7.0 : 5.5,
      color: "#ffffff"
    },
    
    // Lámparas traseras
    { 
      position: [-width * 0.25, height - 0.2, -length * 0.25],
      size: 1.0,
      intensity: exploring ? 6.5 : 5.0,
      color: "#ffffff"
    },
    { 
      position: [width * 0.25, height - 0.2, -length * 0.25],
      size: 1.0,
      intensity: exploring ? 6.5 : 5.0,
      color: "#ffffff"
    },
    
    // Lámpara trasera central
    { 
      position: [0, height - 0.18, -length * 0.35],
      size: 0.9,
      intensity: exploring ? 6.0 : 4.5,
      color: "#ffffff"
    }
  ];
  
  return (
    <group>
      {lampConfigs.map((config, index) => (
        <ProfessionalCeilingLamp
          key={`professional-lamp-${index}`}
          position={config.position}
          size={config.size}
          intensity={config.intensity}
          color={config.color}
          distance={exploring ? 35 : 30}
        />
      ))}
    </group>
  );
});

export { ProfessionalCeilingLamp, ProfessionalCeilingLamps as CeilingLamps };

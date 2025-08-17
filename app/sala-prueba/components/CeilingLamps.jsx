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
  // Materiales optimizados
  const materials = useMemo(() => ({
    blackMetal: new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.9,
      roughness: 0.3
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: '#e8e8e8',
      metalness: 0.95,
      roughness: 0.05
    }),
    reflector: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.95,
      roughness: 0.02
    }),
    led: new THREE.MeshStandardMaterial({
      color: '#fff5e6',
      emissive: '#fff2e6',
      emissiveIntensity: 0.2
    })
  }), []);

  return (
    <group position={position}>
      {/* Soporte del techo */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6 * size, 0.08 * size, 0.08 * size]} />
        <primitive object={materials.blackMetal} />
      </mesh>
      
      {/* Cable de suspensión */}
      <mesh position={[0, -0.3 * size, 0]}>
        <cylinderGeometry args={[0.015 * size, 0.015 * size, 0.6 * size, 8]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* Cuerpo principal */}
      <mesh position={[0, -0.8 * size, 0]}>
        <cylinderGeometry args={[0.35 * size, 0.4 * size, 0.6 * size, 16]} />
        <primitive object={materials.blackMetal} />
      </mesh>
      
      {/* Reflector interior */}
      <mesh position={[0, -0.95 * size, 0]}>
        <cylinderGeometry args={[0.32 * size, 0.37 * size, 0.1 * size, 16]} />
        <primitive object={materials.reflector} />
      </mesh>
      
      {/* LED central */}
      <mesh position={[0, -0.9 * size, 0]}>
        <cylinderGeometry args={[0.25 * size, 0.25 * size, 0.02 * size, 12]} />
        <primitive object={materials.led} />
      </mesh>
      
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

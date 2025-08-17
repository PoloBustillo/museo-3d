/**
 * Efectos volumétricos profesionales
 * Luz volumétrica real con rayos de luz visibles y atmosphere
 */
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VolumetricLightEffects = React.memo(function VolumetricLightEffects({ 
  exploring = false,
  lampPositions = []
}) {
  const dustRef = useRef();
  const lightBeamsRef = useRef();
  
  // Partículas de polvo más realistas
  const dustSystem = useMemo(() => {
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Distribución espacial natural
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Velocidades sutiles
      velocities[i * 3] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 1] = Math.random() * 0.001 + 0.0005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
      
      // Tamaños variables
      sizes[i] = Math.random() * 0.08 + 0.02;
      alphas[i] = Math.random() * 0.8 + 0.2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    return geometry;
  }, []);
  
  const dustMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      color: '#ffffff',
      transparent: true,
      opacity: exploring ? 0.6 : 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false
    });
  }, [exploring]);
  
  // Animación realista de partículas
  useFrame((state, delta) => {
    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array;
      const velocities = dustRef.current.geometry.attributes.velocity.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Movimiento con velocidades persistentes
        positions[i] += velocities[i] + Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.0001;
        positions[i + 1] += velocities[i + 1] + Math.sin(state.clock.elapsedTime * 0.05 + i) * 0.0002;
        positions[i + 2] += velocities[i + 2] + Math.cos(state.clock.elapsedTime * 0.08 + i) * 0.0001;
        
        // Reciclado de partículas
        if (positions[i + 1] > 6.5) {
          positions[i + 1] = -0.5;
          positions[i] = (Math.random() - 0.5) * 12;
          positions[i + 2] = (Math.random() - 0.5) * 10;
        }
        
        // Límites laterales con rebote suave
        if (Math.abs(positions[i]) > 6) {
          velocities[i] *= -0.8;
        }
        if (Math.abs(positions[i + 2]) > 5) {
          velocities[i + 2] *= -0.8;
        }
      }
      
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <group>
      {/* Sistema de partículas realista */}
      <points ref={dustRef} geometry={dustSystem} material={dustMaterial} />
      
      {/* Rayos de luz volumétricos desde cada lámpara */}
      {lampPositions.map((position, index) => (
        <group key={`light-beam-${index}`} position={position}>
          {/* Cono principal de luz */}
          <mesh position={[0, -3, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[3.5, 6, 12, 1, true]} />
            <meshBasicMaterial
              color="#fff5e6"
              transparent
              opacity={exploring ? 0.12 : 0.08}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          
          {/* Núcleo intenso del haz */}
          <mesh position={[0, -2.5, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[1.5, 5, 8, 1, true]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={exploring ? 0.2 : 0.15}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          
          {/* Halo de dispersión en la fuente */}
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.8, 8, 6]} />
            <meshBasicMaterial
              color="#fff8f0"
              transparent
              opacity={exploring ? 0.15 : 0.1}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
      
      {/* Niebla volumétrica de fondo */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[15, 8, 12]} />
        <meshBasicMaterial
          color="#f8f8ff"
          transparent
          opacity={exploring ? 0.02 : 0.015}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Resplandor en el suelo más realista */}
      {lampPositions.slice(0, 3).map((position, index) => (
        <mesh 
          key={`floor-glow-${index}`}
          position={[position[0], 0.02, position[2]]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[4, 16]} />
          <meshBasicMaterial
            color="#fff2e6"
            transparent
            opacity={exploring ? 0.08 : 0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
});

export default VolumetricLightEffects;

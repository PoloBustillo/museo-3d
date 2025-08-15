import React, { useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Componente para la mesa de café industrial con texturas reales del modelo 3D
 */
export function IndustrialCoffeeTable({ position = [0, 0, 0], scale = 1 }) {
  const group = useRef();

  // Cargar solo la textura de color (diffuse) que está en formato JPG
  const diffuseMap = useTexture(
    "/assets/models/industrial_coffee_table_1k.blend/textures/industrial_coffee_table_diff_1k.jpg"
  );

  // Configurar textura para mejor calidad
  useEffect(() => {
    if (diffuseMap) {
      diffuseMap.flipY = false;
      diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
      diffuseMap.repeat.set(1, 1);
    }
  }, [diffuseMap]);

  // Mesa industrial recreada con la textura original de color
  return (
    <group ref={group} position={position} scale={[scale, scale, scale]}>
      {/* Superficie principal de madera con textura real */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.08, 32]} />
        <meshPhysicalMaterial
          map={diffuseMap}
          color="#ffffff" // Dejar que la textura domine
          metalness={0.1}
          roughness={0.6}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Bordes de metal */}
      <mesh position={[0, 0.54, 0]} castShadow>
        <torusGeometry args={[1.0, 0.02, 8, 32]} />
        <meshPhysicalMaterial
          color="#3a3a3a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.9}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Base metálica central robusta */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.5, 16]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          metalness={0.95}
          roughness={0.05}
          clearcoat={0.8}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Patas industriales SIMPLIFICADAS (solo 3 en lugar de 4) */}
      {[0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3; // 3 patas en lugar de 4
        const x = Math.cos(angle) * 0.75;
        const z = Math.sin(angle) * 0.75;

        return (
          <group key={i}>
            {/* Pata principal simplificada */}
            <mesh
              position={[x, 0.25, z]}
              rotation={[0, angle, Math.PI * 0.03]}
              castShadow
            >
              <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} /> {/* Menos segmentos */}
              <meshPhysicalMaterial
                color="#404040"
                metalness={0.85}
                roughness={0.15}
                clearcoat={0.6}
              />
            </mesh>

            {/* Refuerzo diagonal */}
            <mesh
              position={[x * 0.6, 0.2, z * 0.6]}
              rotation={[0, angle + Math.PI / 4, Math.PI * 0.02]}
              castShadow
            >
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshPhysicalMaterial
                color="#505050"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Soporte horizontal */}
            <mesh
              position={[x * 0.5, 0.1, z * 0.5]}
              rotation={[0, angle + Math.PI / 2, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
              <meshPhysicalMaterial
                color="#555555"
                metalness={0.75}
                roughness={0.25}
              />
            </mesh>
          </group>
        );
      })}

      {/* Detalles decorativos - anillo interior */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <torusGeometry args={[0.5, 0.012, 6, 24]} />
        <meshPhysicalMaterial
          color="#6a6a6a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={0.95}
        />
      </mesh>

      {/* Remaches decorativos */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * 0.7;
        const z = Math.sin(angle) * 0.7;

        return (
          <mesh key={`rivet-${i}`} position={[x, 0.55, z]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.008, 8]} />
            <meshPhysicalMaterial
              color="#8a8a8a"
              metalness={1.0}
              roughness={0.0}
              clearcoat={1.0}
            />
          </mesh>
        );
      })}

      {/* Base de apoyo con peso */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.04, 32]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.5}
        />
      </mesh>
    </group>
  );
}

// Precargar solo la textura compatible
useTexture.preload(
  "/assets/models/industrial_coffee_table_1k.blend/textures/industrial_coffee_table_diff_1k.jpg"
);

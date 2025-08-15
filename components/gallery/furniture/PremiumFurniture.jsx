import React from "react";
import {
  MarbleMaterial,
  PremiumWoodMaterial,
  BrushedMetalMaterial,
  LuxuryFabricMaterial,
} from "../core/AdvancedMaterials.jsx";

/**
 * Mobiliario premium para galería de museo
 */

// Banco de museo premium con detalles refinados
export function PremiumMuseumBench({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base de mármol */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.4, 0.6]} />
        <MarbleMaterial color="#f5f5f5" />
      </mesh>

      {/* Cojín de cuero premium */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.0, 0.15, 0.5]} />
        <LuxuryFabricMaterial color="#8b4513" />
      </mesh>

      {/* Detalles metálicos decorativos */}
      <mesh position={[-0.9, 0.35, 0.25]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <BrushedMetalMaterial color="#b8860b" />
      </mesh>
      <mesh position={[0.9, 0.35, 0.25]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <BrushedMetalMaterial color="#b8860b" />
      </mesh>

      {/* Detalles laterales */}
      <mesh position={[-1.0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.6]} />
        <BrushedMetalMaterial color="#daa520" />
      </mesh>
      <mesh position={[1.0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.6]} />
        <BrushedMetalMaterial color="#daa520" />
      </mesh>
    </group>
  );
}

// Pedestal elegante para esculturas
export function ElegantPedestal({
  position,
  height = 1.2,
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base principal de mármol */}
      <mesh position={[0, height / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, height / 2, 16]} />
        <MarbleMaterial color="#f8f8f8" />
      </mesh>

      {/* Tope superior */}
      <mesh position={[0, height - 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.6, 0.2, 16]} />
        <MarbleMaterial color="#ffffff" />
      </mesh>

      {/* Base inferior */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 0.8, 0.2, 16]} />
        <MarbleMaterial color="#f0f0f0" />
      </mesh>

      {/* Detalles dorados */}
      <mesh position={[0, height / 2, 0]}>
        <torusGeometry args={[0.62, 0.02, 8, 24]} />
        <BrushedMetalMaterial color="#ffd700" />
      </mesh>

      <mesh position={[0, height - 0.2, 0]}>
        <torusGeometry args={[0.67, 0.015, 8, 24]} />
        <BrushedMetalMaterial color="#ffd700" />
      </mesh>
    </group>
  );
}

// Vitrina de exhibición premium
export function PremiumShowcase({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base de madera premium */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 1.0, 1.0]} />
        <PremiumWoodMaterial color="#654321" />
      </mesh>

      {/* Marco metálico */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2.05, 1.0, 1.05]} />
        <BrushedMetalMaterial color="#2c2c2c" />
      </mesh>

      {/* Vidrio frontal */}
      <mesh position={[0, 1.5, 0.52]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.9, 0.02]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.0}
          transmission={0.95}
          thickness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          ior={1.5}
          transparent
        />
      </mesh>

      {/* Iluminación interna LED */}
      <pointLight
        position={[0, 2.0, 0]}
        intensity={2.0}
        distance={3}
        color="#ffffff"
        decay={2}
      />

      {/* Reflector interno */}
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
}

// Barrera de seguridad elegante
export function SecurityBarrier({
  position,
  rotation = [0, 0, 0],
  length = 3,
}) {
  const posts = [];
  for (let i = 0; i <= Math.floor(length); i++) {
    posts.push(i * 1.5 - length * 0.75);
  }

  return (
    <group position={position} rotation={rotation}>
      {posts.map((x, i) => (
        <React.Fragment key={i}>
          {/* Poste principal */}
          <mesh position={[x, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
            <BrushedMetalMaterial color="#2c2c2c" />
          </mesh>

          {/* Base del poste */}
          <mesh position={[x, 0.05, 0]} receiveShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.1, 12]} />
            <MarbleMaterial color="#f0f0f0" />
          </mesh>

          {/* Top decorativo */}
          <mesh position={[x, 1.0, 0]}>
            <sphereGeometry args={[0.06, 12, 8]} />
            <BrushedMetalMaterial color="#ffd700" />
          </mesh>
        </React.Fragment>
      ))}

      {/* Cuerda o cadena decorativa */}
      {posts.slice(0, -1).map((x, i) => (
        <mesh
          key={`rope-${i}`}
          position={[x + 0.75, 0.8, 0]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry args={[0.01, 0.01, 1.5, 8]} />
          <PremiumWoodMaterial color="#8b0000" />
        </mesh>
      ))}
    </group>
  );
}

// Configuración de mobiliario para la galería
export function GalleryFurniture({ dynamicLength, dynamicCenterX }) {
  const benchPositions = [];
  const benchCount = Math.max(2, Math.floor(dynamicLength / 8));

  for (let i = 0; i < benchCount; i++) {
    const x =
      dynamicCenterX - dynamicLength / 3 + (i * dynamicLength) / benchCount;
    benchPositions.push([x, 0, 0]);
  }

  return (
    <>
      {/* Bancos premium distribuidos */}
      {benchPositions.map((pos, i) => (
        <PremiumMuseumBench key={`bench-${i}`} position={pos} />
      ))}

      {/* Pedestales en los extremos */}
      <ElegantPedestal
        position={[dynamicCenterX - dynamicLength / 2 + 2, 0, 5]}
      />
      <ElegantPedestal
        position={[dynamicCenterX + dynamicLength / 2 - 2, 0, 5]}
      />

      {/* Vitrinas laterales */}
      <PremiumShowcase position={[dynamicCenterX - dynamicLength / 3, 0, -5]} />
      <PremiumShowcase position={[dynamicCenterX + dynamicLength / 3, 0, -5]} />

      {/* Barreras de seguridad */}
      <SecurityBarrier
        position={[dynamicCenterX, 0, 4]}
        length={dynamicLength * 0.6}
      />
    </>
  );
}

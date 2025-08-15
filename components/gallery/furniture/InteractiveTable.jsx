import React, { useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * Mesa interactiva central con juegos educativos
 */
export function InteractiveTable({
  position = [0, 0, 0],
  onInteract,
  playerPosition,
}) {
  const tableRef = useRef();
  const [isNear, setIsNear] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Crear textura de madera para la mesa
  const woodTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Base de madera clara
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, "#d7ccc8");
    gradient.addColorStop(0.5, "#bcaaa4");
    gradient.addColorStop(1, "#a1887f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Anillos de crecimiento
    ctx.strokeStyle = "#8d6e63";
    ctx.lineWidth = 2;
    for (let i = 1; i <= 8; i++) {
      ctx.beginPath();
      ctx.arc(256, 256, i * 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vetas radiales
    ctx.strokeStyle = "#795548";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(angle) * 50, 256 + Math.sin(angle) * 50);
      ctx.lineTo(256 + Math.cos(angle) * 250, 256 + Math.sin(angle) * 250);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Crear textura metálica para las patas
  const metalTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Base metálica
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#9e9e9e");
    gradient.addColorStop(0.5, "#757575");
    gradient.addColorStop(1, "#616161");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Rayas metálicas
    ctx.strokeStyle = "#424242";
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 13);
      ctx.lineTo(256, i * 13);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Detectar proximidad del jugador
  useFrame(() => {
    if (!playerPosition || !tableRef.current) return;

    const distance = new THREE.Vector3(...playerPosition).distanceTo(
      new THREE.Vector3(...position)
    );

    const wasNear = isNear;
    const nowNear = distance < 4; // Aumenté el rango de detección

    if (nowNear !== wasNear) {
      setIsNear(nowNear);
      if (nowNear) {
        console.log(
          "¡Jugador cerca de la mesa! Distancia:",
          distance.toFixed(2)
        );
      }
    }
  });

  const handleClick = () => {
    if (isNear && onInteract) {
      onInteract();
    }
  };

  return (
    <group ref={tableRef} position={position}>
      {/* Superficie de la mesa CUADRADA */}
      <mesh
        position={[0, 0.8, 0]}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <boxGeometry args={[2.4, 0.08, 2.4]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Borde decorativo */}
      <mesh position={[0, 0.84, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.03, 2.5]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Patas de la mesa (4 esquinas) */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, 0.4, z]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial
            map={metalTexture}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}

      {/* Refuerzos entre patas */}
      <mesh position={[0, 0.2, -1]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial
          map={metalTexture}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[0, 0.2, 1]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial
          map={metalTexture}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[-1, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial
          map={metalTexture}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[1, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial
          map={metalTexture}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Indicador de interacción cuando el jugador está cerca */}
      {isNear && (
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshStandardMaterial
            color={isHovered ? "#4caf50" : "#2196f3"}
            transparent
            opacity={0.8}
            emissive={isHovered ? "#1b5e20" : "#0d47a1"}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Texto flotante de interacción */}
      {isNear && (
        <group position={[0, 1.6, 0]}>
          <Html center>
            <div className="bg-white/90 text-black px-4 py-2 rounded-lg shadow-lg border-2 border-blue-500 text-center">
              <div className="font-bold text-lg">🎮 Mesa de Juegos</div>
              <div className="text-sm">Haz clic para jugar</div>
            </div>
          </Html>
        </group>
      )}

      {/* Elementos decorativos en la mesa */}
      <mesh position={[1, 0.85, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.02, 0.2]} />
        <meshStandardMaterial color="#1976d2" roughness={0.3} metalness={0.7} />
      </mesh>

      <mesh position={[-1, 0.85, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.02, 0.2]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.3} metalness={0.7} />
      </mesh>

      <mesh position={[0, 0.85, 1]} receiveShadow>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#388e3c" roughness={0.3} metalness={0.7} />
      </mesh>

      <mesh position={[0, 0.85, -1]} receiveShadow>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#ff9800" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Lámpara de mesa elegante */}
      <group position={[0.6, 0.84, 0.6]}>
        {/* Base de la lámpara - circular metálica */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
          <meshPhysicalMaterial
            color="#2c3e50"
            metalness={0.9}
            roughness={0.1}
            clearcoat={0.8}
          />
        </mesh>

        {/* Poste de la lámpara */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
          <meshPhysicalMaterial
            color="#34495e"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pantalla de la lámpara - forma de cono invertido */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.12, 0.15, 16]} />
          <meshPhysicalMaterial
            color="#ecf0f1"
            roughness={0.4}
            metalness={0.1}
            transmission={0.1}
          />
        </mesh>

        {/* Interior de la pantalla - emisivo para simular luz */}
        <mesh position={[0, 0.37, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.11, 0.13, 16]} />
          <meshStandardMaterial
            color="#fff9e6"
            emissive="#fff9e6"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Luz puntual de la lámpara */}
        <pointLight
          position={[0, 0.3, 0]}
          intensity={2.0}
          distance={3}
          decay={2}
          color="#fff9e6"
          castShadow={false}
        />
      </group>

      {/* Segunda lámpara de mesa - espejo de la primera */}
      <group position={[-0.6, 0.84, -0.6]}>
        {/* Base de la lámpara - circular metálica */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
          <meshPhysicalMaterial
            color="#2c3e50"
            metalness={0.9}
            roughness={0.1}
            clearcoat={0.8}
          />
        </mesh>

        {/* Poste de la lámpara */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
          <meshPhysicalMaterial
            color="#34495e"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pantalla de la lámpara - forma de cono invertido */}
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.12, 0.15, 16]} />
          <meshPhysicalMaterial
            color="#ecf0f1"
            roughness={0.4}
            metalness={0.1}
            transmission={0.1}
          />
        </mesh>

        {/* Interior de la pantalla - emisivo para simular luz */}
        <mesh position={[0, 0.37, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.11, 0.13, 16]} />
          <meshStandardMaterial
            color="#fff9e6"
            emissive="#fff9e6"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Luz puntual de la lámpara */}
        <pointLight
          position={[0, 0.3, 0]}
          intensity={2.0}
          distance={3}
          decay={2}
          color="#fff9e6"
          castShadow={false}
        />
      </group>
    </group>
  );
}

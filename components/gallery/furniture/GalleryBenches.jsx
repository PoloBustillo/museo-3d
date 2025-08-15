import React from "react";
import { GALLERY_CONFIG } from "../core/config.js";
import * as THREE from "three";

const { HALL_WIDTH, HALL_LENGTH } = GALLERY_CONFIG;

/**
 * Componente individual de banco
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.position - Posición del banco [x, y, z]
 */
function Bench({ position }) {
  // Crear texturas de madera procedurales
  const woodTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Base de madera
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#8d6e63");
    gradient.addColorStop(0.3, "#a0795f");
    gradient.addColorStop(0.7, "#6d4c41");
    gradient.addColorStop(1, "#5d4037");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Vetas de madera
    ctx.strokeStyle = "#3e2723";
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 25 + Math.sin(i) * 10);
      ctx.lineTo(512, i * 25 + Math.sin(i + 1) * 10);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
    return texture;
  }, []);

  const darkWoodTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Base de madera oscura
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#3e2723");
    gradient.addColorStop(0.5, "#2e1a17");
    gradient.addColorStop(1, "#1e0e0a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Textura de madera
    ctx.strokeStyle = "#1a0d08";
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 17);
      ctx.lineTo(256, i * 17 + Math.sin(i) * 5);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <group position={position}>
      {/* Asiento del banco con textura de madera */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 0.4]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.8}
          metalness={0.1}
          normalScale={[0.5, 0.5]}
        />
      </mesh>

      {/* Pata izquierda con textura oscura */}
      <mesh position={[-0.8, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial
          map={darkWoodTexture}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Pata derecha con textura oscura */}
      <mesh position={[0.8, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial
          map={darkWoodTexture}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Soporte central */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.05, 0.3]} />
        <meshStandardMaterial
          map={darkWoodTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

/**
 * Componente que renderiza todos los bancos de la galería
 * @param {Object} props - Propiedades del componente
 * @param {number} props.dynamicLength - Longitud dinámica de la galería (para posicionamiento futuro)
 */
export function GalleryBenches({ dynamicLength }) {
  // Usar la longitud dinámica en lugar de la fija
  const benchSpacing = Math.min(dynamicLength / 3, 12); // Espaciado adaptativo
  const benchPositions = [
    // Bancos en la pared superior
    [-benchSpacing, 0, HALL_WIDTH / 2 - 1.2],
    [0, 0, HALL_WIDTH / 2 - 1.2],
    [benchSpacing, 0, HALL_WIDTH / 2 - 1.2],
    // Bancos en la pared inferior
    [-benchSpacing, 0, -HALL_WIDTH / 2 + 1.2],
    [0, 0, -HALL_WIDTH / 2 + 1.2],
    [benchSpacing, 0, -HALL_WIDTH / 2 + 1.2],
  ];

  return (
    <>
      {benchPositions.map((position, index) => (
        <Bench key={`bench-${index}`} position={position} />
      ))}
    </>
  );
}

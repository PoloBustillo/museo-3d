import React from "react";
import * as THREE from "three";
import { PBRMaterial } from "../core/PBRMaterial.jsx";
import {
  PremiumWoodMaterial,
  BrushedMetalMaterial,
} from "../core/AdvancedMaterials.jsx";

/**
 * Componente especializado para renderizar el techo de la galería
 */
export function CeilingMesh({
  dynamicLength,
  dynamicCenterX,
  ceilingHeight,
  hallWidth,
  floorExtra,
  color = "#f5f5f5",
  premiumMode = false,
  quality = "high",
  textureOptimization = "auto", // Nueva prop para optimización
}) {
  // Material premium para techos de lujo - sin texturas para optimización
  const ceilingMaterial =
    premiumMode && quality === "ultra" ? (
      <PremiumWoodMaterial
        type="walnut"
        color={color}
        // Sin baseColor/maps para optimización GPU
      />
    ) : premiumMode ? (
      <PBRMaterial
        color={color}
        metalness={0.05}
        roughness={0.6}
        physical={true}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
        reflectivity={0.7}
        side={THREE.DoubleSide}
        textureOptimization={textureOptimization}
      />
    ) : (
      <PBRMaterial
        color={color}
        metalness={0.1}
        roughness={0.8}
        textureOptimization={textureOptimization}
        side={THREE.DoubleSide}
      />
    );

  // Dimensiones profesionales del techo
  const CEILING_THICKNESS = 0.2;
  const COFFER_DEPTH = 0.08;
  const COFFER_WIDTH = 1.8;
  const COFFER_LENGTH = 1.6;

  // Molduras y cornisas profesionales
  const CORNICE_HEIGHT = 0.25;
  const CORNICE_DEPTH = 0.18;
  const CORNICE_COLOR = "#f8f8f8";
  const CORNICE_METAL = 0.15;
  const CORNICE_ROUGH = 0.2;

  // Detalles dorados profesionales
  const ACCENT_COLOR = "#c9963b";
  const ACCENT_METAL = 0.85;
  const ACCENT_ROUGH = 0.15;

  // Paneles empotrados
  const PANEL_COLOR = "#f2f2f2";
  const PANEL_METAL = 0.05;
  const PANEL_ROUGH = 0.7;

  // Calcular número de paneles según dimensiones
  const coffersX = Math.floor(dynamicLength / COFFER_WIDTH);
  const coffersZ = Math.floor((hallWidth + floorExtra) / COFFER_LENGTH);

  return (
    <group>
      {/* Techo base principal - más grosor */}
      <mesh
        position={[dynamicCenterX, ceilingHeight + CEILING_THICKNESS / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[
            dynamicLength + 0.2,
            CEILING_THICKNESS,
            hallWidth + floorExtra + 0.2,
          ]}
        />
        {ceilingMaterial}
      </mesh>

      {/* Cornisas perimetrales profesionales */}
      {/* Cornisa frontal */}
      <mesh
        position={[
          dynamicCenterX,
          ceilingHeight + CEILING_THICKNESS + CORNICE_HEIGHT / 2,
          (hallWidth + floorExtra) / 2 + CORNICE_DEPTH / 2,
        ]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[dynamicLength + 0.4, CORNICE_HEIGHT, CORNICE_DEPTH]}
        />
        <meshStandardMaterial
          color={CORNICE_COLOR}
          roughness={CORNICE_ROUGH}
          metalness={CORNICE_METAL}
        />
      </mesh>
      {/* Cornisa trasera */}
      <mesh
        position={[
          dynamicCenterX,
          ceilingHeight + CEILING_THICKNESS + CORNICE_HEIGHT / 2,
          -(hallWidth + floorExtra) / 2 - CORNICE_DEPTH / 2,
        ]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[dynamicLength + 0.4, CORNICE_HEIGHT, CORNICE_DEPTH]}
        />
        <meshStandardMaterial
          color={CORNICE_COLOR}
          roughness={CORNICE_ROUGH}
          metalness={CORNICE_METAL}
        />
      </mesh>
      {/* Cornisa izquierda */}
      <mesh
        position={[
          dynamicCenterX - dynamicLength / 2 - CORNICE_DEPTH / 2,
          ceilingHeight + CEILING_THICKNESS + CORNICE_HEIGHT / 2,
          0,
        ]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[
            CORNICE_DEPTH,
            CORNICE_HEIGHT,
            hallWidth + floorExtra + 2 * CORNICE_DEPTH,
          ]}
        />
        <meshStandardMaterial
          color={CORNICE_COLOR}
          roughness={CORNICE_ROUGH}
          metalness={CORNICE_METAL}
        />
      </mesh>
      {/* Cornisa derecha */}
      <mesh
        position={[
          dynamicCenterX + dynamicLength / 2 + CORNICE_DEPTH / 2,
          ceilingHeight + CEILING_THICKNESS + CORNICE_HEIGHT / 2,
          0,
        ]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[
            CORNICE_DEPTH,
            CORNICE_HEIGHT,
            hallWidth + floorExtra + 2 * CORNICE_DEPTH,
          ]}
        />
        <meshStandardMaterial
          color={CORNICE_COLOR}
          roughness={CORNICE_ROUGH}
          metalness={CORNICE_METAL}
        />
      </mesh>

      {/* Paneles empotrados tipo cofre (coffered ceiling) */}
      {Array.from({ length: coffersX }).map((_, i) =>
        Array.from({ length: coffersZ }).map((_, j) => {
          const x =
            dynamicCenterX -
            dynamicLength / 2 +
            (i + 0.5) * (dynamicLength / coffersX);
          const z =
            -(hallWidth + floorExtra) / 2 +
            (j + 0.5) * ((hallWidth + floorExtra) / coffersZ);
          return (
            <mesh
              key={`coffer-${i}-${j}`}
              position={[x, ceilingHeight - COFFER_DEPTH / 2, z]}
              receiveShadow
            >
              <boxGeometry
                args={[COFFER_WIDTH * 0.85, COFFER_DEPTH, COFFER_LENGTH * 0.85]}
              />
              <meshStandardMaterial
                color={PANEL_COLOR}
                roughness={PANEL_ROUGH}
                metalness={PANEL_METAL}
              />
            </mesh>
          );
        })
      )}

      {/* Vigas transversales decorativas */}
      {Array.from({ length: coffersX + 1 }).map((_, i) => {
        const x =
          dynamicCenterX - dynamicLength / 2 + i * (dynamicLength / coffersX);
        return (
          <mesh
            key={`beam-x-${i}`}
            position={[x, ceilingHeight + 0.02, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[0.08, 0.12, hallWidth + floorExtra]} />
            <meshStandardMaterial
              color={CORNICE_COLOR}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        );
      })}

      {/* Vigas longitudinales decorativas */}
      {Array.from({ length: coffersZ + 1 }).map((_, j) => {
        const z =
          -(hallWidth + floorExtra) / 2 +
          j * ((hallWidth + floorExtra) / coffersZ);
        return (
          <mesh
            key={`beam-z-${j}`}
            position={[dynamicCenterX, ceilingHeight + 0.02, z]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[dynamicLength, 0.12, 0.08]} />
            <meshStandardMaterial
              color={CORNICE_COLOR}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        );
      })}

      {/* Detalles dorados centrales */}
      <mesh
        position={[
          dynamicCenterX,
          ceilingHeight + CEILING_THICKNESS + CORNICE_HEIGHT + 0.06,
          0,
        ]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.15, 0.08, hallWidth + floorExtra]} />
        <meshStandardMaterial
          color={ACCENT_COLOR}
          metalness={ACCENT_METAL}
          roughness={ACCENT_ROUGH}
        />
      </mesh>

      {/* Detalles dorados en esquinas de cornisas */}
      {[
        [dynamicCenterX - dynamicLength / 2, (hallWidth + floorExtra) / 2],
        [dynamicCenterX + dynamicLength / 2, (hallWidth + floorExtra) / 2],
        [dynamicCenterX - dynamicLength / 2, -(hallWidth + floorExtra) / 2],
        [dynamicCenterX + dynamicLength / 2, -(hallWidth + floorExtra) / 2],
      ].map(([x, z], idx) => (
        <mesh
          key={`corner-${idx}`}
          position={[
            x,
            ceilingHeight + CEILING_THICKNESS + CORNICE_HEIGHT + 0.08,
            z,
          ]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[0.12, 0.1, 0.12]} />
          <meshStandardMaterial
            color={ACCENT_COLOR}
            metalness={ACCENT_METAL}
            roughness={ACCENT_ROUGH}
          />
        </mesh>
      ))}
    </group>
  );
}

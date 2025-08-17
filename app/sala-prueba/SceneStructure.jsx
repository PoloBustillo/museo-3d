"use client";
import React, { useRef, useMemo, useEffect } from 'react';
import { Door } from './components/Door';
import { useHallMaterials } from './hooks/useHallMaterials';
import { useFrame } from '@react-three/fiber';
import {
  HALL_WIDTH,
  HALL_HEIGHT,
  TOTAL_LENGTH,
  FRONT_CENTER,
  BACK_CENTER,
  HALF_HALL_W,
  HALF_HALL_D,
  ENTRANCE_WIDTH,
  CORRIDOR_WIDTH,
  WALL_THICK,
  WALL_COLOR,
  ENTRANCE_ACCENT_COLOR,
  MB,
  INITIAL_ROT_Y,
  INITIAL_ROT_X,
  PRESENTATION_ROT_SPEED,
  PRESENTATION_EASE_IN,
  PRESENTATION_EASE_OUT,
  PRESENTATION_FLOAT_AMPLITUDE,
  PRESENTATION_FLOAT_SPEED
} from './sceneConfig';

export default function SceneStructure({ rotate, exiting=false, exploring=false }) {
  const groupRef = useRef();
  const elapsedRef = useRef(0);
  const exitElapsedRef = useRef(0);
  const openingWidth = CORRIDOR_WIDTH;
  const sideSeg = (HALL_WIDTH - openingWidth) / 2;
  const entranceSeg = (HALL_WIDTH - ENTRANCE_WIDTH) / 2;

  // Aplicar rotación inicial y escala reducida solo en modo presentación (rotate true al montar)
  useEffect(() => {
    if (!groupRef.current) return;
    if (rotate) {
  groupRef.current.rotation.set(INITIAL_ROT_X, INITIAL_ROT_Y, 0);
  groupRef.current.scale.setScalar(MB);
      elapsedRef.current = 0; // reset easing timeline
    } else {
      groupRef.current.scale.setScalar(1);
      // Mantén rotación Y acumulada si hubo animación previa, o resetea si quieres: la dejamos en 0
      groupRef.current.rotation.set(0, 0, 0);
    }
  }, [rotate]);

  // Animación profesional: ligera rotación continua + flotación senoidal
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (!rotate) {
      // Suavizar leve jitter + rotación: amortiguar posición y rotación Y hacia 0
      groupRef.current.position.y *= 0.9;
      groupRef.current.rotation.y *= 0.92;
      if (Math.abs(groupRef.current.rotation.y) < 0.0005) groupRef.current.rotation.y = 0;
      return;
    }
    if (exiting) {
      exitElapsedRef.current += delta;
      const tt = Math.min(exitElapsedRef.current / PRESENTATION_EASE_OUT, 1);
      const easeOut = 1 - Math.pow(tt, 2); // cuadrático
      // Reducir progresivamente rotación incremental y flotación
      groupRef.current.rotation.y += PRESENTATION_ROT_SPEED * easeOut * delta;
      const baseFloat = Math.sin(elapsedRef.current * Math.PI * 2 * PRESENTATION_FLOAT_SPEED) * PRESENTATION_FLOAT_AMPLITUDE;
      groupRef.current.position.y = baseFloat * easeOut;
      return;
    }
    elapsedRef.current += delta;
    // Easing de entrada a velocidad objetivo
    const t = Math.min(elapsedRef.current / PRESENTATION_EASE_IN, 1);
    const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1; // easeOutCubic
    groupRef.current.rotation.y += PRESENTATION_ROT_SPEED * ease * delta;
    // Flotación + pulso leve de escala Y para sensación breathing
    const phase = elapsedRef.current * Math.PI * 2 * PRESENTATION_FLOAT_SPEED;
    const floatY = Math.sin(phase) * PRESENTATION_FLOAT_AMPLITUDE;
    groupRef.current.position.y = floatY;
  });

  // Procedural lightweight gradient + noise para paredes / techo / piso.
  const { wallMat, floorMat, ceilMat, shadowMat } = useHallMaterials();

  // Pequeño factory para paredes repetitivas
  const Wall = ({ position, size, mat=wallMat }) => (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      {mat}
    </mesh>
  );

  const sideWalls = [
    { position: [-HALF_HALL_W, HALL_HEIGHT/2, 0], size: [WALL_THICK, HALL_HEIGHT, TOTAL_LENGTH] },
    { position: [ HALF_HALL_W, HALL_HEIGHT/2, 0], size: [WALL_THICK, HALL_HEIGHT, TOTAL_LENGTH] }
  ];

  const entranceExterior = [
    { position: [-(ENTRANCE_WIDTH/2 + entranceSeg/2), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D], size: [entranceSeg, HALL_HEIGHT, WALL_THICK] },
    { position: [ (ENTRANCE_WIDTH/2 + entranceSeg/2), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D], size: [entranceSeg, HALL_HEIGHT, WALL_THICK] },
  ];

  const internalFront = [
    { position: [-(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, FRONT_CENTER - HALF_HALL_D], size: [sideSeg, HALL_HEIGHT, WALL_THICK] },
    { position: [ (openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, FRONT_CENTER - HALF_HALL_D], size: [sideSeg, HALL_HEIGHT, WALL_THICK] },
  ];

  const internalBack = [
    { position: [-(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, BACK_CENTER + HALF_HALL_D], size: [sideSeg, HALL_HEIGHT, WALL_THICK] },
    { position: [ (openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, BACK_CENTER + HALF_HALL_D], size: [sideSeg, HALL_HEIGHT, WALL_THICK] },
  ];

  return (
  <group ref={groupRef} frustumCulled={false}>
      {/* Sombra suave (contact shadow fake) */}
      {rotate && (
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
          <circleGeometry args={[HALL_WIDTH*0.95, 48]} />
          {shadowMat}
        </mesh>
      )}
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, TOTAL_LENGTH]} />
        {floorMat}
      </mesh>
      {/* Techo */}
      <mesh position={[0, HALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, TOTAL_LENGTH]} />
        {ceilMat}
      </mesh>
  {/* Paredes laterales */}
  {sideWalls.map((w,i)=>(<Wall key={'side'+i} position={w.position} size={w.size} />))}
  {/* Entrada principal (pared frontal exterior) con marco acentuado */}
      <group>
  {entranceExterior.map((w,i)=>(<Wall key={'entrExt'+i} position={w.position} size={w.size} />))}
        {/* Marco vertical */}
        <mesh position={[0, HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D + 0.02]}>
          <boxGeometry args={[ENTRANCE_WIDTH+0.6, 0.3, 0.1]} />
          <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.6} metalness={0.15} />
        </mesh>
        <mesh position={[0, HALL_HEIGHT-0.15, FRONT_CENTER + HALF_HALL_D + 0.02]}>
          <boxGeometry args={[ENTRANCE_WIDTH+0.6, 0.3, 0.1]} />
          <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.6} metalness={0.15} />
        </mesh>
        <mesh position={[-(ENTRANCE_WIDTH/2 + 0.3), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D + 0.02]}>
          <boxGeometry args={[0.3, HALL_HEIGHT-0.3, 0.1]} />
          <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.6} metalness={0.15} />
        </mesh>
        <mesh position={[(ENTRANCE_WIDTH/2 + 0.3), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D + 0.02]}>
          <boxGeometry args={[0.3, HALL_HEIGHT-0.3, 0.1]} />
          <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.6} metalness={0.15} />
        </mesh>
        {/* Elementos que sólo aparecen al entrar para enriquecer el interior del marco */}
        {exploring && (
          <group>
            {/* Lintel interior ligeramente sobresalido */}
            <mesh position={[0, HALL_HEIGHT-0.4, FRONT_CENTER + HALF_HALL_D - 0.15]}>
              <boxGeometry args={[ENTRANCE_WIDTH*0.98, 0.25, 0.3]} />
              <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.5} metalness={0.18} />
            </mesh>
            {/* Umbral / zócalo */}
            <mesh position={[0, 0.12, FRONT_CENTER + HALF_HALL_D - 0.05]}>
              <boxGeometry args={[ENTRANCE_WIDTH*0.98, 0.24, 0.25]} />
              <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.55} metalness={0.2} />
            </mesh>
            {/* Moldura interior lateral fina */}
            <mesh position={[-(ENTRANCE_WIDTH/2 -0.1), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D - 0.08]}>
              <boxGeometry args={[0.12, HALL_HEIGHT-0.8, 0.15]} />
              <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.55} metalness={0.2} />
            </mesh>
            <mesh position={[(ENTRANCE_WIDTH/2 -0.1), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D - 0.08]}>
              <boxGeometry args={[0.12, HALL_HEIGHT-0.8, 0.15]} />
              <meshStandardMaterial color={ENTRANCE_ACCENT_COLOR} roughness={0.55} metalness={0.2} />
            </mesh>
          </group>
        )}
      </group>
  {/* Aperturas internas (frontal) */}
  {internalFront.map((w,i)=>(<Wall key={'frontOpen'+i} position={w.position} size={w.size} />))}
  {/* Aperturas internas (posterior) */}
  {internalBack.map((w,i)=>(<Wall key={'backOpen'+i} position={w.position} size={w.size} />))}
      {/* Pared posterior completa */}
      <mesh position={[0, HALL_HEIGHT/2, BACK_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[HALL_WIDTH, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
  {/* Puerta dinámica visible sólo al explorar */}
  {exploring && <Door visible={exploring} />}
    </group>
  );
}

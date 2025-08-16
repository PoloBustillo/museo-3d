"use client";
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
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
  FLOOR_COLOR,
  CEIL_COLOR,
  MB,
  INITIAL_ROT_Y,
  INITIAL_ROT_X,
  PRESENTATION_ROT_SPEED,
  PRESENTATION_EASE_IN,
  PRESENTATION_EASE_OUT,
  PRESENTATION_FLOAT_AMPLITUDE,
  PRESENTATION_FLOAT_SPEED
} from './sceneConfig';

export default function SceneStructure({ rotate, exiting=false }) {
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

  const wallMat = useMemo(() => (<meshStandardMaterial color={WALL_COLOR} roughness={0.95} />), []);
  const floorMat = useMemo(() => (<meshStandardMaterial color={FLOOR_COLOR} roughness={1} />), []);
  const ceilMat = useMemo(() => (<meshStandardMaterial color={CEIL_COLOR} roughness={1} />), []);

  // Material suave para sombra falsa
  const shadowMat = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    grd.addColorStop(0,'rgba(0,0,0,0.4)');
    grd.addColorStop(0.5,'rgba(0,0,0,0.15)');
    grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,size,size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return <meshBasicMaterial map={tex} transparent />;
  }, []);

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
      <mesh position={[-HALF_HALL_W, HALL_HEIGHT/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICK, HALL_HEIGHT, TOTAL_LENGTH]} />
        {wallMat}
      </mesh>
      <mesh position={[HALF_HALL_W, HALL_HEIGHT/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICK, HALL_HEIGHT, TOTAL_LENGTH]} />
        {wallMat}
      </mesh>
      {/* Entrada principal (pared frontal exterior) */}
      <mesh position={[-(ENTRANCE_WIDTH/2 + entranceSeg/2), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[entranceSeg, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
      <mesh position={[(ENTRANCE_WIDTH/2 + entranceSeg/2), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[entranceSeg, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
      {/* Aperturas internas (frontal) */}
      <mesh position={[-(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, FRONT_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
      <mesh position={[(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, FRONT_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
      {/* Aperturas internas (posterior) */}
      <mesh position={[-(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, BACK_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
      <mesh position={[(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, BACK_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
      {/* Pared posterior completa */}
      <mesh position={[0, HALL_HEIGHT/2, BACK_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[HALL_WIDTH, HALL_HEIGHT, WALL_THICK]} />
        {wallMat}
      </mesh>
    </group>
  );
}

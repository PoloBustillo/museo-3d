"use client";
import React, { useRef } from 'react';
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
  PRESENTATION_ROT_SPEED
} from './sceneConfig';

export default function SceneStructure({ rotate }) {
  const groupRef = useRef();
  const openingWidth = CORRIDOR_WIDTH;
  const sideSeg = (HALL_WIDTH - openingWidth) / 2;
  const entranceSeg = (HALL_WIDTH - ENTRANCE_WIDTH) / 2;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (rotate) {
      groupRef.current.rotation.y += delta * PRESENTATION_ROT_SPEED;
    } else if (groupRef.current.rotation.y % (Math.PI * 2) !== 0) {
      groupRef.current.rotation.y *= 0.92;
      if (Math.abs(groupRef.current.rotation.y) < 0.002) groupRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, TOTAL_LENGTH]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={1} />
      </mesh>
      {/* Techo */}
      <mesh position={[0, HALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, TOTAL_LENGTH]} />
        <meshStandardMaterial color={CEIL_COLOR} roughness={1} />
      </mesh>
      {/* Paredes laterales */}
      <mesh position={[-HALF_HALL_W, HALL_HEIGHT/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICK, HALL_HEIGHT, TOTAL_LENGTH]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[HALF_HALL_W, HALL_HEIGHT/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICK, HALL_HEIGHT, TOTAL_LENGTH]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Entrada principal (pared frontal exterior) */}
      <mesh position={[-(ENTRANCE_WIDTH/2 + entranceSeg/2), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[entranceSeg, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[(ENTRANCE_WIDTH/2 + entranceSeg/2), HALL_HEIGHT/2, FRONT_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[entranceSeg, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Aperturas internas (frontal) */}
      <mesh position={[-(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, FRONT_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, FRONT_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Aperturas internas (posterior) */}
      <mesh position={[-(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, BACK_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[(openingWidth/2 + sideSeg/2), HALL_HEIGHT/2, BACK_CENTER + HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[sideSeg, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      {/* Pared posterior completa */}
      <mesh position={[0, HALL_HEIGHT/2, BACK_CENTER - HALF_HALL_D]} castShadow receiveShadow>
        <boxGeometry args={[HALL_WIDTH, HALL_HEIGHT, WALL_THICK]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
    </group>
  );
}

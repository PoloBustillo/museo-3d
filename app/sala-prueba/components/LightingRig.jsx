"use client";
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { HALL_HEIGHT, FRONT_CENTER, PRESENTATION_FLOAT_SPEED, PRESENTATION_PULSE_BASE, PRESENTATION_PULSE_DELTA } from '../sceneConfig';

export function LightingRig({ presentation=false }) {
  const ambientRef = useRef();
  useFrame((state, delta) => {
    if (presentation && ambientRef.current) {
      const t = state.clock.getElapsedTime();
      const pulse = Math.sin(t * Math.PI * 2 * PRESENTATION_FLOAT_SPEED) * 0.5 + 0.5; // 0..1
      ambientRef.current.intensity = PRESENTATION_PULSE_BASE + pulse * PRESENTATION_PULSE_DELTA;
    }
  });
  return (
    <>
      <ambientLight ref={ambientRef} intensity={PRESENTATION_PULSE_BASE} />
      <directionalLight
        position={[70, 110, 50]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[-50, 80, -60]} intensity={0.25} />
      <spotLight
        position={[0, HALL_HEIGHT - 1, FRONT_CENTER]}
        angle={0.55}
        intensity={0.45}
        distance={120}
        penumbra={0.4}
      />
    </>
  );
}

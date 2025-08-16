"use client";
import React from 'react';
import { HALL_HEIGHT, FRONT_CENTER } from '../sceneConfig';

export function LightingRig() {
  return (
    <>
      <ambientLight intensity={0.35} />
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

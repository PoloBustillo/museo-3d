"use client";
import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneStructure from "./SceneStructure";
import { HALL_HEIGHT, FRONT_CENTER, HALF_HALL_D, HALL_WIDTH } from "./sceneConfig";

export default function SalaPruebaPage() {
  const [started, setStarted] = useState(false);      // controles activos
  const [animating, setAnimating] = useState(false);  // en transición de entrada
  const cameraRef = useRef(null);
  const animRef = useRef(null);
  // Posición inicial elevada y retrasada para mostrar interior con giro.
  const initialCameraPos = useRef([0, HALL_HEIGHT * 1.15, FRONT_CENTER + HALF_HALL_D + 26]);

  // Ajustar orientación inicial.
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(...initialCameraPos.current);
      cameraRef.current.lookAt(0, HALL_HEIGHT * 0.6, FRONT_CENTER - 2);
    }
  }, []);

  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

  function CameraController() {
    const { camera } = useThree();
    cameraRef.current = camera;
    useFrame(() => {
      if (animating && animRef.current) {
        const { start, duration, from, to, lookAt } = animRef.current;
        const elapsed = (performance.now() - start) / duration;
        const t = elapsed >= 1 ? 1 : easeOutCubic(elapsed);
        camera.position.set(
          from.x + (to.x - from.x) * t,
          from.y + (to.y - from.y) * t,
          from.z + (to.z - from.z) * t
        );
        camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
        if (elapsed >= 1) {
          setAnimating(false);
          setStarted(true);
          animRef.current = null;
        }
      }
    });
    return null;
  }

  const handleStart = () => {
    if (!cameraRef.current || animating || started) return;
    // Destino dentro de la sala frontal
    const targetZ = FRONT_CENTER + HALF_HALL_D - 6;
    const to = { x: 0, y: 1.8, z: targetZ };
    const lookAt = { x: 0, y: 2.2, z: FRONT_CENTER - 3 };
    animRef.current = {
      start: performance.now(),
      duration: 3000,
      from: cameraRef.current.position.clone(),
      to,
      lookAt
    };
    setAnimating(true);
  };
  return (
    <div className="w-full h-screen bg-neutral-900 relative">
      {!started && (
        <div className="pointer-events-none select-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-24 bg-gradient-to-t from-neutral-900/75 via-neutral-900/10 to-transparent">
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl px-6 py-4 bg-neutral-900/40 backdrop-blur-md border border-white/10 shadow-lg">
            <h1 className="text-white text-sm font-medium tracking-wide">Sala Demo</h1>
            <button onClick={handleStart} disabled={animating} className="px-5 py-2 rounded-md bg-white/90 text-neutral-900 text-xs font-medium shadow hover:bg-white transition disabled:opacity-60">
              {animating ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      )}
      <Canvas
        shadows
        camera={{ position: initialCameraPos.current, fov: 55 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#101010"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[70, 110, 50]} intensity={0.55} castShadow />
  <SceneStructure rotate={!animating && !started} />
  <CameraController />
  <OrbitControls enablePan={started} enableZoom enableRotate maxPolarAngle={Math.PI/2.1} enabled={!animating} />
      </Canvas>
    </div>
  );
}

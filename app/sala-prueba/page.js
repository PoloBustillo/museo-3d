"use client";
import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneStructure from "./SceneStructure";
import { HALL_HEIGHT, FRONT_CENTER, HALF_HALL_D, HALL_WIDTH, CAMERA_INITIAL_POS, ENABLE_FOG, FOG_NEAR, FOG_FAR } from "./sceneConfig";
import { useAdaptiveQuality } from "./hooks/useAdaptiveQuality";
import { LightingRig } from "./components/LightingRig";
import { useEntranceAnimation } from "./hooks/useEntranceAnimation";
import { useWASDControls } from "./hooks/useWASDControls";

export default function SalaPruebaPage() {
  const [started, setStarted] = useState(false);
  const [presentationMode, setPresentationMode] = useState(true);
  const [wasd, setWasd] = useState(false);
  const [animating, setAnimating] = useState(false);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const beginRef = useRef(null);
  const [sceneManagerKey, setSceneManagerKey] = useState(0);
  // Posición inicial elevada y retrasada para mostrar interior con giro.
  const initialCameraPos = useRef(CAMERA_INITIAL_POS);

  // Ajustar orientación inicial.
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(...initialCameraPos.current);
    cameraRef.current.lookAt(0, HALL_HEIGHT * 0.5, FRONT_CENTER - 6.5);
    }
  }, []);
  useAdaptiveQuality({ rendererRef, enabled: true });

  const handleStart = () => beginRef.current && beginRef.current();
  const handleReset = () => {
    // Return to presentation mode
    setPresentationMode(true);
    setStarted(false);
    setAnimating(false);
    beginRef.current = null;
    if (cameraRef.current) {
      cameraRef.current.position.set(...initialCameraPos.current);
    cameraRef.current.lookAt(0, HALL_HEIGHT * 0.5, FRONT_CENTER - 6.5);
    }
    // Force remount SceneManager to reset internal hook state
    setSceneManagerKey(k => k + 1);
  };

  // Component inside Canvas to safely use R3F hooks
  function SceneManager({ presentationMode, wasdEnabled }) {
    const { begin, animating: anim, started: startedInner } = useEntranceAnimation({ onFinish: () => {
      setStarted(true);
      setPresentationMode(false);
    }});
    // Expose begin externally
    useEffect(() => { beginRef.current = begin; }, [begin]);

    // Track animating state upward
    useEffect(() => { setAnimating(anim); }, [anim]);
    // WASD controls only after start
    useWASDControls(wasdEnabled && startedInner);

    // Binder for camera & renderer refs
    const Binder = () => {
      const { camera, gl } = useEntranceAnimation.__proto__.constructor.name ? {} : {}; // no-op placeholder
      return null;
    };
    return (
      <>
  <LightingRig />
  <SceneStructure rotate={presentationMode && !anim} />
        {/* Acquire refs via function child pattern not available here; use onCreated below instead */}
      </>
    );
  }
  return (
    <div className="w-full h-screen bg-neutral-900 relative">
      {presentationMode && (
        <div className="pointer-events-none select-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-24 bg-gradient-to-t from-neutral-900/75 via-neutral-900/10 to-transparent">
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl px-6 py-4 bg-neutral-900/40 backdrop-blur-md border border-white/10 shadow-lg">
            <h1 className="text-white text-sm font-medium tracking-wide">Sala Demo</h1>
            <button onClick={handleStart} disabled={animating} className="px-5 py-2 rounded-md bg-white/90 text-neutral-900 text-xs font-medium shadow hover:bg-white transition disabled:opacity-60">
              {animating ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      )}
      {started && !presentationMode && (
        <div className="absolute top-3 left-3 z-20 flex gap-2 items-center">
          <button onClick={() => setWasd(w => !w)} className="px-3 py-1.5 text-[11px] rounded bg-neutral-800/70 text-neutral-100 border border-white/10 hover:bg-neutral-700/70 transition">
            {wasd ? 'Mover: ON' : 'Mover: OFF'}
          </button>
          <button onClick={handleReset} className="px-3 py-1.5 text-[11px] rounded bg-neutral-800/70 text-neutral-100 border border-white/10 hover:bg-neutral-700/70 transition">
            Presentación
          </button>
        </div>
      )}
      <Canvas
        shadows
        camera={{ position: initialCameraPos.current, fov: 55 }}
        gl={{ antialias: true }}
        onCreated={({ camera, gl }) => {
          cameraRef.current = camera;
          rendererRef.current = gl;
        }}
      >
  <color attach="background" args={["#0f0f10"]} />
  {ENABLE_FOG && <fog attach="fog" args={["#0f0f10", FOG_NEAR, FOG_FAR]} />}
  <SceneManager key={sceneManagerKey} presentationMode={presentationMode} wasdEnabled={wasd} />
        <OrbitControls enablePan={started} enableZoom enableRotate maxPolarAngle={Math.PI/2.1} enabled={!animating} />
      </Canvas>
    </div>
  );
}

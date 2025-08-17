"use client";
import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
import SceneStructure from "./SceneStructure";
import { HALL_HEIGHT, FRONT_CENTER, HALF_HALL_D, HALL_WIDTH, CAMERA_INITIAL_POS, ENABLE_FOG, FOG_NEAR, FOG_FAR, PRESENTATION_EASE_OUT, EXPLORE_BOUNDS } from "./sceneConfig";
import { usePresentationTransition } from "./hooks/usePresentationTransition";
import { useAdaptiveQuality } from "./hooks/useAdaptiveQuality";
import ProfessionalLightingSystem from "../../components/lighting/BohemianLightingSystem";
import { useEntranceAnimation } from "./hooks/useEntranceAnimation";
import { useExploreControls } from "./hooks/useExploreControls";
import { PositionalAmbientAudio } from "./components/PositionalAmbientAudio";
import { useSound } from "../../providers/SoundProvider";
// WASD controls removidos temporalmente

export default function SalaPruebaPage() {
  const [started, setStarted] = useState(false); // for UI legacy control (can derive from exploring)
  // Removed WASD toggle state
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [sceneManagerKey, setSceneManagerKey] = useState(0);
  const {
    presentationMode,
    easingOut,
    animating,
    exploring,
    beginReady,
    registerBegin,
    requestStart,
    markExploring,
    reset: resetMachine
  } = usePresentationTransition({ easeOutMs: PRESENTATION_EASE_OUT * 1000, onExplore: () => setStarted(true) });
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

  const handleStart = () => requestStart();
  // Activar contexto de audio al hacer click en Entrar para cumplir requisito de interacción del usuario
  const { enableAudio } = useSound();
  const handleStartAudioWrapped = () => {
    enableAudio();
    handleStart();
  };
  const handleReset = () => {
    resetMachine();
    setStarted(false);
    if (cameraRef.current) {
      cameraRef.current.position.set(...initialCameraPos.current);
      cameraRef.current.lookAt(0, HALL_HEIGHT * 0.5, FRONT_CENTER - 6.5);
    }
    setSceneManagerKey(k => k + 1);
  };

  // Component inside Canvas to safely use R3F hooks
  function SceneManager({ presentationMode }) {
    const { begin, animating: fly, started: startedInner } = useEntranceAnimation({ onFinish: () => {
      markExploring();
    }});
    // Register immediately (not waiting react flush) via microtask
    useEffect(() => {
      registerBegin(begin);
    }, [begin, registerBegin]);
    // Activar controles de exploración sólo cuando exploring true
  useExploreControls(!presentationMode && !animating && exploring, { bounds: EXPLORE_BOUNDS });

    // Binder for camera & renderer refs
    const Binder = () => {
      const { camera, gl } = useEntranceAnimation.__proto__.constructor.name ? {} : {}; // no-op placeholder
      return null;
    };
    return (
      <>
        <ProfessionalLightingSystem exploring={exploring} />
        <SceneStructure rotate={presentationMode && !animating} exiting={easingOut} exploring={exploring} />
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
            <button onClick={handleStartAudioWrapped} disabled={animating || easingOut || (!beginReady && !easingOut)} className="px-5 py-2 rounded-md bg-white/90 text-neutral-900 text-xs font-medium shadow hover:bg-white transition disabled:opacity-60">
              {animating ? 'Entrando...' : easingOut ? 'Preparando...' : beginReady ? 'Entrar' : 'Cargando...'}
            </button>
          </div>
        </div>
      )}
      {exploring && (
        <div className="absolute top-3 left-3 z-20 flex gap-2 items-center">
          <button onClick={handleReset} className="px-3 py-1.5 text-[11px] rounded bg-neutral-800/70 text-neutral-100 border border-white/10 hover:bg-neutral-700/70 transition">Presentación</button>
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
  <color attach="background" args={["#0a0a0a"]} />
  {ENABLE_FOG && <fog attach="fog" args={["#0a0a0a", FOG_NEAR, FOG_FAR]} />}
  <SceneManager key={sceneManagerKey} presentationMode={presentationMode} />
  {/* Audio posicional multi-zona (se monta sólo al explorar) */}
  <PositionalAmbientAudio active={exploring} intensity={1} />
  {presentationMode && (
    <EffectComposer disableNormalPass>
      <Bloom 
        intensity={0.6} 
        luminanceThreshold={0.4} 
        luminanceSmoothing={0.9} 
        mipmapBlur 
        radius={0.7} 
      />
      <Vignette eskil={false} offset={0.15} darkness={0.6} />
    </EffectComposer>
  )}
  <OrbitControls
    enablePan={false}
    enableZoom={presentationMode && !animating}
    enableRotate={presentationMode && !animating}
    enabled={presentationMode && !animating}
    maxPolarAngle={Math.PI/2.1}
    makeDefault={presentationMode}
  />
      </Canvas>
    </div>
  );
}

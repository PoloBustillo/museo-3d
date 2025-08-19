"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import SceneStructure from '../SceneStructure';
import { anchorPoints } from '../config/anchorPoints';
import { HALL_HEIGHT, FRONT_CENTER, CAMERA_INITIAL_POS, ENABLE_FOG, FOG_NEAR, FOG_FAR, PRESENTATION_EASE_OUT, EXPLORE_BOUNDS } from '../sceneConfig';
import { usePresentationTransition } from '../hooks/usePresentationTransition';
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality';
import { useSalaData } from '../hooks/useSalaData';
import { usePreloadArtworkImages } from '../hooks/usePreloadArtworkImages';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { useExploreControls } from '../hooks/useExploreControls';
import { PositionalAmbientAudio } from '../components/PositionalAmbientAudio';
import { useSound } from '../../../providers/SoundProvider';
import ProfessionalLightingSystem from '../../../components/lighting/BohemianLightingSystem';
import { useParams, useRouter } from 'next/navigation';

export default function SalaMuseoIdPage() {
  const params = useParams();
  const salaId = params?.id;
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [sceneManagerKey, setSceneManagerKey] = useState(0);
  const { sala, artworks, loading, error } = useSalaData(salaId, { allowMockOnErrorWhenId: false });
  const { progress: preloadProgress, total: preloadTotal } = usePreloadArtworkImages(artworks, true, { concurrency: 4 });
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
  const initialCameraPos = useRef(CAMERA_INITIAL_POS);
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(...initialCameraPos.current);
      cameraRef.current.lookAt(0, HALL_HEIGHT * 0.5, FRONT_CENTER - 6.5);
    }
  }, [salaId]);
  const handleStart = () => requestStart();
  const { enableAudio } = useSound();
  const handleStartAudioWrapped = () => { enableAudio(); handleStart(); };
  const handleReset = () => { resetMachine(); setStarted(false); if (cameraRef.current) { cameraRef.current.position.set(...initialCameraPos.current); cameraRef.current.lookAt(0, HALL_HEIGHT * 0.5, FRONT_CENTER - 6.5); } setSceneManagerKey(k => k + 1); };
  const missingSala = salaId && !loading && !sala && error;
  const salaName = missingSala ? `Sala ${salaId}` : (sala?.nombre || 'Sala');
  const totalArtworks = artworks?.length || 0;
  function SceneManager({ presentationMode }) {
    const { begin } = useEntranceAnimation(cameraRef, { onFinish: () => { markExploring(); } });
    useEffect(() => { registerBegin(begin); }, [begin, registerBegin]);
    useExploreControls(!presentationMode && !animating && exploring, { bounds: EXPLORE_BOUNDS });
    return (
      <>
        <ProfessionalLightingSystem exploring={exploring} />
        <SceneStructure rotate={presentationMode && !animating} exiting={easingOut} exploring={exploring} artworks={artworks} />
      </>
    );
  }
  const AdaptiveQuality = () => { useAdaptiveQuality({ enabled:true }); return null; };
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-neutral-900'>
        <div className='text-center text-white text-sm'>Cargando sala...</div>
      </div>
    );
  }
  return (
    <div className='w-full h-screen bg-neutral-900 relative'>
      {presentationMode && (
        <div className='pointer-events-none select-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-24 bg-gradient-to-t from-neutral-900/75 via-neutral-900/10 to-transparent'>
          <div className='pointer-events-auto flex flex-col items-center gap-3 rounded-xl px-6 py-4 bg-neutral-900/40 backdrop-blur-md border border-white/10 shadow-lg'>
            <h1 className='text-white text-lg font-medium tracking-wide'>{salaName}</h1>
            <div className='flex gap-6 text-neutral-300 text-xs'>
              <span>{totalArtworks} obras</span>
              <span>{anchorPoints.length} puntos de anclaje</span>
              <span>40×28×12m</span>
              {loading && <span className='text-yellow-400'>Cargando...</span>}
              {missingSala && <span className='text-red-400'>No existe</span>}
              {!missingSala && error && <span className='text-red-400'>Datos mock</span>}
              {preloadTotal > 0 && (<span>{Math.round(preloadProgress * 100)}% imágenes</span>)}
            </div>
            {missingSala && (
              <p className='text-red-300 text-[11px] max-w-xs text-center'>No se encontró la sala solicitada. Verifica el código o vuelve atrás.</p>
            )}
            <div className='flex gap-3'>
              <button onClick={() => router.push('/museo')} className='px-4 py-2 rounded-md bg-neutral-800 text-white text-xs'>Volver</button>
              <button onClick={handleStartAudioWrapped} disabled={missingSala || animating || easingOut || (!beginReady && !easingOut)} className='px-5 py-2 rounded-md bg-white/90 text-neutral-900 text-xs font-medium shadow hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed'>
                {missingSala ? 'Sala no disponible' : animating ? 'Entrando...' : easingOut ? 'Preparando...' : beginReady ? 'Entrar' : 'Cargando...'}
              </button>
            </div>
          </div>
        </div>
      )}
      {exploring && (
        <div className='absolute top-3 left-3 z-20 flex gap-2 items-center'>
          <button onClick={handleReset} className='px-3 py-1.5 text-[11px] rounded bg-neutral-800/70 text-neutral-100 border border-white/10 hover:bg-neutral-700/70 transition'>Presentación</button>
          <button onClick={() => router.push('/museo')} className='px-3 py-1.5 text-[11px] rounded bg-neutral-800/70 text-neutral-100 border border-white/10 hover:bg-neutral-700/70 transition'>Salir</button>
        </div>
      )}
      <Canvas shadows camera={{ position: initialCameraPos.current, fov: 55 }} gl={{ antialias: true }} onCreated={({ camera, gl }) => { cameraRef.current = camera; rendererRef.current = gl; }}>
        <AdaptiveQuality />
        <color attach='background' args={['#0a0a0a']} />
        {ENABLE_FOG && <fog attach='fog' args={['#0a0a0a', FOG_NEAR, FOG_FAR]} />}
        <SceneManager key={sceneManagerKey} presentationMode={presentationMode} />
        <PositionalAmbientAudio active={exploring} intensity={1} />
        {presentationMode && (
          <EffectComposer disableNormalPass>
            <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
            <Vignette eskil={false} offset={0.15} darkness={0.6} />
          </EffectComposer>
        )}
        <OrbitControls enablePan={false} enableZoom={presentationMode && !animating} enableRotate={presentationMode && !animating} enabled={presentationMode && !animating} maxPolarAngle={Math.PI/2.1} makeDefault={presentationMode} />
        <ambientLight intensity={0.07} />
        <hemisphereLight args={['#f0f0f0', '#141619', 0.16]} />
      </Canvas>
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { AudioListener, AudioLoader, PositionalAudio } from "three";
import { useSound } from "../../../providers/SoundProvider";
import { FRONT_CENTER, BACK_CENTER, HALF_HALL_D } from "../sceneConfig";

/**
 * PositionalAmbientAudio
 * Reproduce dos zonas ambientales (frontal y trasera) y hace crossfade suave
 * dependiendo de la posición Z de la cámara. Incluye fade in/out al (des)activarse.
 *
 * Props:
 *  - active: boolean -> se monta y reproduce sólo cuando true
 *  - url: string -> ruta del archivo de audio (loop)
 *  - intensity: number (0..1.5) -> factor de volumen base
 */
// Usa un archivo existente en /public/audio. Puede recibir otro vía prop.
export function PositionalAmbientAudio({ active, url = "/audio/atmos-museum-quiet-met-nyc-48359.mp3", intensity = 1 }) {
  const { camera } = useThree();
  const { muted, soundEnabled, enableAudio } = useSound();
  const [listener] = useState(() => new AudioListener());
  const frontAudioRef = useRef(null);
  const backAudioRef = useRef(null);
  const bufferRef = useRef(null);
  const mountedRef = useRef(false);
  const loaderRef = useRef(null);
  const fadeRef = useRef(0); // 0..1
  const targetFadeRef = useRef(0);

  // Puntos de referencia (ligeramente dentro del espacio)
  const frontZ = FRONT_CENTER + HALF_HALL_D - 4; // dentro del lobby frontal
  const backZ = BACK_CENTER - HALF_HALL_D + 4;   // cerca del fondo

  const attachListener = useCallback(() => {
    try {
      if (!camera.children.includes(listener)) camera.add(listener);
    } catch {}
  }, [camera, listener]);

  // Cargar buffer (lazy)
  // Intento de desbloquear audio context automáticamente al primer gesto
  useEffect(() => {
    if (soundEnabled) return; // ya está
    const unlock = () => {
      enableAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [soundEnabled, enableAudio]);

  // Preload buffer aunque aún no esté activo para que el fade sea instantáneo al entrar
  useEffect(() => {
    if (!soundEnabled || muted) return;
    mountedRef.current = true;
    attachListener();
    if (bufferRef.current || loaderRef.current) return;
    loaderRef.current = new AudioLoader();
    loaderRef.current.load(
      url,
      (buffer) => {
        bufferRef.current = buffer;
    // Debug: confirmar carga
    if (process.env.NODE_ENV !== 'production') console.info('[AmbientAudio] buffer cargado', url);
        // Instanciar fuentes si aún no
        [frontAudioRef, backAudioRef].forEach((ref) => {
          if (ref.current && !ref.current.buffer) {
            try {
              ref.current.setBuffer(buffer);
              ref.current.setLoop(true);
              ref.current.setRefDistance(8);
              ref.current.setRolloffFactor(1.2);
              ref.current.setDistanceModel("linear");
              ref.current.setVolume(0); // inicia en 0 para fade
              ref.current.play();
            } catch (e) {
              console.warn("Error iniciando fuente de audio:", e);
            }
          }
        });
        targetFadeRef.current = 1; // dispara fade in
      },
      undefined,
  (err) => console.warn("Error cargando audio ambiental:", url, err)
    );
    return () => {
      mountedRef.current = false;
    };
  }, [active, soundEnabled, muted, url, attachListener]);

  // Fade out cuando se desactiva / mute
  useEffect(() => {
    if (!soundEnabled || muted) {
      targetFadeRef.current = 0;
      return;
    }
    targetFadeRef.current = active ? 1 : 0; // fade según estado
  }, [active, muted, soundEnabled]);

  // Actualización por frame: crossfade + fades globales
  useFrame((_, delta) => {
  const front = frontAudioRef.current;
  const back = backAudioRef.current;
    if (!front || !back) return;

    // Lerp del fade global
    const FADE_SPEED = 1.5; // seg para ir 0->1 aprox
    fadeRef.current += (targetFadeRef.current - fadeRef.current) * Math.min(1, delta * FADE_SPEED * 4);

    // Posición Z normalizada de la cámara entre backZ y frontZ
    const z = camera.position.z;
    const t = (z - backZ) / (frontZ - backZ);
    const tt = Math.min(1, Math.max(0, t));
    // Suavizado (ease in/out)
    const smooth = tt * tt * (3 - 2 * tt);
    const frontVol = smooth;
    const backVol = 1 - smooth;

    const BASE = 0.55 * intensity * fadeRef.current; // volumen base escalado
    try {
      const fv = BASE * frontVol;
      const bv = BASE * backVol;
      front.setVolume(fv);
      back.setVolume(bv);
    } catch (e) {
      // Silencioso
    }
  });

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      [frontAudioRef.current, backAudioRef.current].forEach((a) => {
        try {
          if (a?.isPlaying) a.stop();
        } catch {}
      });
      try { camera.remove(listener); } catch {}
    };
  }, [camera, listener]);

  // Mantener montado siempre para precarga; invisibles si no activo

  return (
    <group>
  {/* Fuente frontal */}
      <group position={[0, 1.8, frontZ]}>
        <positionalAudio ref={(n) => (frontAudioRef.current = n)} args={[listener]} />
      </group>
      {/* Fuente trasera */}
      <group position={[0, 1.8, backZ]}>
        <positionalAudio ref={(n) => (backAudioRef.current = n)} args={[listener]} />
      </group>
    </group>
  );
}

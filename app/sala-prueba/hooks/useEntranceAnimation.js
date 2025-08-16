"use client";
import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ENTRANCE_ANIM_DURATION, CAMERA_TARGET_POS, CAMERA_TARGET_LOOK } from '../sceneConfig';

// Easing functions
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useEntranceAnimation({ onFinish }) {
  const { camera, gl } = useThree();
  const animRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [exposureAnim, setExposureAnim] = useState(null);

  // Start camera travel
  const begin = useCallback(() => {
    if (animating || started) return;
    const [tx, ty, tz] = CAMERA_TARGET_POS;
    const [lx, ly, lz] = CAMERA_TARGET_LOOK;
    animRef.current = {
      start: performance.now(),
      duration: ENTRANCE_ANIM_DURATION,
      from: camera.position.clone(),
      to: { x: tx, y: ty, z: tz },
      lookAt: { x: lx, y: ly, z: lz }
    };
    // Exposure ramp (tone mapping) if available
    setExposureAnim({ start: performance.now(), from: gl.toneMappingExposure ?? 1, to: 1.15, duration: 2200 });
    setAnimating(true);
  }, [animating, started, camera, gl]);

  useFrame(() => {
    const now = performance.now();
    if (exposureAnim) {
      const { start, duration, from, to } = exposureAnim;
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutExpo(t);
      gl.toneMappingExposure = from + (to - from) * eased;
      if (t === 1) setExposureAnim(null);
    }
    if (animating && animRef.current) {
      const { start, duration, from, to, lookAt } = animRef.current;
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      camera.position.set(
        from.x + (to.x - from.x) * eased,
        from.y + (to.y - from.y) * eased,
        from.z + (to.z - from.z) * eased
      );
      // Head-bob slight sinus vertical oscillation near end
      const bob = t > 0.85 ? Math.sin((t - 0.85) * Math.PI * 4) * 0.05 * (1 - (1 - t) * 6) : 0;
      camera.position.y += bob;
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
      if (t === 1) {
        setAnimating(false);
        setStarted(true);
        animRef.current = null;
        onFinish && onFinish();
      }
    }
  });

  return { begin, animating, started };
}

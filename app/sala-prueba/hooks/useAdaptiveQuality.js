"use client";
import { useEffect, useRef } from 'react';

// Adapt devicePixelRatio & shadow map size based on FPS sampling.
export function useAdaptiveQuality({ rendererRef, enabled = true, minFps = 50 }) {
  const samples = useRef([]);
  const lastTime = useRef(performance.now());
  const frameCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let raf;
    const loop = () => {
      const now = performance.now();
      frameCount.current++;
      if (now - lastTime.current >= 1000) {
        const fps = frameCount.current * 1000 / (now - lastTime.current);
        samples.current.push(fps);
        if (samples.current.length > 5) samples.current.shift();
        const avg = samples.current.reduce((a,b)=>a+b,0)/samples.current.length;
        const r = rendererRef.current;
        if (r) {
          // Downscale resolution if FPS low; upscale mildly if plenty headroom
            if (avg < minFps && window.devicePixelRatio > 1) {
              r.setPixelRatio(Math.max(1, window.devicePixelRatio - 0.25));
            } else if (avg > minFps + 15 && r.getPixelRatio() < window.devicePixelRatio) {
              r.setPixelRatio(Math.min(window.devicePixelRatio, r.getPixelRatio() + 0.25));
            }
            // Shadow map adjust
            if (r.shadowMap.enabled) {
              if (avg < minFps && r.shadowMap.type !== 0) {
                // reduce size quickly by re-setting
                // (User may implement custom light resizing externally)
              }
            }
        }
        frameCount.current = 0;
        lastTime.current = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, minFps, rendererRef]);
}

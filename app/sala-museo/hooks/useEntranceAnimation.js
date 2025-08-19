// Copia local de useEntranceAnimation (actualizada API)
import { useCallback, useRef } from 'react';
import { Vector3, Quaternion } from 'three';
import { FRONT_CENTER, CAMERA_INITIAL_POS, CAMERA_INITIAL_LOOK_AT } from '../sceneConfig';

export function useEntranceAnimation(cameraRef, { onFinish } = {}) {
  const animRef = useRef(null);

  const begin = useCallback(() => {
    const cam = cameraRef?.current; if (!cam) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startPos = new Vector3().fromArray(CAMERA_INITIAL_POS);
    const endPos = new Vector3().copy(FRONT_CENTER instanceof Vector3 ? FRONT_CENTER : new Vector3(0,0,FRONT_CENTER)).add(new Vector3(0, 1.2, 2.5));
    const startQuat = new Quaternion().copy(cam.quaternion);
    cam.position.copy(startPos);
    cam.lookAt(...(Array.isArray(CAMERA_INITIAL_LOOK_AT) ? CAMERA_INITIAL_LOOK_AT : [0,1.8,0]));
    cam.updateMatrixWorld();
    const endLook = new Vector3(0, 1.6, FRONT_CENTER - 4);
    const tempCam = cam.clone(); tempCam.position.copy(endPos); tempCam.lookAt(endLook); tempCam.updateMatrixWorld();
    const endQuat = new Quaternion().copy(tempCam.quaternion);
    const duration = 2600; const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start)/duration);
      const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
      cam.position.lerpVectors(startPos, endPos, ease);
      cam.quaternion.slerpQuaternions(startQuat, endQuat, ease);
      if(t < 1){ animRef.current = requestAnimationFrame(step); }
      else { onFinish && onFinish(); }
    }
    animRef.current = requestAnimationFrame(step);
  }, [cameraRef, onFinish]);

  return { begin };
}

// Copia local de useHallMaterials (ajustada para devolver elementos React, no instancias directas)
import { useMemo } from 'react';
import * as THREE from 'three';

export function useHallMaterials(){
  return useMemo(()=>{
    const wallMat = (
      <meshStandardMaterial
        color="#e0dfdc"
        roughness={0.85}
        metalness={0.02}
      />
    );
    const floorMat = (
      <meshStandardMaterial
        color="#b9b6b3"
        roughness={0.95}
        metalness={0.02}
      />
    );
    const ceilMat = (
      <meshStandardMaterial
        color="#f1f1f1"
        roughness={0.9}
        metalness={0.01}
      />
    );
    // Sencillo material de sombra para círculo de presentación
    const shadowMat = (()=>{ const size=128; const c=document.createElement('canvas'); c.width=c.height=size; const ctx=c.getContext('2d'); const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2); g.addColorStop(0,'rgba(0,0,0,0.35)'); g.addColorStop(0.6,'rgba(0,0,0,0.18)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,size,size); const tex=new THREE.CanvasTexture(c); tex.needsUpdate=true; tex.anisotropy=4; return <meshBasicMaterial map={tex} transparent />; })();
    return { wallMat, floorMat, ceilMat, shadowMat };
  },[]);
}

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
    const ceilMat = (()=>{
      // Procedural rectangular tile pattern (light noise + subtle lines)
      const size = 512;
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f3f3f3';
      ctx.fillRect(0,0,size,size);
      // subtle noise
      const imgData = ctx.getImageData(0,0,size,size);
      for(let i=0;i<imgData.data.length;i+=4){
        const n = (Math.random()*12)|0; // 0-11
        imgData.data[i]   = 243 - n; // R
        imgData.data[i+1] = 243 - n; // G
        imgData.data[i+2] = 243 - n; // B
      }
      ctx.putImageData(imgData,0,0);
      ctx.strokeStyle = '#dedede';
      ctx.lineWidth = 2;
      const tileW = 160; // rectangular ratio
      const tileH = 80;
      for(let x=0;x<=size;x+=tileW){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,size); ctx.stroke();
      }
      for(let y=0;y<=size;y+=tileH){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(size,y); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6,4); // more tiles across ceiling
      tex.anisotropy = 4;
      return (
        <meshStandardMaterial
          map={tex}
          color="#ffffff"
          roughness={0.92}
          metalness={0.02}
        />
      );
    })();
    // Sencillo material de sombra para círculo de presentación
    const shadowMat = (()=>{ const size=128; const c=document.createElement('canvas'); c.width=c.height=size; const ctx=c.getContext('2d'); const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2); g.addColorStop(0,'rgba(0,0,0,0.35)'); g.addColorStop(0.6,'rgba(0,0,0,0.18)'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,size,size); const tex=new THREE.CanvasTexture(c); tex.needsUpdate=true; tex.anisotropy=4; return <meshBasicMaterial map={tex} transparent />; })();
    return { wallMat, floorMat, ceilMat, shadowMat };
  },[]);
}

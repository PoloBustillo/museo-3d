"use client";
import { useMemo } from 'react';
import * as THREE from 'three';
import { createCeilingTileTexture } from '../../../utils/proceduralTextures.js';
import { WALL_COLOR, WALL_TOP_COLOR, WALL_BOTTOM_COLOR, FLOOR_COLOR } from '../sceneConfig';

// Deterministic PRNG for stable noise
function prng(seed){
  let x = seed % 2147483647; if (x<=0) x+=2147483646;
  return function(){ x = (x*16807)%2147483647; return (x-1)/2147483646; };
}

function makeGradient({ top, bottom, noise=0.05, repeatX=4, seed=1 }) {
  const h=256, w=64;
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,top); g.addColorStop(1,bottom);
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  if(noise>0){
    const rnd=prng(seed); const img=ctx.getImageData(0,0,w,h); const amp=255*noise;
    for(let i=0;i<img.data.length;i+=4){
      const n=(rnd()-0.5)*amp;
      img.data[i]=Math.min(255,Math.max(0,img.data[i]+n));
      img.data[i+1]=Math.min(255,Math.max(0,img.data[i+1]+n));
      img.data[i+2]=Math.min(255,Math.max(0,img.data[i+2]+n));
    }
    ctx.putImageData(img,0,0);
  }
  const tex=new THREE.CanvasTexture(canvas);
  tex.wrapS=THREE.RepeatWrapping; tex.wrapT=THREE.ClampToEdgeWrapping;
  tex.repeat.set(repeatX,1); tex.anisotropy=4; tex.needsUpdate=true;
  return tex;
}

export function useHallMaterials(){
  return useMemo(()=>{
    const wallTex=makeGradient({ top:WALL_TOP_COLOR, bottom:WALL_BOTTOM_COLOR, noise:0.045, seed:11 });
    const floorTex=makeGradient({ top:'#f0f0f0', bottom:FLOOR_COLOR, noise:0.02, seed:22, repeatX:6 });
    
    // Usar módulo centralizado para textura de techo
    const { material: ceilMaterial } = createCeilingTileTexture();

    const wallMat=<meshStandardMaterial map={wallTex} color={WALL_COLOR} roughness={0.92} metalness={0.02} />;
    const floorMat=<meshStandardMaterial map={floorTex} color={FLOOR_COLOR} roughness={0.95} metalness={0.04} />;
    const ceilMat=<primitive object={ceilMaterial} attach="material" />;

    const shadowMat=(()=>{ 
      const size=256; 
      const canvas=document.createElement('canvas'); 
      canvas.width=canvas.height=size; 
      const ctx=canvas.getContext('2d'); 
      const gradient=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2); 
      gradient.addColorStop(0,'rgba(0,0,0,0.4)'); 
      gradient.addColorStop(0.5,'rgba(0,0,0,0.15)'); 
      gradient.addColorStop(1,'rgba(0,0,0,0)'); 
      ctx.fillStyle=gradient; 
      ctx.fillRect(0,0,size,size); 
      const tex=new THREE.CanvasTexture(canvas); 
      tex.anisotropy=4; 
      tex.needsUpdate=true; 
      return <meshBasicMaterial map={tex} transparent />; 
    })();

    return { wallMat, floorMat, ceilMat, shadowMat };
  },[]);
}

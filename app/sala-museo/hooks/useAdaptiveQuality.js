// Copia local de useAdaptiveQuality
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';

export function useAdaptiveQuality({ enabled=true, minDPR=0.6, maxDPR=1.2, sampleInterval=1200 }={}){
  const { gl } = useThree();
  const [dpr,setDpr]=useState(1);
  const frameCount=useRef(0); const lastTime=useRef(performance.now()); const fpsSamples=useRef([]); const intervalRef=useRef(null);
  useEffect(()=>{ if(!enabled) return; gl.setPixelRatio(dpr); },[dpr, gl, enabled]);
  useEffect(()=>{ if(!enabled) return; let raf; function loop(){ frameCount.current++; raf=requestAnimationFrame(loop); } raf=requestAnimationFrame(loop); return ()=> cancelAnimationFrame(raf); },[enabled]);
  useEffect(()=>{ if(!enabled) return; function sample(){ const now=performance.now(); const elapsed=(now-lastTime.current)/1000; const fps= frameCount.current/elapsed; frameCount.current=0; lastTime.current=now; fpsSamples.current.push(fps); if(fpsSamples.current.length>5) fpsSamples.current.shift(); const avg=fpsSamples.current.reduce((a,b)=>a+b,0)/fpsSamples.current.length; let target=dpr; if(avg<35) target=Math.max(minDPR, dpr-0.1); else if(avg>55) target=Math.min(maxDPR, dpr+0.05); if(target!==dpr) setDpr(parseFloat(target.toFixed(2))); }
    intervalRef.current=setInterval(sample, sampleInterval); return ()=> clearInterval(intervalRef.current); },[enabled, dpr, minDPR, maxDPR, sampleInterval]);
  return { dpr };
}

// Copia local de Door
'use client';
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { FRONT_CENTER, HALF_HALL_D, ENTRANCE_WIDTH, HALL_HEIGHT } from '../sceneConfig';
export function Door({ visible=true }){ const group=useRef(); const materialRef=useRef(); const tRef=useRef(0); useEffect(()=>{ tRef.current=0; },[visible]); useFrame((_,delta)=>{ if(!group.current) return; if(!visible){ group.current.visible=false; return; } group.current.visible=true; tRef.current=Math.min(tRef.current+delta*1.2,1); const ease=1 - Math.pow(1 - tRef.current,3); group.current.scale.y=ease; if(materialRef.current) materialRef.current.opacity=ease*0.9; }); return (<group ref={group} position={[0,0, FRONT_CENTER + HALF_HALL_D - 0.4]} scale={[1,0,1]}>
  <mesh position={[0, HALL_HEIGHT*0.5, 0]}><boxGeometry args={[ENTRANCE_WIDTH*0.9, HALL_HEIGHT-0.8, 0.12]} /><meshPhysicalMaterial ref={materialRef} color="#ffffff" transparent opacity={0} roughness={0.2} metalness={0.15} thickness={0.6} transmission={0.6} ior={1.15} reflectivity={0.25} /></mesh>
  {[-0.45,-0.15,0.15,0.45].map((x,i)=>(<mesh key={i} position={[x*ENTRANCE_WIDTH*0.9*0.5, HALL_HEIGHT*0.5, 0.01]}><boxGeometry args={[ENTRANCE_WIDTH*0.05, HALL_HEIGHT-0.8, 0.05]} /><meshStandardMaterial color="#c9c9c9" roughness={0.4} metalness={0.35} /></mesh>))}
  <mesh position={[-ENTRANCE_WIDTH*0.46, HALL_HEIGHT*0.5, -0.02]}><boxGeometry args={[0.15, HALL_HEIGHT-0.8, 0.12]} /><meshStandardMaterial color="#b5b5b5" roughness={0.55} metalness={0.3} /></mesh>
</group> ); }

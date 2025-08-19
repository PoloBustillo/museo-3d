import React from 'react';
import * as THREE from 'three';

const ProfessionalCeilingLamp = React.memo(function ProfessionalCeilingLamp({ position, intensity=6, color='#ffffff', distance=30, size=1 }){
  return (<group position={position}>
    <mesh position={[0,0.1,0]}><boxGeometry args={[0.8*size,0.1*size,0.1*size]} /><meshStandardMaterial color="#404040" metalness={0.7} roughness={0.3} /></mesh>
    <mesh position={[0,-0.3*size,0]}><cylinderGeometry args={[0.018*size,0.018*size,0.6*size,12]} /><meshStandardMaterial color="#e8e8e8" metalness={0.85} roughness={0.3} /></mesh>
    <mesh position={[0,-0.8*size,0]}><cylinderGeometry args={[0.35*size,0.42*size,0.65*size,24,1,true]} /><meshStandardMaterial color="#404040" metalness={0.7} roughness={0.3} side={THREE.FrontSide} /></mesh>
    <spotLight position={[0,-1.1*size,0]} angle={Math.PI/2.2} intensity={intensity} color={color} distance={distance} penumbra={0.5} decay={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
  </group> );
});
export const CeilingLamps = React.memo(function CeilingLamps({ hallDimensions, exploring=false }){ const { width,height,length }=hallDimensions; const cfg=[ { position:[0,height-0.1,0], size:1.3, intensity: exploring?8:6 }, { position:[-width*0.35,height-0.15,length*0.3], size:1.1, intensity: exploring?7:5.5 }, { position:[ width*0.35,height-0.15,length*0.3], size:1.1, intensity: exploring?7:5.5 }, { position:[-width*0.25,height-0.2,-length*0.25], size:1.0, intensity: exploring?6.5:5 }, { position:[ width*0.25,height-0.2,-length*0.25], size:1.0, intensity: exploring?6.5:5 }, { position:[0,height-0.18,-length*0.35], size:0.9, intensity: exploring?6:4.5 } ]; return <group>{cfg.map((c,i)=><ProfessionalCeilingLamp key={i} {...c} color="#ffffff" distance={exploring?35:30} />)}</group>; });

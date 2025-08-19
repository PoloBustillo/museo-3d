import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ProfessionalCeilingLamp = React.memo(function ProfessionalCeilingLamp({ position, intensity=6, color='#ffffff', distance=30, size=1, hallWidth=40, hallHeight=12 }){
  const downRef = useRef();
  const wallRefPrimary = useRef();
  const wallRefSecondary = useRef();
  const targetPrimary = useRef();
  const targetSecondary = useRef();

  const x = position[0];
  const isCentral = Math.abs(x) < hallWidth * 0.15;
  // Mid wall height target
  const targetY = hallHeight * 0.45 - position[1]; // relative in local group space (group at lamp position)
  // Distance from lamp to side walls
  const leftWallX = -hallWidth/2 + 0.4;
  const rightWallX = hallWidth/2 - 0.4;
  const toLeft = leftWallX - x;
  const toRight = rightWallX - x;

  useEffect(()=>{
    if (wallRefPrimary.current && targetPrimary.current){
      wallRefPrimary.current.target = targetPrimary.current;
      wallRefPrimary.current.target.updateMatrixWorld();
    }
    if (wallRefSecondary.current && targetSecondary.current){
      wallRefSecondary.current.target = targetSecondary.current;
      wallRefSecondary.current.target.updateMatrixWorld();
    }
  },[]);

  return (
    <group position={position}>
      <mesh position={[0,0.1,0]}><boxGeometry args={[0.8*size,0.1*size,0.1*size]} /><meshStandardMaterial color="#404040" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0,-0.3*size,0]}><cylinderGeometry args={[0.018*size,0.018*size,0.6*size,12]} /><meshStandardMaterial color="#e8e8e8" metalness={0.85} roughness={0.3} /></mesh>
      <mesh position={[0,-0.8*size,0]}><cylinderGeometry args={[0.35*size,0.42*size,0.65*size,24,1,true]} /><meshStandardMaterial color="#404040" metalness={0.7} roughness={0.3} side={THREE.FrontSide} /></mesh>
      {/* Downward soft fill */}
      <spotLight ref={downRef} position={[0,-1.05*size,0]} angle={Math.PI/3} intensity={intensity*0.35} color={color} distance={distance*0.9} penumbra={0.8} decay={1.4} />
      {/* Primary wall wash */}
      <spotLight ref={wallRefPrimary} position={[0,-1.05*size,0]} angle={Math.PI/6.2} intensity={intensity} color={color} distance={distance} penumbra={0.9} decay={1.6} />
      <mesh ref={targetPrimary} position={[ (isCentral? toRight: (toRight<toLeft? toRight: toLeft))*0.92, targetY, 0 ]} visible={false} />
      {isCentral && (
        <>
          <spotLight ref={wallRefSecondary} position={[0,-1.05*size,0]} angle={Math.PI/6.2} intensity={intensity*0.85} color={color} distance={distance} penumbra={0.9} decay={1.6} />
          <mesh ref={targetSecondary} position={[ toLeft*0.92, targetY, 0 ]} visible={false} />
        </>
      )}
    </group>
  );
});
export const CeilingLamps = React.memo(function CeilingLamps({ hallDimensions, exploring=false }){ const { width,height,length }=hallDimensions; const cfg=[ { position:[0,height-0.1,0], size:1.3, intensity: exploring?8:6 }, { position:[-width*0.35,height-0.15,length*0.3], size:1.1, intensity: exploring?7:5.5 }, { position:[ width*0.35,height-0.15,length*0.3], size:1.1, intensity: exploring?7:5.5 }, { position:[-width*0.25,height-0.2,-length*0.25], size:1.0, intensity: exploring?6.5:5 }, { position:[ width*0.25,height-0.2,-length*0.25], size:1.0, intensity: exploring?6.5:5 }, { position:[0,height-0.18,-length*0.35], size:0.9, intensity: exploring?6:4.5 } ]; return <group>{cfg.map((c,i)=><ProfessionalCeilingLamp key={i} {...c} color="#ffffff" distance={exploring?40:34} hallWidth={width} hallHeight={height} />)}</group>; });

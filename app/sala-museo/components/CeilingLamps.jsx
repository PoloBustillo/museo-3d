import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ProfessionalCeilingLamp = React.memo(function ProfessionalCeilingLamp({ position, intensity=6, color='#ffffff', distance=30, size=1, hallWidth=40, hallHeight=12, beams='dual' }){
  const downRef = useRef();
  const leftRef = useRef();
  const rightRef = useRef();
  const leftTarget = useRef();
  const rightTarget = useRef();
  const targetY = (hallHeight * 0.48 - position[1]);
  const leftWallX = -hallWidth/2 + 0.6;
  const rightWallX = hallWidth/2 - 0.6;
  const toLeft = leftWallX - position[0];
  const toRight = rightWallX - position[0];
  useEffect(()=>{ if(beams!=='right' && leftRef.current && leftTarget.current){ leftRef.current.target=leftTarget.current; leftRef.current.target.updateMatrixWorld(); } if(beams!=='left' && rightRef.current && rightTarget.current){ rightRef.current.target=rightTarget.current; rightRef.current.target.updateMatrixWorld(); } },[beams]);
  const beamFactor = beams==='dual'?1:1.18;
  return (
    <group position={position}>
      {/* Base plate */}
      <mesh position={[0,0.05,0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55*size,0.55*size,0.08*size,24]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Rod */}
      <mesh position={[0,-0.35*size,0]} castShadow>
        <cylinderGeometry args={[0.06*size,0.06*size,0.7*size,20]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Main housing (double shell) */}
      <mesh position={[0,-0.9*size,0]} castShadow>
        <cylinderGeometry args={[0.55*size,0.62*size,0.55*size,32,1,true]} />
        <meshStandardMaterial color="#535353" metalness={0.65} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner reflective bowl */}
      <mesh position={[0,-0.9*size,0]} rotation={[Math.PI,0,0]}>
        <cylinderGeometry args={[0.0,0.5*size,0.32*size,32,1,false]} />
        <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.15} emissive="#ffffff" emissiveIntensity={0.3} side={THREE.FrontSide} />
      </mesh>
      {/* Diffuser disc */}
      <mesh position={[0,-1.05*size,0]}>
        <circleGeometry args={[0.46*size, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} transparent opacity={0.9} roughness={0.1} metalness={0.05} />
      </mesh>
      {/* Decorative ring */}
      <mesh position={[0,-1.05*size,0]}>
        <torusGeometry args={[0.47*size,0.03*size,12,32]} />
        <meshStandardMaterial color="#606060" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Downward fill */}
      <spotLight ref={downRef} position={[0,-1.07*size,0]} angle={Math.PI/3} intensity={intensity*0.27} color={color} distance={distance*0.7} penumbra={0.95} decay={1.25} castShadow={false} />
      {/* Left wall wash */}
      {beams!=='right' && <>
        <spotLight ref={leftRef} position={[0,-1.07*size,0]} angle={Math.PI/7.2} intensity={intensity*0.95*beamFactor} color={color} distance={distance} penumbra={0.85} decay={1.35} castShadow={false} />
        <mesh ref={leftTarget} position={[toLeft*0.94, targetY, 0]} visible={false} />
      </>}
      {/* Right wall wash */}
      {beams!=='left' && <>
        <spotLight ref={rightRef} position={[0,-1.07*size,0]} angle={Math.PI/7.2} intensity={intensity*0.95*beamFactor} color={color} distance={distance} penumbra={0.85} decay={1.35} castShadow={false} />
        <mesh ref={rightTarget} position={[toRight*0.94, targetY, 0]} visible={false} />
      </>}
    </group>
  );
});

export const CeilingLamps = React.memo(function CeilingLamps({ hallDimensions, exploring=false }){ 
  const { width,height,length }=hallDimensions; 
  const spacing = 14; // mayor separación
  const halfL = length/2 - 3;
  const lamps = [];
  let toggleSide = false;
  for(let z=-halfL; z<=halfL; z+=spacing){
    // Central dual-beam lamp
    lamps.push({ position:[0,height-0.12,z], size:1.05, intensity: exploring?8.2:6.4, beams:'dual' });
    // Mid segment side row (staggered)
    const midZ = z + spacing/2;
    if(midZ <= halfL){
      toggleSide = !toggleSide;
      // Two side lamps pointing inward (single beam each)
      const sideOffset = width*0.26;
      lamps.push({ position:[-sideOffset,height-0.18,midZ], size:0.9, intensity: exploring?7.2:5.6, beams:'right' });
      lamps.push({ position:[ sideOffset,height-0.18,midZ], size:0.9, intensity: exploring?7.2:5.6, beams:'left' });
    }
  }
  return <group>{lamps.map((c,i)=><ProfessionalCeilingLamp key={i} {...c} color="#ffffff" distance={exploring?46:38} hallWidth={width} hallHeight={height} />)}</group>; 
});

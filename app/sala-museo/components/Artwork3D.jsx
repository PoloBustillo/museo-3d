// Copia local de Artwork3D (independiente de sala-prueba)
import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { RoundedPlaneGeometry } from 'maath/geometry';
import { useModal } from '../../../providers/ModalProvider';
extend({ RoundedPlaneGeometry });
const textureCache=new Map();
const ArtworkFrame=React.memo(function ArtworkFrame({ width=4, height=3, depth=0.1, frameWidth=0.15, frameStyle='classic', material='wood', highlight=false }){ const frameMaterials=useMemo(()=>{ const baseColors={ wood:'#8b4513', metal:'#2c2c2c', gold:'#ffd700', silver:'#c0c0c0'}; const base=baseColors[material]||baseColors.wood; const hl=highlight? new THREE.Color(base).offsetHSL(0,0,0.25): new THREE.Color(base); return new THREE.MeshStandardMaterial({ color:hl, roughness:(material==='metal'||material==='silver')?0.3:0.8, metalness:(material==='metal'||material==='silver')?0.9:(material==='gold'?0.8:0.1), emissive: highlight? hl.clone().multiplyScalar(0.15): new THREE.Color('#000'), emissiveIntensity: highlight?0.6:0 }); },[material, highlight]); const frameGeometry=useMemo(()=>{ const shape=new THREE.Shape(); shape.moveTo(-width/2 - frameWidth, -height/2 - frameWidth); shape.lineTo(width/2 + frameWidth, -height/2 - frameWidth); shape.lineTo(width/2 + frameWidth, height/2 + frameWidth); shape.lineTo(-width/2 - frameWidth, height/2 + frameWidth); shape.closePath(); const hole=new THREE.Path(); hole.moveTo(-width/2,-height/2); hole.lineTo(width/2,-height/2); hole.lineTo(width/2,height/2); hole.lineTo(-width/2,height/2); hole.closePath(); shape.holes.push(hole); return new THREE.ExtrudeGeometry(shape,{ depth, bevelEnabled: frameStyle!=='minimal', bevelThickness: frameStyle==='ornate'?0.02:0.01, bevelSize: frameStyle==='ornate'?0.02:0.01, bevelSegments: frameStyle==='ornate'?8:4 }); },[width,height,depth,frameWidth,frameStyle]); return <mesh geometry={frameGeometry} material={frameMaterials} castShadow />; });
const ArtworkCanvas=React.memo(function ArtworkCanvas({ width=4, height=3, artwork, artworkType='painting', onAspect=()=>{} }){ const canvasRef=useRef(); const imageUrl= artwork?.imagenUrlWebp || artwork?.url_imagen || artwork?.imageUrl; const artworkMaterial=useMemo(()=>{ if(imageUrl){ let texture=textureCache.get(imageUrl); if(!texture){ const loader=new THREE.TextureLoader(); texture=loader.load(imageUrl,(tx)=>{ if(tx.image?.width&&tx.image?.height) onAspect(tx.image.width/tx.image.height); tx.wrapS=THREE.ClampToEdgeWrapping; tx.wrapT=THREE.ClampToEdgeWrapping; tx.generateMipmaps=false; tx.minFilter=THREE.LinearFilter; tx.magFilter=THREE.LinearFilter; tx.flipY=true; if(tx.colorSpace!==undefined) tx.colorSpace=THREE.SRGBColorSpace; textureCache.set(imageUrl,tx); }); } return new THREE.MeshStandardMaterial({ map:texture, roughness: artworkType==='photo'?0.1:0.6, metalness:0 }); } const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=Math.floor(1024*(height/width)); const ctx=canvas.getContext('2d'); const baseColor=artwork?.color||'#e8f4f8'; const gradient=ctx.createLinearGradient(0,0,canvas.width,canvas.height); gradient.addColorStop(0,baseColor); gradient.addColorStop(1,adjustBrightness(baseColor,-0.3)); ctx.fillStyle=gradient; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.textAlign='center'; ctx.fillStyle='#2c3e50'; ctx.font='bold 48px Arial'; ctx.fillText('🖼️', canvas.width/2, canvas.height/2 -100); ctx.font='bold 32px Arial'; ctx.fillText('IMAGEN NO DISPONIBLE', canvas.width/2, canvas.height/2 -20); if(artwork?.titulo){ ctx.font='24px Arial'; ctx.fillStyle='#34495e'; ctx.fillText(`"${artwork.titulo}"`, canvas.width/2, canvas.height/2 +40); } if(artwork?.autor){ ctx.font='20px Arial'; ctx.fillStyle='#7f8c8d'; ctx.fillText(artwork.autor, canvas.width/2, canvas.height/2 +80); } const texture=new THREE.CanvasTexture(canvas); texture.needsUpdate=true; texture.wrapS=THREE.ClampToEdgeWrapping; texture.wrapT=THREE.ClampToEdgeWrapping; texture.flipY=true; if(texture.colorSpace!==undefined) texture.colorSpace=THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map:texture, roughness: artworkType==='photo'?0.1:0.7, metalness:0 }); },[imageUrl, artworkType, width, height, onAspect]); useEffect(()=>{ if(!imageUrl) return; const tx=textureCache.get(imageUrl); if(tx?.image?.width&&tx.image?.height) onAspect(tx.image.width/tx.image.height); },[imageUrl,onAspect]); function adjustBrightness(color, amount){ const num=parseInt(color.replace('#',''),16); const amt=Math.round(2.55*amount*100); const R=(num>>16)+amt; const G=(num>>8 & 0x00FF)+amt; const B=(num & 0x0000FF)+amt; return '#'+(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0.100 + (B<255?B<1?0:B:255)).toString(16).slice(1); } useFrame((state)=>{ if(canvasRef.current && artwork?.animated){ canvasRef.current.rotation.y=Math.sin(state.clock.elapsedTime*0.5)*0.02; } }); return (<mesh ref={canvasRef} position={[0,0,0.08]} material={artworkMaterial} castShadow receiveShadow><planeGeometry args={[width,height]} /></mesh> ); });
const Artwork3D=React.memo(function Artwork3D({ artwork, width=12, height=8, interactive=true }){ const groupRef=useRef(); const [hovered,setHovered]=useState(false); const [aspect,setAspect]=useState(null); const [dims,setDims]=useState({ w:width, h:height }); const [focused,setFocused]=useState(false); const { openModal } = useModal(); const { camera } = useThree(); const lampSpotRef=useRef(null); const lampTargetRef=useRef(null); const lampHeadRef=useRef(null); const lampHaloRef=useRef(null); const lampFillRef=useRef(null); const topWashRef=useRef(null); const frontFillRef=useRef(null); const floorSpotMainRef=useRef(null); const floorHaloRef=useRef(null); const floorFillRef=useRef(null); const wallBulbRef=useRef(null); const floorBulbRef=useRef(null); const focusedRef=useRef(false); const tmpWorldPosRef=useRef(new THREE.Vector3()); const tmpToArtworkRef=useRef(new THREE.Vector3()); const tmpCamDirRef=useRef(new THREE.Vector3()); const warmStrong=useMemo(()=> new THREE.Color('#ffaa44'),[]); const warmSoft=useMemo(()=> new THREE.Color('#ff8c00'),[]); const warmStrong2=useMemo(()=> new THREE.Color('#ffb347'),[]); const warmSoft2=useMemo(()=> new THREE.Color('#ff9500'),[]); const tmpScaleRef=useRef(new THREE.Vector3(1,1,1)); useEffect(()=>{ if(!aspect) return; const targetHeight=Math.min(Math.max(height,4.5),6.5); let targetWidth=targetHeight*aspect; const maxWidth=10; const minWidth=2.5; if(targetWidth>maxWidth) targetWidth=maxWidth; if(targetWidth<minWidth) targetWidth=minWidth; setDims({ w:targetWidth, h:targetHeight }); },[aspect,height]); useFrame(()=>{ if(!groupRef.current) return; if(interactive){ const targetScale=hovered?1.02:1.0; tmpScaleRef.current.set(targetScale,targetScale,targetScale); groupRef.current.scale.lerp(tmpScaleRef.current,0.15); } const active=(focusedRef.current||hovered)?1:0; if(lampSpotRef.current){ lampSpotRef.current.visible=!!active; if(active){ const cur=lampSpotRef.current.intensity; lampSpotRef.current.intensity=THREE.MathUtils.lerp(cur,6.8,0.12); } } if(lampHaloRef.current){ lampHaloRef.current.visible=!!active; if(active){ const cur=lampHaloRef.current.intensity; lampHaloRef.current.intensity=THREE.MathUtils.lerp(cur,2.0,0.12); } } if(lampFillRef.current){ lampFillRef.current.visible=!!active; if(active){ const cur=lampFillRef.current.intensity; lampFillRef.current.intensity=THREE.MathUtils.lerp(cur,0.9,0.12); } } if(topWashRef.current){ topWashRef.current.visible=!!active; } if(frontFillRef.current){ frontFillRef.current.visible=!!active; } if(floorSpotMainRef.current){ floorSpotMainRef.current.visible=!!active; if(active){ floorSpotMainRef.current.intensity=THREE.MathUtils.lerp(floorSpotMainRef.current.intensity,12.0,0.12); } } if(floorHaloRef.current){ floorHaloRef.current.visible=!!active; if(active){ floorHaloRef.current.intensity=THREE.MathUtils.lerp(floorHaloRef.current.intensity,3.8,0.12); } } if(floorFillRef.current){ floorFillRef.current.visible=!!active; if(active){ floorFillRef.current.intensity=THREE.MathUtils.lerp(floorFillRef.current.intensity,1.2,0.12); } } if(wallBulbRef.current?.material){ const mat=wallBulbRef.current.material; mat.emissive.lerp((focusedRef.current||hovered)?warmStrong:warmSoft,0.15); mat.emissiveIntensity=THREE.MathUtils.lerp(mat.emissiveIntensity,(focusedRef.current||hovered)?5.5:3.8,0.12); } if(floorBulbRef.current?.material){ const mat=floorBulbRef.current.material; mat.emissive.lerp((focusedRef.current||hovered)?warmStrong2:warmSoft2,0.15); mat.emissiveIntensity=THREE.MathUtils.lerp(mat.emissiveIntensity,(focusedRef.current||hovered)?6.0:4.2,0.12); } // Orient lamp head smoothly each frame
  if(lampHeadRef.current && lampTargetRef.current){
    const headPos = tmpWorldPosRef.current.set(0,0,0);
    const targetPos = tmpToArtworkRef.current.set(0,0,0);
    lampHeadRef.current.getWorldPosition(headPos);
    lampTargetRef.current.getWorldPosition(targetPos);
    const dir = targetPos.sub(headPos).normalize();
    const from = new THREE.Vector3(0,0,1);
    const q = new THREE.Quaternion().setFromUnitVectors(from,dir);
    lampHeadRef.current.quaternion.slerp(q,0.22);
  }
 });
 useEffect(()=>{ const id=setInterval(()=>{ if(!groupRef.current) return; const worldPos=tmpWorldPosRef.current; groupRef.current.getWorldPosition(worldPos); const toArtwork=tmpToArtworkRef.current.copy(worldPos).sub(camera.position).normalize(); camera.getWorldDirection(tmpCamDirRef.current); const facing=tmpCamDirRef.current.dot(toArtwork); const dist=camera.position.distanceTo(worldPos); const isFocused= facing>0.985 && dist<40; setFocused(p=> p!==isFocused? isFocused:p); focusedRef.current=isFocused; },300); return ()=> clearInterval(id); },[camera]); useEffect(()=>{ if(lampSpotRef.current && lampTargetRef.current){ lampSpotRef.current.target=lampTargetRef.current; lampSpotRef.current.target.updateMatrixWorld(); } },[dims.h,dims.w]); const handlePointerOver=()=> interactive && setHovered(true); const handlePointerOut=()=> interactive && setHovered(false); const handleClick=(e)=>{ e.stopPropagation(); if(artwork) openModal('artwork-modal',{ artwork:{ ...artwork } }); };
  return (<group ref={groupRef} scale={dims.w>width? width/dims.w:1} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick} dispose={null}>
    <ArtworkCanvas width={dims.w} height={dims.h} artwork={artwork} artworkType={artwork?.tipo||'painting'} onAspect={setAspect} />
    <ArtworkFrame width={dims.w} height={dims.h} depth={0.15} frameWidth={0.15} frameStyle={'classic'} material={'wood'} highlight={focused} />
    <group position={[0, dims.h/2 + 0.42, 0.0]}>
      {/* Wall fixture redesigned */}
      <mesh position={[0,-0.12,0]} castShadow>
        <cylinderGeometry args={[0.1,0.1,0.22,20]} />
        <meshStandardMaterial color="#3f3f3f" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0,-0.25,0.36]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.035,0.035,0.72,24]} />
        <meshStandardMaterial color="#565656" metalness={0.65} roughness={0.4} />
      </mesh>
      <group ref={lampHeadRef} position={[0,-0.25,0.72]}>
        <mesh rotation={[0,0,0]} castShadow>
          <cylinderGeometry args={[0.18,0.22,0.28,28,1,true]} />
          <meshStandardMaterial color="#5d5d5d" metalness={0.55} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0,0,0.08]}>
          <circleGeometry args={[0.16,32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffefa8" emissiveIntensity={0.45} roughness={0.2} metalness={0.1} />
        </mesh>
      </group>
      <mesh ref={wallBulbRef} position={[0,-0.255,0.68]}>
        <sphereGeometry args={[0.06,24,24]} />
        <meshStandardMaterial emissive={'#ff9d2d'} emissiveIntensity={3.0} color="#ffa733" />
      </mesh>
      <spotLight ref={lampSpotRef} position={[0,-0.255,0.68]} angle={Math.PI/5.2} penumbra={0.95} intensity={4.8} distance={6.8} decay={2} color={'#ff9d2d'} castShadow={false} />
      <mesh ref={lampTargetRef} position={[0, -(dims.h/2 + 0.42), 0.09]} visible={false} />
      <spotLight ref={lampHaloRef} position={[0,-0.255,0.68]} angle={Math.PI/3.1} penumbra={1} intensity={1.5} distance={5.2} decay={2} color={'#ffb85c'} castShadow={false} />
      <pointLight ref={lampFillRef} position={[0,-0.30,0.38]} intensity={0.65} distance={2.3} decay={2} color={'#ff9d2d'} />
    </group>
    {/* Floor spotlight redesigned */}
    <group position={[0,-4.8,1.8]}>
      <mesh position={[0,0.03,0]} castShadow>
        <cylinderGeometry args={[0.34,0.34,0.06,32]} />
        <meshStandardMaterial color="#1f1f1f" metalness={0.65} roughness={0.45} />
      </mesh>
      <mesh position={[0,1.55,0]} castShadow>
        <cylinderGeometry args={[0.055,0.055,3.1,28]} />
        <meshStandardMaterial color="#303030" metalness={0.7} roughness={0.35} />
      </mesh>
      <group position={[0,3.05,0]} rotation={[-Math.PI/4,0,0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3,0.36,0.5,32,1,true]} />
          <meshStandardMaterial color="#414141" metalness={0.65} roughness={0.38} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0,0,0.14]}>
          <circleGeometry args={[0.26,40]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffc674" emissiveIntensity={0.55} roughness={0.25} metalness={0.12} />
        </mesh>
      </group>
      <mesh ref={floorBulbRef} position={[0,2.9,0.1]}>
        <sphereGeometry args={[0.1,32,32]} />
        <meshStandardMaterial emissive={'#ffac33'} emissiveIntensity={3.2} color="#ffb347" />
      </mesh>
      <spotLight ref={floorSpotMainRef} position={[0,2.9,0.1]} angle={Math.PI/7} penumbra={0.72} intensity={8.5} distance={15} decay={1.8} color={'#ff9d2d'} castShadow={false} />
      <spotLight ref={floorHaloRef} position={[0,2.9,0.1]} angle={Math.PI/3.5} penumbra={1} intensity={2.9} distance={10} decay={2} color={'#ffb85c'} castShadow={false} />
      <pointLight ref={floorFillRef} position={[0,2.5,0]} intensity={0.85} distance={6} decay={2} color={'#ffac33'} />
    </group>
  </group> ); });
export default Artwork3D;

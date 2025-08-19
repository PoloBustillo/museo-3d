// Copia local de AnchorPoints (removida dependencia de sala-prueba)
import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { anchorPoints, getAnchorById } from '../config/anchorPoints';
import Artwork3D from './Artwork3D';

const AnchorPoints = React.memo(function AnchorPoints({ artworks = [], debug = false }) {
  const debugMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color:'#ff6b6b', transparent:true, opacity:0.7 }),[]);
  useEffect(()=>{ if(debug && artworks.length){ console.log('Distribución de obras:', artworks.map(a=>a.titulo)); } },[debug, artworks]);
  const artworkMeshes = useMemo(()=> artworks.map((artwork,i)=>{ const anchor=getAnchorById(artwork.anchorId); if(!anchor) return null; const [x,y,z]=anchor.position; const [nx,ny,nz]=anchor.normal; const pos=[ x+nx*0.1, y, z+nz*0.1 ]; let rot=[0,0,0]; if(nx>0) rot=[0,Math.PI/2,0]; else if(nx<0) rot=[0,-Math.PI/2,0]; else if(nz<0) rot=[0,Math.PI,0]; return (<group key={artwork.id||i} position={pos} rotation={rot} frustumCulled={false}><Artwork3D artwork={artwork} width={artwork.width||6} height={artwork.height||4.5} interactive /></group> ); }).filter(Boolean),[artworks]);
  const debugPoints=useMemo(()=>{ if(!debug) return []; const used=artworks.map(a=>a.anchorId); return anchorPoints.map(p=>{ const isUsed=used.includes(p.id); return (<mesh key={p.id} position={p.position}><sphereGeometry args={[0.15,8,6]} /><meshBasicMaterial color={isUsed?'#4ecdc4':'#ff6b6b'} transparent opacity={0.8} /></mesh> ); }); },[debug, artworks]);
  return <group>{artworkMeshes}{debug && debugPoints}</group>;
});
export default AnchorPoints;

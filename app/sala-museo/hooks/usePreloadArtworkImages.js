// Copia local de usePreloadArtworkImages
import { useEffect, useRef, useState } from 'react';

export function usePreloadArtworkImages(artworks, { concurrency=3 }={}) {
  const [progress,setProgress]=useState(0);
  const [done,setDone]=useState(false);
  const startedRef=useRef(false);

  useEffect(()=>{ if(!artworks || artworks.length===0){ setProgress(0); setDone(true); return; } setDone(false); setProgress(0); startedRef.current=false; },[artworks]);

  useEffect(()=>{ if(!artworks || artworks.length===0 || startedRef.current) return; startedRef.current=true; let cancelled=false; const urls=[...new Set(artworks.map(a=> a.imageUrl || a.imagenUrlWebp || a.url_imagen).filter(Boolean))]; const total=urls.length; if(total===0){ setProgress(100); setDone(true); return; }
    let completed=0; function update(){ completed++; setProgress(Math.round((completed/total)*100)); if(completed>=total) setDone(true); }
    const queue=[...urls]; const workers=Math.min(concurrency, queue.length);
    function loadNext(){ if(cancelled) return; const url=queue.shift(); if(!url) return; const img=new Image(); img.onload=()=>{ if(!cancelled){ update(); loadNext(); } }; img.onerror=()=>{ if(!cancelled){ update(); loadNext(); } }; img.src=url; }
    for(let i=0;i<workers;i++) loadNext();
    return ()=>{ cancelled=true; };
  },[artworks, concurrency]);

  return { progress, done };
}

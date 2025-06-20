import { useRef } from "react";

export function useCardMouseGlow() {
  const blobRef = useRef();

  function handleMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (blobRef.current) {
      blobRef.current.style.transform = `translate(${x - 130}px, ${y - 130}px)`; // 130 = blob radius/2
      blobRef.current.style.opacity = "0.7";
    }
  }

  function handleMouseLeave() {
    if (blobRef.current) {
      blobRef.current.style.opacity = "0";
    }
  }

  return { blobRef, handleMouseMove, handleMouseLeave };
}

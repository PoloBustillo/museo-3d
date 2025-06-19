"use client";
import { createContext, useContext, useState } from "react";
const SoundContext = createContext();
export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const toggleMute = () => setMuted((m) => !m);
  return (
    <SoundContext.Provider value={{ muted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}
export const useSound = () => useContext(SoundContext);

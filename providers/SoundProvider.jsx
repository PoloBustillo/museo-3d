"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContext = useRef(null);
  const backgroundAudio = useRef(null);

  // Inicializar contexto de audio
  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      try {
        audioContext.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        setSoundEnabled(true);
      } catch (error) {
        console.warn("No se pudo inicializar el contexto de audio:", error);
      }
    }
  }, []);

  // Activar audio con interacción del usuario
  const enableAudio = useCallback(() => {
    if (!soundEnabled) {
      initAudioContext();
      setSoundEnabled(true);
    }
  }, [soundEnabled, initAudioContext]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  // Cambiar volumen
  const setAudioVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);

  // Reproducir sonido de efecto
  const playSound = useCallback(
    (type = "click") => {
      if (muted || !soundEnabled || !audioContext.current) return;

      try {
        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);

        // Configurar sonido según el tipo
        switch (type) {
          case "click":
            oscillator.frequency.setValueAtTime(
              800,
              audioContext.current.currentTime
            );
            oscillator.frequency.exponentialRampToValueAtTime(
              400,
              audioContext.current.currentTime + 0.1
            );
            break;
          case "modal-open":
            oscillator.frequency.setValueAtTime(
              600,
              audioContext.current.currentTime
            );
            oscillator.frequency.exponentialRampToValueAtTime(
              800,
              audioContext.current.currentTime + 0.2
            );
            break;
          case "modal-close":
            oscillator.frequency.setValueAtTime(
              800,
              audioContext.current.currentTime
            );
            oscillator.frequency.exponentialRampToValueAtTime(
              400,
              audioContext.current.currentTime + 0.2
            );
            break;
          case "zoom":
            oscillator.frequency.setValueAtTime(
              400,
              audioContext.current.currentTime
            );
            oscillator.frequency.exponentialRampToValueAtTime(
              600,
              audioContext.current.currentTime + 0.1
            );
            break;
          default:
            oscillator.frequency.setValueAtTime(
              600,
              audioContext.current.currentTime
            );
        }

        gainNode.gain.setValueAtTime(
          volume * 0.3,
          audioContext.current.currentTime
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.current.currentTime + 0.1
        );

        oscillator.start(audioContext.current.currentTime);
        oscillator.stop(audioContext.current.currentTime + 0.1);
      } catch (error) {
        console.warn("Error al reproducir sonido:", error);
      }
    },
    [muted, soundEnabled, volume]
  );

  // Limpiar contexto de audio
  const cleanupAudio = useCallback(() => {
    if (audioContext.current && audioContext.current.state !== "closed") {
      audioContext.current.close();
    }
  }, []);

  return (
    <SoundContext.Provider
      value={{
        muted,
        volume,
        soundEnabled,
        toggleMute,
        setAudioVolume,
        enableAudio,
        playSound,
        initAudioContext,
        cleanupAudio,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound debe ser usado dentro de un SoundProvider");
  }
  return context;
};

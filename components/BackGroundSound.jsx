import { useThree } from "@react-three/fiber";
import { AudioListener, AudioLoader, PositionalAudio } from "three";
import { useEffect, useRef, useCallback, useState } from "react";
import { useSound } from "../providers/SoundProvider";

export default function BackgroundSound({ url }) {
  const { camera } = useThree();
  const [listener] = useState(() => new AudioListener());
  const audio = useRef();
  const isConnected = useRef(false);
  const isLoaded = useRef(false);
  const isMounted = useRef(true);
  const { muted, soundEnabled, enableAudio } = useSound();

  // Callback ref para asegurar la referencia
  const setAudioRef = useCallback((node) => {
    if (node) {
      audio.current = node;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const cleanup = () => {
      if (audio.current && isLoaded.current) {
        try {
          // Verificar si el audio está reproduciéndose antes de detenerlo
          if (audio.current.isPlaying) {
            audio.current.stop();
          }

          // Verificar si el nodo está conectado antes de desconectarlo
          if (
            isConnected.current &&
            audio.current.context &&
            audio.current.context.state !== "closed"
          ) {
            audio.current.disconnect();
            isConnected.current = false;
          }
        } catch (error) {
          // Silenciar errores de desconexión ya que son esperados cuando el componente se desmonta
          if (!error.message.includes("disconnect")) {
            console.warn("Error al limpiar audio:", error);
          }
        }
      }
      isLoaded.current = false;
    };

    if (isMounted.current && soundEnabled && !muted) {
      try {
        camera.add(listener);
        const loader = new AudioLoader();

        loader.load(
          url,
          (buffer) => {
            if (audio.current && isMounted.current && !muted) {
              try {
                audio.current.setBuffer(buffer);
                audio.current.setLoop(true);
                audio.current.setVolume(0.8);
                audio.current.play();
                isConnected.current = true;
                isLoaded.current = true;
              } catch (error) {
                console.warn("Error al reproducir audio:", error);
              }
            }
          },
          undefined,
          (error) => {
            console.warn("Error al cargar audio:", error);
          }
        );
      } catch (error) {
        console.warn("Error al inicializar audio:", error);
      }
    } else if (muted && audio.current && isLoaded.current) {
      // Pausar audio si está muteado
      try {
        if (audio.current.isPlaying) {
          audio.current.stop();
        }
      } catch (error) {
        console.warn("Error al pausar audio:", error);
      }
    }

    return () => {
      isMounted.current = false;
      cleanup();
      try {
        camera.remove(listener);
      } catch (error) {
        console.warn("Error al remover listener:", error);
      }
    };
  }, [url, camera, listener, soundEnabled, muted]);

  // Cleanup adicional cuando el componente se desmonta
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (audio.current && isLoaded.current) {
        try {
          if (audio.current.isPlaying) {
            audio.current.stop();
          }
          if (
            isConnected.current &&
            audio.current.context &&
            audio.current.context.state !== "closed"
          ) {
            audio.current.disconnect();
          }
        } catch (error) {
          // Silenciar errores de desconexión
          if (!error.message.includes("disconnect")) {
            console.warn("Error en cleanup final:", error);
          }
        }
      }
    };
  }, []);

  // Activar audio cuando el usuario interactúe
  useEffect(() => {
    const handleUserInteraction = () => {
      enableAudio();
    };

    if (!soundEnabled) {
      window.addEventListener("click", handleUserInteraction, { once: true });
      window.addEventListener("keydown", handleUserInteraction, { once: true });
      window.addEventListener("touchstart", handleUserInteraction, {
        once: true,
      });
    }

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [soundEnabled, enableAudio]);

  return <positionalAudio ref={setAudioRef} args={[listener]} />;
}

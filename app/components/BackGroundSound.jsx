import { useLoader, useThree } from '@react-three/fiber'
import { AudioListener, AudioLoader, PositionalAudio } from 'three'
import { useEffect, useRef, useCallback, useState } from 'react'

export default function BackgroundSound({ url }) {
  const { camera } = useThree()
  const [listener] = useState(() => new AudioListener())
  const audio = useRef()

  // Callback ref para asegurar la referencia
  const setAudioRef = useCallback((node) => {
    if (node) {
      audio.current = node
    }
  }, [])

  useEffect(() => {
    camera.add(listener)
    const loader = new AudioLoader()
    loader.load(url, (buffer) => {
      if (audio.current) {
        audio.current.setBuffer(buffer)
        audio.current.setLoop(true)
        audio.current.setVolume(0.5)
        audio.current.play()
      }
    })
    return () => {
      if (audio.current) {
        audio.current.stop()
        audio.current.disconnect()
      }
      camera.remove(listener)
    }
  }, [url, camera, listener])

  return <positionalAudio ref={setAudioRef} args={[listener]} />
}
"use client";
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// Simple inertial WASD controls (no collision) activated when active=true
export function useWASDControls(active) {
  const { camera } = useThree();
  const keys = useRef({});
  const velocity = useRef([0,0,0]);
  const speed = 6; // m/s base
  const damping = 0.85;

  useEffect(() => {
    if (!active) return;
    const down = e => { keys.current[e.code] = true; };
    const up = e => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;
    const dir = [0,0,0];
    if (keys.current['KeyW'] || keys.current['ArrowUp']) dir[2] -= 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) dir[2] += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) dir[0] -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir[0] += 1;
    // Normalize
    const len = Math.hypot(dir[0], dir[2]) || 1;
    dir[0] /= len; dir[2] /= len;
    // Camera forward (flattened)
    const forward = [ -Math.sin(camera.rotation.y), 0, -Math.cos(camera.rotation.y) ];
    const right = [ forward[2], 0, -forward[0] ];
    const accelX = (right[0]*dir[0] + forward[0]*dir[2]) * speed;
    const accelZ = (right[2]*dir[0] + forward[2]*dir[2]) * speed;
    velocity.current[0] += accelX * delta;
    velocity.current[2] += accelZ * delta;
    velocity.current[0] *= damping;
    velocity.current[2] *= damping;
    camera.position.x += velocity.current[0] * delta;
    camera.position.z += velocity.current[2] * delta;
  });
}

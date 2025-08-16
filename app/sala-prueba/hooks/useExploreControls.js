"use client";
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

/*
  WASD + rotación con click derecho (pointer lock) para modo exploración.
  - Activo sólo cuando active=true.
  - Click derecho entra a pointer lock; ESC o click afuera libera.
  - Movimiento horizontal sin componente vertical.
  - Pitch limitado para evitar giros extremos.
*/
export function useExploreControls(active,{speed=14, damping=0.86, pitchLimit=Math.PI/2.4, sprintMultiplier=2.1, bounds}={}) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const velocity = useRef([0,0,0]);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const pointerLocked = useRef(false);
  const needInitAngles = useRef(true);

  useEffect(() => {
    if (!active) return;
    if (needInitAngles.current) {
      yawRef.current = camera.rotation.y;
      pitchRef.current = camera.rotation.x;
      needInitAngles.current = false;
    }
  }, [active, camera]);

  useEffect(() => {
    if (!active) return;

    const el = gl.domElement;

    const preventContext = e => { e.preventDefault(); };
    const onMouseDown = e => {
      if (e.button === 2) { // right click
        if (document.pointerLockElement !== el) {
          el.requestPointerLock?.();
        }
      }
    };
    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === el;
    };
    const onMouseMove = e => {
      if (!pointerLocked.current) return;
      const dx = e.movementX || 0;
      const dy = e.movementY || 0;
      const sensitivity = 0.0022; // tune
      yawRef.current -= dx * sensitivity; // invert horizontal so drag feels natural
      pitchRef.current -= dy * sensitivity;
      if (pitchRef.current > pitchLimit) pitchRef.current = pitchLimit;
      if (pitchRef.current < -pitchLimit) pitchRef.current = -pitchLimit;
    };
    const keyDown = e => { keys.current[e.code] = true; };
    const keyUp = e => { keys.current[e.code] = false; };

    el.addEventListener('contextmenu', preventContext);
    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    return () => {
      el.removeEventListener('contextmenu', preventContext);
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      pointerLocked.current = false;
    };
  }, [active, gl, pitchLimit]);

  useFrame((_, delta) => {
    if (!active) return;
    // Apply rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yawRef.current;
    camera.rotation.x = pitchRef.current;
    camera.rotation.z = 0;

    // Input
  const dir = [0,0]; // x (strafe), z (forward)
    if (keys.current['KeyW'] || keys.current['ArrowUp']) dir[1] += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) dir[1] -= 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) dir[0] -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir[0] += 1;
    const len = Math.hypot(dir[0], dir[1]) || 1;
    dir[0] /= len; dir[1] /= len;

  // Sprint
  const sprinting = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
  const targetSpeed = speed * (sprinting ? sprintMultiplier : 1);

    // Orientation vectors (flatten forward)
    const yaw = yawRef.current;
  const forward = [ -Math.sin(yaw), 0, -Math.cos(yaw) ];
  // Vector derecha obteniendo perpendicular en plano XZ: ( -forward[2], 0, forward[0] )
  const right = [ -forward[2], 0, forward[0] ];

    // Accelerate
  // Suavizar aceleración (lerp hacia target accel)
  const accelX = (right[0]*dir[0] + forward[0]*dir[1]) * targetSpeed;
  const accelZ = (right[2]*dir[0] + forward[2]*dir[1]) * targetSpeed;
  velocity.current[0] += (accelX - velocity.current[0]) * 0.12;
  velocity.current[2] += (accelZ - velocity.current[2]) * 0.12;

    // Damping
    velocity.current[0] *= damping;
    velocity.current[2] *= damping;

    // Apply translation
    camera.position.x += velocity.current[0] * delta;
    camera.position.z += velocity.current[2] * delta;

    // Bounds opcionales: { minX,maxX,minZ,maxZ }
    if (bounds) {
      if (camera.position.x < bounds.minX) camera.position.x = bounds.minX;
      if (camera.position.x > bounds.maxX) camera.position.x = bounds.maxX;
      if (camera.position.z < bounds.minZ) camera.position.z = bounds.minZ;
      if (camera.position.z > bounds.maxZ) camera.position.z = bounds.maxZ;
    }

    // Keep eye level (avoid numerical drift)
    // (Assumes target height ~1.85; keep existing y from entrance path.)
  });
}

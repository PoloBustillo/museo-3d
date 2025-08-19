"use client";
// Máquina de estados de presentación: idle -> easingOut -> flyingIn -> exploring
import { useRef, useState, useCallback, useEffect } from 'react';

export function usePresentationTransition({ easeOutMs = 600, onExplore } = {}) {
  const [state, setState] = useState('idle');
  const beginRef = useRef(null);
  const timeoutRef = useRef(null);
  const readyRef = useRef(false);
  const [beginReadyState, setBeginReadyState] = useState(false);
  const pendingStartRef = useRef(false);

  const registerBegin = useCallback(fn => {
    beginRef.current = fn;
    readyRef.current = true;
    setBeginReadyState(true);
    if (pendingStartRef.current && state === 'easingOut') {
      requestAnimationFrame(() => {
        if (beginRef.current && state === 'easingOut') {
          beginRef.current();
          setState('flyingIn');
          pendingStartRef.current = false;
        }
      });
    }
  }, [state]);

  const requestStart = useCallback(() => {
    if (state !== 'idle') return;
    setState('easingOut');
    pendingStartRef.current = true;
    const startAt = performance.now() + easeOutMs;
    const attempt = () => {
      if (beginRef.current) {
        beginRef.current();
        setState('flyingIn');
        pendingStartRef.current = false;
      } else if (performance.now() < startAt + 1500) {
        timeoutRef.current = requestAnimationFrame(attempt);
      } else {
        // fallback
        setState('exploring');
        onExplore && onExplore();
        pendingStartRef.current = false;
      }
    };
    if (easeOutMs === 0) {
      attempt();
    } else {
      timeoutRef.current = setTimeout(attempt, easeOutMs);
    }
  }, [state, easeOutMs, onExplore]);

  const markExploring = useCallback(() => {
    setState('exploring');
    onExplore && onExplore();
  }, [onExplore]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      cancelAnimationFrame(timeoutRef.current);
      clearTimeout(timeoutRef.current);
    }
    setState('idle');
    beginRef.current = null;
    readyRef.current = false;
    setBeginReadyState(false);
    pendingStartRef.current = false;
  }, []);

  const presentationMode = state === 'idle' || state === 'easingOut';
  const easingOut = state === 'easingOut';
  const animating = state === 'flyingIn';
  const exploring = state === 'exploring';
  const beginReady = beginReadyState;

  useEffect(() => () => {
    if (timeoutRef.current) {
      cancelAnimationFrame(timeoutRef.current);
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    state,
    presentationMode,
    easingOut,
    animating,
    exploring,
    beginReady,
    registerBegin,
    requestStart,
    markExploring,
    reset
  };
}

import React, { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GalleryEnvironment } from "./GalleryEnvironment.jsx";
import { GalleryBenches } from "./furniture/GalleryBenches.jsx";
import { InteractiveTable } from "./furniture/InteractiveTable.jsx";
import { GameModal } from "../ui/GameModal.jsx";
import { MemoramaGame } from "../games/MemoramaGame.jsx";
import { QuizGame } from "../games/QuizGame.jsx";
import { PuzzleGame } from "../games/PuzzleGame.jsx";

/**
 * Galería completa con mesa interactiva y sistema de juegos
 * Solo renderiza elementos Three.js - los modales se manejan externamente
 */
export function EnhancedGalleryEnvironment({
  dynamicLength,
  dynamicCenterX,
  wallTextureUrl,
  floorTextureUrl,
  wallColor = "#ffffff",
  floorColor = "#e0e0e0",
  lightingPreset = "museum",
  premiumMode = true,
  environmentQuality = "high",
  camera,
  controls,
  children,
  onGameModalOpen,
  onGameSelect,
}) {
  const [showGameModal, setShowGameModal] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  const cameraRef = useRef();

  // Actualizar posición del jugador
  useFrame(() => {
    if (camera) {
      const pos = camera.position;
      setPlayerPosition([pos.x, pos.y, pos.z]);
    }
  });

  const handleTableInteraction = () => {
    if (onGameModalOpen) {
      onGameModalOpen(true);
    }
  };

  return (
    <>
      {/* Entorno base de la galería */}
      <GalleryEnvironment
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        wallTextureUrl={wallTextureUrl}
        floorTextureUrl={floorTextureUrl}
        wallColor={wallColor}
        floorColor={floorColor}
        lightingPreset={lightingPreset}
        premiumMode={premiumMode}
        environmentQuality={environmentQuality}
      />

      {/* Bancas de la galería */}
      <GalleryBenches
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        benchCount={3}
        spacing={6}
      />

      {/* Mesa interactiva cerca de la pared final */}
      <InteractiveTable
        position={[dynamicCenterX + dynamicLength / 2 - 4, 0, 0]}
        onInteract={handleTableInteraction}
        playerPosition={playerPosition}
      />

      {/* Contenido adicional (obras de arte, etc.) */}
      {children}
    </>
  );
}

/**
 * Componente de modales de juegos para renderizar fuera del Canvas
 */
export function GameModals({
  showGameModal,
  onGameModalClose,
  onGameSelect,
  activeGame,
  onGameClose,
}) {
  return (
    <>
      <GameModal
        isOpen={showGameModal}
        onClose={onGameModalClose}
        onGameSelect={onGameSelect}
      />

      <MemoramaGame isOpen={activeGame === "memorama"} onClose={onGameClose} />

      <QuizGame isOpen={activeGame === "quiz"} onClose={onGameClose} />

      <PuzzleGame isOpen={activeGame === "puzzle"} onClose={onGameClose} />
    </>
  );
}

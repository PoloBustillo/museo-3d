"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import BackGroundSound from "./BackGroundSound.jsx";
import { GALLERY_CONFIG } from "./gallery/config.js";
import { calculateArtworkPositions, calculateGalleryDimensions } from "./gallery/utils.js";
import { GalleryLighting } from "./gallery/GalleryLighting.jsx";
import { GalleryEnvironment } from "./gallery/GalleryEnvironment.jsx";
import { GalleryBenches } from "./gallery/GalleryBenches.jsx";
import { GalleryWalls } from "./gallery/GalleryWalls.jsx";
import { useSound } from "../providers/SoundProvider";
import dynamic from "next/dynamic";
import {
  getPersonalCollection,
  addToPersonalCollection,
  removeFromPersonalCollection,
  isInPersonalCollection,
} from "../lib/personalCollection.js";

const { WALL_HEIGHT } = GALLERY_CONFIG;

const RoomSelectorModal = dynamic(() => import("./gallery/RoomSelectorModal").then((mod) => mod.RoomSelectorModal), { ssr: false });

function Picture({ src, title, artist, year, description, technique, dimensions, position, rotation = [0, 0, 0], onClick, showPlaque, selected, selectedArtwork }) {
  const texture = useTexture(src);
  const [hovered, setHovered] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 3, height: 2 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.width > 0 && img.height > 0) {
        const aspectRatio = img.width / img.height;
        const maxWidth = 4;
        const maxHeight = 3;
        let width = maxWidth;
        let height = maxWidth / aspectRatio;
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
        if (isFinite(width) && isFinite(height)) {
          setImageDimensions({ width, height });
        }
      }
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.warn(`Failed to load image, using default dimensions: ${src}`);
      setImageLoaded(true);
    };
    img.crossOrigin = "anonymous";
    img.src = src;
  }, [src]);

  const w = imageDimensions.width;
  const h = imageDimensions.height;
  const thickness = 0.15;
  const depth = 0.07;
  
  return (
    <motion.group position={position} rotation={rotation} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: selected ? 1.15 : hovered ? 1.04 : 1, opacity: 1, z: selected ? 0.5 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 18 }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh position={[0, h / 2 + thickness / 2, depth]}>
        <boxGeometry args={[w + thickness * 2, thickness, thickness]} />
        <meshStandardMaterial color={hovered ? "#d4af37" : "#111"} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -h / 2 - thickness / 2, depth]}>
        <boxGeometry args={[w + thickness * 2, thickness, thickness]} />
        <meshStandardMaterial color={hovered ? "#d4af37" : "#111"} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-w / 2 - thickness / 2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness * 2, thickness]} />
        <meshStandardMaterial color={hovered ? "#d4af37" : "#111"} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[w / 2 + thickness / 2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness * 2, thickness]} />
        <meshStandardMaterial color={hovered ? "#d4af37" : "#111"} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onClick({ src, title, artist, year, description, technique, dimensions }); }} scale={1}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {showPlaque && !selectedArtwork && (
        <Html position={[0, -h / 2 - 0.25, depth]} center style={{ pointerEvents: "none", textAlign: "left", background: "rgba(30,30,30,0.97)", color: "#fff", borderRadius: 12, padding: "18px 28px", fontSize: 15, minWidth: 340, maxWidth: 480, boxShadow: hovered ? "0 0 16px #d4af37" : "0 2px 16px #000a", border: hovered ? "2px solid #d4af37" : "none", transition: "all 0.2s", lineHeight: 1.5, }}>
          <div style={{ fontSize: "1.2em", fontWeight: "bold", marginBottom: 4 }}>{title}</div>
          <div style={{ fontWeight: "bold", color: "#ffe082", marginBottom: 2 }}>{artist} ({year})</div>
          <div style={{ fontSize: "0.98em", color: "#bdbdbd", marginBottom: 2 }}><b>Técnica:</b> {technique}</div>
          <div style={{ fontSize: "0.98em", color: "#bdbdbd", marginBottom: 2 }}><b>Dimensiones:</b> {dimensions}</div>
          <div style={{ fontSize: "0.97em", color: "#e0e0e0", marginTop: 6 }}>{description}</div>
        </Html>
      )}
    </motion.group>
  );
}

function PlayerControls({ onPassInitialWall, FIRST_X, LAST_X, WALL_MARGIN_INITIAL, WALL_MARGIN_FINAL }) {
  const passedWallRef = useRef(false);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.key.toLowerCase()] = true; };
    const onKeyUp = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const minZ = -GALLERY_CONFIG.HALL_WIDTH / 2 + 0.7;
    const maxZ = GALLERY_CONFIG.HALL_WIDTH / 2 - 0.7;
    direction.current.set(0, 0, 0);
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;
    direction.current.normalize().applyEuler(camera.rotation).y = 0;
    velocity.current.copy(direction.current).multiplyScalar(5 * delta);
    camera.position.add(velocity.current);
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
    const minX = FIRST_X - WALL_MARGIN_INITIAL * 0.8 + 0.3;
    const maxX = LAST_X + WALL_MARGIN_FINAL - 0.8;
    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    if (!passedWallRef.current && onPassInitialWall && camera.position.x > FIRST_X - WALL_MARGIN_INITIAL * 0.8 + 0.2) {
      onPassInitialWall();
      passedWallRef.current = true;
    }
  });
  return null;
}

function Room({ artworks, artworkPositions, galleryDimensions, passedInitialWall, setSelectedArtwork, selectedArtwork, showList, showCollection, showInstructions }) {
  const { dynamicLength, dynamicCenterX, firstX, lastX, wallMarginInitial, wallMarginFinal } = galleryDimensions;
  return (
    <>
      <GalleryLighting dynamicLength={dynamicLength} dynamicCenterX={dynamicCenterX} />
      <GalleryEnvironment dynamicLength={dynamicLength} dynamicCenterX={dynamicCenterX} />
      {artworks.map((art, i) => (
        <Picture key={art.id || i} {...art} position={artworkPositions[i].position} rotation={artworkPositions[i].rotation} onClick={() => setSelectedArtwork(art)} showPlaque={passedInitialWall && !selectedArtwork && !showList && !showCollection && !showInstructions} selected={selectedArtwork && selectedArtwork.id === art.id} selectedArtwork={selectedArtwork} />
      ))}
      <GalleryBenches dynamicLength={dynamicLength} />
      <GalleryWalls firstX={firstX} lastX={lastX} wallMarginInitial={wallMarginInitial} wallMarginFinal={wallMarginFinal} />
    </>
  );
}

function ZoomModal({ artwork, onClose, onCollectionUpdate, userId }) {
  const modalRef = useRef(null);
  const [isInCollection, setIsInCollection] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsInCollection(isInPersonalCollection(artwork, onCollectionUpdate.collection));
  }, [artwork, onCollectionUpdate.collection]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCollectionAction = useCallback(async (e) => {
    e.stopPropagation();
    if (!userId) {
      setCollectionMessage("⚠️ Inicia sesión para guardar");
      setTimeout(() => setCollectionMessage(""), 3000);
      return;
    }

    setIsUpdating(true);
    try {
      if (isInCollection) {
        await removeFromPersonalCollection(artwork);
        setCollectionMessage("🗑️ Removido de tu colección");
      } else {
        await addToPersonalCollection(artwork);
        setCollectionMessage("✅ ¡Añadido a tu colección!");
      }
      if (onCollectionUpdate?.update) {
        onCollectionUpdate.update();
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      setCollectionMessage("❌ Error al actualizar");
    } finally {
      setIsUpdating(false);
      setTimeout(() => setCollectionMessage(""), 3000);
    }
  }, [artwork, isInCollection, onCollectionUpdate, userId]);

  if (!artwork) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1c1c1c] text-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row"
        >
          <div className="md:w-1/2 w-full p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-amber-300">{artwork.title}</h2>
              <h3 className="text-xl font-semibold mb-4">{artwork.artist} ({artwork.year})</h3>
              <p className="text-gray-300 mb-2"><b>Técnica:</b> {artwork.technique}</p>
              <p className="text-gray-300 mb-4"><b>Dimensiones:</b> {artwork.dimensions}</p>
              <p className="text-gray-200 leading-relaxed">{artwork.description}</p>
            </div>
            <div className="mt-6">
              {collectionMessage ? (
                <p className="text-center font-semibold text-lg h-[52px] flex items-center justify-center">{collectionMessage}</p>
              ) : (
                <button
                  onClick={handleCollectionAction}
                  disabled={isUpdating}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isUpdating
                      ? "bg-neutral-600 cursor-not-allowed"
                      : isInCollection
                      ? "bg-red-700 hover:bg-red-800 text-white"
                      : "bg-amber-400 hover:bg-amber-500 text-black"
                  }`}
                >
                  {isUpdating ? "Guardando..." : isInCollection ? "Eliminar de la colección" : "Añadir a mi colección"}
                </button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 w-full relative bg-black">
            <img src={artwork.src} alt={artwork.title} className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function GalleryRoom({ salaId = 1, murales = [], onRoomChange, availableRooms = [] }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [passedInitialWall, setPassedInitialWall] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const { isMuted } = useSound();
  const [personalCollection, setPersonalCollection] = useState([]);

  const fetchCollection = useCallback(async () => {
    if (userId) {
      const collection = await getPersonalCollection();
      setPersonalCollection(collection);
    }
  }, [userId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const validArtworks = murales
    .filter((art) => art && art.url_imagen)
    .map((art) => ({
      ...art,
      src: art.url_imagen,
      title: art.titulo || "Sin título",
      artist: art.autor || "Desconocido",
      year: art.anio || "N/A",
      description: art.descripcion || "Sin descripción",
      technique: art.tecnica || "No especificada",
      dimensions: "Dimensiones no especificadas",
    }));

  const galleryDimensions = calculateGalleryDimensions(validArtworks);
  const artworkPositions = calculateArtworkPositions(validArtworks, galleryDimensions.firstX, GALLERY_CONFIG.PICTURE_SPACING, galleryDimensions.contentLength);

  const handleSelectArtwork = (art) => setSelectedArtwork(art);
  const handleCloseModal = () => setSelectedArtwork(null);

  return (
    <>
      <div className="gallery-container absolute top-0 left-0 w-full h-full bg-black">
        <Canvas camera={{ position: [0, WALL_HEIGHT / 2, 5], fov: 75 }} shadows>
          <Room passedInitialWall={passedInitialWall} setSelectedArtwork={handleSelectArtwork} selectedArtwork={selectedArtwork} showList={showRoomSelector} showCollection={false} showInstructions={showInstructions} artworks={validArtworks} artworkPositions={artworkPositions} galleryDimensions={galleryDimensions} />
          <PlayerControls onPassInitialWall={() => setPassedInitialWall(true)} FIRST_X={galleryDimensions.firstX} LAST_X={galleryDimensions.lastX} WALL_MARGIN_INITIAL={galleryDimensions.wallMarginInitial} WALL_MARGIN_FINAL={galleryDimensions.wallMarginFinal} />
          {!selectedArtwork && <PointerLockControls />}
          {!isMuted && <BackGroundSound url="/assets/audio.mp3" />}
        </Canvas>
        <AnimatePresence>
          {selectedArtwork && (
            <ZoomModal
              artwork={selectedArtwork}
              onClose={handleCloseModal}
              userId={userId}
              onCollectionUpdate={{
                collection: personalCollection,
                update: fetchCollection
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}



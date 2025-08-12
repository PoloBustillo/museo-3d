"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import BackGroundSound from "./BackGroundSound.jsx";
import { GALLERY_CONFIG } from "./gallery/config.js";
import {
  calculateArtworkPositions,
  calculateGalleryDimensions,
} from "./gallery/utils.js";
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

const RoomSelectorModal = dynamic(
  () =>
    import("./gallery/RoomSelectorModal").then((mod) => mod.RoomSelectorModal),
  { ssr: false }
);

function Picture({
  src,
  title,
  artist,
  year,
  description,
  technique,
  dimensions,
  position,
  rotation = [0, 0, 0],
  onClick,
  showPlaque,
  selected,
  selectedArtwork,
  spotlightIntensity = 1,
  frameStyle,
}) {
  const texture = useTexture(src);
  const [hovered, setHovered] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 3,
    height: 2,
  });
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

  const frameColor =
    frameStyle === "gold" ? "#d4af37" : frameStyle === "dark" ? "#111" : "#111";

  // Escala animada simple sin framer-motion 3D (evitamos motion.group para no perder position)
  const scale = selected ? 1.15 : hovered ? 1.04 : 1;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, h / 2 + thickness / 2, depth]}>
        <boxGeometry args={[w + thickness * 2, thickness, thickness]} />
        <meshStandardMaterial
          color={frameColor}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, -h / 2 - thickness / 2, depth]}>
        <boxGeometry args={[w + thickness * 2, thickness, thickness]} />
        <meshStandardMaterial
          color={frameColor}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-w / 2 - thickness / 2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness * 2, thickness]} />
        <meshStandardMaterial
          color={frameColor}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[w / 2 + thickness / 2, 0, depth]}>
        <boxGeometry args={[thickness, h + thickness * 2, thickness]} />
        <meshStandardMaterial
          color={frameColor}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick({
            src,
            title,
            artist,
            year,
            description,
            technique,
            dimensions,
          });
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* Spotlight dedicada opcional */}
      {spotlightIntensity > 0 && (
        <spotLight
          intensity={spotlightIntensity}
          position={[0, h + 1.2, 0.5]}
          angle={0.6}
          penumbra={0.4}
          distance={8}
          decay={2}
          color="#fff7e6"
        />
      )}
      {showPlaque && !selectedArtwork && (
        <Html
          position={[0, -h / 2 - 0.25, depth]}
          center
          style={{
            pointerEvents: "none",
            textAlign: "left",
            background: "rgba(30,30,30,0.97)",
            color: "#fff",
            borderRadius: 12,
            padding: "18px 28px",
            fontSize: 15,
            minWidth: 340,
            maxWidth: 480,
            boxShadow: hovered ? "0 0 16px #d4af37" : "0 2px 16px #000a",
            border: hovered ? "2px solid #d4af37" : "none",
            transition: "all 0.2s",
            lineHeight: 1.5,
          }}
        >
          <div
            style={{ fontSize: "1.2em", fontWeight: "bold", marginBottom: 4 }}
          >
            {title}
          </div>
          <div
            style={{ fontWeight: "bold", color: "#ffe082", marginBottom: 2 }}
          >
            {artist} ({year})
          </div>
          <div
            style={{ fontSize: "0.98em", color: "#bdbdbd", marginBottom: 2 }}
          >
            <b>Técnica:</b> {technique}
          </div>
          <div
            style={{ fontSize: "0.98em", color: "#bdbdbd", marginBottom: 2 }}
          >
            <b>Dimensiones:</b> {dimensions}
          </div>
          <div style={{ fontSize: "0.97em", color: "#e0e0e0", marginTop: 6 }}>
            {description}
          </div>
        </Html>
      )}
    </group>
  );
}

function PlayerControls({
  onPassInitialWall,
  FIRST_X,
  LAST_X,
  WALL_MARGIN_INITIAL,
  WALL_MARGIN_FINAL,
}) {
  const passedWallRef = useRef(false);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const onKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
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
    if (
      !passedWallRef.current &&
      onPassInitialWall &&
      camera.position.x > FIRST_X - WALL_MARGIN_INITIAL * 0.8 + 0.2
    ) {
      onPassInitialWall();
      passedWallRef.current = true;
    }
  });
  return null;
}

// Componente de niebla condicional
function SceneFog({ fog }) {
  const { scene } = useThree();
  useEffect(() => {
    if (fog) {
      scene.fog = new THREE.Fog(
        fog.color || "#ffffff",
        fog.near ?? 0,
        fog.far ?? 50
      );
    } else {
      scene.fog = null;
    }
    return () => {
      scene.fog = null;
    };
  }, [fog, scene]);
  return null;
}

function ManualLookControls() {
  const { camera, gl } = useThree();
  const looking = useRef(false);
  const sensitivity = 0.0025;
  useEffect(() => {
    const el = gl.domElement;
    const onContext = (e) => e.preventDefault();
    const onDown = (e) => {
      if (e.button === 2) {
        looking.current = true;
        if (el.requestPointerLock) el.requestPointerLock();
      }
    };
    const onUp = (e) => {
      if (e.button === 2) {
        looking.current = false;
        if (document.pointerLockElement && document.exitPointerLock)
          document.exitPointerLock();
      }
    };
    const onMove = (e) => {
      if (!looking.current) return;
      const dx = e.movementX || 0;
      const dy = e.movementY || 0;
      camera.rotation.order = "YXZ";
      camera.rotation.y -= dx * sensitivity;
      camera.rotation.x -= dy * sensitivity;
      const maxPitch = Math.PI / 2 - 0.05;
      camera.rotation.x = Math.max(
        -maxPitch,
        Math.min(maxPitch, camera.rotation.x)
      );
    };
    el.addEventListener("contextmenu", onContext);
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("contextmenu", onContext);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      if (document.pointerLockElement && document.exitPointerLock)
        document.exitPointerLock();
    };
  }, [camera, gl]);
  return null;
}

function Room({
  artworks,
  artworkPositions,
  galleryDimensions,
  passedInitialWall,
  setSelectedArtwork,
  selectedArtwork,
  showList,
  showCollection,
  showInstructions,
  layoutItems,
  scene,
  salaTextures,
}) {
  const {
    dynamicLength,
    dynamicCenterX,
    firstX,
    lastX,
    wallMarginInitial,
    wallMarginFinal,
  } = galleryDimensions;
  const WALL_Z = GALLERY_CONFIG.HALL_WIDTH / 2 - 0.12; // un poco más pegado a la pared

  // Detectar si layout está "colapsado" en X
  const layoutAllCenteredX = useMemo(
    () =>
      layoutItems &&
      layoutItems.length > 0 &&
      layoutItems.every((li) => Math.abs(li?.pos?.x ?? 0) < 0.5),
    [layoutItems]
  );

  // Generar posiciones auto si layout colapsado (usa orden de layout original)
  const autoFromLayout = useMemo(() => {
    if (!layoutItems || layoutItems.length === 0) return [];
    if (!layoutAllCenteredX) return [];
    const dummyArtworks = layoutItems.map((li, i) => ({
      id: li.mural?.id || li.muralId || i,
      titulo: li.mural?.titulo || "Obra",
      url_imagen: li.mural?.url_imagen || li.mural?.imagenUrlWebp,
    }));
    const dims = calculateGalleryDimensions(dummyArtworks);
    return calculateArtworkPositions(
      dummyArtworks,
      dims.firstX,
      GALLERY_CONFIG.PICTURE_SPACING,
      dims.contentLength
    ).map((p, i) => ({
      ...layoutItems[i],
      pos: {
        ...(layoutItems[i].pos || {}),
        x: p.position[0],
        y: layoutItems[i].pos?.y ?? 1.5,
        z: p.position[2] > 0 ? WALL_Z : -WALL_Z,
      },
      rot: { ...(layoutItems[i].rot || {}), y: p.rotation[1] },
    }));
  }, [layoutItems, layoutAllCenteredX]);

  const normalizedLayout = useMemo(() => {
    if (!layoutItems || layoutItems.length === 0) return [];
    if (autoFromLayout.length) return autoFromLayout;
    const centralThreshold = 0.6;
    const centralCount = layoutItems.reduce(
      (acc, li) => acc + (Math.abs(li?.pos?.z ?? 0) < 0.5 ? 1 : 0),
      0
    );
    if (centralCount / layoutItems.length > centralThreshold) return [];
    let altCounter = 0;
    return layoutItems.map((li) => {
      const p = li.pos || {};
      const r = li.rot || {};
      const clone = { ...li };
      const isCentralZ = Math.abs(p.z ?? 0) < 0.5;
      if (isCentralZ) {
        const side = altCounter++ % 2 === 0 ? 1 : -1;
        clone.pos = { ...p, z: side * WALL_Z };
        clone.rot = { ...r, y: side === 1 ? 0 : Math.PI };
      } else if (Math.abs(p.z ?? 0) < WALL_Z * 0.6) {
        const side = (p.z ?? 0) >= 0 ? 1 : -1;
        clone.pos = { ...p, z: side * WALL_Z };
        clone.rot = { ...r, y: side === 1 ? 0 : Math.PI };
      } else {
        const side = (p.z ?? 0) > 0 ? 1 : -1;
        clone.rot = { ...r, y: side === 1 ? 0 : Math.PI };
      }
      if (!clone.pos) clone.pos = {};
      if (!clone.pos.y || Math.abs(clone.pos.y) < 0.01) clone.pos.y = 1.5;
      if (typeof clone.pos.x !== "number") clone.pos.x = 0;
      return clone;
    });
  }, [layoutItems, autoFromLayout]);

  // NUEVO: slots de pared determinísticos para fallback sin layout (refactor centrado)
  const slotPositions = useMemo(() => {
    if (!artworks || artworks.length === 0) return [];
    if (normalizedLayout.length > 0) return [];
    const pairs = Math.ceil(artworks.length / 2);
    if (pairs === 0) return [];
    // Usar el rango calculado (firstX -> lastX) para garantizar que cámara pueda alcanzarlos
    const span = Math.max(0.0001, lastX - firstX); // debería ser (pairs-1)*minSpacing
    const spacing = pairs > 1 ? span / (pairs - 1) : 0;
    const positions = [];
    for (let i = 0; i < artworks.length; i++) {
      const side = i % 2 === 0 ? 1 : -1; // alternar paredes
      const pairIndex = Math.floor(i / 2);
      const x = firstX + pairIndex * spacing;
      const y = 1.6;
      const z = side * WALL_Z;
      const rotY = side === 1 ? 0 : Math.PI;
      positions.push({ position: [x, y, z], rotation: [0, rotY, 0] });
    }
    if (process && process.env && !process.env.__GALLERY_FALLBACK_LOGGED2__) {
      console.log("[GalleryRoom] Fallback slots (aligned)", {
        count: artworks.length,
        pairs,
        firstX,
        lastX,
        span,
        spacing,
        sample: positions.slice(0, 8),
      });
      process.env.__GALLERY_FALLBACK_LOGGED2__ = "1";
    }
    return positions;
  }, [artworks, normalizedLayout, firstX, lastX]);

  return (
    <>
      <GalleryLighting
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        lightingPreset={scene?.lightingPreset}
        ambientIntensity={scene?.ambientIntensity}
      />
      <GalleryEnvironment
        dynamicLength={dynamicLength}
        dynamicCenterX={dynamicCenterX}
        wallTextureUrl={salaTextures?.pared}
        floorTextureUrl={salaTextures?.piso}
      />
      {normalizedLayout && normalizedLayout.length > 0
        ? normalizedLayout.map((li, i) => (
            <Picture
              key={li.mural?.id || li.muralId || i}
              src={li.mural?.imagenUrlWebp || li.mural?.url_imagen}
              title={li.mural?.titulo || "Sin título"}
              artist={li.mural?.autor || "Desconocido"}
              year={li.mural?.anio || "N/A"}
              description={li.mural?.descripcion || "Sin descripción"}
              technique={li.mural?.tecnica || "No especificada"}
              dimensions={
                li.mural?.dimensiones || "Dimensiones no especificadas"
              }
              position={[li.pos?.x ?? 0, li.pos?.y ?? 1.5, li.pos?.z ?? 0]}
              rotation={[li.rot?.x ?? 0, li.rot?.y ?? 0, li.rot?.z ?? 0]}
              onClick={() => setSelectedArtwork(li.mural || null)}
              showPlaque={
                passedInitialWall &&
                !selectedArtwork &&
                !showList &&
                !showCollection &&
                !showInstructions
              }
              selected={selectedArtwork && selectedArtwork.id === li.mural?.id}
              selectedArtwork={selectedArtwork}
              spotlightIntensity={li.spotlightIntensity ?? 0}
              frameStyle={li.frameStyle}
            />
          ))
        : artworks.map((art, i) => {
            const sp = slotPositions[i] || { position: [0, 1.5, 0], rotation: [0, 0, 0] };
            return (
              <Picture
                key={art.id || i}
                {...art}
                position={sp.position}
                rotation={sp.rotation}
                onClick={() => setSelectedArtwork(art)}
                showPlaque={
                  passedInitialWall &&
                  !selectedArtwork &&
                  !showList &&
                  !showCollection &&
                  !showInstructions
                }
                selected={selectedArtwork && selectedArtwork.id === art.id}
                selectedArtwork={selectedArtwork}
              />
            );
          })}
      <GalleryBenches dynamicLength={dynamicLength} />
      <GalleryWalls
        firstX={firstX}
        lastX={lastX}
        wallMarginInitial={wallMarginInitial}
        wallMarginFinal={wallMarginFinal}
      />
    </>
  );
}

function ZoomModal({ artwork, onClose, onCollectionUpdate, userId }) {
  const modalRef = useRef(null);
  const [isInCollection, setIsInCollection] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsInCollection(
      isInPersonalCollection(artwork, onCollectionUpdate.collection)
    );
  }, [artwork, onCollectionUpdate.collection]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCollectionAction = useCallback(
    async (e) => {
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
    },
    [artwork, isInCollection, onCollectionUpdate, userId]
  );

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
              <h2 className="text-3xl font-bold mb-2 text-amber-300">
                {artwork.title}
              </h2>
              <h3 className="text-xl font-semibold mb-4">
                {artwork.artist} ({artwork.year})
              </h3>
              <p className="text-gray-300 mb-2">
                <b>Técnica:</b> {artwork.technique}
              </p>
              <p className="text-gray-300 mb-4">
                <b>Dimensiones:</b> {artwork.dimensions}
              </p>
              <p className="text-gray-200 leading-relaxed">
                {artwork.description}
              </p>
            </div>
            <div className="mt-6">
              {collectionMessage ? (
                <p className="text-center font-semibold text-lg h-[52px] flex items-center justify-center">
                  {collectionMessage}
                </p>
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
                  {isUpdating
                    ? "Guardando..."
                    : isInCollection
                      ? "Eliminar de la colección"
                      : "Añadir a mi colección"}
                </button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 w-full relative bg-black">
            <img
              src={artwork.src}
              alt={artwork.title}
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Adaptar componente principal para aceptar sala con layout/scene
export default function GalleryRoom({
  salaId = 1,
  murales = [],
  layout = [],
  scene = null,
  texturaPared = null,
  texturaPiso = null,
  onRoomChange,
  availableRooms = [],
}) {
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

  // Determinar si el layout es realmente utilizable (no todo en 0,0,0)
  const hasUsableLayout = useMemo(() => {
    if (!layout || layout.length === 0) return false;
    // Al menos una obra con posición distinta de origen o con rot/scale personalizada
    return layout.some((l) => {
      const p = l.pos || {};
      const r = l.rot || {};
      return (
        (p.x && Math.abs(p.x) > 0.01) ||
        (p.z && Math.abs(p.z) > 0.01) ||
        (p.y && Math.abs(p.y) > 0.01) ||
        (r.y && Math.abs(r.y) > 0.01) ||
        (l.scale && l.scale !== 1)
      );
    });
  }, [layout]);

  // Filtrar layout efectivo
  const effectiveLayout = hasUsableLayout ? layout : [];

  const validArtworks = useMemo(
    () =>
      murales
        .filter((art) => art && (art.url_imagen || art.imagenUrlWebp))
        .map((art) => ({
          ...art,
          src: art.imagenUrlWebp || art.url_imagen,
          title: art.titulo || "Sin título",
          artist: art.autor || "Desconocido",
          year: art.anio || "N/A",
          description: art.descripcion || "Sin descripción",
          technique: art.tecnica || "No especificada",
          dimensions: art.dimensiones || "Dimensiones no especificadas",
        })),
    [murales]
  );

  const galleryDimensions = useMemo(() => {
    if (effectiveLayout.length > 0) {
      const xs = effectiveLayout.map((l) => l.pos?.x ?? 0);
      const minX = Math.min(...xs, 0);
      const maxX = Math.max(...xs, 0);
      const padding = 6;
      const dynamicLength = Math.max(
        GALLERY_CONFIG.HALL_LENGTH,
        maxX - minX + padding * 2
      );
      const center = (minX + maxX) / 2;
      return {
        dynamicLength,
        dynamicCenterX: center,
        firstX: minX - padding,
        lastX: maxX + padding,
        contentLength: maxX - minX + padding * 2,
        wallMarginInitial: 4,
        wallMarginFinal: 3,
      };
    }
    return calculateGalleryDimensions(validArtworks);
  }, [effectiveLayout, validArtworks]);

  const artworkPositions = useMemo(
    () =>
      effectiveLayout.length > 0
        ? []
        : calculateArtworkPositions(
            validArtworks,
            galleryDimensions.firstX,
            GALLERY_CONFIG.PICTURE_SPACING,
            galleryDimensions.contentLength
          ),
    [effectiveLayout, validArtworks, galleryDimensions]
  );

  const handleSelectArtwork = (art) => setSelectedArtwork(art);
  const handleCloseModal = () => setSelectedArtwork(null);

  const plRef = useRef(null);
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      if (plRef.current) plRef.current.lock();
    };
    const handleMouseDown = (e) => {
      if (e.button === 2 && plRef.current) {
        plRef.current.lock();
      }
    };
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(k) &&
        plRef.current &&
        !document.pointerLockElement
      ) {
        plRef.current.lock();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="gallery-container absolute top-0 left-0 w-full h-full bg-black">
        <Canvas camera={{ position: [0, WALL_HEIGHT / 2, 5], fov: 75 }} shadows>
          {scene?.fog && <SceneFog fog={scene.fog} />}
          <Room
            passedInitialWall={passedInitialWall}
            setSelectedArtwork={handleSelectArtwork}
            selectedArtwork={selectedArtwork}
            showList={showRoomSelector}
            showCollection={false}
            showInstructions={showInstructions}
            artworks={validArtworks}
            artworkPositions={artworkPositions}
            galleryDimensions={galleryDimensions}
            layoutItems={effectiveLayout}
            scene={scene}
            salaTextures={{ pared: texturaPared, piso: texturaPiso }}
          />
          <PlayerControls
            onPassInitialWall={() => setPassedInitialWall(true)}
            FIRST_X={galleryDimensions.firstX}
            LAST_X={galleryDimensions.lastX}
            WALL_MARGIN_INITIAL={galleryDimensions.wallMarginInitial}
            WALL_MARGIN_FINAL={galleryDimensions.wallMarginFinal}
          />
          <ManualLookControls />
          {!isMuted && (
            <BackGroundSound
              url={scene?.audioZones?.[0]?.trackUrl || "/assets/audio.mp3"}
            />
          )}
        </Canvas>
        <AnimatePresence>
          {selectedArtwork && (
            <ZoomModal
              artwork={selectedArtwork}
              onClose={handleCloseModal}
              userId={userId}
              onCollectionUpdate={{
                collection: personalCollection,
                update: fetchCollection,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

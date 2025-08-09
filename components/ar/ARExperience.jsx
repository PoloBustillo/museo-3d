"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as Sentry from "@sentry/nextjs";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

export default function ARExperience({
  modelUrl,
  onClose,
  showCloseButton = true,
  restoreMaterials,
}) {
  const mountRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const controlsRef = useRef();
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isAR, setIsAR] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showRealWorld, setShowRealWorld] = useState(true);
  const [arMode, setArMode] = useState("positioning"); // 'positioning' o 'fixed'
  const [fixedPosition, setFixedPosition] = useState(null);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const [webXRSupported, setWebXRSupported] = useState(false);
  const textureRef = useRef();

  // Referencias para controles AR - Botón HTML tradicional
  // Eliminar arControlsRef y createARButton y cualquier referencia a window.createARButton

  // --- BOTÓN 3D EN AR ---
  const arButtonSpriteRef = useRef();

  // Función para crear un sprite con texto/botón
  function createTextSprite(text, options = {}) {
    const {
      fontSize = 64,
      fontColor = "#ffffff",
      backgroundColor = "rgba(0,0,0,0.8)",
      borderColor = "#ff6600",
      borderWidth = 4,
      padding = 20,
      borderRadius = 15,
      width = null,
      height = null,
    } = options;

    // Crear canvas para el texto
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Configurar font
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    const textMetrics = context.measureText(text);

    // Calcular dimensiones
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    const canvasWidth = width || textWidth + padding * 2;
    const canvasHeight = height || textHeight + padding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Dibujar fondo con bordes redondeados
    context.fillStyle = backgroundColor;
    context.strokeStyle = borderColor;
    context.lineWidth = borderWidth;

    // Función para dibujar rectángulo con bordes redondeados
    function roundRect(x, y, w, h, r) {
      context.beginPath();
      context.moveTo(x + r, y);
      context.lineTo(x + w - r, y);
      context.quadraticCurveTo(x + w, y, x + w, y + r);
      context.lineTo(x + w, y + h - r);
      context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      context.lineTo(x + r, y + h);
      context.quadraticCurveTo(x, y + h, x, y + h - r);
      context.lineTo(x, y + r);
      context.quadraticCurveTo(x, y, x + r, y);
      context.closePath();
    }

    roundRect(
      borderWidth / 2,
      borderWidth / 2,
      canvasWidth - borderWidth,
      canvasHeight - borderWidth,
      borderRadius
    );
    context.fill();
    context.stroke();

    // Dibujar texto
    context.fillStyle = fontColor;
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvasWidth / 2, canvasHeight / 2);

    // Crear textura y sprite
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
    });

    const sprite = new THREE.Sprite(spriteMaterial);

    // Escalar sprite basado en el canvas - MUCHO MÁS PEQUEÑO
    const scale = 0.001; // Factor de escala reducido para AR
    sprite.scale.set(canvasWidth * scale, canvasHeight * scale, 1);

    return sprite;
  }

  // Función para crear el botón 3D
  function createARButton3D() {
    // Eliminar sprite anterior si existe
    if (arButtonSpriteRef.current && sceneRef.current) {
      sceneRef.current.remove(arButtonSpriteRef.current);
      arButtonSpriteRef.current = null;
    }
    // Crear sprite con texto
    const sprite = createTextSprite("ACCION AR", {
      fontSize: 80,
      fontColor: "#fff",
      backgroundColor: "rgba(255,102,0,0.95)",
      borderColor: "#fff",
      borderWidth: 6,
      borderRadius: 30,
      padding: 40,
    });
    // Posicionar el botón frente a la cámara
    sprite.position.set(0, -0.2, -0.7); // Frente y un poco abajo
    arButtonSpriteRef.current = sprite;
    sceneRef.current.add(sprite);
  }

  // Exponer función globalmente para actualizaciones
  // Eliminar arControlsRef y createARButton y cualquier referencia a window.createARButton

  // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado

  // Verificar soporte WebXR al inicio
  useEffect(() => {
    // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado

    if (navigator.xr) {
      navigator.xr
        .isSessionSupported("immersive-ar")
        .then((supported) => {
          // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
          setWebXRSupported(supported);
        })
        .catch((error) => {
          // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
          setWebXRSupported(false);
        });
    } else {
      // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
      setWebXRSupported(false);
    }

    // Eliminar todos los overlays y botones HTML relacionados con AR, debug y fallback
    // Mantener solo el botón 3D (sprite) en la escena AR
  }, []);

  // Detecta cuando el canvas de Three.js está montado
  useEffect(() => {
    const checkCanvas = () => {
      if (mountRef.current && mountRef.current.firstChild) {
        setCanvasReady(true);
      } else {
        setCanvasReady(false);
      }
    };
    const interval = setInterval(checkCanvas, 100);
    checkCanvas();
    return () => clearInterval(interval);
  }, []);

  // Inicializar Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // Limpiar
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Renderer básico
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.set(0, 1.6, 3);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Cargar escena de fondo básica
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/images/image360.jpg", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
      scene.environment = texture;
      textureRef.current = texture;
    });

    // Render loop simple
    function animate() {
      requestAnimationFrame(animate);
      if (!renderer.xr.isPresenting && controls) {
        controls.update();
        renderer.render(scene, camera);
      }
    }
    animate();

    // Cleanup
    return () => {
      if (controls) controls.dispose();
      if (renderer) {
        renderer.dispose();
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  // Cargar modelo
  useEffect(() => {
    if (!sceneRef.current || !modelUrl) return;

    // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado

    // Limpiar modelo anterior
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
        const model = gltf.scene;

        // Debug: Verificar si el back panel está presente
        let backPanelFound = false;
        let totalMeshes = 0;
        model.traverse((child) => {
          if (child.isMesh) {
            totalMeshes++;
            if (child.name && child.name.toLowerCase().includes("back")) {
              backPanelFound = true;
              console.log(
                "[AR] Back panel encontrado:",
                child.name,
                child.visible,
                child.material
              );
              console.log("[AR] Back panel position:", child.position);
              console.log("[AR] Back panel geometry:", child.geometry);
            }
          }
        });
        console.log("[AR] Total meshes en el modelo:", totalMeshes);
        if (!backPanelFound) {
          console.log("[AR] No se encontró back panel en el modelo");
          // Listar todos los meshes para debugging
          model.traverse((child) => {
            if (child.isMesh) {
              console.log("[AR] Mesh encontrado:", child.name, child.visible);
            }
          });
        }

        // Centrar y escalar
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.0 / maxDim;
        model.scale.setScalar(scale);
        model.position.set(0, 0, 0);

        // Material básico
        if (!restoreMaterials) {
          model.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x00ff88,
              });
            }
          });
        }

        // Configurar materiales para AR - preservar back panel y eliminar transparencias
        model.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = false; // NO desaparecer por culling
            if (child.material) {
              child.material.side = THREE.DoubleSide; // Visible desde ambos lados

              // Configuración uniforme para TODOS los materiales - eliminando diferencias problemáticas
              child.material.depthTest = true;
              child.material.depthWrite = true;
              child.material.transparent = false;
              child.material.opacity = 1.0;
              child.material.needsUpdate = true;
              
              // Si es un array de materiales (como nuestro canvas con múltiples caras)
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.side = THREE.DoubleSide;
                  mat.depthTest = true;
                  mat.depthWrite = true;
                  mat.transparent = false;
                  mat.opacity = 1.0;
                  mat.needsUpdate = true;
                });
              }
              
              console.log("[AR] Material AR configurado:", {
                name: child.name || 'unnamed',
                side: child.material.side,
                transparent: child.material.transparent,
                isArray: Array.isArray(child.material)
              });
            }
          }
        });

        sceneRef.current.add(model);
        modelRef.current = model;
        setModelLoaded(true);
        // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
      },
      // Progress callback
      (progress) => {
        // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
      },
      // Error callback
      (error) => {
        // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
      }
    );
  }, [modelUrl, restoreMaterials]);

  // AR Management con controles Three.js Sprites
  useEffect(() => {
    if (!rendererRef.current || !modelRef.current) return;

    const renderer = rendererRef.current;
    const model = modelRef.current;

    function handleSessionStart() {
      setIsAR(true);
      setShowRealWorld(true);
      setArMode("positioning"); // Empezar en modo posicionamiento
      setFixedPosition(null);
      setModelRotation({ x: 0, y: 0, z: 0 });

      // Limpiar fondo y ambiente
      if (sceneRef.current) {
        sceneRef.current.background = null;
        sceneRef.current.environment = null;
      }

      // Remover todos los hijos de la escena excepto el modelo AR y el sprite del botón
      if (sceneRef.current) {
        sceneRef.current.children = sceneRef.current.children.filter(
          (child) =>
            child === modelRef.current || child === arButtonSpriteRef.current
        );
      }

      // Ajustar posición y escala del modelo para AR
      if (modelRef.current) {
        modelRef.current.position.set(0, 0, -0.8); // Frente a la cámara
        modelRef.current.scale.setScalar(0.15); // Escala pequeña para AR
        // Reforzar materiales y visibilidad - preservar back panel
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = false;
            child.visible = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;

              // Preservar depth testing para el back panel y asegurar opacidad completa
              if (child.name && child.name.toLowerCase().includes("back")) {
                child.material.depthTest = true;
                child.material.depthWrite = true;
                child.material.transparent = false;
                child.material.opacity = 1.0;
                child.material.needsUpdate = true;
                console.log(
                  "[AR] Configurando back panel en sesión AR:",
                  child.name,
                  "depthTest:",
                  true,
                  "depthWrite:",
                  true
                );
              } else {
                child.material.depthTest = false;
                child.material.depthWrite = false;
                child.material.transparent = false;
                child.material.opacity = 1.0;
                child.material.needsUpdate = true;
              }
            }
          }
        });
      }

      // Agregar luz ambiental y direccional para AR
      if (sceneRef.current) {
        // Elimina luces previas
        sceneRef.current.children = sceneRef.current.children
          .filter((child) => !child.isLight)
          .concat(
            sceneRef.current.children.filter(
              (child) =>
                child === modelRef.current ||
                child === arButtonSpriteRef.current
            )
          );
        // Luz ambiental
        sceneRef.current.add(new THREE.AmbientLight(0xffffff, 1.2));
        // Luz direccional
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(0, 2, 2);
        sceneRef.current.add(directional);
        // Luz adicional para el back panel
        const backLight = new THREE.PointLight(0xffffff, 0.8);
        backLight.position.set(0, 0, -2);
        sceneRef.current.add(backLight);

        // Luz adicional desde atrás para asegurar visibilidad del back panel
        const backAmbientLight = new THREE.AmbientLight(0xffffff, 0.3);
        sceneRef.current.add(backAmbientLight);
      }
    }

    function handleSessionEnd() {
      setIsAR(false);
      setShowRealWorld(true);
      setArMode("positioning");
      setFixedPosition(null);
      setModelRotation({ x: 0, y: 0, z: 0 });

      // Remover botón HTML
      // Eliminar arControlsRef y createARButton y cualquier referencia a window.createARButton

      // Restaurar escena de fondo
      if (textureRef.current && sceneRef.current) {
        sceneRef.current.background = textureRef.current;
        sceneRef.current.environment = textureRef.current;
      }
    }

    renderer.xr.addEventListener("sessionstart", handleSessionStart);
    renderer.xr.addEventListener("sessionend", handleSessionEnd);

    // AR render loop simplificado - solo modelo
    renderer.setAnimationLoop(() => {
      if (
        renderer.xr.isPresenting &&
        sceneRef.current &&
        cameraRef.current &&
        modelRef.current
      ) {
        const xrCamera = renderer.xr.getCamera();

        if (arMode === "positioning") {
          // FASE 1: Modelo sigue la cámara con rotación personalizada
          const cameraDirection = new THREE.Vector3();
          xrCamera.getWorldDirection(cameraDirection);

          // Posicionar el modelo frente a la cámara
          const distance = 0.8;
          const targetPosition = new THREE.Vector3();
          targetPosition.copy(xrCamera.position);
          targetPosition.add(cameraDirection.multiplyScalar(distance));

          // Actualizar posición suavemente
          modelRef.current.position.lerp(targetPosition, 0.1);

          // Aplicar rotación personalizada + orientación hacia cámara
          const baseRotation = new THREE.Euler();
          baseRotation.setFromQuaternion(xrCamera.quaternion);
          baseRotation.y += Math.PI; // Girar para que se vea de frente

          // Agregar rotaciones personalizadas
          modelRef.current.rotation.set(
            baseRotation.x + modelRotation.x,
            baseRotation.y + modelRotation.y,
            baseRotation.z + modelRotation.z
          );
        } else if (arMode === "fixed" && fixedPosition) {
          // FASE 2: Modelo fijo en el mundo real
          modelRef.current.position.copy(fixedPosition.position);
          modelRef.current.rotation.copy(fixedPosition.rotation);
        }

        renderer.render(sceneRef.current, cameraRef.current);
      }
    });

    return () => {
      renderer.xr.removeEventListener("sessionstart", handleSessionStart);
      renderer.xr.removeEventListener("sessionend", handleSessionEnd);
      renderer.setAnimationLoop(null);

      // Limpiar botón HTML al desmontar
      // Eliminar arControlsRef y createARButton y cualquier referencia a window.createARButton
    };
  }, [modelLoaded]); // Simplificar dependencias

  // Detectar toque/click en el botón 3D en AR
  useEffect(() => {
    if (
      !isAR ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    )
      return;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    let lastTouch = 0;

    function onSelect(event) {
      // Raycasting para detectar si el sprite fue tocado
      const session = renderer.xr.getSession();
      if (!session) return;
      const inputSource = event.inputSource;
      if (!inputSource || !inputSource.targetRaySpace) return;
      const referenceSpace = renderer.xr.getReferenceSpace();
      const pose = event.frame.getPose(
        inputSource.targetRaySpace,
        referenceSpace
      );
      if (!pose) return;
      // Convertir la posición del rayo a Three.js
      const { x, y, z } = pose.transform.position;
      const rayOrigin = new THREE.Vector3(x, y, z);
      const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
      const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
        new THREE.Quaternion(qx, qy, qz, qw)
      );
      // Raycaster
      const raycaster = new THREE.Raycaster(rayOrigin, rayDirection);
      const sprite = arButtonSpriteRef.current;
      const scene = sceneRef.current;
      if (
        sprite &&
        scene &&
        scene.children.includes(sprite) &&
        sprite.matrixWorld // chequeo extra
      ) {
        try {
          const intersects = raycaster.intersectObject(sprite, true);
          if (intersects.length > 0) {
            // Log a Sentry
            Sentry.captureMessage("Botón AR 3D tocado en mundo real", {
              level: "info",
              tags: { action: "ar_button_3d_tap" },
              extra: { timestamp: new Date().toISOString() },
            });
          }
        } catch (err) {
          Sentry.captureException(err, {
            tags: { action: "ar_button_3d_raycast_error" },
            extra: {
              spriteNull: !sprite,
              matrixWorldNull: !sprite?.matrixWorld,
              sceneHasSprite: scene?.children?.includes(sprite),
            },
          });
        }
      }
    }

    renderer.xr.getSession()?.addEventListener("select", onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener("select", onSelect);
    };
  }, [isAR]);

  // 1. Botón 3D como plano
  const arButtonPlaneRef = useRef();

  function createARButtonPlane() {
    if (arButtonPlaneRef.current && sceneRef.current) {
      sceneRef.current.remove(arButtonPlaneRef.current);
      arButtonPlaneRef.current = null;
    }
    // Crear plano con material llamativo
    const geometry = new THREE.PlaneGeometry(0.25, 0.1); // 25cm x 10cm
    const material = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, -0.2, -1); // Frente a la cámara
    plane.name = "ARButtonPlane";
    arButtonPlaneRef.current = plane;
    sceneRef.current.add(plane);
    // Cubo de prueba
    const cubeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const cubeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(0.3, 0, -1);
    cube.name = "DebugCube";
    sceneRef.current.add(cube);
    // Log children
    console.log(
      "[AR] Objetos en la escena tras añadir plano y cubo:",
      sceneRef.current.children.map((o) => o.name || o.type)
    );
  }

  // 2. Hit test para colocar el modelo
  const [hitTestActive, setHitTestActive] = useState(true);
  const hitTestRef = useRef(null);

  useEffect(() => {
    if (!isAR || !rendererRef.current) return;
    const renderer = rendererRef.current;
    let hitTestSource = null;
    let localRefSpace = null;
    let placed = false;

    function onSessionStart() {
      const session = renderer.xr.getSession();
      if (!session) return;
      session.requestReferenceSpace("viewer").then((refSpace) => {
        session.requestHitTestSource({ space: refSpace }).then((source) => {
          hitTestSource = source;
          localRefSpace = renderer.xr.getReferenceSpace();
          hitTestRef.current = { hitTestSource, localRefSpace };
        });
      });
    }
    function onSessionEnd() {
      hitTestSource = null;
      hitTestRef.current = null;
    }
    renderer.xr.addEventListener("sessionstart", onSessionStart);
    renderer.xr.addEventListener("sessionend", onSessionEnd);
    return () => {
      renderer.xr.removeEventListener("sessionstart", onSessionStart);
      renderer.xr.removeEventListener("sessionend", onSessionEnd);
    };
  }, [isAR]);

  // Render loop para hit test
  useEffect(() => {
    if (!isAR || !rendererRef.current || !modelRef.current) return;
    const renderer = rendererRef.current;
    let placed = false;
    renderer.setAnimationLoop((timestamp, frame) => {
      if (!hitTestActive || placed) return;
      const session = renderer.xr.getSession();
      if (!session || !frame || !hitTestRef.current) return;
      const { hitTestSource, localRefSpace } = hitTestRef.current;
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(localRefSpace);
        if (pose && modelRef.current) {
          modelRef.current.visible = true;
          modelRef.current.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );
          modelRef.current.quaternion.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          );
        }
      }
    });
    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [isAR, hitTestActive]);

  // Evento para colocar el modelo por hit test
  useEffect(() => {
    if (!isAR || !rendererRef.current) return;
    const renderer = rendererRef.current;
    function onSelect(event) {
      if (!hitTestActive) return;
      if (modelRef.current) {
        setHitTestActive(false);
        logSentryStep("[HIT TEST] Modelo colocado en el mundo real");
      }
    }
    renderer.xr.getSession()?.addEventListener("select", onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener("select", onSelect);
    };
  }, [isAR, hitTestActive]);

  // Evento para click en el botón 3D plano
  useEffect(() => {
    if (!isAR || !rendererRef.current || !sceneRef.current) return;
    const renderer = rendererRef.current;
    function onSelect(event) {
      const session = renderer.xr.getSession();
      if (!session) return;
      const inputSource = event.inputSource;
      if (!inputSource || !inputSource.targetRaySpace) return;
      const referenceSpace = renderer.xr.getReferenceSpace();
      const pose = event.frame.getPose(
        inputSource.targetRaySpace,
        referenceSpace
      );
      if (!pose) return;
      const { x, y, z } = pose.transform.position;
      const rayOrigin = new THREE.Vector3(x, y, z);
      const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
      const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
        new THREE.Quaternion(qx, qy, qz, qw)
      );
      const raycaster = new THREE.Raycaster(rayOrigin, rayDirection);
      const plane = arButtonPlaneRef.current;
      const scene = sceneRef.current;
      if (
        plane &&
        scene &&
        scene.children.includes(plane) &&
        plane.matrixWorld
      ) {
        try {
          const intersects = raycaster.intersectObject(plane, true);
          if (intersects.length > 0) {
            console.log("[PLANO 3D] Botón AR plano tocado en mundo real");
            Sentry.captureMessage(
              "[PLANO 3D] Botón AR plano tocado en mundo real",
              {
                level: "info",
                tags: { action: "ar_button_3d_plane_tap" },
                extra: { timestamp: new Date().toISOString() },
              }
            );
          }
        } catch (err) {
          Sentry.captureException(err, {
            tags: { action: "ar_button_3d_plane_raycast_error" },
          });
        }
      }
    }
    renderer.xr.getSession()?.addEventListener("select", onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener("select", onSelect);
    };
  }, [isAR]);

  // Crear el botón plano solo cuando inicia AR
  useEffect(() => {
    if (isAR && sceneRef.current) {
      createARButtonPlane();
    } else if (!isAR && sceneRef.current && arButtonPlaneRef.current) {
      sceneRef.current.remove(arButtonPlaneRef.current);
      arButtonPlaneRef.current = null;
      // Remover cubo de debug si existe
      const debugCube = sceneRef.current.getObjectByName("DebugCube");
      if (debugCube) sceneRef.current.remove(debugCube);
    }
  }, [isAR]);

  // Función para alternar entre mundo real y ambiente virtual
  const toggleRealWorld = () => {
    setShowRealWorld(!showRealWorld);

    if (isAR && sceneRef.current) {
      if (!showRealWorld) {
        // Cambiar a mundo real (fondo transparente)
        sceneRef.current.background = null;
        sceneRef.current.environment = null;
      } else {
        // Cambiar a ambiente virtual
        if (textureRef.current) {
          sceneRef.current.background = textureRef.current;
          sceneRef.current.environment = textureRef.current;
        }
      }
    }
  };

  // Función para fijar el modelo en la posición actual
  const fixModelPosition = () => {
    if (modelRef.current && arMode === "positioning") {
      setFixedPosition({
        position: modelRef.current.position.clone(),
        rotation: modelRef.current.rotation.clone(),
      });
      setArMode("fixed");
    }
  };

  // Función para volver al modo posicionamiento
  const repositionModel = () => {
    setArMode("positioning");
    setFixedPosition(null);
    setModelRotation({ x: 0, y: 0, z: 0 });
  };

  // Funciones para rotar el modelo
  const rotateModel = (axis, angle) => {
    if (arMode === "positioning") {
      setModelRotation((prev) => ({
        ...prev,
        [axis]: prev[axis] + angle,
      }));
    }
  };

  // Estado para escala y rotación del modelo
  const [modelScale, setModelScale] = useState(0.15);
  const [modelRotationY, setModelRotationY] = useState(0);
  const [modelFixed, setModelFixed] = useState(false);

  // Botones HTML flotantes para escalar y rotar
  function renderARControls() {
    if (!isAR || !modelFixed) return null;
    return (
      <div
        style={{
          position: "fixed",
          bottom: 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          zIndex: 10000,
          pointerEvents: "auto",
        }}
      >
        <button
          style={arBtnStyle}
          onClick={() => {
            setModelScale((s) => Math.max(0.05, s - 0.05));
            logSentryStep("Botón: Escalar -");
          }}
        >
          -
        </button>
        <button
          style={arBtnStyle}
          onClick={() => {
            setModelScale((s) => Math.min(1, s + 0.05));
            logSentryStep("Botón: Escalar +");
          }}
        >
          +
        </button>
        <button
          style={arBtnStyle}
          onClick={() => {
            setModelRotationY((r) => r - Math.PI / 12);
            logSentryStep("Botón: Rotar ⟲");
          }}
        >
          ⟲
        </button>
        <button
          style={arBtnStyle}
          onClick={() => {
            setModelRotationY((r) => r + Math.PI / 12);
            logSentryStep("Botón: Rotar ⟳");
          }}
        >
          ⟳
        </button>
      </div>
    );
  }
  const arBtnStyle = {
    fontSize: 28,
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.95)",
    color: "#222",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    cursor: "pointer",
  };

  // Throttle para gestos multitouch
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last > wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  // Gestos multitouch para escalar y rotar (con throttle)
  useEffect(() => {
    if (!isAR || !modelFixed) return;
    let lastDist = null;
    let lastAngle = null;
    const throttledTouchMove = throttle(function onTouchMove(e) {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        if (lastDist !== null) {
          // Pinch para escalar
          const scaleDelta = (dist - lastDist) * 0.001;
          setModelScale((s) => Math.max(0.05, Math.min(1, s + scaleDelta)));
          logSentryStep("Gesto: Pinch para escalar");
        }
        if (lastAngle !== null) {
          // Rotar con dos dedos
          const rotDelta = angle - lastAngle;
          setModelRotationY((r) => r + rotDelta);
          logSentryStep("Gesto: Rotar con dos dedos");
        }
        lastDist = dist;
        lastAngle = angle;
      }
    }, 50); // throttle a 50ms
    function onTouchEnd(e) {
      lastDist = null;
      lastAngle = null;
    }
    window.addEventListener("touchmove", throttledTouchMove, {
      passive: false,
    });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", throttledTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isAR, modelFixed]);

  // Toggle fijar/mover modelo con cada tap
  useEffect(() => {
    if (!isAR || !rendererRef.current) return;
    const renderer = rendererRef.current;
    function onSelect(event) {
      setModelFixed((fixed) => {
        const newFixed = !fixed;
        logSentryStep(
          `[HIT TEST] Modelo ${newFixed ? "fijado" : "liberado"} en el mundo real`
        );
        return newFixed;
      });
    }
    renderer.xr.getSession()?.addEventListener("select", onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener("select", onSelect);
    };
  }, [isAR]);

  // En el render loop, aplicar escala y rotación solo si el modelo no está fijo
  useEffect(() => {
    if (
      !isAR ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    )
      return;
    const renderer = rendererRef.current;
    let frameCount = 0;
    renderer.setAnimationLoop(() => {
      frameCount++;
      if (modelRef.current && cameraRef.current && !modelFixed) {
        modelRef.current.position.set(0, 0, -0.8);
        modelRef.current.position.applyMatrix4(cameraRef.current.matrixWorld);
        modelRef.current.quaternion.copy(cameraRef.current.quaternion);
      }
      // Aplicar escala y rotación Y siempre
      if (modelRef.current) {
        modelRef.current.scale.setScalar(modelScale);
        modelRef.current.rotation.y = modelRotationY;
      }
      if (frameCount % 300 === 0) {
        logSentryStep(`Render loop activo. Frame: ${frameCount}`);
      }
      try {
        renderer.render(sceneRef.current, cameraRef.current);
      } catch (err) {
        console.error("[AR] Error en render loop:", err);
        Sentry.captureException(err, {
          tags: { action: "ar_render_loop_error" },
        });
      }
    });
    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [isAR, modelFixed, modelScale, modelRotationY]);

  // En el render, renderARControls()
  // Estilo para botones de rotación mejorado para AR
  const rotationButtonStyle = {
    width: "50px",
    height: "50px",
    backgroundColor: "rgba(255,255,255,0.95)",
    border: "3px solid #FF6600",
    borderRadius: "15px",
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
    touchAction: "manipulation", // Mejorar respuesta táctil
  };

  // Contador global para logs de Sentry
  let sentryLogCounter = 0;
  // Helper para logs solo en desarrollo
  function logSentryStep(msg) {
    if (process.env.NODE_ENV === "production") return;
    sentryLogCounter += 1;
    const fullMsg = `[AR-STEP-${sentryLogCounter}] ${msg}`;
    // Solo loguear en desarrollo
    if (typeof window !== "undefined") {
      console.log(fullMsg);
    }
    if (typeof Sentry !== "undefined") {
      Sentry.captureMessage(fullMsg);
    }
  }

  // Log en cada paso crítico usando logSentryStep
  useEffect(() => {
    logSentryStep(`useEffect isAR: ${isAR}`);
    if (isAR && sceneRef.current) {
      try {
        // LIMPIEZA: Elimina todos los modelos previos excepto el modelo principal y las luces
        sceneRef.current.children = sceneRef.current.children.filter(
          (child) =>
            child === modelRef.current ||
            child.isLight ||
            child === arStatusPlaneRef.current
        );
        // Añade el modelo si no está
        if (
          modelRef.current &&
          !sceneRef.current.children.includes(modelRef.current)
        ) {
          sceneRef.current.add(modelRef.current);
          logSentryStep("Modelo añadido a la escena");
        }
        logSentryStep(
          `Children finales: ${sceneRef.current.children.map((o) => o.name || o.type).join(", ")}`
        );
      } catch (err) {
        console.error("[AR] Error añadiendo objetos:", err);
        Sentry.captureException(err, {
          tags: { action: "ar_add_objects_error" },
        });
      }
    } else if (!isAR && sceneRef.current) {
      // No cleanup especial fuera de AR
    }
  }, [isAR]);

  // Render loop de AR optimizado
  useEffect(() => {
    if (
      !isAR ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    )
      return;
    const renderer = rendererRef.current;
    let frameCount = 0;
    renderer.setAnimationLoop(() => {
      frameCount++;
      // Solo el modelo sigue la cámara hasta el hit
      if (modelRef.current && cameraRef.current && hitTestActive) {
        modelRef.current.position.set(0, 0, -0.8);
        modelRef.current.position.applyMatrix4(cameraRef.current.matrixWorld);
        modelRef.current.quaternion.copy(cameraRef.current.quaternion);
      }
      if (frameCount % 300 === 0) {
        logSentryStep(`Render loop activo. Frame: ${frameCount}`);
      }
      try {
        renderer.render(sceneRef.current, cameraRef.current);
      } catch (err) {
        console.error("[AR] Error en render loop:", err);
        Sentry.captureException(err, {
          tags: { action: "ar_render_loop_error" },
        });
      }
    });
    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [isAR, hitTestActive]);

  // Indicador de estado como plano 3D
  const arStatusPlaneRef = useRef();

  // Reutilización de textura/material del plano indicador
  function createARStatusPlane(text) {
    if (!sceneRef.current) return;
    // Si ya existe el plano y el texto no cambió, solo actualiza la textura
    if (
      arStatusPlaneRef.current &&
      arStatusPlaneRef.current.userData.text === text
    ) {
      return;
    }
    // Si existe el plano pero el texto cambió, actualiza la textura
    if (
      arStatusPlaneRef.current &&
      sceneRef.current.children.includes(arStatusPlaneRef.current)
    ) {
      // Actualizar solo la textura
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(30,30,30,0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "400 32px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      arStatusPlaneRef.current.material.map.dispose();
      arStatusPlaneRef.current.material.map = texture;
      arStatusPlaneRef.current.material.needsUpdate = true;
      arStatusPlaneRef.current.userData.text = text;
      return;
    }
    // Si no existe el plano, créalo
    if (
      arStatusPlaneRef.current &&
      sceneRef.current.children.includes(arStatusPlaneRef.current)
    ) {
      sceneRef.current.remove(arStatusPlaneRef.current);
    }
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(30,30,30,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "400 32px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(0.45, 0.08);
    const plane = new THREE.Mesh(geometry, material);
    plane.name = "ARStatusPlane";
    plane.userData.text = text;
    arStatusPlaneRef.current = plane;
    sceneRef.current.add(plane);
  }

  // Guardar el último texto del indicador para evitar recrear el canvas/textura si no cambia
  const lastStatusText = useRef("");
  useEffect(() => {
    if (!isAR || !sceneRef.current) return;
    const text = modelFixed
      ? "Modelo fijo. Puedes girar y escalar."
      : "Coloca el modelo. Toca para fijar.";
    if (lastStatusText.current !== text) {
      createARStatusPlane(text);
      lastStatusText.current = text;
    }
  }, [isAR, modelFixed]);

  // Render loop optimizado
  useEffect(() => {
    if (
      !isAR ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    )
      return;
    const renderer = rendererRef.current;
    renderer.setAnimationLoop(() => {
      // Indicador de estado siempre frente a la cámara
      if (arStatusPlaneRef.current && cameraRef.current) {
        arStatusPlaneRef.current.position.set(0, 0.5, -1.3);
        arStatusPlaneRef.current.position.applyMatrix4(
          cameraRef.current.matrixWorld
        );
        arStatusPlaneRef.current.quaternion.copy(cameraRef.current.quaternion);
      }
      // Solo actualizar el modelo si no está fijo
      if (modelRef.current && cameraRef.current && !modelFixed) {
        modelRef.current.position.set(0, 0, -0.8);
        modelRef.current.position.applyMatrix4(cameraRef.current.matrixWorld);
        modelRef.current.quaternion.copy(cameraRef.current.quaternion);
      }
      // Aplicar escala y rotación Y siempre
      if (modelRef.current) {
        modelRef.current.scale.setScalar(modelScale);
        modelRef.current.rotation.y = modelRotationY;
      }
      try {
        renderer.render(sceneRef.current, cameraRef.current);
      } catch (err) {
        console.error("[AR] Error en render loop:", err);
        Sentry.captureException(err, {
          tags: { action: "ar_render_loop_error" },
        });
      }
    });
    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [isAR, modelFixed, modelScale, modelRotationY]);

  function renderARStatusIndicator() {
    if (!isAR) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: modelFixed
            ? "rgba(0,200,0,0.95)"
            : "rgba(255,180,0,0.95)",
          color: "#fff",
          padding: "10px 24px",
          borderRadius: 16,
          fontWeight: "bold",
          fontSize: 18,
          zIndex: 10001,
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          letterSpacing: 1,
          pointerEvents: "none",
        }}
      >
        {modelFixed
          ? "📍 Modelo fijo en el mundo real"
          : "👀 Siguiendo cámara (toca para fijar)"}
      </div>
    );
  }

  // 1. Mejorar el estilo del botón AR estándar y cambiar texto a español

  // 2. Reactivar el selector de ambientes con miniaturas, solo visible antes de entrar en AR
  const ambientes = [
    {
      name: "Galería",
      url: "/images/image360.jpg",
      thumb: "/images/image360.jpg",
    },
    {
      name: "Ambiente 2",
      url: "/images/image3603.png",
      thumb: "/images/image3603.png",
    },
    {
      name: "Ambiente 3",
      url: "/images/image3604.png",
      thumb: "/images/image3604.png",
    },
    { name: "Sin fondo", url: null, thumb: "/images/placeholder-image.jpg" },
  ];
  const [ambiente, setAmbiente] = useState(ambientes[0]);
  function renderAmbienteSelector() {
    if (isAR) return null;
    return (
      <div
        style={{
          position: "fixed",
          bottom: 120,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 36,
          zIndex: 10001,
          padding: "0 32px",
        }}
      >
        {ambientes.map((a) =>
          a.url ? (
            <img
              key={a.name}
              src={a.thumb}
              alt={a.name}
              style={{
                width: 72,
                height: 44,
                borderRadius: 10,
                border:
                  ambiente.name === a.name
                    ? "3px solid #6366f1"
                    : "2px solid #fff",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
                background: "#fff",
                objectFit: "cover",
                transition: "border 0.2s, filter 0.2s, opacity 0.2s",
                filter:
                  ambiente.name === a.name
                    ? "grayscale(0) opacity(1)"
                    : "grayscale(1) opacity(0.7)",
              }}
              onClick={() => setAmbiente(a)}
            />
          ) : (
            <div
              key={a.name}
              style={{
                width: 72,
                height: 44,
                borderRadius: 10,
                border:
                  ambiente.name === a.name
                    ? "3px solid #6366f1"
                    : "2px solid #fff",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                transition: "border 0.2s, filter 0.2s, opacity 0.2s",
                filter:
                  ambiente.name === a.name
                    ? "grayscale(0) opacity(1)"
                    : "grayscale(1) opacity(0.7)",
              }}
              onClick={() => setAmbiente(a)}
              title="Sin fondo"
            >
              Sin fondo
            </div>
          )
        )}
      </div>
    );
  }
  // Cambiar el fondo cuando cambia el ambiente (solo en preview)
  useEffect(() => {
    if (!isAR && sceneRef.current) {
      if (ambiente.url) {
        const loader = new THREE.TextureLoader();
        loader.load(ambiente.url, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          sceneRef.current.background = texture;
          sceneRef.current.environment = texture;
        });
      } else {
        sceneRef.current.background = null;
        sceneRef.current.environment = null;
      }
    }
  }, [ambiente, isAR]);

  // Al entrar/salir de AR, poner overflow: hidden y margin/padding 0 en body/html
  useEffect(() => {
    if (isAR) {
      document.body.classList.add("ar-viewport");
      document.documentElement.classList.add("ar-viewport");
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";
    } else {
      document.body.classList.remove("ar-viewport");
      document.documentElement.classList.remove("ar-viewport");
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
    }
  }, [isAR]);

  // Prevenir scroll en mobile siempre que el componente esté montado
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlHeight = document.documentElement.style.height;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.height = "100vh";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.height = prevHtmlHeight;
    };
  }, []);

  // Utilidad para media queries en JS
  function getARViewportStyle() {
    // Por defecto mobile
    let top = 88;
    let height = `calc(100vh - 88px)`;
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      top = 96;
      height = `calc(100vh - 96px)`;
    }
    return {
      position: "fixed",
      width: "100vw",
      height,
      background: "#000",
      top,
      left: 0,
      zIndex: 3000,
      pointerEvents: "auto",
      overflow: "hidden",
    };
  }

  // useEffect para agregar el botón ARButton por default de Three.js
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.navigator.xr ||
      !rendererRef.current
    )
      return;
    if (document.querySelector(".ar-button, .webxr-ar-button, #ARButton"))
      return;
    const arBtn = ARButton.createButton(rendererRef.current);
    if (arBtn) {
      // Sube el botón en mobile para evitar que quede cortado
      if (window.innerWidth < 700) {
        arBtn.style.bottom = "80px";
      }
      document.body.appendChild(arBtn);
    }
    return () => {
      if (arBtn && arBtn.parentNode) {
        arBtn.parentNode.removeChild(arBtn);
      }
    };
  }, [rendererRef.current]);

  return (
    <>
      {/* Container principal de THREE.js */}
      <div style={getARViewportStyle()}>
        <div
          ref={mountRef}
          style={{
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            position: "absolute",
            top: 0,
            left: 0,
            boxSizing: "border-box",
          }}
        />

        {renderARControls()}
        {renderARStatusIndicator()}
        {renderAmbienteSelector()}
      </div>

      {/* Eliminar todos los demás overlays y botones HTML */}
    </>
  );
}

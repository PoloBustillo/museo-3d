"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import * as Sentry from "@sentry/nextjs";

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
  const [showRealWorld, setShowRealWorld] = useState(true);
  const [arMode, setArMode] = useState('positioning'); // 'positioning' o 'fixed'
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
      fontColor = '#ffffff',
      backgroundColor = 'rgba(0,0,0,0.8)',
      borderColor = '#ff6600',
      borderWidth = 4,
      padding = 20,
      borderRadius = 15,
      width = null,
      height = null
    } = options;

    // Crear canvas para el texto
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
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
    
    roundRect(borderWidth/2, borderWidth/2, canvasWidth - borderWidth, canvasHeight - borderWidth, borderRadius);
    context.fill();
    context.stroke();
    
    // Dibujar texto
    context.fillStyle = fontColor;
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvasWidth/2, canvasHeight/2);
    
    // Crear textura y sprite
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      alphaTest: 0.1
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
      fontColor: '#fff',
      backgroundColor: 'rgba(255,102,0,0.95)',
      borderColor: '#fff',
      borderWidth: 6,
      borderRadius: 30,
      padding: 40
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
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
        setWebXRSupported(supported);
      }).catch((error) => {
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
    textureLoader.load('/images/image360.jpg', (texture) => {
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
    loader.load(modelUrl, (gltf) => {
      // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
      const model = gltf.scene;

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

      // SOLUCIÓN OCLUSIÓN: Configurar para AR
      model.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false; // NO desaparecer por culling
          if (child.material) {
            child.material.side = THREE.DoubleSide; // Visible desde ambos lados
            child.material.depthTest = false; // NO hacer depth test
            child.material.depthWrite = false; // NO escribir al depth buffer
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
    });
  }, [modelUrl, restoreMaterials]);

  // Botón AR mejorado para móvil
  useEffect(() => {
    if (!modelLoaded || !rendererRef.current || !webXRSupported) {
      // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado
      return;
    }

    // Eliminar debugLogs, showDebugUI, addDebugLog, y cualquier render o estado relacionado

    // Verificar que el renderer tenga WebXR habilitado
    if (!rendererRef.current.xr) {
      console.error("🔧 WebXR no está habilitado en el renderer");
      return;
    }

    try {
      const arButton = ARButton.createButton(rendererRef.current);
      
      if (!arButton) {
        console.error("🔧 ARButton.createButton retornó null/undefined");
        return;
      }

      arButton.style.position = "fixed";
      arButton.style.bottom = "120px"; // Más arriba para que no se corte
      arButton.style.right = "20px";
      arButton.style.left = "20px"; // Ancho completo en móvil
      arButton.style.padding = "20px 30px"; // Más padding para hacerlo más grande
      arButton.style.background = "linear-gradient(135deg, #ff6600, #ff8800)";
      arButton.style.color = "white";
      arButton.style.border = "3px solid #fff"; // Borde blanco para hacerlo más visible
      arButton.style.borderRadius = "15px";
      arButton.style.fontSize = "20px"; // Texto más grande
      arButton.style.fontWeight = "bold";
      arButton.style.zIndex = "999999"; // Aumentar z-index para asegurar visibilidad
      arButton.style.boxShadow = "0 8px 30px rgba(255,102,0,0.6), 0 0 0 2px rgba(255,255,255,0.3)"; // Sombra más prominente
      arButton.style.pointerEvents = "auto"; // Asegurar que los eventos funcionen
      arButton.style.cursor = "pointer"; // Agregar cursor pointer
      arButton.style.fontFamily = "system-ui, -apple-system, sans-serif"; // Fuente específica
      arButton.style.textAlign = "center"; // Centrar texto
      arButton.style.display = "flex"; // Usar flexbox
      arButton.style.alignItems = "center"; // Centrar verticalmente
      arButton.style.justifyContent = "center"; // Centrar horizontalmente
      arButton.style.gap = "8px"; // Espacio entre icono y texto

      // Agregar el texto al botón
      arButton.textContent = "🥽 Iniciar Experiencia AR";

      console.log("🔧 Botón AR creado:", arButton); // Debug

      document.body.appendChild(arButton);

      console.log("🔧 Botón AR agregado al DOM"); // Debug

      return () => {
        console.log("🔧 Limpiando botón AR..."); // Debug
        if (arButton.parentNode) {
          arButton.parentNode.removeChild(arButton);
        }
      };
    } catch (error) {
      console.error("🔧 Error creando botón AR:", error);
      
      // Crear un botón de fallback si ARButton.createButton falla
      const fallbackButton = document.createElement('button');
      fallbackButton.textContent = webXRSupported ? "🥽 AR No Disponible" : "🥽 WebXR No Soportado";
      fallbackButton.style.position = "fixed";
      fallbackButton.style.bottom = "120px";
      fallbackButton.style.right = "20px";
      fallbackButton.style.left = "20px";
      fallbackButton.style.padding = "16px 24px";
      fallbackButton.style.background = "linear-gradient(135deg, #666, #999)";
      fallbackButton.style.color = "white";
      fallbackButton.style.border = "none";
      fallbackButton.style.borderRadius = "12px";
      fallbackButton.style.fontSize = "18px";
      fallbackButton.style.fontWeight = "bold";
      fallbackButton.style.zIndex = "999999";
      fallbackButton.style.cursor = "not-allowed";
      fallbackButton.disabled = true;
      
      document.body.appendChild(fallbackButton);
      
      return () => {
        if (fallbackButton.parentNode) {
          fallbackButton.parentNode.removeChild(fallbackButton);
        }
      };
    }
  }, [modelLoaded, webXRSupported]);

  // AR Management con controles Three.js Sprites
  useEffect(() => {
    if (!rendererRef.current || !modelRef.current) return;

    const renderer = rendererRef.current;
    const model = modelRef.current;

    function handleSessionStart() {
      setIsAR(true);
      setShowRealWorld(true);
      setArMode('positioning'); // Empezar en modo posicionamiento
      setFixedPosition(null);
      setModelRotation({ x: 0, y: 0, z: 0 });

      // Limpiar fondo y ambiente
      if (sceneRef.current) {
        sceneRef.current.background = null;
        sceneRef.current.environment = null;
      }

      // Remover todos los hijos de la escena excepto el modelo AR y el sprite del botón
      if (sceneRef.current) {
        sceneRef.current.children = sceneRef.current.children.filter(child =>
          child === modelRef.current || child === arButtonSpriteRef.current
        );
      }

      // Ajustar posición y escala del modelo para AR
      if (modelRef.current) {
        modelRef.current.position.set(0, 0, -0.8); // Frente a la cámara
        modelRef.current.scale.setScalar(0.15);   // Escala pequeña para AR
        // Reforzar materiales y visibilidad
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.frustumCulled = false;
            child.visible = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              child.material.depthTest = false;
              child.material.depthWrite = false;
              child.material.transparent = false;
              child.material.opacity = 1.0;
            }
          }
        });
      }

      // Agregar luz ambiental y direccional para AR
      if (sceneRef.current) {
        // Elimina luces previas
        sceneRef.current.children = sceneRef.current.children.filter(child =>
          !(child.isLight)
        ).concat(sceneRef.current.children.filter(child =>
          child === modelRef.current || child === arButtonSpriteRef.current
        ));
        // Luz ambiental
        sceneRef.current.add(new THREE.AmbientLight(0xffffff, 1.2));
        // Luz direccional
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(0, 2, 2);
        sceneRef.current.add(directional);
      }
    }

    function handleSessionEnd() {
      setIsAR(false);
      setShowRealWorld(true);
      setArMode('positioning');
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
      if (renderer.xr.isPresenting && sceneRef.current && cameraRef.current && modelRef.current) {
        const xrCamera = renderer.xr.getCamera();
        
        if (arMode === 'positioning') {
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
          
        } else if (arMode === 'fixed' && fixedPosition) {
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

  // Efecto para actualizar el botón AR cuando cambia el modo
  useEffect(() => {
    if (isAR && rendererRef.current?.xr?.isPresenting && ARButton.createButton) {
      setTimeout(() => {
        ARButton.createButton(rendererRef.current);
      }, 100);
    }
  }, [arMode]);

  // Detectar toque/click en el botón 3D en AR
  useEffect(() => {
    if (!isAR || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
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
      const pose = event.frame.getPose(inputSource.targetRaySpace, referenceSpace);
      if (!pose) return;
      // Convertir la posición del rayo a Three.js
      const { x, y, z } = pose.transform.position;
      const rayOrigin = new THREE.Vector3(x, y, z);
      const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
      const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(qx, qy, qz, qw));
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
              extra: { timestamp: new Date().toISOString() }
            });
          }
        } catch (err) {
          Sentry.captureException(err, {
            tags: { action: "ar_button_3d_raycast_error" },
            extra: {
              spriteNull: !sprite,
              matrixWorldNull: !sprite?.matrixWorld,
              sceneHasSprite: scene?.children?.includes(sprite)
            }
          });
        }
      }
    }

    renderer.xr.getSession()?.addEventListener('select', onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener('select', onSelect);
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
    console.log("[AR] Objetos en la escena tras añadir plano y cubo:", sceneRef.current.children.map(o => o.name || o.type));
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
      session.requestReferenceSpace('viewer').then((refSpace) => {
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
    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);
    return () => {
      renderer.xr.removeEventListener('sessionstart', onSessionStart);
      renderer.xr.removeEventListener('sessionend', onSessionEnd);
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
          modelRef.current.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
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
    renderer.xr.getSession()?.addEventListener('select', onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener('select', onSelect);
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
      const pose = event.frame.getPose(inputSource.targetRaySpace, referenceSpace);
      if (!pose) return;
      const { x, y, z } = pose.transform.position;
      const rayOrigin = new THREE.Vector3(x, y, z);
      const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
      const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(qx, qy, qz, qw));
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
            Sentry.captureMessage("[PLANO 3D] Botón AR plano tocado en mundo real", {
              level: "info",
              tags: { action: "ar_button_3d_plane_tap" },
              extra: { timestamp: new Date().toISOString() }
            });
          }
        } catch (err) {
          Sentry.captureException(err, {
            tags: { action: "ar_button_3d_plane_raycast_error" }
          });
        }
      }
    }
    renderer.xr.getSession()?.addEventListener('select', onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener('select', onSelect);
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
    if (modelRef.current && arMode === 'positioning') {
      setFixedPosition({
        position: modelRef.current.position.clone(),
        rotation: modelRef.current.rotation.clone()
      });
      setArMode('fixed');
    }
  };

  // Función para volver al modo posicionamiento
  const repositionModel = () => {
    setArMode('positioning');
    setFixedPosition(null);
    setModelRotation({ x: 0, y: 0, z: 0 });
  };

  // Funciones para rotar el modelo
  const rotateModel = (axis, angle) => {
    if (arMode === 'positioning') {
      setModelRotation(prev => ({
        ...prev,
        [axis]: prev[axis] + angle
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
      <div style={{
        position: 'fixed',
        bottom: 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        zIndex: 10000,
        pointerEvents: 'auto',
      }}>
        <button style={arBtnStyle} onClick={() => {
          setModelScale(s => Math.max(0.05, s - 0.05));
          logSentryStep('Botón: Escalar -');
        }}>-</button>
        <button style={arBtnStyle} onClick={() => {
          setModelScale(s => Math.min(1, s + 0.05));
          logSentryStep('Botón: Escalar +');
        }}>+</button>
        <button style={arBtnStyle} onClick={() => {
          setModelRotationY(r => r - Math.PI / 12);
          logSentryStep('Botón: Rotar ⟲');
        }}>⟲</button>
        <button style={arBtnStyle} onClick={() => {
          setModelRotationY(r => r + Math.PI / 12);
          logSentryStep('Botón: Rotar ⟳');
        }}>⟳</button>
      </div>
    );
  }
  const arBtnStyle = {
    fontSize: 28,
    padding: '12px 18px',
    borderRadius: 12,
    border: 'none',
    background: 'rgba(255,255,255,0.95)',
    color: '#222',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
  };

  // Gestos multitouch para escalar y rotar
  useEffect(() => {
    if (!isAR || !modelFixed) return;
    let lastDist = null;
    let lastAngle = null;
    function onTouchMove(e) {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        if (lastDist !== null) {
          // Pinch para escalar
          const scaleDelta = (dist - lastDist) * 0.001;
          setModelScale(s => Math.max(0.05, Math.min(1, s + scaleDelta)));
          logSentryStep('Gesto: Pinch para escalar');
        }
        if (lastAngle !== null) {
          // Rotar con dos dedos
          const rotDelta = angle - lastAngle;
          setModelRotationY(r => r + rotDelta);
          logSentryStep('Gesto: Rotar con dos dedos');
        }
        lastDist = dist;
        lastAngle = angle;
      }
    }
    function onTouchEnd(e) {
      lastDist = null;
      lastAngle = null;
    }
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isAR, modelFixed]);

  // Toggle fijar/mover modelo con cada tap
  useEffect(() => {
    if (!isAR || !rendererRef.current) return;
    const renderer = rendererRef.current;
    function onSelect(event) {
      setModelFixed(fixed => {
        const newFixed = !fixed;
        logSentryStep(`[HIT TEST] Modelo ${newFixed ? 'fijado' : 'liberado'} en el mundo real`);
        return newFixed;
      });
    }
    renderer.xr.getSession()?.addEventListener('select', onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener('select', onSelect);
    };
  }, [isAR]);

  // En el render loop, aplicar escala y rotación solo si el modelo no está fijo
  useEffect(() => {
    if (!isAR || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
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
        Sentry.captureException(err, { tags: { action: "ar_render_loop_error" } });
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
  function logSentryStep(msg) {
    sentryLogCounter += 1;
    const fullMsg = `[AR-STEP-${sentryLogCounter}] ${msg}`;
    console.log(fullMsg);
    Sentry.captureMessage(fullMsg);
  }

  // Log en cada paso crítico usando logSentryStep
  useEffect(() => {
    logSentryStep(`useEffect isAR: ${isAR}`);
    if (isAR && sceneRef.current) {
      try {
        // LIMPIEZA: Elimina todos los modelos previos excepto el modelo principal y las luces
        sceneRef.current.children = sceneRef.current.children.filter(child =>
          child === modelRef.current || child.isLight
        );
        // Añade el modelo si no está
        if (modelRef.current && !sceneRef.current.children.includes(modelRef.current)) {
          sceneRef.current.add(modelRef.current);
          logSentryStep("Modelo añadido a la escena");
        }
        logSentryStep(`Children finales: ${sceneRef.current.children.map(o => o.name || o.type).join(", ")}`);
      } catch (err) {
        console.error("[AR] Error añadiendo objetos:", err);
        Sentry.captureException(err, { tags: { action: "ar_add_objects_error" } });
      }
    } else if (!isAR && sceneRef.current) {
      // No cleanup especial fuera de AR
    }
  }, [isAR]);

  // Render loop de AR optimizado
  useEffect(() => {
    if (!isAR || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
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
        Sentry.captureException(err, { tags: { action: "ar_render_loop_error" } });
      }
    });
    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [isAR, hitTestActive]);

  // Indicador de estado como plano 3D
  const arStatusPlaneRef = useRef();

  function createARStatusPlane(text) {
    if (arStatusPlaneRef.current && sceneRef.current) {
      sceneRef.current.remove(arStatusPlaneRef.current);
      arStatusPlaneRef.current = null;
    }
    // Crear canvas para el texto
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(30,30,30,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '400 32px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    // Crear textura y plano
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(0.45, 0.08);
    const plane = new THREE.Mesh(geometry, material);
    plane.name = 'ARStatusPlane';
    arStatusPlaneRef.current = plane;
    sceneRef.current.add(plane);
  }

  // Actualizar el texto del plano indicador cuando cambia el estado
  useEffect(() => {
    if (!isAR || !sceneRef.current) return;
    const text = modelFixed
      ? 'Modelo fijo. Puedes girar y escalar.'
      : 'Coloca el modelo. Toca para fijar.';
    createARStatusPlane(text);
  }, [isAR, modelFixed]);

  // En el render loop, el plano indicador siempre sigue la cámara, más arriba y más pequeño
  useEffect(() => {
    if (!isAR || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const renderer = rendererRef.current;
    let frameCount = 0;
    renderer.setAnimationLoop(() => {
      frameCount++;
      // Indicador de estado siempre frente a la cámara, más arriba y más pequeño
      if (arStatusPlaneRef.current && cameraRef.current) {
        arStatusPlaneRef.current.position.set(0, 0.5, -1.3);
        arStatusPlaneRef.current.position.applyMatrix4(cameraRef.current.matrixWorld);
        arStatusPlaneRef.current.quaternion.copy(cameraRef.current.quaternion);
      }
      if (modelRef.current && cameraRef.current && !modelFixed) {
        modelRef.current.position.set(0, 0, -0.8);
        modelRef.current.position.applyMatrix4(cameraRef.current.matrixWorld);
        modelRef.current.quaternion.copy(cameraRef.current.quaternion);
      }
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
        Sentry.captureException(err, { tags: { action: "ar_render_loop_error" } });
      }
    });
    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [isAR, modelFixed, modelScale, modelRotationY]);

  function renderARStatusIndicator() {
    if (!isAR) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: modelFixed ? 'rgba(0,200,0,0.95)' : 'rgba(255,180,0,0.95)',
        color: '#fff',
        padding: '10px 24px',
        borderRadius: 16,
        fontWeight: 'bold',
        fontSize: 18,
        zIndex: 10001,
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        letterSpacing: 1,
        pointerEvents: 'none',
      }}>
        {modelFixed ? '📍 Modelo fijo en el mundo real' : '👀 Siguiendo cámara (toca para fijar)'}
      </div>
    );
  }

  return (
    <>
      {/* Container principal de THREE.js */}
      <div
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          background: "#000",
          top: 0,
          left: 0,
          zIndex: 3000,
          pointerEvents: "auto", // Siempre permitir eventos para que el botón funcione
        }}
      >
        <div
          ref={mountRef}
          style={{
            width: "100vw",
            height: "100vh",
          }}
        />

        {/* Botón cerrar - Solo si no estamos en AR */}
        {showCloseButton && onClose && !isAR && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              padding: "10px 15px",
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              zIndex: 9999,
              pointerEvents: "auto",
            }}
          >
            ← Cerrar
          </button>
        )}
        {renderARControls()}
        {renderARStatusIndicator()}
      </div>

      {/* Eliminar todos los demás overlays y botones HTML */}

    </>
  );
}

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
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebugUI, setShowDebugUI] = useState(true);
  const textureRef = useRef();
  
  // Referencias para controles AR - Botón HTML tradicional
  const arControlsRef = useRef({
    buttonElement: null
  });

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

  // Función para crear botón HTML que funciona en AR
  function createARButton() {
    // Remover botón existente
    if (arControlsRef.current.buttonElement) {
      document.body.removeChild(arControlsRef.current.buttonElement);
      arControlsRef.current.buttonElement = null;
    }
    
    // Crear botón HTML
    const button = document.createElement('button');
    const buttonText = arMode === 'positioning' ? 'COLOCAR AQUÍ' : 'REPOSICIONAR';
    button.textContent = buttonText;
    
    // Estilo del botón para AR
    button.style.position = 'fixed';
    button.style.bottom = '50px';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    button.style.padding = '15px 30px';
    button.style.fontSize = '18px';
    button.style.fontWeight = 'bold';
    button.style.color = 'white';
    button.style.backgroundColor = arMode === 'positioning' ? '#00c851' : '#ff8800';
    button.style.border = 'none';
    button.style.borderRadius = '25px';
    button.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    button.style.zIndex = '99999'; // Z-index muy alto
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
    button.style.touchAction = 'manipulation';
    
    // Event listener del botón
    button.addEventListener('click', () => {
      console.log('Botón HTML clickeado!'); // Debug
      
      if (arMode === 'positioning') {
        // Colocar el modelo
        if (modelRef.current) {
          setFixedPosition({
            position: modelRef.current.position.clone(),
            rotation: modelRef.current.rotation.clone()
          });
          setArMode('fixed');
          console.log('Modelo colocado');
        }
      } else {
        // Reposicionar el modelo
        setArMode('positioning');
        setFixedPosition(null);
        setModelRotation({ x: 0, y: 0, z: 0 });
        console.log('Modo reposicionamiento');
      }
    });
    
    // Agregar al DOM
    document.body.appendChild(button);
    arControlsRef.current.buttonElement = button;
  }

  // Exponer función globalmente para actualizaciones
  window.createARButton = createARButton;

  // Función para agregar logs visuales
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [
      ...prev.slice(-5), // Mantener solo los últimos 5 logs
      { message, type, timestamp }
    ]);
    console.log(`🔧 [${timestamp}] ${message}`);
  };

  // Verificar soporte WebXR al inicio
  useEffect(() => {
    addDebugLog("Verificando soporte WebXR...");
    addDebugLog(`navigator.xr disponible: ${!!navigator.xr}`);
    
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        addDebugLog(`WebXR AR soportado: ${supported}`, supported ? 'success' : 'error');
        setWebXRSupported(supported);
      }).catch((error) => {
        addDebugLog(`Error verificando WebXR AR: ${error.message}`, 'error');
        setWebXRSupported(false);
      });
    } else {
      addDebugLog("WebXR no disponible", 'error');
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

    addDebugLog(`Iniciando carga del modelo: ${modelUrl}`);

    // Limpiar modelo anterior
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      addDebugLog("Modelo cargado exitosamente", 'success');
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
      addDebugLog("Modelo agregado a la escena", 'success');
    }, 
    // Progress callback
    (progress) => {
      const percent = (progress.loaded / progress.total * 100).toFixed(2);
      addDebugLog(`Progreso de carga: ${percent}%`);
    },
    // Error callback
    (error) => {
      addDebugLog(`Error cargando modelo: ${error.message}`, 'error');
    });
  }, [modelUrl, restoreMaterials]);

  // Botón AR mejorado para móvil
  useEffect(() => {
    if (!modelLoaded || !rendererRef.current || !webXRSupported) {
      addDebugLog(`No creando botón AR - modelLoaded: ${modelLoaded}, renderer: ${!!rendererRef.current}, WebXR: ${webXRSupported}`);
      return;
    }

    addDebugLog("Creando botón AR inicial...");

    // Verificar que el renderer tenga WebXR habilitado
    if (!rendererRef.current.xr) {
      console.error("🔧 WebXR no está habilitado en el renderer");
      return;
    }

    try {
      // PRIMERO: Crear un botón de prueba simple para verificar que funciona
      const testButton = document.createElement('button');
      testButton.textContent = "🧪 BOTÓN DE PRUEBA";
      testButton.style.position = "fixed";
      testButton.style.bottom = "200px";
      testButton.style.right = "20px";
      testButton.style.left = "20px";
      testButton.style.padding = "20px 30px";
      testButton.style.background = "linear-gradient(135deg, #ff0000, #ff6600)";
      testButton.style.color = "white";
      testButton.style.border = "5px solid #fff";
      testButton.style.borderRadius = "15px";
      testButton.style.fontSize = "24px";
      testButton.style.fontWeight = "bold";
      testButton.style.zIndex = "999999";
      testButton.style.cursor = "pointer";
      testButton.onclick = () => {
        alert("¡Botón de prueba funciona!");
        console.log("🧪 Botón de prueba clickeado");
      };
      
      document.body.appendChild(testButton);
      console.log("🧪 Botón de prueba creado y agregado al DOM");

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

      // Agregar un indicador visual de que el botón AR está creado
      const indicator = document.createElement('div');
      indicator.textContent = "✅ Botón AR creado";
      indicator.style.position = "fixed";
      indicator.style.top = "20px";
      indicator.style.right = "20px";
      indicator.style.background = "rgba(0,255,0,0.9)";
      indicator.style.color = "white";
      indicator.style.padding = "10px 15px";
      indicator.style.borderRadius = "8px";
      indicator.style.fontSize = "14px";
      indicator.style.fontWeight = "bold";
      indicator.style.zIndex = "999999";
      document.body.appendChild(indicator);

      // Remover el indicador después de 3 segundos
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 3000);

      return () => {
        console.log("🔧 Limpiando botón AR..."); // Debug
        if (arButton.parentNode) {
          arButton.parentNode.removeChild(arButton);
        }
        if (testButton.parentNode) {
          testButton.parentNode.removeChild(testButton);
        }
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
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
      
      // Crear botón HTML para AR
      createARButton();
      
      // Posicionar para AR (modo búsqueda inicial)
      model.position.set(0, 0, -0.8);
      model.scale.setScalar(0.15);
      
      // Configurar fondo transparente para AR
      if (sceneRef.current) {
        sceneRef.current.background = null;
        sceneRef.current.environment = null;
      }
      
      // REFORZAR configuraciones anti-oclusión
      model.traverse((child) => {
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

    function handleSessionEnd() {
      setIsAR(false);
      setShowRealWorld(true);
      setArMode('positioning');
      setFixedPosition(null);
      setModelRotation({ x: 0, y: 0, z: 0 });
      
      // Remover botón HTML
      if (arControlsRef.current.buttonElement) {
        document.body.removeChild(arControlsRef.current.buttonElement);
        arControlsRef.current.buttonElement = null;
      }
      
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
      if (arControlsRef.current.buttonElement) {
        document.body.removeChild(arControlsRef.current.buttonElement);
        arControlsRef.current.buttonElement = null;
      }
    };
  }, [modelLoaded]); // Simplificar dependencias

  // Efecto para actualizar el botón AR cuando cambia el modo
  useEffect(() => {
    if (isAR && rendererRef.current?.xr?.isPresenting && window.createARButton) {
      setTimeout(() => {
        window.createARButton();
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
        scene.children.includes(sprite)
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
            tags: { action: "ar_button_3d_raycast_error" }
          });
        }
      }
    }

    renderer.xr.getSession()?.addEventListener('select', onSelect);
    return () => {
      renderer.xr.getSession()?.removeEventListener('select', onSelect);
    };
  }, [isAR]);

  // Crear el botón 3D solo cuando inicia AR
  useEffect(() => {
    if (isAR && sceneRef.current) {
      createARButton3D();
    } else if (!isAR && sceneRef.current && arButtonSpriteRef.current) {
      sceneRef.current.remove(arButtonSpriteRef.current);
      arButtonSpriteRef.current = null;
    }
  }, [isAR]);

  // Efecto para crear un botón de fallback cuando estés en AR
  useEffect(() => {
    if (isAR) {
      console.log("🔧 Creando botón de fallback para AR...");
      
      // Crear un botón de fallback directamente en el DOM
      const fallbackButton = document.createElement('button');
      fallbackButton.textContent = "🥽 INICIAR AR (DOM)";
      fallbackButton.style.position = "fixed";
      fallbackButton.style.bottom = "100px";
      fallbackButton.style.left = "50%";
      fallbackButton.style.transform = "translateX(-50%)";
      fallbackButton.style.padding = "20px 40px";
      fallbackButton.style.background = "linear-gradient(135deg, #00ff00, #00cc00)";
      fallbackButton.style.color = "white";
      fallbackButton.style.border = "3px solid #000";
      fallbackButton.style.borderRadius = "15px";
      fallbackButton.style.fontSize = "20px";
      fallbackButton.style.fontWeight = "bold";
      fallbackButton.style.zIndex = "999999";
      fallbackButton.style.cursor = "pointer";
      fallbackButton.style.pointerEvents = "auto";
      fallbackButton.onclick = () => {
        console.log("🔧 Botón de fallback DOM clickeado");
        alert("¡Botón de fallback DOM funciona!");
      };
      
      document.body.appendChild(fallbackButton);
      console.log("🔧 Botón de fallback DOM creado");

      return () => {
        if (fallbackButton.parentNode) {
          fallbackButton.parentNode.removeChild(fallbackButton);
        }
      };
    }
  }, [isAR]);

  // Efecto para crear un botón cuando el modelo esté cargado
  useEffect(() => {
    if (modelLoaded) {
      console.log("🔧 Modelo cargado, creando botón de modelo...");
      
      // Crear un botón cuando el modelo esté cargado
      const modelButton = document.createElement('button');
      modelButton.textContent = "🎨 MODELO CARGADO";
      modelButton.style.position = "fixed";
      modelButton.style.top = "150px";
      modelButton.style.left = "50%";
      modelButton.style.transform = "translateX(-50%)";
      modelButton.style.padding = "15px 30px";
      modelButton.style.background = "linear-gradient(135deg, #0000ff, #0066ff)";
      modelButton.style.color = "white";
      modelButton.style.border = "3px solid #fff";
      modelButton.style.borderRadius = "12px";
      modelButton.style.fontSize = "18px";
      modelButton.style.fontWeight = "bold";
      modelButton.style.zIndex = "999999";
      modelButton.style.cursor = "pointer";
      modelButton.style.pointerEvents = "auto";
      modelButton.onclick = () => {
        console.log("🔧 Botón de modelo clickeado");
        alert("¡Modelo cargado correctamente!");
      };
      
      document.body.appendChild(modelButton);
      console.log("🔧 Botón de modelo creado");

      return () => {
        if (modelButton.parentNode) {
          modelButton.parentNode.removeChild(modelButton);
        }
      };
    }
  }, [modelLoaded]);

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

        {/* Botón de prueba AR siempre visible */}
        {modelLoaded && !isAR && (
          <button
            onClick={() => {
              console.log("🔧 Botón de prueba AR clickeado");
              // Intentar iniciar AR manualmente
              if (rendererRef.current?.xr?.isPresenting === false) {
                rendererRef.current.xr.getSession().then(session => {
                  if (session) {
                    console.log("🔧 Sesión AR iniciada manualmente");
                  }
                }).catch(error => {
                  console.error("🔧 Error iniciando AR manualmente:", error);
                });
              }
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              padding: "15px 25px",
              backgroundColor: "rgba(255,102,0,0.9)",
              color: "white",
              border: "2px solid #fff",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              zIndex: 9999,
              pointerEvents: "auto",
            }}
          >
            🧪 Probar AR
          </button>
        )}

        {/* Indicador de estado del modelo */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 20,
            padding: "10px 15px",
            backgroundColor: modelLoaded ? "rgba(0,255,0,0.8)" : "rgba(255,0,0,0.8)",
            color: "white",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: 9999,
          }}
        >
          Modelo: {modelLoaded ? "✅ Cargado" : "⏳ Cargando..."}
        </div>

        {/* Indicador de soporte WebXR */}
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 20,
            padding: "10px 15px",
            backgroundColor: webXRSupported ? "rgba(0,255,0,0.8)" : "rgba(255,0,0,0.8)",
            color: "white",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: 9999,
          }}
        >
          WebXR: {webXRSupported ? "✅ Soportado" : "❌ No soportado"}
        </div>

        {/* Botón de fallback para AR - SIEMPRE visible cuando estés en AR */}
        {isAR && (
          <button
            onClick={() => {
              console.log("🔧 Botón de fallback AR clickeado");
              // Intentar iniciar AR manualmente
              if (rendererRef.current?.xr?.isPresenting === false) {
                rendererRef.current.xr.getSession().then(session => {
                  if (session) {
                    console.log("🔧 Sesión AR iniciada manualmente desde fallback");
                  }
                }).catch(error => {
                  console.error("🔧 Error iniciando AR manualmente desde fallback:", error);
                });
              }
            }}
            style={{
              position: "fixed",
              bottom: "50px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "20px 40px",
              backgroundColor: "rgba(255,102,0,0.95)",
              color: "white",
              border: "3px solid #fff",
              borderRadius: "15px",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
              zIndex: "999999",
              pointerEvents: "auto",
              boxShadow: "0 8px 30px rgba(255,102,0,0.6)",
            }}
          >
            🥽 INICIAR AR (FALLBACK)
          </button>
        )}
      </div>

      {/* Los controles AR ahora se crean como elementos DOM nativos en handleSessionStart */}

      {/* UI de Debug Visual - Solo visible cuando showDebugUI es true */}
      {showDebugUI && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontFamily: "monospace",
            zIndex: "999999",
            maxWidth: "300px",
            maxHeight: "200px",
            overflow: "auto",
            border: "2px solid #ff6600",
          }}
        >
          <div style={{ marginBottom: "10px", fontWeight: "bold", color: "#ff6600" }}>
            🐛 DEBUG INFO
          </div>
          <div style={{ marginBottom: "5px" }}>
            WebXR: {webXRSupported ? "✅" : "❌"}
          </div>
          <div style={{ marginBottom: "5px" }}>
            Modelo: {modelLoaded ? "✅" : "⏳"}
          </div>
          <div style={{ marginBottom: "5px" }}>
            AR: {isAR ? "✅" : "❌"}
          </div>
          <div style={{ marginBottom: "5px" }}>
            Real World: {showRealWorld ? "✅" : "❌"}
          </div>
          <div style={{ marginBottom: "10px", borderTop: "1px solid #666", paddingTop: "5px" }}>
            <strong>Logs:</strong>
          </div>
          {debugLogs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: "3px",
                fontSize: "12px",
                color: log.type === 'error' ? '#ff6666' : log.type === 'success' ? '#66ff66' : '#ffffff'
              }}
            >
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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
  const [showRealWorld, setShowRealWorld] = useState(true);
  const [arMode, setArMode] = useState('positioning'); // 'positioning' o 'fixed'
  const [fixedPosition, setFixedPosition] = useState(null);
  const [modelRotation, setModelRotation] = useState({ x: 0, y: 0, z: 0 });
  const textureRef = useRef();

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

    // Limpiar modelo anterior
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
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
    });
  }, [modelUrl, restoreMaterials]);

  // Botón AR mejorado para móvil
  useEffect(() => {
    if (!modelLoaded || !rendererRef.current) return;

    const arButton = ARButton.createButton(rendererRef.current);
    arButton.style.position = "fixed";
    arButton.style.bottom = "120px"; // Más arriba para que no se corte
    arButton.style.right = "20px";
    arButton.style.left = "20px"; // Ancho completo en móvil
    arButton.style.padding = "16px 24px";
    arButton.style.background = "linear-gradient(135deg, #ff6600, #ff8800)";
    arButton.style.color = "white";
    arButton.style.border = "none";
    arButton.style.borderRadius = "12px";
    arButton.style.fontSize = "18px";
    arButton.style.fontWeight = "bold";
    arButton.style.zIndex = "9999";
    arButton.style.boxShadow = "0 4px 20px rgba(255,102,0,0.4)";
    arButton.textContent = "🥽 Iniciar Experiencia AR";

    document.body.appendChild(arButton);

    return () => {
      if (arButton.parentNode) {
        arButton.parentNode.removeChild(arButton);
      }
    };
  }, [modelLoaded]);

  // AR Management con controles DOM nativos
  useEffect(() => {
    if (!rendererRef.current || !modelRef.current) return;

    const renderer = rendererRef.current;
    const model = modelRef.current;

    // Crear controles AR como elementos DOM nativos
    let arControlsContainer = null;
    let instructionsEl = null;
    let rotationControlsEl = null;
    let mainButtonEl = null;
    let toggleButtonEl = null;

    function createARControls() {
      // Container principal
      arControlsContainer = document.createElement('div');
      arControlsContainer.id = 'ar-controls-container';
      arControlsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 99999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // Instrucciones
      instructionsEl = document.createElement('div');
      instructionsEl.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: rgba(0,0,0,0.95);
        color: white;
        padding: 15px;
        border-radius: 12px;
        font-size: 16px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.8);
        pointer-events: none;
      `;
      
      // Controles de rotación
      rotationControlsEl = document.createElement('div');
      rotationControlsEl.style.cssText = `
        position: fixed;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: auto;
      `;
      
      // Crear botones de rotación
      const rotationLabel = document.createElement('div');
      rotationLabel.textContent = 'ROTAR';
      rotationLabel.style.cssText = `
        font-size: 12px;
        color: white;
        text-align: center;
        font-weight: bold;
        margin-bottom: 5px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      `;
      rotationControlsEl.appendChild(rotationLabel);
      
      const rotationButtons = [
        { text: '⬆️', axis: 'x', angle: 0.1 },
        { text: '⬇️', axis: 'x', angle: -0.1 },
        { text: '⬅️', axis: 'y', angle: 0.1 },
        { text: '➡️', axis: 'y', angle: -0.1 },
        { text: '↗️', axis: 'z', angle: 0.1 },
        { text: '↙️', axis: 'z', angle: -0.1 }
      ];
      
      rotationButtons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.cssText = `
          width: 55px;
          height: 55px;
          background: rgba(255,255,255,0.95);
          border: 3px solid #FF6600;
          border-radius: 15px;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          touch-action: manipulation;
          user-select: none;
        `;
        button.addEventListener('click', () => {
          setModelRotation(prev => ({
            ...prev,
            [btn.axis]: prev[btn.axis] + btn.angle
          }));
        });
        rotationControlsEl.appendChild(button);
      });
      
      // Botón principal de acción
      mainButtonEl = document.createElement('button');
      mainButtonEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        width: calc(100vw - 40px);
        padding: 18px 24px;
        background: #00C851;
        color: white;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 6px 25px rgba(0,200,81,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        touch-action: manipulation;
        pointer-events: auto;
        user-select: none;
      `;
      
      // Toggle mundo real/virtual
      toggleButtonEl = document.createElement('button');
      toggleButtonEl.style.cssText = `
        position: fixed;
        top: 90px;
        right: 10px;
        padding: 10px 16px;
        background: rgba(0,150,0,0.95);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 3px 15px rgba(0,0,0,0.4);
        min-width: 120px;
        touch-action: manipulation;
        pointer-events: auto;
        user-select: none;
      `;
      toggleButtonEl.textContent = '🌍 Real';
      
      // Agregar event listeners
      mainButtonEl.addEventListener('click', () => {
        if (model && modelRef.current) {
          if (arMode === 'positioning') {
            // Fijar posición
            setFixedPosition({
              position: modelRef.current.position.clone(),
              rotation: modelRef.current.rotation.clone()
            });
            setArMode('fixed');
          } else {
            // Reposicionar
            setArMode('positioning');
            setFixedPosition(null);
            setModelRotation({ x: 0, y: 0, z: 0 });
          }
        }
      });
      
      toggleButtonEl.addEventListener('click', () => {
        setShowRealWorld(prev => {
          const newValue = !prev;
          // Actualizar escena inmediatamente
          if (sceneRef.current) {
            if (newValue) {
              // Mundo real - fondo transparente
              sceneRef.current.background = null;
              sceneRef.current.environment = null;
            } else {
              // Ambiente virtual
              if (textureRef.current) {
                sceneRef.current.background = textureRef.current;
                sceneRef.current.environment = textureRef.current;
              }
            }
          }
          return newValue;
        });
      });
      
      // Agregar al DOM
      arControlsContainer.appendChild(instructionsEl);
      arControlsContainer.appendChild(rotationControlsEl);
      arControlsContainer.appendChild(mainButtonEl);
      arControlsContainer.appendChild(toggleButtonEl);
      document.body.appendChild(arControlsContainer);
      
      // Event listener para actualizaciones
      const handleUpdate = () => updateARControls();
      document.addEventListener('updateARControls', handleUpdate);
      
      // Cleanup del event listener
      arControlsContainer._cleanup = () => {
        document.removeEventListener('updateARControls', handleUpdate);
      };
    }
    
    function updateARControls() {
      if (!instructionsEl || !mainButtonEl || !rotationControlsEl) return;
      
      // Actualizar instrucciones
      if (arMode === 'positioning') {
        instructionsEl.innerHTML = `
          🖼️ <strong>Posiciona tu cuadro</strong><br />
          <span style="font-size: 14px; opacity: 0.9;">
            Mueve el teléfono y usa los controles para el ángulo perfecto
          </span>
        `;
        mainButtonEl.textContent = '📍 COLOCAR CUADRO AQUÍ';
        mainButtonEl.style.background = '#00C851';
        rotationControlsEl.style.display = 'flex';
      } else {
        instructionsEl.innerHTML = `
          ✅ <strong>Cuadro colocado</strong><br />
          <span style="font-size: 14px; opacity: 0.9;">
            Camina alrededor para admirarlo desde todos los ángulos
          </span>
        `;
        mainButtonEl.textContent = '🔄 CAMBIAR POSICIÓN';
        mainButtonEl.style.background = '#FF8800';
        rotationControlsEl.style.display = 'none';
      }
      
      // Actualizar toggle
      if (showRealWorld) {
        toggleButtonEl.textContent = '🌍 Real';
        toggleButtonEl.style.background = 'rgba(0,150,0,0.95)';
      } else {
        toggleButtonEl.textContent = '🎨 Virtual';
        toggleButtonEl.style.background = 'rgba(100,100,255,0.95)';
      }
    }
    
    function removeARControls() {
      if (arControlsContainer && arControlsContainer.parentNode) {
        // Cleanup event listeners
        if (arControlsContainer._cleanup) {
          arControlsContainer._cleanup();
        }
        arControlsContainer.parentNode.removeChild(arControlsContainer);
        arControlsContainer = null;
        instructionsEl = null;
        rotationControlsEl = null;
        mainButtonEl = null;
        toggleButtonEl = null;
      }
    }

    function handleSessionStart() {
      setIsAR(true);
      setShowRealWorld(true);
      setArMode('positioning'); // Empezar en modo posicionamiento
      setFixedPosition(null);
      setModelRotation({ x: 0, y: 0, z: 0 });
      
      // Crear controles AR nativos
      createARControls();
      
      // Posicionar para AR (modo búsqueda inicial)
      model.position.set(0, 0, -0.8); // Un poco más lejos para mejor visibilidad
      model.scale.setScalar(0.15); // Más grande para facilitar posicionamiento
      
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
      
      // Remover controles AR
      removeARControls();
      
      // Restaurar escena de fondo
      if (textureRef.current && sceneRef.current) {
        sceneRef.current.background = textureRef.current;
        sceneRef.current.environment = textureRef.current;
      }
    }

    renderer.xr.addEventListener("sessionstart", handleSessionStart);
    renderer.xr.addEventListener("sessionend", handleSessionEnd);

    // AR render loop con lógica de posicionamiento y rotación
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
      // Limpiar controles al desmontar
      removeARControls();
    };
  }, [modelLoaded, arMode, showRealWorld]); // Agregar dependencias para actualizar controles

  // Efecto para actualizar controles AR cuando cambian los estados
  useEffect(() => {
    if (isAR) {
      // Pequeño delay para asegurar que los elementos DOM existan
      setTimeout(() => {
        const container = document.getElementById('ar-controls-container');
        if (container) {
          // Forzar actualización de controles
          const updateEvent = new CustomEvent('updateARControls');
          document.dispatchEvent(updateEvent);
        }
      }, 100);
    }
  }, [arMode, showRealWorld, isAR]);

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
          pointerEvents: isAR ? "none" : "auto", // Deshabilitar eventos en AR para que pasen a los controles
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
      </div>

      {/* Los controles AR ahora se crean como elementos DOM nativos en handleSessionStart */}
    </>
  );
}

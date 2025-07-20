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
  
  // Referencias para controles AR - Botón HTML tradicional
  const arControlsRef = useRef({
    buttonElement: null
  });

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

  // AR Management con controles Three.js Sprites
  useEffect(() => {
    if (!rendererRef.current || !modelRef.current) return;

    const renderer = rendererRef.current;
    const model = modelRef.current;

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
      </div>

      {/* Los controles AR ahora se crean como elementos DOM nativos en handleSessionStart */}
    </>
  );
}

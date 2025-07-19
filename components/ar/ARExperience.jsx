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
  
  // Referencias para controles AR como sprites de Three.js
  const arControlsRef = useRef({
    instructionsSprite: null,
    rotationSprites: [],
    mainButtonSprite: null,
    toggleSprite: null
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

    // Función para crear controles AR como sprites
    function createARSprites() {
      const controls = arControlsRef.current;
      
      // Limpiar controles existentes
      if (controls.instructionsSprite) {
        sceneRef.current.remove(controls.instructionsSprite);
      }
      controls.rotationSprites.forEach(sprite => {
        sceneRef.current.remove(sprite);
      });
      if (controls.mainButtonSprite) {
        sceneRef.current.remove(controls.mainButtonSprite);
      }
      if (controls.toggleSprite) {
        sceneRef.current.remove(controls.toggleSprite);
      }
      
      // Reset arrays
      controls.rotationSprites = [];
      
      // Crear instrucciones - MÁS PEQUEÑAS
      const instructionsText = arMode === 'positioning' 
        ? 'Posiciona tu cuadro'
        : 'Cuadro colocado';
        
      controls.instructionsSprite = createTextSprite(instructionsText, {
        fontSize: 24,
        backgroundColor: 'rgba(0,0,0,0.9)',
        width: 200,
        height: 60
      });
      controls.instructionsSprite.position.set(0, 0.3, -0.5);
      sceneRef.current.add(controls.instructionsSprite);
      
      // Crear controles de rotación (solo en modo positioning) - MÁS PEQUEÑOS
      if (arMode === 'positioning') {
        const rotationButtons = [
          { text: '⬆️', position: [-0.3, 0.15, -0.5], axis: 'x', angle: 0.1 },
          { text: '⬇️', position: [-0.3, 0.05, -0.5], axis: 'x', angle: -0.1 },
          { text: '⬅️', position: [-0.3, -0.05, -0.5], axis: 'y', angle: 0.1 },
          { text: '➡️', position: [-0.3, -0.15, -0.5], axis: 'y', angle: -0.1 },
          { text: '↗️', position: [0.3, 0.05, -0.5], axis: 'z', angle: 0.1 },
          { text: '↙️', position: [0.3, -0.05, -0.5], axis: 'z', angle: -0.1 }
        ];
        
        rotationButtons.forEach(btn => {
          const sprite = createTextSprite(btn.text, {
            fontSize: 32,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#FF6600',
            width: 50,
            height: 50
          });
          sprite.position.set(...btn.position);
          sprite.userData = { axis: btn.axis, angle: btn.angle, type: 'rotation' };
          controls.rotationSprites.push(sprite);
          sceneRef.current.add(sprite);
        });
      }
      
      // Crear botón principal - MÁS PEQUEÑO
      const mainButtonText = arMode === 'positioning' 
        ? 'COLOCAR' 
        : 'CAMBIAR';
      const mainButtonColor = arMode === 'positioning' ? 'rgba(0,200,81,0.9)' : 'rgba(255,136,0,0.9)';
      
      controls.mainButtonSprite = createTextSprite(mainButtonText, {
        fontSize: 24,
        backgroundColor: mainButtonColor,
        borderColor: '#ffffff',
        width: 120,
        height: 50
      });
      controls.mainButtonSprite.position.set(0, -0.25, -0.5);
      controls.mainButtonSprite.userData = { type: 'mainButton' };
      sceneRef.current.add(controls.mainButtonSprite);
      
      // Crear toggle - MÁS PEQUEÑO
      const toggleText = showRealWorld ? 'Real' : 'Virtual';
      const toggleColor = showRealWorld ? 'rgba(0,150,0,0.95)' : 'rgba(100,100,255,0.95)';
      
      controls.toggleSprite = createTextSprite(toggleText, {
        fontSize: 18,
        backgroundColor: toggleColor,
        width: 80,
        height: 35
      });
      controls.toggleSprite.position.set(0.25, 0.25, -0.5);
      controls.toggleSprite.userData = { type: 'toggle' };
      sceneRef.current.add(controls.toggleSprite);
    }

    // Exponer función globalmente para actualizaciones
    window.createARSprites = createARSprites;

    // Función para manejar clicks en sprites usando raycasting de XR
    function handleSpriteClick(event) {
      if (!renderer.xr.isPresenting || !cameraRef.current) return;
      
      // Crear raycaster
      const raycaster = new THREE.Raycaster();
      
      // Para AR, usar el centro de la pantalla ya que el usuario "apunta" con el teléfono
      const centerMouse = new THREE.Vector2(0, 0);
      
      // Configurar raycaster desde la cámara XR
      raycaster.setFromCamera(centerMouse, renderer.xr.getCamera());
      
      // Obtener todos los sprites
      const sprites = [
        ...arControlsRef.current.rotationSprites,
        arControlsRef.current.mainButtonSprite,
        arControlsRef.current.toggleSprite
      ].filter(Boolean);
      
      // Verificar intersecciones
      const intersects = raycaster.intersectObjects(sprites);
      
      if (intersects.length > 0) {
        const clickedSprite = intersects[0].object;
        const userData = clickedSprite.userData;
        
        // Feedback visual simple
        clickedSprite.scale.multiplyScalar(1.2);
        setTimeout(() => {
          clickedSprite.scale.divideScalar(1.2);
        }, 150);
        
        if (userData.type === 'rotation') {
          // Manejar rotación
          setModelRotation(prev => ({
            ...prev,
            [userData.axis]: prev[userData.axis] + userData.angle
          }));
        } else if (userData.type === 'mainButton') {
          // Manejar botón principal
          if (arMode === 'positioning') {
            if (modelRef.current) {
              setFixedPosition({
                position: modelRef.current.position.clone(),
                rotation: modelRef.current.rotation.clone()
              });
              setArMode('fixed');
            }
          } else {
            setArMode('positioning');
            setFixedPosition(null);
            setModelRotation({ x: 0, y: 0, z: 0 });
          }
        } else if (userData.type === 'toggle') {
          // Manejar toggle
          setShowRealWorld(prev => {
            const newValue = !prev;
            if (sceneRef.current) {
              if (newValue) {
                sceneRef.current.background = null;
                sceneRef.current.environment = null;
              } else {
                if (textureRef.current) {
                  sceneRef.current.background = textureRef.current;
                  sceneRef.current.environment = textureRef.current;
                }
              }
            }
            return newValue;
          });
        }
      }
    }

    function handleSessionStart() {
      setIsAR(true);
      setShowRealWorld(true);
      setArMode('positioning'); // Empezar en modo posicionamiento
      setFixedPosition(null);
      setModelRotation({ x: 0, y: 0, z: 0 });
      
      // Crear controles AR como sprites
      createARSprites();
      
      // Agregar event listener para clicks
      renderer.domElement.addEventListener('click', handleSpriteClick);
      renderer.domElement.addEventListener('touchend', handleSpriteClick);
      
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
      
      // Remover event listeners
      renderer.domElement.removeEventListener('click', handleSpriteClick);
      renderer.domElement.removeEventListener('touchend', handleSpriteClick);
      
      // Limpiar sprites AR
      const controls = arControlsRef.current;
      if (controls.instructionsSprite) {
        sceneRef.current.remove(controls.instructionsSprite);
        controls.instructionsSprite = null;
      }
      controls.rotationSprites.forEach(sprite => {
        sceneRef.current.remove(sprite);
      });
      controls.rotationSprites = [];
      if (controls.mainButtonSprite) {
        sceneRef.current.remove(controls.mainButtonSprite);
        controls.mainButtonSprite = null;
      }
      if (controls.toggleSprite) {
        sceneRef.current.remove(controls.toggleSprite);
        controls.toggleSprite = null;
      }
      
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
      
      // Remover event listeners si existen
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleSpriteClick);
        renderer.domElement.removeEventListener('touchend', handleSpriteClick);
      }
      
      // Limpiar sprites al desmontar
      const controls = arControlsRef.current;
      if (sceneRef.current) {
        if (controls.instructionsSprite) {
          sceneRef.current.remove(controls.instructionsSprite);
        }
        controls.rotationSprites.forEach(sprite => {
          sceneRef.current.remove(sprite);
        });
        if (controls.mainButtonSprite) {
          sceneRef.current.remove(controls.mainButtonSprite);
        }
        if (controls.toggleSprite) {
          sceneRef.current.remove(controls.toggleSprite);
        }
      }
    };
  }, [modelLoaded]); // Simplificar dependencias

  // Efecto para actualizar sprites AR cuando cambian los estados
  useEffect(() => {
    if (isAR && rendererRef.current?.xr?.isPresenting) {
      // Recrear sprites cuando cambien estados
      setTimeout(() => {
        // Buscar la función createARSprites en el scope
        const controls = arControlsRef.current;
        
        // Limpiar controles existentes
        if (controls.instructionsSprite) {
          sceneRef.current.remove(controls.instructionsSprite);
        }
        controls.rotationSprites.forEach(sprite => {
          sceneRef.current.remove(sprite);
        });
        if (controls.mainButtonSprite) {
          sceneRef.current.remove(controls.mainButtonSprite);
        }
        if (controls.toggleSprite) {
          sceneRef.current.remove(controls.toggleSprite);
        }
        
        // Recrear sprites actualizados
        // Esta función se definirá en el useEffect principal
        if (window.createARSprites) {
          window.createARSprites();
        }
      }, 100);
    }
  }, [arMode, showRealWorld]);

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

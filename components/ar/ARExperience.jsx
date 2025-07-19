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

  // AR Management
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
    };
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

  // Estilo para botones de rotación
  const rotationButtonStyle = {
    width: "45px",
    height: "45px",
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "2px solid #333",
    borderRadius: "12px",
    fontSize: "18px",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        background: "#000",
        top: 0,
        left: 0,
        zIndex: 3000,
      }}
    >
      {/* Instrucciones dinámicas según el modo AR */}
      {isAR && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.9)",
            color: "#fff",
            padding: "15px",
            borderRadius: "12px",
            fontSize: "16px",
            zIndex: 9999,
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {arMode === 'positioning' ? (
            <>
              �️ <strong>Busca el lugar perfecto</strong><br />
              Mueve el teléfono para posicionar el cuadro
            </>
          ) : (
            <>
              ✅ <strong>Cuadro colocado</strong><br />
              Camina alrededor para verlo desde diferentes ángulos
            </>
          )}
        </div>
      )}

      {/* Controles de rotación - Solo en modo posicionamiento */}
      {isAR && arMode === 'positioning' && (
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 9999,
          }}
        >
          <div style={{ fontSize: "12px", color: "#fff", textAlign: "center", fontWeight: "bold", marginBottom: "5px" }}>
            ROTAR
          </div>
          {/* Rotación X (inclinar hacia arriba/abajo) */}
          <button onClick={() => rotateModel('x', 0.1)} style={rotationButtonStyle}>⬆️</button>
          <button onClick={() => rotateModel('x', -0.1)} style={rotationButtonStyle}>⬇️</button>
          {/* Rotación Y (girar izquierda/derecha) */}
          <button onClick={() => rotateModel('y', 0.1)} style={rotationButtonStyle}>⬅️</button>
          <button onClick={() => rotateModel('y', -0.1)} style={rotationButtonStyle}>➡️</button>
          {/* Rotación Z (inclinar lateral) */}
          <button onClick={() => rotateModel('z', 0.1)} style={rotationButtonStyle}>↗️</button>
          <button onClick={() => rotateModel('z', -0.1)} style={rotationButtonStyle}>↙️</button>
        </div>
      )}

      {/* Botón principal de acción - Centrado y grande */}
      {isAR && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          {arMode === 'positioning' ? (
            <button
              onClick={fixModelPosition}
              style={{
                width: "100%",
                padding: "18px 24px",
                backgroundColor: "#00C851",
                color: "#fff",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: "0 6px 25px rgba(0,200,81,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              📍 COLOCAR CUADRO AQUÍ
            </button>
          ) : (
            <button
              onClick={repositionModel}
              style={{
                width: "100%",
                padding: "18px 24px",
                backgroundColor: "#FF8800",
                color: "#fff",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: "0 6px 25px rgba(255,136,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              🔄 CAMBIAR POSICIÓN
            </button>
          )}
        </div>
      )}

      {/* Toggle mundo real / ambiente virtual - Esquina superior derecha */}
      {isAR && (
        <div
          style={{
            position: "absolute",
            top: "90px",
            right: "10px",
            zIndex: 9999,
          }}
        >
          <button
            onClick={toggleRealWorld}
            style={{
              padding: "10px 16px",
              backgroundColor: showRealWorld
                ? "rgba(0,150,0,0.95)"
                : "rgba(100,100,255,0.95)",
              color: "#fff",
              border: "none",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 3px 15px rgba(0,0,0,0.4)",
              minWidth: "120px",
            }}
          >
            {showRealWorld ? "🌍 Real" : "🎨 Virtual"}
          </button>
        </div>
      )}

      <div
        ref={mountRef}
        style={{
          width: "100vw",
          height: "100vh",
        }}
      />

      {/* Botón cerrar */}
      {showCloseButton && onClose && (
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
          }}
        >
          ← Cerrar
        </button>
      )}
    </div>
  );
}

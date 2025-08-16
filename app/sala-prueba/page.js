"use client";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, OrbitControls } from "@react-three/drei";
import { useRouter } from "next/navigation";

// Componente de la estructura Hall-Pasillo-Hall
function HallPasilloHall() {
  return (
    <group>
      {/* HALL 1 (Entrada) */}
      <group position={[0, 0, 15]}>
        {/* Piso Hall 1 */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 8]} />
          <meshBasicMaterial color="#d4d4d4" />
        </mesh>
        
        {/* Paredes Hall 1 */}
        {/* Pared izquierda */}
        <mesh position={[-6, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 8]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Pared derecha */}
        <mesh position={[6, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 8]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Pared frontal (con apertura al pasillo) */}
        <mesh position={[-3, 2.5, -4]}>
          <boxGeometry args={[6, 5, 0.2]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[3, 2.5, -4]}>
          <boxGeometry args={[6, 5, 0.2]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Pared trasera */}
        <mesh position={[0, 2.5, 4]}>
          <boxGeometry args={[12, 5, 0.2]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Techo Hall 1 */}
        <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* PASILLO (Conecta los dos halls) */}
      <group position={[0, 0, 5]}>
        {/* Piso Pasillo */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 20]} />
          <meshBasicMaterial color="#c0c0c0" />
        </mesh>
        
        {/* Paredes Pasillo */}
        {/* Pared izquierda */}
        <mesh position={[-2, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 20]} />
          <meshBasicMaterial color="#e8e8e8" />
        </mesh>
        
        {/* Pared derecha */}
        <mesh position={[2, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 20]} />
          <meshBasicMaterial color="#e8e8e8" />
        </mesh>
        
        {/* Techo Pasillo */}
        <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 20]} />
          <meshBasicMaterial color="#f8f8f8" />
        </mesh>
      </group>

      {/* HALL 2 (Final) */}
      <group position={[0, 0, -15]}>
        {/* Piso Hall 2 */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 8]} />
          <meshBasicMaterial color="#d4d4d4" />
        </mesh>
        
        {/* Paredes Hall 2 */}
        {/* Pared izquierda */}
        <mesh position={[-6, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 8]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Pared derecha */}
        <mesh position={[6, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 8]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Pared frontal (con apertura al pasillo) */}
        <mesh position={[-3, 2.5, 4]}>
          <boxGeometry args={[6, 5, 0.2]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[3, 2.5, 4]}>
          <boxGeometry args={[6, 5, 0.2]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Pared trasera */}
        <mesh position={[0, 2.5, -4]}>
          <boxGeometry args={[12, 5, 0.2]} />
          <meshBasicMaterial color="#f0f0f0" />
        </mesh>
        
        {/* Techo Hall 2 */}
        <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Elementos decorativos simples */}
      {/* Columnas en el pasillo */}
      <mesh position={[-1.5, 1, 5]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
      <mesh position={[1.5, 1, 5]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
      
      <mesh position={[-1.5, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
      <mesh position={[1.5, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
      
      <mesh position={[-1.5, 1, -5]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
      <mesh position={[1.5, 1, -5]}>
        <cylinderGeometry args={[0.2, 0.2, 2]} />
        <meshBasicMaterial color="#b0b0b0" />
      </mesh>
    </group>
  );
}

// Controles de cámara simples
function CameraControls() {
  return null;
}

export default function SalaPruebaPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('fps'); // 'fps' o 'orbit'
  const controlsRef = useRef();

  return (
    <div className="w-full h-screen relative bg-gray-900">
      {/* UI de controles */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button 
          onClick={() => router.push('/museo')}
          className="block bg-white px-4 py-2 rounded shadow hover:bg-gray-100"
        >
          ← Volver al Museo
        </button>
        
        <button 
          onClick={() => setViewMode(viewMode === 'fps' ? 'orbit' : 'fps')}
          className="block bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        >
          Modo: {viewMode === 'fps' ? 'Primera Persona' : 'Órbita'}
        </button>
      </div>

      {/* Información de la sala */}
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded shadow max-w-xs">
        <h3 className="font-bold text-lg mb-2">Sala de Prueba</h3>
        <p className="text-sm text-gray-600 mb-2">
          Diseño: Hall → Pasillo → Hall
        </p>
        <div className="text-xs text-gray-500">
          <p>• Hall 1: Entrada (12x8m)</p>
          <p>• Pasillo: Conexión (4x20m)</p>
          <p>• Hall 2: Final (12x8m)</p>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        camera={{ 
          position: viewMode === 'fps' ? [0, 1.7, 18] : [15, 10, 15], 
          fov: 75 
        }}
        gl={{ antialias: false }}
      >
        {/* Iluminación simple */}
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.5} 
          castShadow={false}
        />
        
        {/* Estructura de la sala */}
        <HallPasilloHall />
        
        {/* Controles según el modo */}
        {viewMode === 'fps' ? (
          <PointerLockControls ref={controlsRef} />
        ) : (
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
          />
        )}
        
        <CameraControls />
      </Canvas>
    </div>
  );
}

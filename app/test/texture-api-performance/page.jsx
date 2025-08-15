import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { APIAwarePBRMaterial } from '../components/gallery/core/APIAwarePBRMaterial.jsx';
import { useTexturePerformanceAnalyzer } from '../hooks/useTexturePerformanceAnalyzer.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Activity, Cpu } from 'lucide-react';

/**
 * DEMO DE TEXTURAS API CON ANÁLISIS DE PERFORMANCE
 * Prueba el sistema de texturas inteligente en tiempo real
 */
export default function TextureAPIPerformanceTest() {
  const [salaId, setSalaId] = useState(3); // Sala de prueba
  const [forceTextures, setForceTextures] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  
  // Monitor de performance
  const {
    performanceData,
    frameRate,
    canLoadTexture,
    getStrategy,
    isPerformanceGood,
    isPerformanceExcellent,
    debugInfo
  } = useTexturePerformanceAnalyzer();

  const strategy = getStrategy();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Análisis de Performance - Texturas API</h1>
        <p className="text-gray-600">
          Sistema inteligente que adapta la carga de texturas según el rendimiento en tiempo real
        </p>
      </div>

      {/* Panel de control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* FPS */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FPS:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    frameRate >= 50 ? 'text-green-600' :
                    frameRate >= 30 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {frameRate.toFixed(1)}
                  </span>
                  {isPerformanceExcellent ? 
                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                    isPerformanceGood ? 
                    <CheckCircle className="h-4 w-4 text-yellow-600" /> :
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  }
                </div>
              </div>

              {/* Estrategia */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estrategia:</span>
                <Badge variant={
                  strategy.strategy === 'progressive' ? 'default' :
                  strategy.strategy === 'minimal' ? 'secondary' : 'destructive'
                }>
                  {strategy.strategy}
                </Badge>
              </div>

              {/* Capacidad de carga */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Puede cargar texturas:</span>
                <Badge variant={canLoadTexture() ? 'default' : 'secondary'}>
                  {canLoadTexture() ? 'Sí' : 'No'}
                </Badge>
              </div>

              {/* Texturas cargadas */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Texturas activas:</span>
                <span className="font-mono">{debugInfo.texturesLoaded}/6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Configuración de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sala ID */}
              <div>
                <label className="text-sm font-medium">Sala ID:</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={salaId}
                  onChange={(e) => setSalaId(Number(e.target.value))}
                >
                  <option value={1}>Sala 1 - Principal</option>
                  <option value={2}>Sala 2 - Contemporánea</option>
                  <option value={3}>Sala 3 - Digital</option>
                  <option value={4}>Sala 4 - ARPA</option>
                </select>
              </div>

              {/* Forzar texturas */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="forceTextures"
                  checked={forceTextures}
                  onChange={(e) => setForceTextures(e.target.checked)}
                />
                <label htmlFor="forceTextures" className="text-sm">
                  Forzar carga de texturas (ignorar performance)
                </label>
              </div>

              {/* Toggle demo */}
              <Button 
                onClick={() => setShowDemo(!showDemo)}
                variant={showDemo ? 'default' : 'outline'}
                className="w-full"
              >
                {showDemo ? 'Ocultar' : 'Mostrar'} Demo 3D
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información de estrategia */}
        <Card>
          <CardHeader>
            <CardTitle>Estrategia Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium mb-1">Modo:</p>
                <p className="text-sm text-gray-600">{strategy.reason}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm font-medium mb-1">Recomendación:</p>
                <p className="text-sm text-blue-700">
                  {strategy.loadTextures === true ? 
                    'Cargar texturas PBR completas' :
                    strategy.loadTextures === 'colors' ?
                    'Usar colores inteligentes de API' :
                    'Solo colores básicos por performance'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo 3D */}
      {showDemo && (
        <Card>
          <CardHeader>
            <CardTitle>Demo 3D - Texturas API Adaptativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                
                {/* Suelo con textura API */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                  <planeGeometry args={[8, 8]} />
                  <APIAwarePBRMaterial 
                    salaId={salaId}
                    type="floor"
                    force={forceTextures}
                    fallbackColor="#e8e8e8"
                  />
                </mesh>

                {/* Pared trasera con textura API */}
                <mesh position={[0, 1, -4]}>
                  <planeGeometry args={[8, 4]} />
                  <APIAwarePBRMaterial 
                    salaId={salaId}
                    type="wall"
                    force={forceTextures}
                    fallbackColor="#f0f0f0"
                  />
                </mesh>

                {/* Pared lateral izquierda */}
                <mesh position={[-4, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <planeGeometry args={[8, 4]} />
                  <APIAwarePBRMaterial 
                    salaId={salaId}
                    type="wall"
                    force={forceTextures}
                    fallbackColor="#f0f0f0"
                  />
                </mesh>

                {/* Cubo de prueba central */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <APIAwarePBRMaterial 
                    salaId={salaId}
                    type="wall"
                    force={forceTextures}
                    fallbackColor="#ffffff"
                  />
                </mesh>

                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Canvas>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Controles:</strong> Click y arrastrar para rotar, scroll para zoom, click derecho para mover.</p>
              <p><strong>Prueba:</strong> El sistema ajusta automáticamente si muestra texturas o colores según el performance actual.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explicación del sistema */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>¿Cómo funciona el Sistema Inteligente?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">Performance Óptimo (50+ FPS)</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Carga texturas PBR completas</li>
                <li>• Usa datos completos de la API</li>
                <li>• Máxima calidad visual</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-800 mb-2">Performance Intermedio (30-50 FPS)</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Usa colores inteligentes de API</li>
                <li>• Propiedades de material realistas</li>
                <li>• Balance calidad/rendimiento</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2">Performance Crítico (&lt;30 FPS)</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Solo colores básicos</li>
                <li>• Sin carga de texturas</li>
                <li>• Máximo rendimiento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para exportar como página
export { TextureAPIPerformanceTest };

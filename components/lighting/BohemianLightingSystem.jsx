/**
 * Sistema de iluminación dramático con ambiente oscuro
 * Luces focalizadas hacia abajo para crear atmósfera
 */
import React from 'react';

const ProfessionalLightingSystem = React.memo(function ProfessionalLightingSystem({ 
  exploring = false 
}) {
  return (
    <group>
      {/* Luz ambiental muy reducida para ambiente oscuro */}
      <ambientLight 
        intensity={exploring ? 0.05 : 0.03} 
        color="#f0f0f0" 
      />
      
      {/* Luz direccional principal desde arriba hacia abajo */}
      <directionalLight
        position={[0, 20, 0]}
        target-position={[0, 0, 0]}
        intensity={exploring ? 0.3 : 0.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />
      
      {/* Luz hemisférica muy tenue */}
      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#e8e8e8"
        intensity={exploring ? 0.1 : 0.08}
      />
      
      {/* Luces de acento lateral muy sutiles para definir bordes */}
      <pointLight
        position={[-10, 8, 0]}
        intensity={exploring ? 0.4 : 0.3}
        color="#ffffff"
        distance={15}
        decay={3}
      />
      
      <pointLight
        position={[10, 8, 0]}
        intensity={exploring ? 0.4 : 0.3}
        color="#ffffff"
        distance={15}
        decay={3}
      />
      
      {/* Luz trasera muy sutil */}
      <pointLight
        position={[0, 6, -12]}
        intensity={exploring ? 0.2 : 0.15}
        color="#ffffff"
        distance={10}
        decay={3}
      />
    </group>
  );
});

export default ProfessionalLightingSystem;

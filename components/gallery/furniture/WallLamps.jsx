import React from "react";

/**
 * Lámparas de pared elegantes para iluminar obras de arte
 * Se colocan estratégicamente para crear iluminación focal tenue
 */
export function WallLamps({ dynamicLength, dynamicCenterX, wallHeight = 4 }) {
  // Posiciones para lámparas de pared en ambas paredes
  const lampPositions = [
    // Pared izquierda (Z negativo)
    { x: dynamicCenterX - dynamicLength / 4, z: -6.3, wall: "left" },
    { x: dynamicCenterX, z: -6.3, wall: "left" },
    { x: dynamicCenterX + dynamicLength / 4, z: -6.3, wall: "left" },

    // Pared derecha (Z positivo)
    { x: dynamicCenterX - dynamicLength / 4, z: 6.3, wall: "right" },
    { x: dynamicCenterX, z: 6.3, wall: "right" },
    { x: dynamicCenterX + dynamicLength / 4, z: 6.3, wall: "right" },
  ];

  return (
    <>
      {lampPositions.map((pos, i) => (
        <group
          key={`wall-lamp-${i}`}
          position={[pos.x, wallHeight - 1.5, pos.z]}
          rotation={[0, pos.wall === "left" ? 0 : Math.PI, 0]}
        >
          {/* Base de montaje en pared - circular metálica */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.04, 16]} />
            <meshPhysicalMaterial
              color="#34495e"
              metalness={0.8}
              roughness={0.2}
              clearcoat={0.6}
            />
          </mesh>

          {/* Brazo de la lámpara - curvado hacia afuera */}
          <group position={[0, 0, 0.1]} rotation={[0, 0, -Math.PI / 6]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
              <meshPhysicalMaterial
                color="#2c3e50"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {/* Pantalla de la lámpara - tipo aplique clásico */}
            <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.08, 0.12, 12]} />
              <meshPhysicalMaterial
                color="#f8f8f8"
                roughness={0.3}
                metalness={0.1}
                transmission={0.05}
              />
            </mesh>

            {/* Interior emisivo de la pantalla */}
            <mesh position={[0, -0.27, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.07, 0.1, 12]} />
              <meshStandardMaterial
                color="#fff9e6"
                emissive="#fff9e6"
                emissiveIntensity={0.15} // Muy tenue
              />
            </mesh>

            {/* Luz puntual tenue para las obras */}
            <pointLight
              position={[0, -0.25, 0]}
              intensity={1.2} // Muy tenue
              distance={2.5}
              decay={2}
              color="#fff9e6"
              castShadow={false}
            />

            {/* Spot light direccional hacia la pared */}
            <spotLight
              position={[0, -0.25, 0]}
              target-position={[0, -0.25, -0.5]} // Hacia la pared
              intensity={2.5}
              angle={0.8} // Ángulo amplio para cubrir la obra
              penumbra={0.8} // Muy suave
              distance={1.5} // Muy corta para solo iluminar la zona de la obra
              decay={2}
              color="#fff4e6"
              castShadow={false}
            />
          </group>
        </group>
      ))}
    </>
  );
}

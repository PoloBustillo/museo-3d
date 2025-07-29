import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

/**
 * Genera un modelo base de sala con puntos de anclaje para obras
 * @param {Object} options - Opciones de configuración de la sala
 * @returns {Promise<Object>} Modelo GLTF de la sala base
 */
export async function generateBaseRoom(options = {}) {
  const {
    width = 14,
    length = 30,
    height = 4,
    wallThickness = 0.2,
    floorThickness = 0.1,
    ceilingThickness = 0.1,
    slotSpacing = 3,
    slotHeight = 2.5,
  } = options;

  const scene = new THREE.Scene();
  const group = new THREE.Group();
  scene.add(group);

  // Materiales base
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.8,
    metalness: 0.1,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.9,
    metalness: 0.0,
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.0,
  });

  // Crear paredes
  const walls = createWalls(width, length, height, wallThickness, wallMaterial);
  group.add(walls);

  // Crear suelo
  const floor = createFloor(width, length, floorThickness, floorMaterial);
  group.add(floor);

  // Crear techo
  const ceiling = createCeiling(
    width,
    length,
    height,
    ceilingThickness,
    ceilingMaterial
  );
  group.add(ceiling);

  // Crear puntos de anclaje (slots) para obras
  const slots = createArtworkSlots(width, length, slotSpacing, slotHeight);
  group.add(slots);

  // Crear iluminación base
  const lighting = createBaseLighting(width, length, height);
  group.add(lighting);

  // Exportar como GLTF
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      group,
      (gltf) => {
        resolve({
          gltf,
          slots: getSlotPositions(width, length, slotSpacing, slotHeight),
          dimensions: { width, length, height },
        });
      },
      { binary: false }
    );
  });
}

function createWalls(width, length, height, thickness, material) {
  const wallsGroup = new THREE.Group();

  // Pared izquierda
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, height, length),
    material
  );
  leftWall.position.set(-width / 2 - thickness / 2, height / 2, 0);
  wallsGroup.add(leftWall);

  // Pared derecha
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, height, length),
    material
  );
  rightWall.position.set(width / 2 + thickness / 2, height / 2, 0);
  wallsGroup.add(rightWall);

  // Pared trasera
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width + thickness * 2, height, thickness),
    material
  );
  backWall.position.set(0, height / 2, -length / 2 - thickness / 2);
  wallsGroup.add(backWall);

  // Pared frontal (con entrada)
  const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(width + thickness * 2, height, thickness),
    material
  );
  frontWall.position.set(0, height / 2, length / 2 + thickness / 2);
  wallsGroup.add(frontWall);

  return wallsGroup;
}

function createFloor(width, length, thickness, material) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, thickness, length + 0.4),
    material
  );
  floor.position.set(0, -thickness / 2, 0);
  return floor;
}

function createCeiling(width, length, height, thickness, material) {
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, thickness, length + 0.4),
    material
  );
  ceiling.position.set(0, height + thickness / 2, 0);
  return ceiling;
}

function createArtworkSlots(width, length, spacing, height) {
  const slotsGroup = new THREE.Group();

  // Crear slots invisibles para obras
  const slotGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const slotMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.0,
    color: 0xff0000,
  });

  // Calcular número de slots por pared
  const slotsPerWall = Math.floor(length / spacing);

  // Slots en pared izquierda
  for (let i = 0; i < slotsPerWall; i++) {
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    const x = -width / 2 - 0.1;
    const z = -length / 2 + spacing / 2 + i * spacing;
    slot.position.set(x, height, z);
    slot.userData = {
      slotId: `left-${i + 1}`,
      wall: "left",
      index: i,
    };
    slotsGroup.add(slot);
  }

  // Slots en pared derecha
  for (let i = 0; i < slotsPerWall; i++) {
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    const x = width / 2 + 0.1;
    const z = -length / 2 + spacing / 2 + i * spacing;
    slot.position.set(x, height, z);
    slot.userData = {
      slotId: `right-${i + 1}`,
      wall: "right",
      index: i,
    };
    slotsGroup.add(slot);
  }

  return slotsGroup;
}

function createBaseLighting(width, length, height) {
  const lightingGroup = new THREE.Group();

  // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  lightingGroup.add(ambientLight);

  // Luces direccionales principales
  const light1 = new THREE.DirectionalLight(0xffffff, 0.6);
  light1.position.set(width / 2, height + 2, length / 2);
  light1.castShadow = true;
  lightingGroup.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
  light2.position.set(-width / 2, height + 2, -length / 2);
  light2.castShadow = true;
  lightingGroup.add(light2);

  return lightingGroup;
}

function getSlotPositions(width, length, spacing, height) {
  const slots = [];
  const slotsPerWall = Math.floor(length / spacing);

  // Slots pared izquierda
  for (let i = 0; i < slotsPerWall; i++) {
    slots.push({
      id: `left-${i + 1}`,
      position: [
        -width / 2 - 0.1,
        height,
        -length / 2 + spacing / 2 + i * spacing,
      ],
      rotation: [0, 0, 0],
      wall: "left",
      index: i,
    });
  }

  // Slots pared derecha
  for (let i = 0; i < slotsPerWall; i++) {
    slots.push({
      id: `right-${i + 1}`,
      position: [
        width / 2 + 0.1,
        height,
        -length / 2 + spacing / 2 + i * spacing,
      ],
      rotation: [0, Math.PI, 0],
      wall: "right",
      index: i,
    });
  }

  return slots;
}

export { getSlotPositions };

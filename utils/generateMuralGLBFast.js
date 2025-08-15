/**
 * BYPASS COMPLETO PARA GENERATEMURALGLB
 * Reemplaza la generación pesada con versión ultraligera
 */

// Función de bypass que retorna un blob mínimo
export async function generateMuralGLBFast(imageUrl) {
  return new Promise((resolve) => {
    // Crear un blob mínimo en lugar de generar geometría compleja
    const minimalGLB = new Blob(['minimal'], { type: "model/gltf-binary" });
    resolve(minimalGLB);
  });
}

// Función de bypass para el fallback también
export async function generateMuralGLBFallbackFast(color = "#ffffff", text = "TEST") {
  return new Promise((resolve) => {
    const minimalGLB = new Blob(['minimal'], { type: "model/gltf-binary" });
    resolve(minimalGLB);
  });
}

export default generateMuralGLBFast;

/**
 * Hook ULTRALIGERO para galería - SIN TEXTURAS
 * Soluciona problemas de rendimiento al eliminar carga de texturas
 */

export const useFastGallery = () => {
  // Colores optimizados según tipo de superficie
  const FAST_COLORS = {
    wall: "#f0f0f0",      // Gris claro para paredes
    floor: "#e0e0e0",     // Gris medio para piso
    ceiling: "#f8f8f8",   // Blanco roto para techo
    molding: "#d4af37",   // Dorado para molduras
    furniture: "#8B4513"  // Marrón para muebles
  };

  const FAST_PROPERTIES = {
    wall: { roughness: 0.9, metalness: 0.0 },
    floor: { roughness: 0.8, metalness: 0.1 },
    ceiling: { roughness: 0.3, metalness: 0.0 },
    molding: { roughness: 0.2, metalness: 0.8 },
    furniture: { roughness: 0.6, metalness: 0.0 }
  };

  const getMaterial = (type) => ({
    color: FAST_COLORS[type] || "#ffffff",
    ...FAST_PROPERTIES[type] || { roughness: 0.7, metalness: 0.2 }
  });

  return {
    getMaterial,
    colors: FAST_COLORS,
    properties: FAST_PROPERTIES,
    // Función helper para aplicar rápidamente
    wallMaterial: getMaterial('wall'),
    floorMaterial: getMaterial('floor'),
    ceilingMaterial: getMaterial('ceiling'),
    moldingMaterial: getMaterial('molding'),
    furnitureMaterial: getMaterial('furniture')
  };
};

export default useFastGallery;

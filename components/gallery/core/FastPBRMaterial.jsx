import React, { useMemo } from 'react';

/**
 * PBRMaterial ULTRALIGERO - Sin API, solo colores y texturas básicas
 * Para resolver problemas de rendimiento inmediatos
 */
export const FastPBRMaterial = ({
  mode = "minimal", // Forzar modo minimal por defecto
  color = [1, 1, 1],
  roughness = 0.8,
  metalness = 0.2,
  children,
  ...props
}) => {
  
  // Memoizar material para evitar recreaciones
  const materialProps = useMemo(() => ({
    color,
    roughness,
    metalness,
    ...props
  }), [color, roughness, metalness, props]);

  // Solo material básico - SIN TEXTURAS para máximo rendimiento
  return (
    <meshStandardMaterial
      {...materialProps}
    />
  );
};

export default FastPBRMaterial;

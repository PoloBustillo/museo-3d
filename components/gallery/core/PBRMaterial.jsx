import React from "react";
import { useTexture } from "@react-three/drei";

/**
 * PBRMaterial Component
 * Provides physically-based rendering materials with texture optimization
 *
 * @param {Object} props
 * @param {string} props.mode - Optimization mode: 'auto', 'minimal', 'none'
 * @param {Object} props.textures - Legacy texture object (DEPRECATED)
 * @param {Object} props.maps - New texture maps object with PBR textures
 * @param {number} props.roughness - Material roughness (0-1)
 * @param {number} props.metalness - Material metalness (0-1)
 * @param {Array} props.color - RGB color array [r, g, b]
 * @param {number} props.normalScale - Normal map intensity
 * @param {Array} props.repeat - Texture repeat [u, v]
 */
export const PBRMaterial = ({
  mode = "auto",
  textures = {},
  maps = {},
  roughness = 0.8,
  metalness = 0.2,
  color = [1, 1, 1],
  normalScale = 1,
  repeat = [1, 1],
  physical = true,
  ...props
}) => {
  // Support both legacy textures and new maps interface
  const textureSource = Object.keys(maps).length > 0 ? maps : textures;

  // Apply texture optimization based on mode
  const getOptimizedTextures = () => {
    switch (mode) {
      case "minimal":
        // Only use diffuse texture for minimal performance
        return {
          map: textureSource.color || textureSource.map || null,
        };
      case "none":
        // No textures, color only
        return {};
      case "auto":
      default:
        // Use all available textures with proper mapping
        return {
          map: textureSource.color || textureSource.map || null,
          normalMap: textureSource.normal || textureSource.normalMap || null,
          roughnessMap:
            textureSource.roughness || textureSource.roughnessMap || null,
          metalnessMap:
            textureSource.metalness || textureSource.metalnessMap || null,
          aoMap: textureSource.ao || textureSource.aoMap || null,
        };
    }
  };

  const optimizedTextures = getOptimizedTextures();

  // Use conditional rendering for material type
  if (physical) {
    return (
      <meshPhysicalMaterial
        {...props}
        map={optimizedTextures.map || null}
        normalMap={optimizedTextures.normalMap || null}
        roughnessMap={optimizedTextures.roughnessMap || null}
        metalnessMap={optimizedTextures.metalnessMap || null}
        aoMap={optimizedTextures.aoMap || null}
        roughness={roughness}
        metalness={metalness}
        color={color}
        normalScale={normalScale}
      />
    );
  }

  return (
    <meshStandardMaterial
      {...props}
      map={optimizedTextures.map || null}
      normalMap={optimizedTextures.normalMap || null}
      roughnessMap={optimizedTextures.roughnessMap || null}
      metalnessMap={optimizedTextures.metalnessMap || null}
      aoMap={optimizedTextures.aoMap || null}
      roughness={roughness}
      metalness={metalness}
      color={color}
      normalScale={normalScale}
    />
  );
};

export default PBRMaterial;

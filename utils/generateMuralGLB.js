export async function generateMuralGLB(imageUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      // Importar Three.js de manera dinámica para evitar problemas de SSR
      const THREE = await import("three");
      const { GLTFExporter } = await import(
        "three/examples/jsm/exporters/GLTFExporter"
      );

      const scene = new THREE.Scene();

      // Configurar iluminación para mejor calidad
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.4);
      pointLight.position.set(-1, 1, 2);
      scene.add(pointLight);

      // Hacer el modelo más pequeño para AR
      const width = 0.8;
      const height = 0.6;

      // Cargar la textura con configuración mejorada
      const loader = new THREE.TextureLoader();

      // Configurar crossOrigin para manejar CORS
      loader.setCrossOrigin("anonymous");

      loader.load(
        imageUrl,
        (texture) => {
          try {
            // Configurar la textura para mejor calidad pero optimizada
            texture.flipY = true; // Cambiar a true para corregir orientación
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter; // Cambiado para optimizar
            texture.magFilter = THREE.LinearFilter;

            // Crear geometría del cuadro principal con subdivisiones optimizadas
            const geometry = new THREE.PlaneGeometry(width, height, 8, 8); // Reducido de 16x16
            const material = new THREE.MeshPhongMaterial({
              map: texture,
              side: THREE.DoubleSide,
              transparent: false,
              opacity: 1.0,
              shininess: 30,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0.06); // Más adelante para estar sobre el marco

            // Crear marco volumétrico más realista con textura premium
            const frameGroup = new THREE.Group();

            // Parámetros del marco - optimizados
            const frameDepth = 0.12; // Reducido
            const frameWidth = 0.08; // Reducido
            const outerWidth = width + frameWidth * 2;
            const outerHeight = height + frameWidth * 2;

            // Crear textura de madera premium optimizada
            const createOptimizedWoodTexture = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 1024; // Reducido de 2048
              canvas.height = 1024; // Reducido de 2048
              const ctx = canvas.getContext("2d");

              // Base de madera premium con gradiente complejo
              const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
              gradient.addColorStop(0, "#8B4513");
              gradient.addColorStop(0.2, "#A0522D");
              gradient.addColorStop(0.4, "#CD853F");
              gradient.addColorStop(0.6, "#DEB887");
              gradient.addColorStop(0.8, "#CD853F");
              gradient.addColorStop(1, "#8B4513");
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 1024, 1024);

              // Vetas de madera optimizadas
              for (let i = 0; i < 40; i++) {
                // Reducido de 80
                const y = i * 25;
                const alpha = 0.3 + Math.random() * 0.7;
                ctx.strokeStyle = `rgba(139, 69, 19, ${alpha})`;
                ctx.lineWidth = 1 + Math.random() * 6; // Reducido

                ctx.beginPath();
                ctx.moveTo(0, y);

                // Curvas naturales optimizadas
                for (let x = 0; x <= 1024; x += 25) {
                  // Aumentado el paso
                  const offset =
                    Math.sin(x * 0.008 + i * 0.3) * 20 + // Reducido
                    Math.sin(x * 0.003 + i * 0.7) * 15 + // Reducido
                    Math.random() * 10; // Reducido
                  ctx.lineTo(x, y + offset);
                }
                ctx.stroke();
              }

              // Nudos de madera optimizados
              for (let i = 0; i < 8; i++) {
                // Reducido de 15
                const x = Math.random() * 1024;
                const y = Math.random() * 1024;
                const radius = 20 + Math.random() * 25; // Reducido

                // Nudo principal
                ctx.fillStyle = `rgba(101, 67, 33, ${0.7 + Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Anillos múltiples del nudo (reducidos)
                for (let ring = 1; ring <= 4; ring++) {
                  // Reducido de 8
                  const ringRadius = radius + ring * 3;
                  ctx.strokeStyle = `rgba(139, 69, 19, ${0.9 - ring * 0.1})`;
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
                  ctx.stroke();
                }

                // Centro del nudo más oscuro
                ctx.fillStyle = `rgba(101, 67, 33, ${0.95 + Math.random() * 0.05})`;
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
                ctx.fill();
              }

              // Brillo premium optimizado
              for (let i = 0; i < 20; i++) {
                // Reducido de 40
                const alpha = 0.03 + Math.random() * 0.12;
                ctx.fillStyle = `rgba(255, 228, 196, ${alpha})`;
                ctx.fillRect(
                  Math.random() * 1024,
                  Math.random() * 1024,
                  40 + Math.random() * 100, // Reducido
                  30 + Math.random() * 80 // Reducido
                );
              }

              // Grano fino de madera optimizado
              for (let i = 0; i < 500; i++) {
                // Reducido de 1000
                const x = Math.random() * 1024;
                const y = Math.random() * 1024;
                const alpha = 0.1 + Math.random() * 0.2;
                ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
                ctx.fillRect(
                  x,
                  y,
                  1 + Math.random() * 2, // Reducido
                  1 + Math.random() * 2 // Reducido
                );
              }

              return new THREE.CanvasTexture(canvas);
            };

            const woodTexture = createOptimizedWoodTexture();
            woodTexture.wrapS = THREE.RepeatWrapping;
            woodTexture.wrapT = THREE.RepeatWrapping;
            woodTexture.repeat.set(1, 1);

            // Material del marco principal con textura premium
            const frameMaterial = new THREE.MeshPhongMaterial({
              map: woodTexture,
              color: 0x8b4513,
              shininess: 80, // Reducido
              specular: 0x666666, // Reducido
              side: THREE.DoubleSide,
            });

            // Material para ornamentos dorados
            const ornamentMaterial = new THREE.MeshPhongMaterial({
              color: 0xdaa520,
              shininess: 100, // Reducido
              specular: 0x888888, // Reducido
              side: THREE.DoubleSide,
            });

            // Marco principal - superior
            const topFrame = new THREE.BoxGeometry(
              outerWidth,
              frameWidth,
              frameDepth
            );
            const topMesh = new THREE.Mesh(topFrame, frameMaterial);
            topMesh.position.set(0, height / 2 + frameWidth / 2, 0);
            frameGroup.add(topMesh);

            // Marco principal - inferior
            const bottomFrame = new THREE.BoxGeometry(
              outerWidth,
              frameWidth,
              frameDepth
            );
            const bottomMesh = new THREE.Mesh(bottomFrame, frameMaterial);
            bottomMesh.position.set(0, -height / 2 - frameWidth / 2, 0);
            frameGroup.add(bottomMesh);

            // Marco principal - izquierdo
            const leftFrame = new THREE.BoxGeometry(
              frameWidth,
              height,
              frameDepth
            );
            const leftMesh = new THREE.Mesh(leftFrame, frameMaterial);
            leftMesh.position.set(-width / 2 - frameWidth / 2, 0, 0);
            frameGroup.add(leftMesh);

            // Marco principal - derecho
            const rightFrame = new THREE.BoxGeometry(
              frameWidth,
              height,
              frameDepth
            );
            const rightMesh = new THREE.Mesh(rightFrame, frameMaterial);
            rightMesh.position.set(width / 2 + frameWidth / 2, 0, 0);
            frameGroup.add(rightMesh);

            // PANEL TRASERO SÓLIDO - FIX PARA EL HUECO
            const backPanelGeometry = new THREE.BoxGeometry(
              outerWidth,
              outerHeight,
              0.06 // Reducido
            );
            const backPanelMaterial = new THREE.MeshPhongMaterial({
              color: 0x654321,
              shininess: 20, // Reducido
              side: THREE.DoubleSide,
            });
            const backPanel = new THREE.Mesh(
              backPanelGeometry,
              backPanelMaterial
            );
            backPanel.position.set(0, 0, -frameDepth / 2 - 0.03);
            frameGroup.add(backPanel);

            // BISELES INTERIORES optimizados
            const bevelMaterial = new THREE.MeshPhongMaterial({
              color: 0xa0522d,
              shininess: 40, // Reducido
              side: THREE.DoubleSide,
            });

            // Bisel superior interior
            const topBevel = new THREE.BoxGeometry(width, 0.006, 0.015); // Reducido
            const topBevelMesh = new THREE.Mesh(topBevel, bevelMaterial);
            topBevelMesh.position.set(0, height / 2 - 0.003, 0.015);
            frameGroup.add(topBevelMesh);

            // Bisel inferior interior
            const bottomBevel = new THREE.BoxGeometry(width, 0.006, 0.015); // Reducido
            const bottomBevelMesh = new THREE.Mesh(bottomBevel, bevelMaterial);
            bottomBevelMesh.position.set(0, -height / 2 + 0.003, 0.015);
            frameGroup.add(bottomBevelMesh);

            // Bisel izquierdo interior
            const leftBevel = new THREE.BoxGeometry(0.006, height, 0.015); // Reducido
            const leftBevelMesh = new THREE.Mesh(leftBevel, bevelMaterial);
            leftBevelMesh.position.set(-width / 2 + 0.003, 0, 0.015);
            frameGroup.add(leftBevelMesh);

            // Bisel derecho interior
            const rightBevel = new THREE.BoxGeometry(0.006, height, 0.015); // Reducido
            const rightBevelMesh = new THREE.Mesh(rightBevel, bevelMaterial);
            rightBevelMesh.position.set(width / 2 - 0.003, 0, 0.015);
            frameGroup.add(rightBevelMesh);

            // ORNAMENTOS EN LOS LADOS - optimizados
            const ornamentSize = 0.03; // Reducido
            const ornamentHeight = 0.015; // Reducido

            // Ornamento superior izquierdo
            const topLeftOrnament = new THREE.BoxGeometry(
              ornamentSize,
              ornamentSize,
              ornamentHeight
            );
            const topLeftOrnamentMesh = new THREE.Mesh(
              topLeftOrnament,
              ornamentMaterial
            );
            topLeftOrnamentMesh.position.set(
              -width / 2 - frameWidth / 2 - ornamentSize / 2,
              height / 2 + frameWidth / 2 + ornamentSize / 2,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(topLeftOrnamentMesh);

            // Ornamento superior derecho
            const topRightOrnament = new THREE.BoxGeometry(
              ornamentSize,
              ornamentSize,
              ornamentHeight
            );
            const topRightOrnamentMesh = new THREE.Mesh(
              topRightOrnament,
              ornamentMaterial
            );
            topRightOrnamentMesh.position.set(
              width / 2 + frameWidth / 2 + ornamentSize / 2,
              height / 2 + frameWidth / 2 + ornamentSize / 2,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(topRightOrnamentMesh);

            // Ornamento inferior izquierdo
            const bottomLeftOrnament = new THREE.BoxGeometry(
              ornamentSize,
              ornamentSize,
              ornamentHeight
            );
            const bottomLeftOrnamentMesh = new THREE.Mesh(
              bottomLeftOrnament,
              ornamentMaterial
            );
            bottomLeftOrnamentMesh.position.set(
              -width / 2 - frameWidth / 2 - ornamentSize / 2,
              -height / 2 - frameWidth / 2 - ornamentSize / 2,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(bottomLeftOrnamentMesh);

            // Ornamento inferior derecho
            const bottomRightOrnament = new THREE.BoxGeometry(
              ornamentSize,
              ornamentSize,
              ornamentHeight
            );
            const bottomRightOrnamentMesh = new THREE.Mesh(
              bottomRightOrnament,
              ornamentMaterial
            );
            bottomRightOrnamentMesh.position.set(
              width / 2 + frameWidth / 2 + ornamentSize / 2,
              -height / 2 - frameWidth / 2 - ornamentSize / 2,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(bottomRightOrnamentMesh);

            // ORNAMENTOS CENTRALES EN LOS LADOS - optimizados
            const sideOrnamentWidth = 0.02; // Reducido
            const sideOrnamentHeight = 0.04; // Reducido

            // Ornamento central izquierdo
            const leftCenterOrnament = new THREE.BoxGeometry(
              sideOrnamentWidth,
              sideOrnamentHeight,
              ornamentHeight
            );
            const leftCenterOrnamentMesh = new THREE.Mesh(
              leftCenterOrnament,
              ornamentMaterial
            );
            leftCenterOrnamentMesh.position.set(
              -width / 2 - frameWidth / 2 - sideOrnamentWidth / 2,
              0,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(leftCenterOrnamentMesh);

            // Ornamento central derecho
            const rightCenterOrnament = new THREE.BoxGeometry(
              sideOrnamentWidth,
              sideOrnamentHeight,
              ornamentHeight
            );
            const rightCenterOrnamentMesh = new THREE.Mesh(
              rightCenterOrnament,
              ornamentMaterial
            );
            rightCenterOrnamentMesh.position.set(
              width / 2 + frameWidth / 2 + sideOrnamentWidth / 2,
              0,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(rightCenterOrnamentMesh);

            // Ornamento central superior
            const topCenterOrnament = new THREE.BoxGeometry(
              sideOrnamentHeight,
              sideOrnamentWidth,
              ornamentHeight
            );
            const topCenterOrnamentMesh = new THREE.Mesh(
              topCenterOrnament,
              ornamentMaterial
            );
            topCenterOrnamentMesh.position.set(
              0,
              height / 2 + frameWidth / 2 + sideOrnamentWidth / 2,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(topCenterOrnamentMesh);

            // Ornamento central inferior
            const bottomCenterOrnament = new THREE.BoxGeometry(
              sideOrnamentHeight,
              sideOrnamentWidth,
              ornamentHeight
            );
            const bottomCenterOrnamentMesh = new THREE.Mesh(
              bottomCenterOrnament,
              ornamentMaterial
            );
            bottomCenterOrnamentMesh.position.set(
              0,
              -height / 2 - frameWidth / 2 - sideOrnamentWidth / 2,
              frameDepth / 2 + ornamentHeight / 2
            );
            frameGroup.add(bottomCenterOrnamentMesh);

            // Asegurar transformaciones válidas
            mesh.rotation.set(0, 0, 0);
            mesh.scale.set(1, 1, 1);

            frameGroup.position.set(0, 0, 0);
            frameGroup.rotation.set(0, 0, 0);
            frameGroup.scale.set(1, 1, 1);

            scene.add(mesh);
            scene.add(frameGroup);

            const exporter = new GLTFExporter();

            const exportOptions = {
              binary: true,
              onlyVisible: true,
              truncateDrawRange: true,
              embedImages: true,
              maxTextureSize: 1024, // Reducido de 4096 para optimizar
              includeCustomExtensions: false,
            };

            exporter.parse(
              scene,
              (result) => {
                try {
                  if (result instanceof ArrayBuffer) {
                    const blob = new Blob([result], {
                      type: "model/gltf-binary",
                    });

                    console.log("Mural GLB optimizado generado:", {
                      size: Math.round(blob.size / 1024) + " KB",
                      features:
                        "Optimized wood texture, solid back panel, reduced file size",
                    });

                    resolve(blob);
                  } else {
                    reject(
                      new Error(
                        "Error en la exportación: formato de resultado inválido"
                      )
                    );
                  }
                } catch (error) {
                  reject(error);
                }
              },
              (error) => {
                reject(
                  new Error(
                    `Error al exportar mural 3D: ${error.message || error}`
                  )
                );
              },
              exportOptions
            );
          } catch (error) {
            reject(error);
          }
        },
        (progress) => {
          // Progreso simplificado
          if (progress.total > 0) {
            const percentage = Math.round(
              (progress.loaded / progress.total) * 100
            );
            if (percentage % 25 === 0) {
              // Solo log cada 25%
              console.log(`Cargando imagen: ${percentage}%`);
            }
          }
        },
        (error) => {
          // Error simplificado pero específico
          let errorMessage = "URL inválida o imagen no accesible";

          if (imageUrl.startsWith("http") && !imageUrl.startsWith("https://")) {
            errorMessage = "URL HTTP no segura. Intenta con HTTPS.";
          } else if (error.message && error.message.includes("404")) {
            errorMessage = "Imagen no encontrada (404).";
          } else if (error.message && error.message.includes("network")) {
            errorMessage = "Error de red al cargar la imagen.";
          }

          reject(new Error(`Error al cargar imagen: ${errorMessage}`));
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Genera un mural GLB con una textura creada programáticamente (fallback)
 * @param {string} color - Color hexadecimal para la textura (ej: "#ff0000")
 * @param {string} text - Texto a mostrar en la textura
 * @returns {Promise<Blob>}
 */
export async function generateMuralGLBFallback(
  color = "#ffffff",
  text = "TEST"
) {
  return new Promise(async (resolve, reject) => {
    try {
      const THREE = await import("three");
      const { GLTFExporter } = await import(
        "three/examples/jsm/exporters/GLTFExporter"
      );

      const scene = new THREE.Scene();
      // Hacer el modelo más pequeño para AR
      const width = 0.8;
      const height = 0.6;

      // Crear una textura usando Canvas
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 384;
      const context = canvas.getContext("2d");

      // Fondo
      context.fillStyle = color;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Texto
      context.fillStyle = color === "#ffffff" ? "#000000" : "#ffffff";
      context.font = "bold 48px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      // Borde
      context.strokeStyle = context.fillStyle;
      context.lineWidth = 4;
      context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      // Crear textura de Three.js desde el canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true; // Cambiar a true para corregir orientación
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Crear geometría del cuadro principal
      const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0.02); // Ligeramente hacia adelante

      // Crear marco volumétrico
      const frameGroup = new THREE.Group();

      // Parámetros del marco - más prominente
      const frameDepth = 0.08;
      const frameWidth = 0.04;
      const outerWidth = width + frameWidth * 2;
      const outerHeight = height + frameWidth * 2;

      // Material del marco con mejor textura
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b4513,
        shininess: 30,
        specular: 0x111111,
        side: THREE.DoubleSide,
      });

      // Marco superior
      const topFrame = new THREE.BoxGeometry(
        outerWidth,
        frameWidth,
        frameDepth
      );
      const topMesh = new THREE.Mesh(topFrame, frameMaterial);
      topMesh.position.set(0, height / 2 + frameWidth / 2, 0);
      frameGroup.add(topMesh);

      // Marco inferior
      const bottomFrame = new THREE.BoxGeometry(
        outerWidth,
        frameWidth,
        frameDepth
      );
      const bottomMesh = new THREE.Mesh(bottomFrame, frameMaterial);
      bottomMesh.position.set(0, -height / 2 - frameWidth / 2, 0);
      frameGroup.add(bottomMesh);

      // Marco izquierdo
      const leftFrame = new THREE.BoxGeometry(frameWidth, height, frameDepth);
      const leftMesh = new THREE.Mesh(leftFrame, frameMaterial);
      leftMesh.position.set(-width / 2 - frameWidth / 2, 0, 0);
      frameGroup.add(leftMesh);

      // Marco derecho
      const rightFrame = new THREE.BoxGeometry(frameWidth, height, frameDepth);
      const rightMesh = new THREE.Mesh(rightFrame, frameMaterial);
      rightMesh.position.set(width / 2 + frameWidth / 2, 0, 0);
      frameGroup.add(rightMesh);

      // Añadir profundidad al fondo - más grosor
      const backGeometry = new THREE.BoxGeometry(outerWidth, outerHeight, 0.02);
      const backMaterial = new THREE.MeshPhongMaterial({
        color: 0x654321,
        shininess: 10,
        side: THREE.DoubleSide,
      });
      const backMesh = new THREE.Mesh(backGeometry, backMaterial);
      backMesh.position.set(0, 0, -frameDepth / 2);
      frameGroup.add(backMesh);

      // Añadir bisel interior del marco
      const bevelMaterial = new THREE.MeshPhongMaterial({
        color: 0xa0522d,
        shininess: 50,
        side: THREE.DoubleSide,
      });

      // Bisel superior
      const topBevel = new THREE.BoxGeometry(width, 0.005, 0.01);
      const topBevelMesh = new THREE.Mesh(topBevel, bevelMaterial);
      topBevelMesh.position.set(0, height / 2 - 0.005, 0.015);
      frameGroup.add(topBevelMesh);

      // Bisel inferior
      const bottomBevel = new THREE.BoxGeometry(width, 0.005, 0.01);
      const bottomBevelMesh = new THREE.Mesh(bottomBevel, bevelMaterial);
      bottomBevelMesh.position.set(0, -height / 2 + 0.005, 0.015);
      frameGroup.add(bottomBevelMesh);

      // Bisel izquierdo
      const leftBevel = new THREE.BoxGeometry(0.005, height, 0.01);
      const leftBevelMesh = new THREE.Mesh(leftBevel, bevelMaterial);
      leftBevelMesh.position.set(-width / 2 + 0.005, 0, 0.015);
      frameGroup.add(leftBevelMesh);

      // Bisel derecho
      const rightBevel = new THREE.BoxGeometry(0.005, height, 0.01);
      const rightBevelMesh = new THREE.Mesh(rightBevel, bevelMaterial);
      rightBevelMesh.position.set(width / 2 - 0.005, 0, 0.015);
      frameGroup.add(rightBevelMesh);

      mesh.rotation.set(0, 0, 0);
      mesh.scale.set(1, 1, 1);

      frameGroup.position.set(0, 0, 0);
      frameGroup.rotation.set(0, 0, 0);
      frameGroup.scale.set(1, 1, 1);

      scene.add(mesh);
      scene.add(frameGroup);

      const exporter = new GLTFExporter();

      const exportOptions = {
        binary: true,
        onlyVisible: true,
        truncateDrawRange: true,
        embedImages: true,
        maxTextureSize: 2048,
        includeCustomExtensions: false,
      };

      exporter.parse(
        scene,
        (result) => {
          try {
            if (result instanceof ArrayBuffer) {
              const blob = new Blob([result], { type: "model/gltf-binary" });

              console.log("Mural fallback generado:", {
                size: Math.round(blob.size / 1024) + " KB",
              });

              resolve(blob);
            } else {
              reject(
                new Error(
                  "Error en la exportación: formato de resultado inválido"
                )
              );
            }
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(
            new Error(`Error al exportar mural 3D: ${error.message || error}`)
          );
        },
        exportOptions
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Genera un modelo 3D usando IA a partir de una imagen 2D
 * @param {string} imageUrl - URL de la imagen
 * @param {string} prompt - Descripción del estilo deseado
 * @returns {Promise<Blob>}
 */
export async function generateAI3DModel(
  imageUrl,
  prompt = "elegant framed artwork"
) {
  return new Promise(async (resolve, reject) => {
    try {
      // Aquí podrías integrar con Magic3D o Stable Diffusion 3D
      console.log("Generando modelo 3D con IA...");

      // Por ahora, usamos el método tradicional pero con mejoras
      const THREE = await import("three");
      const { GLTFExporter } = await import(
        "three/examples/jsm/exporters/GLTFExporter"
      );

      const scene = new THREE.Scene();

      // Configurar iluminación para mejor calidad
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.4);
      pointLight.position.set(-1, 1, 2);
      scene.add(pointLight);

      // Dimensiones optimizadas
      const width = 0.8;
      const height = 0.6;

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");

      loader.load(
        imageUrl,
        (texture) => {
          try {
            // Configurar textura para máxima calidad
            texture.flipY = true;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;

            // Crear geometría del cuadro principal
            const geometry = new THREE.PlaneGeometry(width, height, 32, 32);
            const material = new THREE.MeshPhongMaterial({
              map: texture,
              side: THREE.DoubleSide,
              transparent: false,
              opacity: 1.0,
              shininess: 30,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0.05);

            // Crear marco premium con IA
            const frameGroup = createAIFrame(width, height, THREE);

            scene.add(mesh);
            scene.add(frameGroup);

            const exporter = new GLTFExporter();

            const exportOptions = {
              binary: true,
              onlyVisible: true,
              truncateDrawRange: true,
              embedImages: true,
              maxTextureSize: 4096,
              includeCustomExtensions: false,
            };

            exporter.parse(
              scene,
              (result) => {
                try {
                  if (result instanceof ArrayBuffer) {
                    const blob = new Blob([result], {
                      type: "model/gltf-binary",
                    });

                    console.log("Modelo 3D con IA generado:", {
                      size: Math.round(blob.size / 1024) + " KB",
                      method: "AI-enhanced",
                    });

                    resolve(blob);
                  } else {
                    reject(
                      new Error("Error en la exportación: formato inválido")
                    );
                  }
                } catch (error) {
                  reject(error);
                }
              },
              (error) => {
                reject(
                  new Error(`Error al exportar modelo 3D: ${error.message}`)
                );
              },
              exportOptions
            );
          } catch (error) {
            reject(error);
          }
        },
        (progress) => {
          if (progress.total > 0) {
            const percentage = Math.round(
              (progress.loaded / progress.total) * 100
            );
            if (percentage % 25 === 0) {
              console.log(`Procesando imagen con IA: ${percentage}%`);
            }
          }
        },
        (error) => {
          reject(new Error(`Error al cargar imagen: ${error.message}`));
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Crea un marco premium usando técnicas de IA
 */
function createAIFrame(width, height, THREE) {
  const frameGroup = new THREE.Group();

  // Parámetros del marco premium
  const frameDepth = 0.15;
  const frameWidth = 0.12;
  const outerWidth = width + frameWidth * 2;
  const outerHeight = height + frameWidth * 2;

  // Crear textura de madera premium con IA
  const createAIWoodTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d");

    // Base de madera premium con gradiente complejo
    const gradient = ctx.createLinearGradient(0, 0, 2048, 2048);
    gradient.addColorStop(0, "#8B4513");
    gradient.addColorStop(0.2, "#A0522D");
    gradient.addColorStop(0.4, "#CD853F");
    gradient.addColorStop(0.6, "#DEB887");
    gradient.addColorStop(0.8, "#CD853F");
    gradient.addColorStop(1, "#8B4513");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 2048);

    // Vetas de madera ultra realistas
    for (let i = 0; i < 60; i++) {
      const y = i * 34;
      const alpha = 0.3 + Math.random() * 0.7;
      ctx.strokeStyle = `rgba(139, 69, 19, ${alpha})`;
      ctx.lineWidth = 1 + Math.random() * 6;

      ctx.beginPath();
      ctx.moveTo(0, y);

      // Curvas naturales más complejas
      for (let x = 0; x <= 2048; x += 20) {
        const offset =
          Math.sin(x * 0.008 + i * 0.3) * 25 +
          Math.sin(x * 0.003 + i * 0.7) * 15 +
          Math.sin(x * 0.015 + i * 0.2) * 10 +
          Math.random() * 15;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }

    // Nudos de madera ultra realistas
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const radius = 20 + Math.random() * 35;

      // Nudo principal
      ctx.fillStyle = `rgba(101, 67, 33, ${0.7 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Anillos múltiples del nudo
      for (let ring = 1; ring <= 5; ring++) {
        const ringRadius = radius + ring * 4;
        ctx.strokeStyle = `rgba(139, 69, 19, ${0.8 - ring * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Centro del nudo
      ctx.fillStyle = `rgba(101, 67, 33, ${0.9 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Brillo premium con variaciones
    for (let i = 0; i < 30; i++) {
      const alpha = 0.05 + Math.random() * 0.15;
      ctx.fillStyle = `rgba(255, 228, 196, ${alpha})`;
      ctx.fillRect(
        Math.random() * 2048,
        Math.random() * 2048,
        50 + Math.random() * 150,
        30 + Math.random() * 100
      );
    }

    return new THREE.CanvasTexture(canvas);
  };

  const woodTexture = createAIWoodTexture();
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(1, 1);

  // Material del marco premium
  const frameMaterial = new THREE.MeshPhongMaterial({
    map: woodTexture,
    color: 0x8b4513,
    shininess: 100,
    specular: 0x888888,
    side: THREE.DoubleSide,
  });

  // Material para ornamentos dorados
  const ornamentMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    shininess: 120,
    specular: 0xaaaaaa,
    side: THREE.DoubleSide,
  });

  // Marco principal con geometría más compleja
  const topFrame = new THREE.BoxGeometry(outerWidth, frameWidth, frameDepth);
  const topMesh = new THREE.Mesh(topFrame, frameMaterial);
  topMesh.position.set(0, height / 2 + frameWidth / 2, 0);
  frameGroup.add(topMesh);

  const bottomFrame = new THREE.BoxGeometry(outerWidth, frameWidth, frameDepth);
  const bottomMesh = new THREE.Mesh(bottomFrame, frameMaterial);
  bottomMesh.position.set(0, -height / 2 - frameWidth / 2, 0);
  frameGroup.add(bottomMesh);

  const leftFrame = new THREE.BoxGeometry(frameWidth, height, frameDepth);
  const leftMesh = new THREE.Mesh(leftFrame, frameMaterial);
  leftMesh.position.set(-width / 2 - frameWidth / 2, 0, 0);
  frameGroup.add(leftMesh);

  const rightFrame = new THREE.BoxGeometry(frameWidth, height, frameDepth);
  const rightMesh = new THREE.Mesh(rightFrame, frameMaterial);
  rightMesh.position.set(width / 2 + frameWidth / 2, 0, 0);
  frameGroup.add(rightMesh);

  // Ornamentos dorados premium
  const ornamentSize = 0.04;
  const ornamentHeight = 0.02;

  // Esquinas con ornamentos más elaborados
  const cornerOrnaments = [
    {
      x: -width / 2 - frameWidth / 2 - ornamentSize / 2,
      y: height / 2 + frameWidth / 2 + ornamentSize / 2,
    },
    {
      x: width / 2 + frameWidth / 2 + ornamentSize / 2,
      y: height / 2 + frameWidth / 2 + ornamentSize / 2,
    },
    {
      x: -width / 2 - frameWidth / 2 - ornamentSize / 2,
      y: -height / 2 - frameWidth / 2 - ornamentSize / 2,
    },
    {
      x: width / 2 + frameWidth / 2 + ornamentSize / 2,
      y: -height / 2 - frameWidth / 2 - ornamentSize / 2,
    },
  ];

  cornerOrnaments.forEach(({ x, y }) => {
    const ornament = new THREE.BoxGeometry(
      ornamentSize,
      ornamentSize,
      ornamentHeight
    );
    const ornamentMesh = new THREE.Mesh(ornament, ornamentMaterial);
    ornamentMesh.position.set(x, y, frameDepth / 2 + ornamentHeight / 2);
    frameGroup.add(ornamentMesh);
  });

  // Ornamentos centrales más elaborados
  const centerOrnaments = [
    { width: 0.03, height: 0.06, x: -width / 2 - frameWidth / 2 - 0.015, y: 0 },
    { width: 0.03, height: 0.06, x: width / 2 + frameWidth / 2 + 0.015, y: 0 },
    { width: 0.06, height: 0.03, x: 0, y: height / 2 + frameWidth / 2 + 0.015 },
    {
      width: 0.06,
      height: 0.03,
      x: 0,
      y: -height / 2 - frameWidth / 2 - 0.015,
    },
  ];

  centerOrnaments.forEach(({ width: w, height: h, x, y }) => {
    const ornament = new THREE.BoxGeometry(w, h, ornamentHeight);
    const ornamentMesh = new THREE.Mesh(ornament, ornamentMaterial);
    ornamentMesh.position.set(x, y, frameDepth / 2 + ornamentHeight / 2);
    frameGroup.add(ornamentMesh);
  });

  // Panel trasero premium
  const backGeometry = new THREE.BoxGeometry(outerWidth, outerHeight, 0.05);
  const backMaterial = new THREE.MeshPhongMaterial({
    color: 0x654321,
    shininess: 30,
    side: THREE.DoubleSide,
  });
  const backMesh = new THREE.Mesh(backGeometry, backMaterial);
  backMesh.position.set(0, 0, -frameDepth / 2);
  frameGroup.add(backMesh);

  return frameGroup;
}

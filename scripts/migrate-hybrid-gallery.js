const fs = require('fs');
const path = require('path');

/**
 * SCRIPT DE MIGRACIÓN AUTOMÁTICA
 * Actualiza HybridGalleryRoom.jsx para usar el sistema inteligente de texturas
 */

const filePath = 'c:\\Users\\leopo\\OneDrive\\Escritorio\\museo-3d\\components\\HybridGalleryRoom.jsx';

console.log('🚀 Iniciando migración de FastPBRMaterial a sistema inteligente...');

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

// Patrones de reemplazo con contexto para identificar el tipo de material
const replacements = [
  // Molduras del techo
  {
    pattern: /(\s+)<FastPBRMaterial color="#e0e0e0" roughness={0\.3} metalness={0\.2} \/>/g,
    replacement: '$1<FastPBRMaterial \n          salaId={salaId}\n          materialType="decoration"\n          color="#e0e0e0" \n          roughness={0.3} \n          metalness={0.2} \n        />'
  },
  
  // Molduras doradas del techo
  {
    pattern: /(\s+)<FastPBRMaterial color="#d4af37" metalness={0\.8} roughness={0\.2} \/>/g,
    replacement: '$1<FastPBRMaterial \n          salaId={salaId}\n          materialType="decoration"\n          color="#d4af37" \n          metalness={0.8} \n          roughness={0.2} \n        />'
  },
  
  // Lámparas - base metálica
  {
    pattern: /(\s+)<FastPBRMaterial color="#2F4F4F" metalness={0\.9} roughness={0\.1} \/>/g,
    replacement: '$1<FastPBRMaterial \n            salaId={salaId}\n            materialType="decoration"\n            color="#2F4F4F" \n            metalness={0.9} \n            roughness={0.1} \n          />'
  },
  
  // Lámparas - bombilla dorada
  {
    pattern: /(\s+)<FastPBRMaterial color="#FFD700" metalness={0\.9} roughness={0\.05} \/>/g,
    replacement: '$1<FastPBRMaterial \n            salaId={salaId}\n            materialType="decoration"\n            color="#FFD700" \n            metalness={0.9} \n            roughness={0.05} \n          />'
  }
];

// Aplicar reemplazos
let changeCount = 0;
replacements.forEach(({ pattern, replacement }) => {
  const matches = content.match(pattern);
  if (matches) {
    content = content.replace(pattern, replacement);
    changeCount += matches.length;
    console.log(`✅ Actualizados ${matches.length} elementos con patrón: ${pattern.source.substring(0, 50)}...`);
  }
});

// Escribir el archivo actualizado
fs.writeFileSync(filePath, content, 'utf8');

console.log(`🎉 Migración completada! ${changeCount} materiales actualizados.`);
console.log('📝 Archivo actualizado:', filePath);
console.log('\n📊 Beneficios de la migración:');
console.log('   • Sistema inteligente detecta performance automáticamente');
console.log('   • Carga texturas API cuando es posible');
console.log('   • Fallback a colores inteligentes en performance intermedio');
console.log('   • Mantiene modo de emergencia para performance crítico');
console.log('   • Compatible 100% con código existente');

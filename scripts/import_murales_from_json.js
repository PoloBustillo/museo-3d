const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function importMuralesFromJson() {
  try {
    console.log("🔄 Iniciando importación de murales desde JSON...");

    // Leer el archivo JSON de murales
    const jsonPath = path.join(
      __dirname,
      "..",
      "public",
      "murales_backup.json"
    );

    if (!fs.existsSync(jsonPath)) {
      console.error(
        "❌ No se encontró el archivo murales_backup.json en public/"
      );
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const muralesData = jsonData.murales || [];
    console.log(`📊 Encontrados ${muralesData.length} murales en el JSON`);

    // Limpiar tabla de murales existente
    console.log("🧹 Limpiando tabla de murales existente...");
    await prisma.mural.deleteMany({});
    console.log("✅ Tabla de murales limpiada");

    // Importar murales
    console.log("📥 Importando murales...");
    let importedCount = 0;
    let errorCount = 0;

    for (const mural of muralesData) {
      try {
        // Mapear los datos del JSON al esquema de Prisma
        const muralData = {
          titulo: mural.titulo || "Sin título",
          autor: mural.autor || "Artista desconocido", // Campo legacy
          tecnica: mural.tecnica || "Técnica no especificada",
          descripcion: mural.descripcion || "",
          anio: mural.anio || null,
          url_imagen: mural.url_imagen || "",
          ubicacion: mural.ubicacion || "",
          latitud: mural.latitud ? parseFloat(mural.latitud) : null,
          longitud: mural.longitud ? parseFloat(mural.longitud) : null,
        };

        await prisma.mural.create({
          data: muralData,
        });

        importedCount++;
        if (importedCount % 5 === 0) {
          console.log(`✅ Importados ${importedCount} murales...`);
        }
      } catch (error) {
        console.error(
          `❌ Error importando mural "${mural.titulo || "sin título"}":`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n📊 Resumen de importación:");
    console.log(`✅ Murales importados exitosamente: ${importedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📈 Total procesados: ${muralesData.length}`);

    // Verificar importación
    const totalMurales = await prisma.mural.count();
    console.log(
      `\n🔍 Verificación: ${totalMurales} murales en la base de datos`
    );
  } catch (error) {
    console.error("❌ Error durante la importación:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  importMuralesFromJson()
    .then(() => {
      console.log("🎉 Importación completada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { importMuralesFromJson };

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkMurales() {
  try {
    console.log("🔍 Verificando murales importados...");

    const murales = await prisma.mural.findMany({
      take: 5,
      select: {
        id: true,
        titulo: true,
        autor: true,
        anio: true,
        tecnica: true,
      },
    });

    console.log("📋 Primeros 5 murales:");
    murales.forEach((mural, index) => {
      console.log(
        `${index + 1}. ${mural.titulo} - ${mural.autor} (${mural.anio})`
      );
    });

    const total = await prisma.mural.count();
    console.log(`\n📊 Total de murales en la base de datos: ${total}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMurales();

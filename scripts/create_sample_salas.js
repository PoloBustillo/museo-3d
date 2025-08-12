const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createSampleSalas() {
  console.log("🏛️ Creating sample salas with updated schema...");

  try {
    // Obtener usuario admin
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@museo3d.com" },
    });

    if (!adminUser) {
      console.error("❌ Admin user not found!");
      return;
    }

    // Obtener algunos murales para asignar
    const murales = await prisma.mural.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    if (murales.length === 0) {
      console.error("❌ No murales found!");
      return;
    }

    console.log(`📄 Found ${murales.length} murales to assign`);

    // Sala 1: Galería Clásica
    const sala1 = await prisma.sala.create({
      data: {
        nombre: "Galería Clásica",
        descripcion: "Una colección de murales que refleja la elegancia atemporal del arte clásico",
        tema: "clasico",
        publica: true,
        esPrivada: false,
        color: "#8B5CF6",
        texturaPared: "MarbleSlabs017A_1K-JPG",
        texturaPiso: "Wood076_1K-JPG",
        musica: "/audio/menu.mp3",
        imagenPortada: murales[0]?.id || null,
        maxColaboradores: 3,
        notas: "Sala dedicada al arte clásico y tradicional",
        creadorId: adminUser.id,
      },
    });

    // Asignar murales a la sala 1
    const muralesSala1 = murales.slice(0, 5);
    for (const mural of muralesSala1) {
      await prisma.salaMural.create({
        data: {
          salaId: sala1.id,
          muralId: mural.id,
        },
      });
    }

    console.log(`✅ Created "${sala1.nombre}" with ${muralesSala1.length} murales`);

    // Sala 2: Espacio Futurista
    const sala2 = await prisma.sala.create({
      data: {
        nombre: "Espacio Futurista",
        descripcion: "Una experiencia inmersiva con arte de vanguardia y tecnología",
        tema: "Arte digital experimental con elementos de realidad aumentada",
        publica: true,
        esPrivada: false,
        color: "#06B6D4",
        texturaPared: "MetalPlates006_1K-JPG",
        texturaPiso: "MetalFloor007A_1K-JPG",
        musica: "/audio/menu.mp3",
        imagenPortada: murales[5]?.id || murales[0]?.id || null,
        maxColaboradores: 3,
        notas: "Sala experimental con tema personalizado y estética futurista",
        creadorId: adminUser.id,
      },
    });

    // Asignar murales a la sala 2
    const muralesSala2 = murales.slice(5, 10);
    for (const mural of muralesSala2) {
      await prisma.salaMural.create({
        data: {
          salaId: sala2.id,
          muralId: mural.id,
        },
      });
    }

    console.log(`✅ Created "${sala2.nombre}" with ${muralesSala2.length} murales`);

    console.log("🎉 Sample salas created successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • ${sala1.nombre}: Tema predefinido "${sala1.tema}"`);
    console.log(`   • ${sala2.nombre}: Tema personalizado "${sala2.tema}"`);
    console.log(`   • Both salas have maxColaboradores: ${sala1.maxColaboradores}`);
    console.log(`   • Both use imagenPortada from selected murales`);

  } catch (error) {
    console.error("❌ Error creating sample salas:", error);
  }
}

createSampleSalas()
  .catch((e) => {
    console.error("❌ Script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

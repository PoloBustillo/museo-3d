const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Crear usuario admin por defecto
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@museo3d.com" },
    update: {},
    create: {
      email: "admin@museo3d.com",
      name: "Administrador",
      role: "ADMIN",
      settings: {
        theme: "dark",
        notifications: true,
        emailValidated: true,
      },
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

  // Crear usuario de prueba
  const testUser = await prisma.user.upsert({
    where: { email: "test@museo3d.com" },
    update: {},
    create: {
      email: "test@museo3d.com",
      name: "Usuario de Prueba",
      role: "USER",
      settings: {
        theme: "light",
        notifications: false,
        emailValidated: true,
      },
    },
  });

  console.log("✅ Test user created:", testUser.email);

  // Crear algunos murales de ejemplo
  const murales = [
    {
      titulo: "Mural de Bienvenida",
      autor: "Artista Local",
      tecnica: "Acrílico sobre muro",
      descripcion: "Mural que da la bienvenida a los visitantes del museo",
      anio: 2024,
      url_imagen:
        "https://res.cloudinary.com/daol1ohso/image/upload/v1749847137/ejemplo1.jpg",
      latitud: -33.4489,
      longitud: -70.6693,
      ubicacion: "Entrada principal del museo",
    },
    {
      titulo: "Historia de la Ciudad",
      autor: "Muralista Urbano",
      tecnica: "Spray y acrílico",
      descripcion:
        "Representación de la historia de la ciudad a través del arte",
      anio: 2023,
      url_imagen:
        "https://res.cloudinary.com/daol1ohso/image/upload/v1749847137/ejemplo2.jpg",
      latitud: -33.4489,
      longitud: -70.6693,
      ubicacion: "Pared exterior del museo",
    },
  ];

  for (const muralData of murales) {
    const mural = await prisma.mural.create({
      data: muralData,
    });
    console.log("✅ Mural created:", mural.titulo);
  }

  // Crear sala de ejemplo
  const sala = await prisma.sala.upsert({
    where: { nombre: "Sala Principal" },
    update: {},
    create: {
      nombre: "Sala Principal",
      descripcion: "Sala principal del museo con las obras más importantes",
      publica: true,
      creadorId: adminUser.id,
    },
  });

  console.log("✅ Sala created:", sala.nombre);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

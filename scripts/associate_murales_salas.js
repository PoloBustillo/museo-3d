const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Creando usuario admin, salas y asociando murales...");

  // 1. Crear usuario admin si no existe
  let admin = await prisma.user.findUnique({
    where: { email: "admin@museo.com" },
  });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "admin@museo.com",
        name: "Admin Museo",
        // Si tu modelo User tiene un campo password, descomenta la siguiente línea:
        // password: "nullpointer!!",
      },
    });
    console.log("✅ Usuario admin creado");
  } else {
    console.log("⏭️ Usuario admin ya existe");
  }

  // Ejemplo de salas
  const salasEjemplo = [
    { nombre: "Sala Principal", descripcion: "Murales destacados" },
    { nombre: "Sala ARPA", descripcion: "Murales de ARPA" },
    { nombre: "Sala CCU", descripcion: "Murales del CCU" },
  ];

  // Crear salas si no existen
  const salas = [];
  for (const salaData of salasEjemplo) {
    let sala = await prisma.sala.findFirst({
      where: { nombre: salaData.nombre },
    });
    if (!sala) {
      sala = await prisma.sala.create({
        data: { ...salaData, creadorId: admin.id },
      });
      console.log(`✅ Sala creada: ${sala.nombre}`);
    } else {
      console.log(`⏭️ Sala ya existe: ${sala.nombre}`);
    }
    salas.push(sala);
  }

  // Obtener algunos murales para asociar
  const murales = await prisma.mural.findMany({ take: 10 });
  if (murales.length === 0) {
    console.log("❌ No hay murales para asociar");
    return;
  }

  // Asociar los primeros 5 murales a la Sala Principal
  for (let i = 0; i < 5 && i < murales.length; i++) {
    const mural = murales[i];
    await prisma.salaMural.upsert({
      where: { salaId_muralId: { salaId: salas[0].id, muralId: mural.id } },
      update: {},
      create: { salaId: salas[0].id, muralId: mural.id },
    });
    console.log(
      `🔗 Asociado mural '${mural.titulo}' a sala '${salas[0].nombre}'`
    );
  }

  // Asociar los murales 6-10 a la Sala ARPA
  for (let i = 5; i < 10 && i < murales.length; i++) {
    const mural = murales[i];
    await prisma.salaMural.upsert({
      where: { salaId_muralId: { salaId: salas[1].id, muralId: mural.id } },
      update: {},
      create: { salaId: salas[1].id, muralId: mural.id },
    });
    console.log(
      `🔗 Asociado mural '${mural.titulo}' a sala '${salas[1].nombre}'`
    );
  }

  // Asociar todos los murales a la Sala CCU
  for (const mural of murales) {
    await prisma.salaMural.upsert({
      where: { salaId_muralId: { salaId: salas[2].id, muralId: mural.id } },
      update: {},
      create: { salaId: salas[2].id, muralId: mural.id },
    });
  }
  console.log(`🔗 Todos los murales asociados a sala '${salas[2].nombre}'`);

  // Mostrar resumen
  for (const sala of salas) {
    const count = await prisma.salaMural.count({ where: { salaId: sala.id } });
    console.log(`📊 Sala '${sala.nombre}' tiene ${count} murales asociados.`);
  }

  await prisma.$disconnect();
  console.log("✅ Asociación completada");
}

main();

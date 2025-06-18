const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const { parse } = require("csv-parse/sync");

const prisma = new PrismaClient();

async function main() {
  const file = fs.readFileSync(
    "./public/Registro de murales ARPA - Hoja 1.csv",
    "utf8"
  );
  const records = parse(file, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    trim: true,
  });

  for (const row of records) {
    try {
      await prisma.mural.create({
        data: {
          nombre: row["Título"]?.trim() || "Sin título",
          autor: row["Autores"]?.trim() || null,
          colaboradores: row["Colaborador"]?.trim() || null,
          tecnica: row["Técnica"]?.trim() || "",
          medidas: row["Medidas"]?.trim() || null,
          anio: Number(row["Año"]) || 0,
          ubicacion: row["Ubicación"]?.trim() || "",
          url_imagen: "",
        },
      });
    } catch (e) {
      console.error(`Error insertando mural: ${row["Título"]}`, e);
    }
  }
  await prisma.$disconnect();
}

main();

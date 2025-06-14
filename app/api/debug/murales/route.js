import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const murales = await prisma.mural.findMany({
      select: {
        id: true,
        nombre: true,
        autor: true,
        tecnica: true,
        salaId: true,
        sala: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const totalCount = await prisma.mural.count();

    return new Response(
      JSON.stringify({
        message: "Murales disponibles para debugging",
        total: totalCount,
        murales: murales,
        ids: murales.map((m) => m.id),
        availableForSalas: murales
          .filter((m) => !m.salaId)
          .map((m) => ({ id: m.id, nombre: m.nombre })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener murales:", error);
    return new Response(
      JSON.stringify({
        error: "Error al obtener murales",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

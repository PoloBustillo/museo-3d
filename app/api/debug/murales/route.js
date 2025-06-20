import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const murales = await prisma.mural.findMany({
      select: {
        id: true,
        titulo: true,
        artista: true,
        tecnica: true,
        salas: {
          select: {
            sala: {
              select: {
                id: true,
                nombre: true,
              },
            },
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
          .filter((m) => m.salas.length === 0)
          .map((m) => ({ id: m.id, titulo: m.titulo })),
        muralesConSalas: murales
          .filter((m) => m.salas.length > 0)
          .map((m) => ({
            id: m.id,
            titulo: m.titulo,
            salas: m.salas.map((s) => s.sala.nombre),
          })),
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

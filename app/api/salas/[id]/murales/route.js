import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/salas/[id]/murales
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const sala = await prisma.sala.findUnique({
      where: { id: Number(id) },
      include: {
        murales: {
          include: {
            mural: {
              select: {
                id: true,
                titulo: true,
                artista: true,
                tecnica: true,
                anio: true,
                imagenUrl: true,
                imagenUrlWebp: true,
                latitud: true,
                longitud: true,
                ubicacion: true,
                descripcion: true,
                estado: true,
                dimensiones: true,
                fechaCreacion: true,
              },
            },
          },
        },
      },
    });

    if (!sala) {
      return new Response(JSON.stringify({ error: "Sala no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transformar la respuesta para devolver solo los murales
    const murales = sala.murales.map((salaMural) => salaMural.mural);

    return new Response(
      JSON.stringify({
        murales,
        total: murales.length,
        sala: {
          id: sala.id,
          nombre: sala.nombre,
          descripcion: sala.descripcion,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener murales de la sala:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST /api/salas/[id]/murales
export async function POST(req, { params }) {
  const { id } = params;
  try {
    const data = await req.json();

    // Validar que los murales existan
    if (data.murales && data.murales.length > 0) {
      const existingMurales = await prisma.mural.findMany({
        where: {
          id: { in: data.murales.map((muralId) => Number(muralId)) },
        },
      });

      if (existingMurales.length !== data.murales.length) {
        const foundIds = existingMurales.map((m) => m.id);
        const missingIds = data.murales.filter(
          (id) => !foundIds.includes(Number(id))
        );

        return new Response(
          JSON.stringify({
            error: "Murales no encontrados",
            message: `Los siguientes murales no existen: ${missingIds.join(
              ", "
            )}`,
            missing: missingIds,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Agregar murales a la sala
    const sala = await prisma.sala.update({
      where: { id: Number(id) },
      data: {
        murales: {
          create: data.murales.map((muralId) => ({
            mural: { connect: { id: Number(muralId) } },
          })),
        },
      },
      include: {
        murales: {
          include: {
            mural: {
              select: {
                id: true,
                titulo: true,
                artista: true,
                tecnica: true,
                anio: true,
                imagenUrl: true,
                imagenUrlWebp: true,
              },
            },
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "Murales agregados exitosamente",
        sala,
        muralesAgregados: data.murales.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al agregar murales a la sala:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE /api/salas/[id]/murales
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const data = await req.json();

    // Eliminar murales específicos de la sala
    if (data.murales && data.murales.length > 0) {
      await prisma.salaMural.deleteMany({
        where: {
          salaId: Number(id),
          muralId: { in: data.murales.map((muralId) => Number(muralId)) },
        },
      });
    } else {
      // Eliminar todos los murales de la sala
      await prisma.salaMural.deleteMany({
        where: { salaId: Number(id) },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Murales eliminados exitosamente de la sala",
        muralesEliminados: data.murales ? data.murales.length : "todos",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar murales de la sala:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

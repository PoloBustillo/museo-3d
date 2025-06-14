import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/salas/[id] - Obtener sala por ID
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    const sala = await prisma.sala.findUnique({
      where: { id: Number(id) },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        colaboradores: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        murales: {
          select: {
            id: true,
            nombre: true,
            autor: true,
            colaboradores: true,
            tecnica: true,
            medidas: true,
            anio: true,
            ubicacion: true,
            url_imagen: true,
          },
        },
        _count: {
          select: {
            murales: true,
            colaboradores: true,
          },
        },
      },
    });

    if (!sala) {
      return new Response(
        JSON.stringify({
          error: "Sala no encontrada",
          message: `No se encontró una sala con ID ${id}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(sala), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener sala por ID:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener la sala",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT /api/salas/[id] - Actualizar sala por ID
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const data = await req.json();
    // data puede incluir: nombre, ownerId, colaboradores (array de userId), murales (array de muralId)
    const sala = await prisma.sala.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre,
        owner: data.ownerId ? { connect: { id: data.ownerId } } : undefined,
        colaboradores: data.colaboradores
          ? { set: data.colaboradores.map((id) => ({ id })) }
          : undefined,
        murales: data.murales
          ? { set: data.murales.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        owner: true,
        colaboradores: true,
        murales: true,
      },
    });
    return new Response(JSON.stringify(sala), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// DELETE /api/salas/[id] - Eliminar sala por ID
export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    await prisma.sala.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

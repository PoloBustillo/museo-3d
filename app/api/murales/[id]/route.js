import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/murales/[id]
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    const mural = await prisma.mural.findUnique({
      where: { id: Number(id) },
      include: {
        sala: {
          select: {
            id: true,
            nombre: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!mural) {
      return new Response(
        JSON.stringify({
          error: "Mural no encontrado",
          message: `No se encontró un mural con ID ${id}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(mural), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener mural por ID:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener el mural",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT /api/murales/[id]
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const data = await req.json();
    // data puede incluir cualquier campo del mural
    const mural = await prisma.mural.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre,
        tecnica: data.tecnica,
        anio: data.anio,
        ubicacion: data.ubicacion,
        url_imagen: data.url_imagen,
        autor: data.autor,
        colaboradores: data.colaboradores,
        medidas: data.medidas,
      },
    });
    return new Response(JSON.stringify(mural), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// DELETE /api/murales/[id]
export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    await prisma.mural.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

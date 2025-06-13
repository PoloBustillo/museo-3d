import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/salas/[id]
export async function PUT(req, { params }) {
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

// DELETE /api/salas/[id]
export async function DELETE(req, { params }) {
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

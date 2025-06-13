import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/salas
export async function POST(req) {
  try {
    const data = await req.json();
    // data debe incluir: ownerId, nombre, colaboradores (array de userId), murales (array de muralId)
    const sala = await prisma.sala.create({
      data: {
        owner: { connect: { id: data.ownerId } },
        colaboradores: {
          connect: data.colaboradores?.map((id) => ({ id })) || [],
        },
        murales: { connect: data.murales?.map((id) => ({ id })) || [] },
        nombre: data.nombre || undefined,
      },
      include: {
        owner: true,
        colaboradores: true,
        murales: true,
      },
    });
    return new Response(JSON.stringify(sala), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

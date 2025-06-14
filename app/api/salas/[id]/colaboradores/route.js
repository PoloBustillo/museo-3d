import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/salas/[id]/colaboradores
export async function POST(req, { params }) {
  const { id } = params;
  try {
    const data = await req.json();
    // data: { colaboradores: [userId, ...] }
    const sala = await prisma.sala.update({
      where: { id: Number(id) },
      data: {
        colaboradores: {
          connect: data.colaboradores.map((userId) => ({ id: userId })),
        },
      },
      include: { colaboradores: true },
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

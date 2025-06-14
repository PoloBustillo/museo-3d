import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/salas/[id]/murales
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const sala = await prisma.sala.findUnique({
      where: { id: Number(id) },
      include: {
        murales: true,
      },
    });
    if (!sala) {
      return new Response(JSON.stringify({ error: "Sala no encontrada" }), {
        status: 404,
      });
    }
    // Suponiendo que url_imagen ya es la URL de Cloudinary
    return new Response(JSON.stringify(sala.murales), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// POST /api/salas/[id]/murales
export async function POST(req, { params }) {
  const { id } = params;
  try {
    const data = await req.json();
    // data: { murales: [muralId, ...] }
    const sala = await prisma.sala.update({
      where: { id: Number(id) },
      data: {
        murales: {
          connect: data.murales.map((muralId) => ({ id: muralId })),
        },
      },
      include: { murales: true },
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

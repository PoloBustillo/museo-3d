import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Función para obtener el cliente de Prisma
async function getPrismaClient() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prisma = await getPrismaClient();

    const record = await prisma.personalCollection.findUnique({
      where: { userId: parseInt(session.user.id) },
    });

    await prisma.$disconnect();

    return Response.json(record ? record.data : []);
  } catch (error) {
    console.error("Error al obtener colección:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await req.json();
    const prisma = await getPrismaClient();

    await prisma.personalCollection.upsert({
      where: { userId: parseInt(session.user.id) },
      update: { data },
      create: {
        userId: parseInt(session.user.id),
        data,
      },
    });

    await prisma.$disconnect();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error al guardar colección:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

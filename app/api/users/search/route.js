import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    if (query.length < 2) {
      return NextResponse.json({
        users: [],
        message: "Escribe al menos 2 caracteres para buscar",
      });
    }

    // Buscar usuarios por nombre y email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            // Excluir al usuario actual
            id: {
              not: session.user.id,
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: [
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name || "Sin nombre",
        email: user.email,
        image: user.image || "/placeholder-image.jpg",
      })),
      total: users.length,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

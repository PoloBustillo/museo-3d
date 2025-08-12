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
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
    const includePublic = searchParams.get("includePublic") === "true";

    // Construir condiciones de búsqueda
    const whereConditions = {
      AND: [
        {
          // Excluir murales eliminados
          deletedAt: null,
        },
        {
          // Incluir obras del usuario actual O obras públicas de otros usuarios
          OR: [
            {
              // Obras del usuario actual
              userId: session.user.id,
            },
            ...(includePublic
              ? [
                  {
                    // Obras públicas de otros usuarios
                    AND: [
                      {
                        publica: true,
                      },
                      {
                        userId: {
                          not: session.user.id,
                        },
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
        // Si hay query de búsqueda, buscar en título, descripción y técnica
        ...(query.length >= 2
          ? [
              {
                OR: [
                  {
                    titulo: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    descripcion: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    tecnica: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    // Obtener murales
    const murales = await prisma.mural.findMany({
      where: whereConditions,
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        anio: true,
        tecnica: true,
        dimensiones: true,
        url_imagen: true,
        imagenUrlWebp: true,
        videoUrl: true,
        audioUrl: true,
        publica: true,
        destacada: true,
        visitas: true,
        orden: true,
        salaId: true,
        userId: true,
        createdAt: true,
        // Incluir información del autor para obras públicas
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ destacada: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
    });

    // Obtener total para paginación
    const total = await prisma.mural.count({
      where: whereConditions,
    });

    return NextResponse.json({
      murales: murales.map((mural) => ({
        id: mural.id,
        titulo: mural.titulo || "Sin título",
        descripcion: mural.descripcion || "",
        anio: mural.anio,
        tecnica: mural.tecnica || "Técnica no especificada",
        dimensiones: mural.dimensiones || "",
        imagen:
          mural.imagenUrlWebp || mural.url_imagen || "/placeholder-image.jpg",
        videoUrl: mural.videoUrl,
        audioUrl: mural.audioUrl,
        publica: mural.publica,
        destacada: mural.destacada,
        visitas: mural.visitas || 0,
        enSala: mural.salaId !== null,
        salaId: mural.salaId,
        isOwn: mural.userId === session.user.id,
        author:
          mural.userId === session.user.id
            ? null
            : mural.user
              ? {
                  id: mural.user.id,
                  name: mural.user.name || "Usuario anónimo",
                  image: mural.user.image,
                }
              : null,
        createdAt: mural.createdAt,
      })),
      total,
      hasMore: offset + limit < total,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching murales:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

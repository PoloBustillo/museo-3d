import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/salas - Obtener todas las salas
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    // Construir filtros dinámicamente
    const where = {};
    if (ownerId) where.ownerId = Number(ownerId);

    const salas = await prisma.sala.findMany({
      where,
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
            tecnica: true,
            anio: true,
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
      orderBy: [{ nombre: "asc" }],
    });

    // Agregar estadísticas
    const stats = {
      total: salas.length,
      totalMurales: salas.reduce((acc, sala) => acc + sala._count.murales, 0),
      totalColaboradores: salas.reduce(
        (acc, sala) => acc + sala._count.colaboradores,
        0
      ),
      salasConMurales: salas.filter((sala) => sala._count.murales > 0).length,
    };

    return new Response(
      JSON.stringify({
        salas,
        estadisticas: stats,
        filtros: {
          ownerId: ownerId || null,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener salas:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener salas",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST /api/salas - Crear una nueva sala
export async function POST(req) {
  try {
    const data = await req.json();

    // Validaciones
    if (!data.nombre || data.nombre.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Validación fallida",
          message: "El nombre de la sala es requerido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.ownerId) {
      return new Response(
        JSON.stringify({
          error: "Validación fallida",
          message: "El ID del propietario es requerido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar que el usuario propietario exista
    const owner = await prisma.user.findUnique({
      where: { id: Number(data.ownerId) },
    });

    if (!owner) {
      return new Response(
        JSON.stringify({
          error: "Usuario no encontrado",
          message: `No se encontró un usuario con ID ${data.ownerId}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear la sala
    const sala = await prisma.sala.create({
      data: {
        nombre: data.nombre.trim(),
        owner: { connect: { id: Number(data.ownerId) } },
        colaboradores: {
          connect: data.colaboradores?.map((id) => ({ id: Number(id) })) || [],
        },
        murales: {
          connect: data.murales?.map((id) => ({ id: Number(id) })) || [],
        },
      },
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
            tecnica: true,
            anio: true,
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

    return new Response(JSON.stringify(sala), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al crear sala:", error);

    // Manejo específico de errores de Prisma
    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({
          error: "Conflicto de datos",
          message: "Ya existe una sala con ese nombre para este propietario",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error.code === "P2025") {
      return new Response(
        JSON.stringify({
          error: "Datos relacionados no encontrados",
          message: "Uno o más usuarios/murales especificados no existen",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al crear la sala",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

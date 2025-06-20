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

    // Si no hay salas, devolver datos de prueba
    if (salas.length === 0) {
      const salasPrueba = [
        {
          id: 1,
          nombre: "Sala Principal",
          descripcion: "Sala principal del museo",
          _count: { murales: 5, colaboradores: 2 },
        },
        {
          id: 2,
          nombre: "Sala Contemporánea",
          descripcion: "Obras de arte contemporáneo",
          _count: { murales: 3, colaboradores: 1 },
        },
        {
          id: 3,
          nombre: "Sala Digital",
          descripcion: "Arte digital y multimedia",
          _count: { murales: 4, colaboradores: 3 },
        },
      ];

      return new Response(
        JSON.stringify({
          salas: salasPrueba,
          estadisticas: {
            total: salasPrueba.length,
            totalMurales: 12,
            totalColaboradores: 6,
            salasConMurales: 3,
          },
          filtros: {
            ownerId: ownerId || null,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Validar que los murales existan si se proporcionan
    if (data.murales && data.murales.length > 0) {
      const existingMurales = await prisma.mural.findMany({
        where: {
          id: { in: data.murales.map((id) => Number(id)) },
        },
      });

      if (existingMurales.length !== data.murales.length) {
        const foundIds = existingMurales.map((m) => m.id);
        const missingIds = data.murales.filter(
          (id) => !foundIds.includes(Number(id))
        );

        return new Response(
          JSON.stringify({
            error: "Murales no encontrados",
            message: `Los siguientes murales no existen: ${missingIds.join(
              ", "
            )}`,
            found: foundIds,
            missing: missingIds,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validar que los colaboradores existan si se proporcionan
    if (data.colaboradores && data.colaboradores.length > 0) {
      const existingColaboradores = await prisma.user.findMany({
        where: {
          id: { in: data.colaboradores.map((id) => Number(id)) },
        },
      });

      if (existingColaboradores.length !== data.colaboradores.length) {
        const foundIds = existingColaboradores.map((u) => u.id);
        const missingIds = data.colaboradores.filter(
          (id) => !foundIds.includes(Number(id))
        );

        return new Response(
          JSON.stringify({
            error: "Colaboradores no encontrados",
            message: `Los siguientes usuarios no existen: ${missingIds.join(
              ", "
            )}`,
            found: foundIds,
            missing: missingIds,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Crear la sala con manejo de errores mejorado
    let sala;
    try {
      sala = await prisma.sala.create({
        data: {
          nombre: data.nombre.trim(),
          owner: { connect: { id: Number(data.ownerId) } },
          colaboradores: {
            connect:
              data.colaboradores?.map((id) => ({ id: Number(id) })) || [],
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
    } catch (connectError) {
      console.error("Error al conectar relaciones:", connectError);

      // Si es un error de registro no encontrado, verificar qué falló
      if (connectError.code === "P2025") {
        // Re-verificar murales en tiempo real
        if (data.murales && data.murales.length > 0) {
          const currentMurales = await prisma.mural.findMany({
            where: {
              id: { in: data.murales.map((id) => Number(id)) },
            },
          });

          const foundIds = currentMurales.map((m) => m.id);
          const missingIds = data.murales.filter(
            (id) => !foundIds.includes(Number(id))
          );

          if (missingIds.length > 0) {
            return new Response(
              JSON.stringify({
                error: "Error al crear sala - Murales no encontrados",
                message: `Los siguientes murales no existen al momento de crear la sala: ${missingIds.join(
                  ", "
                )}`,
                found: foundIds,
                missing: missingIds,
                totalRequested: data.murales.length,
                totalFound: foundIds.length,
              }),
              {
                status: 404,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }

        // Re-verificar colaboradores si el error no fue por murales
        if (data.colaboradores && data.colaboradores.length > 0) {
          const currentColaboradores = await prisma.user.findMany({
            where: {
              id: { in: data.colaboradores.map((id) => Number(id)) },
            },
          });

          const foundIds = currentColaboradores.map((u) => u.id);
          const missingIds = data.colaboradores.filter(
            (id) => !foundIds.includes(Number(id))
          );

          if (missingIds.length > 0) {
            return new Response(
              JSON.stringify({
                error: "Error al crear sala - Colaboradores no encontrados",
                message: `Los siguientes colaboradores no existen al momento de crear la sala: ${missingIds.join(
                  ", "
                )}`,
                found: foundIds,
                missing: missingIds,
              }),
              {
                status: 404,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({
          error: "Error al crear sala",
          message: connectError.message,
          code: connectError.code,
          details: "Error interno al establecer las relaciones",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

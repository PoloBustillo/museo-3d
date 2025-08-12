import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/salas/[id] - Obtener sala por ID (estructura extendida)
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    const s = await prisma.sala.findUnique({
      where: { id: Number(id) },
      include: {
        creador: { select: { id: true, name: true, email: true, role: true } },
        colaboradores: {
          select: {
            rol: true,
            createdAt: true,
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        murales: {
          include: {
            mural: {
              select: {
                id: true,
                titulo: true,
                autor: true,
                tecnica: true,
                anio: true,
                descripcion: true,
                url_imagen: true,
                imagenUrlWebp: true,
                latitud: true,
                longitud: true,
                ubicacion: true,
                artistId: true,
                artist: {
                  select: {
                    id: true,
                    bio: true,
                    especialidad: true,
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
        _count: { select: { murales: true, colaboradores: true } },
      },
    });

    if (!s) {
      return new Response(
        JSON.stringify({
          error: "Sala no encontrada",
          message: `No se encontró una sala con ID ${id}`,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const sala = {
      ...s,
      layout: (s.murales || []).map((sm) => ({
        muralId: sm.muralId,
        pos: { x: sm.posX ?? 0, y: sm.posY ?? 0, z: sm.posZ ?? 0 },
        rot: { x: sm.rotX ?? 0, y: sm.rotY ?? 0, z: sm.rotZ ?? 0 },
        scale: sm.scale ?? 1,
        wallId: sm.wallId || null,
        frameStyle: sm.frameStyle || null,
        spotlightIntensity: sm.spotlightIntensity ?? 1,
        metadata: sm.metadata || null,
        mural: sm.mural || null,
      })),
      scene: {
        lightingPreset: s.lightingPreset || null,
        ambientIntensity: s.ambientIntensity ?? 0.8,
        fog: s.fogColor ? { color: s.fogColor, near: s.fogNear ?? 0, far: s.fogFar ?? 0 } : null,
        audioZones: s.audioZones || null,
        navigationMeshId: s.navigationMeshId || null,
        layoutVersion: s.layoutVersion ?? 1,
      },
    };

    return new Response(JSON.stringify({ sala }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener sala por ID:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener la sala",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/salas/[id] - Actualizar sala por ID (mantener implementación existente)
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    const data = await req.json();
    const updateData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      publica: data.publica,
    };
    if (data.creadorId) {
      updateData.creador = { connect: { id: data.creadorId } };
    }
    if (data.colaboradores) {
      updateData.colaboradores = {
        set: data.colaboradores.map((id) => ({ id })),
      };
    }
    if (data.murales) {
      await prisma.salaMural.deleteMany({ where: { salaId: Number(id) } });
      updateData.murales = {
        create: data.murales.map((muralId) => ({
          mural: { connect: { id: Number(muralId) } },
        })),
      };
    }

    const salaUpdated = await prisma.sala.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        creador: { select: { id: true, name: true, email: true, role: true } },
        colaboradores: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        murales: {
          include: {
            mural: { select: { id: true, titulo: true, autor: true, tecnica: true, anio: true, url_imagen: true } },
          },
        },
        _count: { select: { murales: true, colaboradores: true } },
      },
    });

    return new Response(JSON.stringify(salaUpdated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al actualizar sala:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al actualizar la sala",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/salas/[id] - Eliminar sala por ID (igual que antes)
export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;

  try {
    await prisma.sala.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error al eliminar sala:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al eliminar la sala",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

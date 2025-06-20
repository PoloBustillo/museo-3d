import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth.js";

const prisma = new PrismaClient();

// GET /api/usuarios/[id] - Obtener usuario por ID
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar permisos: solo admin o el propio usuario
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        settings: true,
        salasPropias: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            publica: true,
            createdAt: true,
            _count: {
              select: {
                murales: true,
                colaboradores: true,
              },
            },
          },
        },
        salasColabora: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            publica: true,
            createdAt: true,
            _count: {
              select: {
                murales: true,
                colaboradores: true,
              },
            },
          },
        },
        personalCollection: {
          select: {
            id: true,
            items: {
              select: {
                id: true,
                artworkId: true,
                artworkType: true,
                addedAt: true,
              },
            },
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
        _count: {
          select: {
            salasPropias: true,
            salasColabora: true,
            personalCollection: true,
          },
        },
      },
    });

    if (!usuario) {
      return new Response(
        JSON.stringify({
          error: "Usuario no encontrado",
          message: `No se encontró un usuario con ID ${id}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(usuario), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener el usuario",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT /api/usuarios/[id] - Actualizar usuario
export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar permisos: solo admin o el propio usuario
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await req.json();

    // Preparar datos de actualización
    const updateData = {};

    // Campos que cualquier usuario puede actualizar
    if (data.name !== undefined) updateData.name = data.name;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.settings !== undefined) updateData.settings = data.settings;

    // Campos que solo admin puede actualizar
    if (session.user.role === "ADMIN") {
      if (data.email !== undefined) updateData.email = data.email;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.emailVerified !== undefined) {
        updateData.emailVerified = data.emailVerified
          ? new Date(data.emailVerified)
          : null;
      }
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        settings: true,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Usuario actualizado exitosamente",
        usuario,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al actualizar el usuario",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario (solo admin)
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Solo admin puede eliminar usuarios
    if (session.user.role !== "ADMIN") {
      return new Response(
        JSON.stringify({
          error: "Acceso denegado - Se requieren permisos de administrador",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // No permitir que un admin se elimine a sí mismo
    if (session.user.id === id) {
      return new Response(
        JSON.stringify({ error: "No puedes eliminar tu propia cuenta" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({
        message: "Usuario eliminado exitosamente",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al eliminar el usuario",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

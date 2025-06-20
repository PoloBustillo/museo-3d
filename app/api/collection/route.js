import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth.js";

const prisma = new PrismaClient();

// GET /api/collection - Obtener colección personal del usuario
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    console.log("🔍 Debug - Session user ID:", userId);
    console.log("🔍 Debug - Session user:", session.user);

    // Verificar que el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("❌ Usuario no encontrado en la base de datos:", userId);
      return new Response(
        JSON.stringify({
          error: "Usuario no encontrado",
          message: "El usuario no existe en la base de datos",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar o crear la colección personal del usuario
    let collection = await prisma.personalCollection.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!collection) {
      // Crear colección si no existe
      console.log("🆕 Creando nueva colección personal para usuario:", userId);
      collection = await prisma.personalCollection.create({
        data: { userId },
        include: {
          items: {
            orderBy: { addedAt: "desc" },
          },
        },
      });
    }

    return new Response(JSON.stringify(collection), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener colección personal:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener la colección",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST /api/collection - Agregar item a la colección personal
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    console.log("🔍 Debug - POST - Session user ID:", userId);

    // Verificar que el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("❌ Usuario no encontrado en la base de datos:", userId);
      return new Response(
        JSON.stringify({
          error: "Usuario no encontrado",
          message: "El usuario no existe en la base de datos",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await req.json();

    // Validar datos requeridos
    if (!data.artworkId || !data.artworkType) {
      return new Response(
        JSON.stringify({
          error: "Datos incompletos",
          message: "artworkId y artworkType son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar o crear la colección personal
    let collection = await prisma.personalCollection.findUnique({
      where: { userId },
    });

    if (!collection) {
      collection = await prisma.personalCollection.create({
        data: { userId },
      });
    }

    // Verificar si el item ya existe en la colección
    const existingItem = await prisma.personalCollectionItem.findFirst({
      where: {
        collectionId: collection.id,
        artworkId: data.artworkId,
        artworkType: data.artworkType,
      },
    });

    if (existingItem) {
      return new Response(
        JSON.stringify({
          error: "Item ya existe en la colección",
          message: "Este item ya está en tu colección personal",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Agregar item a la colección
    const item = await prisma.personalCollectionItem.create({
      data: {
        collectionId: collection.id,
        artworkId: data.artworkId,
        artworkType: data.artworkType,
        artworkData: data.artworkData || {},
      },
    });

    return new Response(
      JSON.stringify({
        message: "Item agregado exitosamente a la colección",
        item,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al agregar item a la colección:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al agregar item",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE /api/collection - Eliminar item de la colección personal
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    console.log("🔍 Debug - DELETE - Session user ID:", userId);

    // Verificar que el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("❌ Usuario no encontrado en la base de datos:", userId);
      return new Response(
        JSON.stringify({
          error: "Usuario no encontrado",
          message: "El usuario no existe en la base de datos",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return new Response(
        JSON.stringify({
          error: "ID de item requerido",
          message: "Debes proporcionar el itemId como parámetro de consulta",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar la colección del usuario
    const collection = await prisma.personalCollection.findUnique({
      where: { userId },
    });

    if (!collection) {
      return new Response(
        JSON.stringify({
          error: "Colección no encontrada",
          message: "No se encontró una colección personal para este usuario",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Eliminar el item
    await prisma.personalCollectionItem.delete({
      where: {
        id: Number(itemId),
        collectionId: collection.id, // Asegurar que pertenece al usuario
      },
    });

    return new Response(
      JSON.stringify({
        message: "Item eliminado exitosamente de la colección",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar item de la colección:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al eliminar item",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

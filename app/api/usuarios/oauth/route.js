import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/usuarios/oauth - Crear usuario OAuth (sin autenticación)
export async function POST(req) {
  try {
    const data = await req.json();
    console.log("🆕 OAuth - Creando usuario:", data.email);

    if (!data.email || !data.name) {
      console.log("❌ OAuth - Datos incompletos");
      return new Response(
        JSON.stringify({
          error: "Datos incompletos",
          message: "email y name son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log("👤 OAuth - Usuario ya existe:", data.email);
      return new Response(
        JSON.stringify({
          message: "Usuario ya existe",
          usuario: existingUser,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear usuario OAuth
    const usuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || "USER",
        image: data.image,
        emailVerified: data.emailVerified
          ? new Date(data.emailVerified)
          : new Date(),
        settings: data.settings || {},
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
      },
    });

    console.log("✅ OAuth - Usuario creado:", usuario.id);

    return new Response(
      JSON.stringify({
        message: "Usuario OAuth creado exitosamente",
        usuario,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ OAuth - Error al crear usuario:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al crear usuario OAuth",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

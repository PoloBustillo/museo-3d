import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/usuarios/test - Crear usuario (sin autenticación para testing)
export async function POST(req) {
  try {
    const data = await req.json();
    console.log("🔍 Test - Datos recibidos para crear usuario:", data);

    if (!data.email || !data.name) {
      console.log("❌ Test - Datos incompletos");
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

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log("❌ Test - Usuario ya existe:", data.email);
      return new Response(
        JSON.stringify({
          error: "Usuario ya existe",
          message: "Ya existe un usuario con ese email",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("🆕 Test - Creando usuario en la base de datos:", data);

    const usuario = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || "USER",
        image: data.image,
        settings: data.settings || {},
      },
    });

    console.log("✅ Test - Usuario creado:", usuario);

    return new Response(
      JSON.stringify({
        message: "Usuario creado exitosamente (test)",
        usuario,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Test - Error al crear usuario:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al crear usuario",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

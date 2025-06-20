import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/usuarios/email/[email] - Verificar disponibilidad de email
export async function GET(req, context) {
  try {
    const params = await context.params;
    const { email } = params;

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email requerido",
          message: "Debes proporcionar un email para verificar",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuario con ese email
    const { searchParams } = new URL(req.url);
    const includePassword = searchParams.get("includePassword") === "true";

    const usuario = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        settings: true,
        ...(includePassword && { password: true }),
      },
    });

    return new Response(
      JSON.stringify({
        email,
        available: !usuario,
        exists: !!usuario,
        user: usuario || null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al verificar email:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al verificar email",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

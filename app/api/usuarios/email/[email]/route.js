import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/usuarios/email/[email]
export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        creadoEn: true,
        provider: true,
        password: true,
        roles: { select: { role: { select: { name: true } } } },
        settings: { select: { key: true, value: true } },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Formatea los roles y settings para que sean arrays simples
    const roles = user.roles.map((r) => r.role.name);
    const settings = Object.fromEntries(
      user.settings.map((s) => [s.key, s.value])
    );
    const { password, ...userWithoutPassword } = user;
    return new Response(
      JSON.stringify({ ...userWithoutPassword, roles, settings }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/usuarios
export async function POST(req) {
  try {
    const data = await req.json();
    // data: { email, password, role, provider }
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role || "user",
        provider: data.provider || null,
      },
    });
    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

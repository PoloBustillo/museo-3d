import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/usuarios
export async function POST(req) {
  try {
    const data = await req.json();
    // data: { email, password?, name?, image?, emailVerified?, role?, provider? }
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password || null,
        name: data.name || null,
        image: data.image || null,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
        role: data.role || "user",
        provider: data.provider || null,
      },
    });
    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// GET /api/usuarios
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        creadoEn: true,
        role: true,
        provider: true,
        // No incluir password por seguridad
      },
    });
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

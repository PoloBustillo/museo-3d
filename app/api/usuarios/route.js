import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/usuarios
export async function POST(req) {
  try {
    const data = await req.json();
    // data: { email, password?, name?, image?, emailVerified?, provider?, settings?, roles? }

    // 1. Crear el usuario
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password || null,
        name: data.name || null,
        image: data.image || null,
        emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
        provider: data.provider || null,
      },
    });

    // 2. Asignar roles (por nombre, ej: ["user"])
    const roles = data.roles || ["user"];
    for (const roleName of roles) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    // 3. Guardar configuraciones personalizadas (opcional)
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await prisma.userSetting.create({
          data: {
            userId: user.id,
            key,
            value: String(value),
          },
        });
      }
    }

    // Devuelve el usuario sin password
    const { password, ...userWithoutPassword } = user;
    return new Response(JSON.stringify(userWithoutPassword), {
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
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (name) {
    try {
      const user = await prisma.user.findFirst({ where: { name } });
      return new Response(JSON.stringify({ available: !user }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
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

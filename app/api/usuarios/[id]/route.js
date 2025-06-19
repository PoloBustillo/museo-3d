import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/usuarios/[id]
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        creadoEn: true,
        provider: true,
        roles: {
          select: {
            role: { select: { name: true } },
          },
        },
        settings: {
          select: { key: true, value: true },
        },
      },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
      });
    }
    // Formatea los roles y settings para que sean arrays simples
    const roles = user.roles.map((r) => r.role.name);
    const settings = Object.fromEntries(
      user.settings.map((s) => [s.key, s.value])
    );
    return new Response(JSON.stringify({ ...user, roles, settings }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// PUT /api/usuarios/[id]
export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const data = await req.json();
    // data: { roles?, settings?, ...otrosCampos }

    // Actualizar campos básicos del usuario si se envían
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.image) updateData.image = data.image;
    if (data.email) updateData.email = data.email;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Actualizar roles si se envían
    if (data.roles) {
      // Elimina roles actuales
      await prisma.userRole.deleteMany({ where: { userId: user.id } });
      // Asigna nuevos roles
      for (const roleName of data.roles) {
        const role = await prisma.role.findUnique({
          where: { name: roleName },
        });
        if (role) {
          await prisma.userRole.create({
            data: { userId: user.id, roleId: role.id },
          });
        }
      }
    }

    // Actualizar configuraciones si se envían
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await prisma.userSetting.upsert({
          where: { userId_key: { userId: user.id, key } },
          update: { value: String(value) },
          create: { userId: user.id, key, value: String(value) },
        });
      }
    }

    return new Response(JSON.stringify({ message: "Usuario actualizado" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// DELETE /api/usuarios/[id]
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/usuarios/[id]
export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const data = await req.json();
    // data puede incluir: email, password, role, provider, name, image
    const user = await prisma.user.update({
      where: { id: isNaN(Number(id)) ? id : Number(id) },
      data: {
        email: data.email,
        password: data.password,
        role: data.role,
        provider: data.provider,
        ...(data.name && { name: data.name }),
        ...(data.image && { image: data.image }),
      },
    });
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
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

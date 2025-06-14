import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/murales/[id]
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    const data = await req.json();
    // data puede incluir cualquier campo del mural
    const mural = await prisma.mural.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre,
        tecnica: data.tecnica,
        anio: data.anio,
        ubicacion: data.ubicacion,
        url_imagen: data.url_imagen,
        autor: data.autor,
        colaboradores: data.colaboradores,
        medidas: data.medidas,
      },
    });
    return new Response(JSON.stringify(mural), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// DELETE /api/murales/[id]
export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;
  try {
    await prisma.mural.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

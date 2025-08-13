import { prisma } from "../../../../../lib/prisma.js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth.js";

// GET /api/usuarios/[id]/collection?muralId=123  -> lista o verificación
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const muralIdParam = searchParams.get("muralId");
    if (muralIdParam) {
      const muralId = parseInt(muralIdParam, 10);
      if (isNaN(muralId)) {
        return new Response(JSON.stringify({ error: "muralId inválido" }), { status: 400 });
      }
      const fav = await prisma.userMuralFavorite.findUnique({ where: { userId_muralId: { userId: id, muralId } } });
      return new Response(JSON.stringify({ isFavorite: !!fav }), { status: 200 });
    }
    const favorites = await prisma.userMuralFavorite.findMany({
      where: { userId: id },
      select: { muralId: true, addedAt: true, mural: { select: { id: true, titulo: true, autor: true, imagenUrlWebp: true, url_imagen: true } } },
      orderBy: { addedAt: 'desc' }
    });
    return new Response(JSON.stringify({ favorites }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

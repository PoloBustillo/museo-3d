import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const { id } = await params;
  if (!id) return new Response("ID requerido", { status: 400 });

  // Invalidate email
  await prisma.user.update({
    where: { id },
    data: { emailVerified: null },
  });

  // Remove subscription (adjust model name if needed)
  await prisma.subscription.deleteMany({
    where: { userId: id },
  });

  return new Response("Email invalidado y suscripción eliminada", { status: 200 });
}

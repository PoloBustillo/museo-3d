import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth.js";

const prisma = new PrismaClient();

// GET /api/usuarios/[id]/account - Obtener información de Account del usuario
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const { id } = params;

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar permisos: solo admin o el propio usuario
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar las cuentas del usuario
    const accounts = await prisma.account.findMany({
      where: { userId: id },
      select: {
        id: true,
        type: true,
        provider: true,
        providerAccountId: true,
        expires_at: true,
        token_type: true,
        scope: true,
      },
    });

    // Si no hay cuentas, es un usuario de credentials
    if (accounts.length === 0) {
      return new Response(
        JSON.stringify({
          accounts: [],
          primaryProvider: "credentials",
          accountType: "credentials",
          hasOAuth: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Si hay cuentas, usar la primera como principal
    const primaryAccount = accounts[0];

    return new Response(
      JSON.stringify({
        accounts,
        primaryProvider: primaryAccount.provider,
        accountType: primaryAccount.type,
        hasOAuth: true,
        expiresAt: primaryAccount.expires_at
          ? new Date(primaryAccount.expires_at * 1000).toISOString()
          : null,
        tokenType: primaryAccount.token_type,
        scope: primaryAccount.scope,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al obtener información de cuenta:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al obtener información de cuenta",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

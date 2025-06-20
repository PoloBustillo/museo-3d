import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth.js";
import jwt from "jsonwebtoken";

// POST /api/auth/token - Obtener token JWT para Postman
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({
          error: "No autorizado",
          message: "Debes estar autenticado para obtener un token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role || "USER",
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "24h" }
    );

    return new Response(
      JSON.stringify({
        message: "Token generado exitosamente",
        token: token,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        },
        expiresIn: "24h",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generando token:", error);
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// GET /api/auth/token - Verificar token
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Token requerido",
          message: "Debes proporcionar un token para verificar",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);

    return new Response(
      JSON.stringify({
        message: "Token válido",
        user: decoded,
        valid: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Token inválido",
        message: "El token proporcionado no es válido",
        valid: false,
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

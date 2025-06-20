import jwt from "jsonwebtoken";

/**
 * Verifica un token JWT y retorna los datos del usuario
 * @param {string} token - Token JWT a verificar
 * @returns {object|null} - Datos del usuario o null si el token es inválido
 */
export function verifyToken(token) {
  try {
    if (!token) {
      return null;
    }

    // Remover "Bearer " si está presente
    const cleanToken = token.replace(/^Bearer\s/, "");

    const decoded = jwt.verify(cleanToken, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (error) {
    console.error("Error verificando token:", error.message);
    return null;
  }
}

/**
 * Middleware para verificar autenticación en APIs
 * @param {Request} req - Request object
 * @returns {object|null} - Datos del usuario autenticado o null
 */
export async function verifyAuth(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return null;
    }

    const user = verifyToken(authHeader);
    return user;
  } catch (error) {
    console.error("Error en verificación de auth:", error);
    return null;
  }
}

/**
 * Middleware para verificar si el usuario es admin
 * @param {Request} req - Request object
 * @returns {object|null} - Datos del usuario admin o null
 */
export async function verifyAdmin(req) {
  const user = await verifyAuth(req);

  if (!user) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return null;
  }

  return user;
}

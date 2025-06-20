// Helper script para autenticación en Postman
// Uso: Copiar y pegar en la pestaña "Tests" de Postman

// Función para extraer token de la respuesta de login
function extractAuthToken(response) {
  try {
    const data = response.json();

    // Si la respuesta tiene un token JWT
    if (data.token) {
      pm.environment.set("auth_token", data.token);
      console.log("✅ Token JWT guardado");
      return data.token;
    }

    // Si la respuesta tiene un access_token
    if (data.access_token) {
      pm.environment.set("auth_token", data.access_token);
      console.log("✅ Access token guardado");
      return data.access_token;
    }

    // Si la respuesta tiene session data
    if (data.user && data.user.id) {
      pm.environment.set("user_id", data.user.id);
      console.log("✅ User ID guardado:", data.user.id);
    }
  } catch (error) {
    console.error("❌ Error extrayendo token:", error);
  }
}

// Función para agregar Bearer token automáticamente
function addBearerToken() {
  const token = pm.environment.get("auth_token");
  if (token) {
    pm.request.headers.add({
      key: "Authorization",
      value: `Bearer ${token}`,
    });
    console.log("🔐 Bearer token agregado automáticamente");
  } else {
    console.warn("⚠️ No hay token disponible");
  }
}

// Función para verificar si el usuario está autenticado
function checkAuthStatus(response) {
  if (response.code === 401) {
    console.error("❌ No autorizado - Necesitas hacer login primero");
    console.log(
      "💡 Sugerencia: Ejecuta el endpoint de login antes de continuar"
    );
  } else if (response.code === 403) {
    console.error("❌ Acceso denegado - No tienes permisos suficientes");
  }
}

// Exportar funciones para uso en Postman
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    extractAuthToken,
    addBearerToken,
    checkAuthStatus,
  };
}

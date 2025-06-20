# 🔐 Guía de Autenticación para Postman

## 📋 Resumen

Este proyecto soporta dos tipos de autenticación:

1. **Sesiones de NextAuth** (para el frontend)
2. **Tokens JWT** (para APIs y Postman)

## 🚀 Configuración Rápida

### 1. Importar la Colección

1. Abre Postman
2. Importa el archivo `Museo-3D-API-v5.postman_collection.json`
3. Configura las variables de entorno

### 2. Variables de Entorno

```json
{
  "base_url": "http://localhost:3002",
  "auth_token": "",
  "user_id": ""
}
```

## 🔑 Obtener Token JWT

### Opción 1: Desde el Frontend (Recomendado)

1. Ve a tu aplicación en el navegador
2. Haz login con tu cuenta
3. Abre las DevTools (F12)
4. Ve a la pestaña "Application" > "Cookies"
5. Copia el valor de `next-auth.session-token`
6. Usa este token en Postman

### Opción 2: Endpoint de Token

```http
POST {{base_url}}/api/auth/token
Content-Type: application/json

# Requiere estar autenticado en el navegador primero
```

## 📝 Uso en Postman

### Headers Automáticos

Para endpoints que requieren autenticación, agrega este header:

```
Authorization: Bearer {{auth_token}}
```

### Script de Test para Extraer Token

```javascript
// En la pestaña "Tests" del endpoint de login
if (pm.response.code === 200) {
  const data = pm.response.json();
  if (data.token) {
    pm.environment.set("auth_token", data.token);
    console.log("✅ Token guardado");
  }
}
```

## 🛡️ Endpoints por Nivel de Autenticación

### 🔓 Públicos (Sin autenticación)

- `GET /api/murales` - Listar murales
- `GET /api/artists` - Listar artistas
- `GET /api/salas` - Listar salas

### 🔐 Autenticados (Requieren login)

- `POST /api/artists` - Crear artista
- `PUT /api/artists/:id` - Actualizar artista
- `POST /api/collection` - Agregar a colección
- `GET /api/collection` - Ver colección personal

### 👑 Admin (Solo administradores)

- `DELETE /api/artists/:id` - Eliminar artista
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `POST /api/usuarios` - Crear usuario

## 🔧 Troubleshooting

### Error 401 - No autorizado

```javascript
// Verificar que el token esté configurado
console.log("Token:", pm.environment.get("auth_token"));

// Verificar que el header esté presente
pm.request.headers.each((header) => {
  if (header.key === "Authorization") {
    console.log("Auth header:", header.value);
  }
});
```

### Error 403 - Acceso denegado

- Verifica que tu usuario tenga el rol correcto
- Para endpoints admin, asegúrate de ser ADMIN

### Token Expirado

- Los tokens JWT expiran en 24 horas
- Regenera el token usando el endpoint `/api/auth/token`

## 📚 Ejemplos de Uso

### Crear un Artista

```http
POST {{base_url}}/api/artists
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "bio": "Artista urbano especializado en murales",
  "website": "https://ejemplo.com",
  "instagram": "@artista_ejemplo",
  "especialidad": "Muralismo urbano",
  "experiencia": "5 años"
}
```

### Verificar Token

```http
GET {{base_url}}/api/auth/token?token={{auth_token}}
```

## 🎯 Flujo de Trabajo Recomendado

1. **Configurar entorno** en Postman
2. **Hacer login** en el navegador
3. **Obtener token** usando el endpoint `/api/auth/token`
4. **Probar endpoints** con el token en el header Authorization
5. **Regenerar token** cuando expire

## 🔍 Debugging

### Verificar Sesión

```http
GET {{base_url}}/api/auth/session
```

### Verificar Token

```http
GET {{base_url}}/api/auth/token?token={{auth_token}}
```

### Logs del Servidor

Revisa la consola del servidor para ver logs de autenticación:

```bash
npm run dev
```

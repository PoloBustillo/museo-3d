# 📮 Colección Postman - Museo 3D API v3.0

## 🚀 ¿Qué hay de nuevo en v3.0?

### ✅ **Problemas Corregidos**
- **JSON Bodies corregidos:** Eliminados los caracteres `\n` problemáticos en los bodies
- **Saltos de línea apropiados:** Los JSON ahora tienen formato correcto y legible
- **URLs actualizadas:** Base URL cambiada a `localhost:3000`
- **Variables optimizadas:** Variables de environment simplificadas y actualizadas

### 🎯 **Colección Limpia y Optimizada**
- Endpoints esenciales para desarrollo y testing
- Tests automatizados mejorados
- Documentación actualizada
- JSON responses bien formateados

## 📋 Descripción
Esta colección de Postman contiene los endpoints principales del API del Museo Virtual 3D, con ejemplos limpios, tests automatizados y documentación completa.

## 🚀 Instalación Rápida

### 1. Importar Colección v3.0
1. Abre Postman
2. Haz clic en **"Import"** (esquina superior izquierda)
3. Arrastra y suelta o selecciona el archivo: `Museo-3D-API-v3.postman_collection.json`
4. La colección se importará automáticamente

### 2. Importar Environment Actualizado
1. En Postman, ve a **"Environments"** (panel izquierdo)
2. Haz clic en **"Import"**
3. Selecciona el archivo: `Museo-3D-Development.postman_environment.json`
4. Activa el environment "Museo 3D - Development v3.0"

## 📁 Estructura de la Colección

### 🎨 Murales
- **📋 Obtener todos los murales** - Lista completa con estadísticas
- **🆕 Crear mural (JSON)** - Crear con datos JSON limpios
- **🔍 Obtener mural por ID** - Detalles de un mural específico
- **✏️ Actualizar mural** - Modificar mural existente
- **🗑️ Eliminar mural** - Eliminar mural del museo

### 🏛️ Salas
- **📋 Obtener todas las salas** - Lista de salas con estadísticas
- **🔍 Filtrar salas por propietario** - Filtro por ID de propietario
- **🆕 Crear nueva sala** - Crear sala con murales y colaboradores
- **🔍 Obtener sala por ID** - Detalles completos de una sala
- **✏️ Actualizar sala** - Modificar sala existente
- **🗑️ Eliminar sala** - Eliminar sala del museo

### 🧪 Testing & Utilities
- **🏥 Health Check** - Verificar estado del servidor

## 🔧 Variables de Environment

```json
{
  "base_url": "http://localhost:3000",
  "production_url": "https://museo-3d.vercel.app",
  "api_version": "v1",
  "created_mural_id": "",
  "test_sala_id": "2",
  "created_sala_id": "",
  "test_user_id": "2",
  "timestamp": ""
}
```

### Variables Dinámicas
- `{{created_mural_id}}` - Se establece automáticamente al crear un mural
- `{{created_sala_id}}` - Se establece automáticamente al crear una sala
- `{{timestamp}}` - Se actualiza automáticamente en cada request
- `{{test_sala_id}}` - ID de sala para pruebas (Sala ARPA)
- `{{test_user_id}}` - ID de usuario para pruebas (propietario de salas)

## 🧪 Tests Automatizados

### Tests Incluidos
- ✅ Verificación de códigos de estado HTTP
- ✅ Validación de estructura de respuesta
- ✅ Verificación de propiedades requeridas
- ✅ Logging automático de errores
- ✅ Establecimiento de variables dinámicas

### Ejecutar Tests
1. Selecciona la colección completa
2. Haz clic en **"Run"**
3. Selecciona el environment "Museo 3D - Development v3.0"
4. Haz clic en **"Run Museo 3D - API Completa v3.0"**

## 📖 Flujos de Trabajo Recomendados

### 1. Flujo Básico de Testing
```text
Health Check → Obtener todas las salas → Crear nueva sala → Crear mural → Verificar relaciones
```

### 2. Flujo de Gestión de Salas
```text
Obtener todas las salas → Crear nueva sala → Obtener sala por ID → Actualizar sala → Eliminar sala
```

### 3. Flujo de Gestión de Murales
```text
Obtener todos los murales → Crear mural → Obtener mural por ID → Actualizar mural → Eliminar mural
```

## 📊 Ejemplos de JSON Bodies

### Crear Mural
```json
{
  "nombre": "Mural de Prueba",
  "autor": "Artista de Prueba",
  "tecnica": "Acrílico sobre muro",
  "anio": 2025,
  "ubicacion": "Pared de prueba",
  "url_imagen": "https://res.cloudinary.com/ejemplo/imagen.jpg",
  "medidas": "2.0 x 3.0 m",
  "salaId": 2
}
```

### Crear Sala
```json
{
  "nombre": "Sala de Prueba",
  "ownerId": 2,
  "murales": [15, 16, 17],
  "colaboradores": []
}
```

### Actualizar Sala
```json
{
  "nombre": "Sala ARPA Actualizada",
  "murales": [15, 16, 17, 18]
}
```

## 🚨 Códigos de Estado

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Recurso eliminado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto de datos |
| 500 | Internal Server Error | Error interno del servidor |

## 🔄 Cambio de Environment

### Development (Local)
```json
{
  "base_url": "http://localhost:3000"
}
```

### Production (Vercel)
```json
{
  "base_url": "https://museo-3d.vercel.app"
}
```

Para cambiar entre environments:
1. Ve a la esquina superior derecha de Postman
2. Selecciona el environment deseado
3. Los requests usarán automáticamente la URL correcta

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solución:** Verificar que el servidor esté ejecutándose con `npm run dev`

#### 2. JSON Mal Formateado
```
SyntaxError: Unexpected token in JSON
```
**Solución:** La v3.0 tiene todos los JSON bodies corregidos, esto no debería ocurrir

#### 3. Variables No Definidas
```
{{created_mural_id}} not found
```
**Solución:** Ejecutar primero el request de crear mural para establecer la variable

## 📞 Soporte

Si encuentras problemas:
1. Revisa la documentación del API en `API_DOCUMENTATION.md`
2. Verifica los logs del servidor
3. Consulta la consola de Postman para detalles de error
4. Asegúrate de usar la versión v3.0 de la colección

## 🎯 Diferencias entre Versiones

### v3.0 vs v2.0
- ✅ JSON bodies corregidos (sin `\n` problemáticos)
- ✅ URL base actualizada a `localhost:3000`
- ✅ Colección simplificada y optimizada
- ✅ Variables de environment actualizadas
- ✅ Tests mejorados y más robustos

---

**Versión:** 3.0.0  
**Última actualización:** Junio 2025  
**Compatibilidad:** Postman v10+  
**Recomendación:** Usar esta versión para desarrollo activo

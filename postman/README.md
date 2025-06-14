# 📮 Colección Postman - Museo 3D API

## 📋 Descripción
Esta colección de Postman contiene todos los endpoints del API del Museo Virtual 3D, con ejemplos, tests automatizados y documentación completa.

## 🚀 Instalación Rápida

### 1. Importar Colección
1. Abre Postman
2. Haz clic en **"Import"** (esquina superior izquierda)
3. Arrastra y suelta o selecciona el archivo: `Museo-3D-API-v2.postman_collection.json`
4. La colección se importará automáticamente

### 2. Importar Environment
1. En Postman, ve a **"Environments"** (panel izquierdo)
2. Haz clic en **"Import"**
3. Selecciona el archivo: `Museo-3D-Development.postman_environment.json`
4. Activa el environment "Museo 3D - Development"

## 📁 Estructura de la Colección

### 🎨 Murales
- **📋 Obtener todos los murales** - Lista completa con estadísticas
- **🔍 Filtrar murales por sala** - Filtro por ID de sala
- **👤 Buscar murales por autor** - Búsqueda parcial por autor
- **🎨 Filtrar por técnica artística** - Filtro por técnica
- **📅 Filtrar por año de creación** - Filtro por año
- **🔧 Filtros combinados (Avanzado)** - Múltiples filtros
- **➕ Crear mural (JSON)** - Crear con datos JSON
- **📤 Crear mural con imagen** - Crear subiendo archivo
- **🔍 Obtener mural por ID** - Detalles de un mural específico

### 🏛️ Salas
- **📋 Obtener todas las salas** - Lista de salas disponibles
- **🎭 Obtener murales de una sala** - Murales de una sala específica
- **🔍 Obtener sala por ID** - Detalles de una sala
- **👥 Obtener colaboradores de una sala** - Colaboradores por sala

### 👥 Usuarios
- **📋 Obtener todos los usuarios** - Lista de usuarios
- **🔍 Obtener usuario por ID** - Detalles de un usuario

### 📤 Upload
- **📷 Subir imagen** - Subir archivos a Cloudinary

### 🧪 Testing & Utilities
- **🏥 Health Check** - Verificar estado del servidor
- **📊 Estadísticas generales** - Métricas del museo

## 🔧 Configuración de Variables

### Variables de Environment
```json
{
  "base_url": "http://localhost:3001",
  "production_url": "https://museo-3d.vercel.app",
  "api_version": "v1",
  "test_sala_id": "4",
  "created_mural_id": "",
  "timestamp": ""
}
```

### Variables Dinámicas
- `{{created_mural_id}}` - Se establece automáticamente al crear un mural
- `{{timestamp}}` - Se actualiza automáticamente en cada request
- `{{test_sala_id}}` - ID de sala para pruebas (Sala ARPA)

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
3. Selecciona el environment
4. Haz clic en **"Run Museo 3D - API Completa v2.0"**

## 📖 Ejemplos de Uso

### 1. Flujo Básico de Testing
```
1. Health Check → Verificar servidor
2. Obtener todas las salas → Ver salas disponibles
3. Obtener todos los murales → Ver colección completa
4. Crear mural (JSON) → Agregar nuevo mural
5. Obtener mural por ID → Verificar creación
```

### 2. Flujo de Filtrado Avanzado
```
1. Filtrar murales por sala → Murales de Sala ARPA
2. Buscar por autor → Murales de autor específico
3. Filtrar por técnica → Murales con técnica específica
4. Filtros combinados → Búsqueda muy específica
```

### 3. Flujo de Upload de Imágenes
```
1. Subir imagen → Obtener URL de Cloudinary
2. Crear mural con imagen → Usar URL obtenida
3. Verificar creación → Confirmar mural con imagen
```

## 🔍 Filtros Disponibles

### Murales
- `salaId` - ID de sala (número)
- `autor` - Nombre del autor (texto parcial, insensible a mayúsculas)
- `tecnica` - Técnica artística (texto parcial, insensible a mayúsculas)
- `anio` - Año de creación (número exacto)

### Ejemplos de URLs
```
# Filtro simple
GET /api/murales?salaId=4

# Múltiples filtros
GET /api/murales?salaId=4&anio=2024&tecnica=acrílico

# Búsqueda por texto
GET /api/murales?autor=Rodriguez&tecnica=spray
```

## 📊 Respuestas del API

### Estructura de Respuesta - Murales
```json
{
  "murales": [
    {
      "id": 1,
      "nombre": "Nombre del Mural",
      "tecnica": "Técnica utilizada",
      "anio": 2024,
      "ubicacion": "Ubicación física",
      "url_imagen": "https://cloudinary.com/...",
      "autor": "Nombre del autor",
      "colaboradores": "Lista de colaboradores",
      "medidas": "Dimensiones",
      "salaId": 4,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "sala": {
        "id": 4,
        "nombre": "Nombre de la sala",
        "descripcion": "Descripción de la sala"
      }
    }
  ],
  "estadisticas": {
    "total": 10,
    "porSala": { "Sala ARPA": 5, "Sala Principal": 3 },
    "porTecnica": { "Acrílico": 4, "Spray": 3 },
    "porAnio": { "2024": 8, "2023": 2 }
  },
  "filtros": {
    "salaId": null,
    "autor": null,
    "tecnica": null,
    "anio": null
  }
}
```

## 🚨 Códigos de Estado

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos o faltantes |
| 404 | Not Found | Recurso no encontrado |
| 415 | Unsupported Media Type | Tipo de contenido no soportado |
| 500 | Internal Server Error | Error interno del servidor |

## 🔄 Cambio de Environment

### Development (Local)
```json
{
  "base_url": "http://localhost:3001"
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
Error: connect ECONNREFUSED 127.0.0.1:3001
```
**Solución:** Verificar que el servidor esté ejecutándose con `npm run dev`

#### 2. Error 404 en Endpoints
```
Cannot GET /api/murales
```
**Solución:** Verificar que la ruta del API esté correcta y el servidor iniciado

#### 3. Error de CORS
```
Access-Control-Allow-Origin header is missing
```
**Solución:** Verificar configuración de CORS en el servidor

#### 4. Error de Parsing JSON
```
SyntaxError: Unexpected token in JSON
```
**Solución:** Verificar que el Content-Type sea `application/json`

### Tests que Fallan
Si algún test falla:
1. Verificar que el servidor esté corriendo
2. Revisar la consola de Postman para logs detallados
3. Verificar que las variables de environment estén configuradas
4. Comprobar que la base de datos tenga datos de prueba

## 📞 Soporte

Si encuentras problemas:
1. Revisa la documentación del API en `API_DOCUMENTATION.md`
2. Verifica los logs del servidor
3. Consulta la consola de Postman para detalles de error
4. Asegúrate de que todas las dependencias estén instaladas

## 🔄 Actualizaciones

Para actualizar la colección:
1. Descarga la nueva versión
2. Elimina la colección anterior en Postman
3. Importa la nueva colección
4. Verifica que las variables de environment sigan configuradas

---

**Versión:** 2.0.0  
**Última actualización:** Junio 2025  
**Compatibilidad:** Postman v10+

# API de Murales - Museo Virtual 3D

## Descripción
API REST para gestionar murales en el Museo Virtual 3D. Permite crear, consultar y filtrar murales con diferentes criterios.

## URL Base
```
http://localhost:3001/api
```

## Endpoints Disponibles

### 📋 GET /api/murales
Obtiene todos los murales con estadísticas y filtros opcionales.

#### Parámetros de consulta (Query Parameters)
- `salaId` (opcional): ID de la sala para filtrar murales
- `autor` (opcional): Nombre del autor (búsqueda parcial e insensible a mayúsculas)
- `tecnica` (opcional): Técnica artística para filtrar
- `anio` (opcional): Año de creación del mural

#### Ejemplo de respuesta
```json
{
  "murales": [
    {
      "id": 1,
      "nombre": "Saturnino-Moon",
      "tecnica": "Acrílico sobre muro",
      "anio": 2024,
      "ubicacion": "Pared Este",
      "url_imagen": "https://cloudinary.com/imagen.jpg",
      "autor": "Miguel Fernando Lima Rodríguez",
      "colaboradores": "Pamela Sánchez Hernández",
      "medidas": "2.46 x 3.8m",
      "salaId": 4,
      "sala": {
        "id": 4,
        "nombre": "Sala ARPA",
        "descripcion": "Murales del programa ARPA"
      }
    }
  ],
  "estadisticas": {
    "total": 2,
    "porSala": {
      "Sala ARPA": 2
    },
    "porTecnica": {
      "Acrílico sobre muro": 1,
      "Pintura vinílica sobre muro": 1
    },
    "porAnio": {
      "2024": 2
    }
  },
  "filtros": {
    "salaId": null,
    "autor": null,
    "tecnica": null,
    "anio": null
  }
}
```

### 🎨 POST /api/murales
Crea un nuevo mural.

#### Opción 1: Envío con JSON
**Content-Type:** `application/json`

```json
{
  "nombre": "Nuevo Mural",
  "tecnica": "Acrílico sobre muro",
  "anio": 2024,
  "ubicacion": "Pared Norte",
  "url_imagen": "https://ejemplo.com/imagen.jpg",
  "autor": "Artista Ejemplo",
  "colaboradores": "Colaborador 1, Colaborador 2",
  "medidas": "3m x 2m",
  "salaId": 1
}
```

#### Opción 2: Envío con Form Data (para subir imagen)
**Content-Type:** `multipart/form-data`

- `nombre`: Nombre del mural
- `tecnica`: Técnica artística utilizada
- `anio`: Año de creación (número)
- `ubicacion`: Ubicación del mural
- `autor`: Nombre del autor
- `colaboradores`: Colaboradores (opcional)
- `medidas`: Dimensiones del mural (opcional)
- `salaId`: ID de la sala (opcional)
- `imagen`: Archivo de imagen (se subirá automáticamente a Cloudinary)

### 🔍 GET /api/murales/{id}
Obtiene un mural específico por su ID.

### 🏛️ GET /api/salas
Obtiene todas las salas disponibles.

### 🎭 GET /api/salas/{id}/murales
Obtiene todos los murales de una sala específica.

## Ejemplos de Uso

### 1. Obtener todos los murales
```bash
curl -X GET "http://localhost:3001/api/murales"
```

### 2. Filtrar murales por sala
```bash
curl -X GET "http://localhost:3001/api/murales?salaId=4"
```

### 3. Buscar murales por autor
```bash
curl -X GET "http://localhost:3001/api/murales?autor=Rodriguez"
```

### 4. Filtrar por técnica
```bash
curl -X GET "http://localhost:3001/api/murales?tecnica=acrílico"
```

### 5. Filtrar por año
```bash
curl -X GET "http://localhost:3001/api/murales?anio=2024"
```

### 6. Combinar múltiples filtros
```bash
curl -X GET "http://localhost:3001/api/murales?salaId=4&anio=2024&tecnica=acrílico"
```

### 7. Crear un mural con JSON
```bash
curl -X POST "http://localhost:3001/api/murales" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mural de Prueba",
    "tecnica": "Spray sobre muro",
    "anio": 2024,
    "ubicacion": "Pared Sur",
    "url_imagen": "https://ejemplo.com/imagen.jpg",
    "autor": "Artista Digital",
    "salaId": 2
  }'
```

## Características del API

### ✨ Funcionalidades Principales
- **Filtrado flexible**: Combina múltiples filtros para búsquedas específicas
- **Búsqueda parcial**: Los filtros de texto (autor, técnica) son insensibles a mayúsculas
- **Estadísticas automáticas**: Genera estadísticas por sala, técnica y año
- **Relaciones incluidas**: Incluye información de la sala asociada
- **Subida de imágenes**: Integración con Cloudinary para almacenamiento de imágenes
- **Ordenamiento**: Los resultados se ordenan por año (descendente) y nombre (ascendente)

### 🔒 Validaciones
- Los campos obligatorios son: `nombre`, `tecnica`, `anio`, `ubicacion`
- El campo `anio` debe ser un número válido
- El campo `salaId` debe ser un número válido si se proporciona
- Se requiere `url_imagen` o un archivo de imagen para crear un mural

### 📊 Estadísticas Incluidas
Cada respuesta GET incluye estadísticas automáticas:
- **Total**: Número total de murales
- **Por Sala**: Cantidad de murales por cada sala
- **Por Técnica**: Distribución por técnica artística
- **Por Año**: Distribución temporal de los murales

## Importar en Postman

1. Abre Postman
2. Haz clic en "Import" en la esquina superior izquierda
3. Selecciona el archivo `Museo-3D-API.postman_collection.json`
4. La colección se importará con todos los endpoints configurados
5. Puedes modificar la variable `base_url` si tu servidor está en un puerto diferente

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Mural creado exitosamente
- `400 Bad Request`: Datos inválidos o faltantes
- `404 Not Found`: Recurso no encontrado
- `415 Unsupported Media Type`: Tipo de contenido no soportado
- `500 Internal Server Error`: Error interno del servidor

## Estructura de la Base de Datos

### Tabla Mural
- `id`: Identificador único
- `nombre`: Nombre del mural
- `tecnica`: Técnica artística utilizada
- `anio`: Año de creación
- `ubicacion`: Ubicación física del mural
- `url_imagen`: URL de la imagen en Cloudinary
- `autor`: Autor principal
- `colaboradores`: Lista de colaboradores (opcional)
- `medidas`: Dimensiones del mural (opcional)
- `salaId`: ID de la sala asociada (opcional)
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización

### Relaciones
- Un mural puede pertenecer a una sala (`sala`)
- Una sala puede tener múltiples murales (`murales`)

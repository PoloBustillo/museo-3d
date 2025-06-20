This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Museo Virtual 3D

Un museo virtual inmersivo construido con Next.js, Three.js y Prisma.

## 🚀 Características

- **Galería 3D Inmersiva**: Explora obras de arte en un entorno virtual tridimensional
- **Sistema de Salas**: Organiza las obras en salas temáticas
- **Autenticación**: Sistema completo de registro e inicio de sesión
- **Colección Personal**: Guarda tus obras favoritas
- **Responsive**: Funciona en dispositivos móviles y de escritorio
- **Modo Oscuro**: Interfaz adaptable con tema claro/oscuro

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL
- pnpm (recomendado) o npm

## 🛠️ Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd museo-3d
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/museo_3d"
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

4. **Configurar la base de datos**

```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar el servidor de desarrollo**

```bash
pnpm dev
```

## 🗄️ Esquema de Base de Datos

### Modelos Principales

#### Usuario (User)

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified DateTime?
  image         String?
  role          Role     @default(USER)
  settings      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  salasCreadas     Sala[]
  salasColaboradas SalaColaborador[]
  coleccion        PersonalCollection[]
}
```

#### Mural

```prisma
model Mural {
  id            Int      @id @default(autoincrement())
  titulo        String
  artista       String?
  tecnica       String?
  anio          Int?
  imagenUrl     String?
  imagenUrlWebp String?
  latitud       Float?
  longitud      Float?
  ubicacion     String?
  descripcion   String?
  estado        String?
  dimensiones   String?
  fechaCreacion DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  salas         SalaMural[]
  coleccion     PersonalCollection[]
}
```

#### Sala

```prisma
model Sala {
  id          Int      @id @default(autoincrement())
  nombre      String
  descripcion String?
  publica     Boolean  @default(false)
  creadorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  creador       User
  colaboradores SalaColaborador[]
  murales       SalaMural[]
}
```

## 🔄 Actualizaciones Recientes del Esquema

### Cambios en la API (v4)

Se ha actualizado el esquema de la base de datos y las APIs para mejorar la estructura y relaciones:

#### Cambios en Murales:

- `nombre` → `titulo`
- `autor` → `artista`
- `url_imagen` → `imagenUrl`
- Agregados campos de geolocalización (`latitud`, `longitud`)
- Agregado campo `imagenUrlWebp` para optimización

#### Cambios en Salas:

- `ownerId` → `creadorId`
- Relación many-to-many con murales a través de `SalaMural`
- Agregado sistema de colaboradores

#### Nuevas APIs:

- `/api/salas/[id]/murales` - Gestionar murales de una sala
- `/api/collection` - Colección personal de usuarios
- `/api/debug/murales` - Endpoint de debugging

#### Archivos Actualizados:

- Todas las páginas del frontend (`/app/museo`, `/app/galeria`, etc.)
- Providers (`GalleryProvider`, `CollectionProvider`)
- Hooks (`useUpdateProfile`)
- Componentes (`GalleryRoom`, `AuthModal`)

## 🎨 Estructura del Proyecto

```
museo-3d/
├── app/                    # App Router de Next.js 13+
│   ├── api/               # API Routes
│   ├── museo/             # Página principal del museo
│   ├── galeria/           # Galería de obras
│   ├── perfil/            # Perfil de usuario
│   └── ...
├── components/            # Componentes reutilizables
├── providers/             # Context providers
├── lib/                   # Utilidades y configuración
├── prisma/                # Esquema y migraciones
└── public/                # Archivos estáticos
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Construcción
pnpm build

# Producción
pnpm start

# Base de datos
npx prisma studio
npx prisma db push
npx prisma generate

# Scripts de utilidad
node scripts/associate_murales_salas.js
```

## 📚 Documentación de APIs

### Endpoints Principales

#### Murales

- `GET /api/murales` - Listar murales con filtros
- `GET /api/murales/[id]` - Obtener mural específico
- `POST /api/murales` - Crear nuevo mural
- `PUT /api/murales/[id]` - Actualizar mural
- `DELETE /api/murales/[id]` - Eliminar mural

#### Salas

- `GET /api/salas` - Listar salas
- `GET /api/salas/[id]` - Obtener sala específica
- `POST /api/salas` - Crear nueva sala
- `PUT /api/salas/[id]` - Actualizar sala
- `DELETE /api/salas/[id]` - Eliminar sala

#### Murales de Sala

- `GET /api/salas/[id]/murales` - Obtener murales de una sala
- `POST /api/salas/[id]/murales` - Agregar murales a una sala
- `DELETE /api/salas/[id]/murales` - Remover murales de una sala

#### Colección Personal

- `GET /api/collection` - Obtener colección del usuario
- `POST /api/collection` - Agregar obra a la colección
- `DELETE /api/collection` - Remover obra de la colección

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación de la API](docs/API_DOCUMENTATION.md)
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

**Museo Virtual 3D** - Explorando el arte en el mundo digital 🎨



# app-mono-skaffold

Un monorepo de TypeScript listo para producción construido con [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack). Este proyecto demuestra el desarrollo full-stack moderno con código compartido, seguridad de tipos en todas las capas y soporte para Docker para facilitar el despliegue.

## ¿Por qué este stack?

Esta arquitectura de monorepo proporciona:

- **Seguridad de tipos de extremo a extremo** - Comparte tipos entre frontend, backend y móvil con oRPC
- **Reutilización de código** - Los paquetes compartidos eliminan la duplicación entre aplicaciones
- **Compilaciones rápidas** - Turborepo almacena en caché y paralleliza las compilaciones de manera inteligente
- **Experiencia de desarrollo** - Recarga en caliente, TypeScript y herramientas modernas en todo el proyecto
- **Listo para producción** - Incluye soporte para Docker, autenticación y configuración de la base de datos

## Stack Tecnológico

### Frontend y Móvil
- **Next.js** - Marco de trabajo React full-stack con App Router
- **React Native + Expo** - Desarrollo de aplicaciones móviles multiplataforma
- **TailwindCSS** - Estilos basados en utilidades
- **shadcn/ui** - Componentes de UI de alta calidad y accesibles

### Backend
- **Hono** - Marco de trabajo web ultrarrápido y ligero
- **oRPC** - RPC seguro en tipos con generación automática de OpenAPI
- **Drizzle ORM** - Kit de herramientas de base de datos orientado a TypeScript
- **PostgreSQL** - Base de datos relacional robusta
- **Better-Auth** - Solución de autenticación moderna

### Infraestructura
- **Turborepo** - Sistema de compilación para monorepos de alto rendimiento
- **pnpm** - Administrador de paquetes rápido y eficiente en disco
- **Docker** - Contenedorización para despliegues consistentes

## Cómo Empezar

Primero, instala las dependencias:

```bash
pnpm install
```
## Configuración de la Base de Datos

Este proyecto utiliza PostgreSQL con Drizzle ORM.

1. Asegúrate de tener una base de datos PostgreSQL configurada.
2. Actualiza tu archivo `apps/server/.env` con los detalles de conexión de PostgreSQL.

3. Aplica el esquema a tu base de datos:
```bash
pnpm db:push
```


Luego, ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

Abre [http://localhost:3001](http://localhost:3001) en tu navegador para ver la aplicación web.
Usa la aplicación Expo Go para ejecutar la aplicación móvil.
La API se está ejecutando en [http://localhost:3000](http://localhost:3000).




## Estructura del Proyecto

```
app-mono-skaffold/
├── apps/
│   ├── web/              # Aplicación web Next.js
│   │   ├── app/          # Páginas y layouts de App Router
│   │   ├── components/   # Componentes de React
│   │   └── Dockerfile    # Imagen de Docker para producción
│   ├── native/           # Aplicación móvil React Native (Expo)
│   │   ├── app/          # Pantallas de Expo Router
│   │   └── components/   # Componentes móviles
│   └── server/           # API backend Hono
│       ├── src/          # Código fuente del servidor
│       ├── dist/         # Salida de la compilación
│       └── Dockerfile    # Imagen de Docker para producción
├── packages/
│   └── shared/           # Código compartido (tipos, utilidades, etc.)
├── turbo.json            # Configuración de Turborepo
├── pnpm-workspace.yaml   # Configuración de workspace de pnpm
└── package.json          # package.json raíz
```

## Scripts Disponibles

### Desarrollo
- `pnpm dev` - Iniciar todas las aplicaciones en modo de desarrollo
- `pnpm dev:web` - Iniciar solo la aplicación web de Next.js
- `pnpm dev:server` - Iniciar solo el servidor backend de Hono
- `pnpm dev:native` - Iniciar el servidor de desarrollo de React Native/Expo

### Compilación
- `pnpm build` - Compilar todas las aplicaciones para producción
- `pnpm check-types` - Ejecutar la verificación de tipos de TypeScript en todas las aplicaciones

### Base de Datos
- `pnpm db:push` - Aplicar cambios del esquema de Drizzle a la base de datos
- `pnpm db:studio` - Abrir Drizzle Studio (interfaz de la base de datos)

## Despliegue con Docker

Tanto la aplicación web como la del servidor incluyen Dockerfiles listos para producción con compilaciones en múltiples etapas para optimizar el tamaño de las imágenes.

### Creación de Imágenes de Docker

**Compilar desde la raíz del repositorio:**

```bash
# Aplicación web
docker build -t your-registry/web:latest -f apps/web/Dockerfile .

# Aplicación del servidor
docker build -t your-registry/server:latest -f apps/server/Dockerfile .
```

### Características de las Imágenes de Docker

**Web (Next.js):**
- Compilación en múltiples etapas para un tamaño de imagen mínimo
- Utiliza la salida standalone de Next.js
- Se ejecuta como usuario no root por seguridad
- Incluye comprobaciones de estado (health checks)
- Expone el puerto 3000

**Servidor (Hono):**
- Compila las dependencias de los paquetes compartidos
- Solo dependencias de producción en la imagen final
- Soporta la estructura de workspace de monorepo
- Expone el puerto 3000

### Ejecución de Contenedores de Docker

```bash
# Ejecutar la aplicación web
docker run -p 3000:3000 your-registry/web:latest

# Ejecutar la aplicación del servidor con variables de entorno
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="your-secret" \
  your-registry/server:latest
```

### Docker Compose (Opcional)

Crea un archivo `docker-compose.yml` para ejecutar múltiples servicios:

```yaml
version: '3.8'
services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://server:3000

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - AUTH_SECRET=your-secret-here

  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Despliegue

Este monorepo admite múltiples estrategias de despliegue:

- **Docker**: Usa los Dockerfiles proporcionados para desplegar en cualquier plataforma de contenedores (AWS ECS, Google Cloud Run, Azure Container Apps, etc.)
- **Vercel**: Despliega la aplicación Next.js directamente desde el directorio `apps/web`
- **Alojamiento Tradicional**: Compila y despliega aplicaciones individuales en un VPS o alojamiento tradicional
- **Kubernetes**: Usa las imágenes de Docker con Kubernetes/Skaffold para la orquestación

## Variables de Entorno

### Aplicación Web (`apps/web/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Aplicación del Servidor (`apps/server/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/database
AUTH_SECRET=your-secret-key
PORT=3000
```

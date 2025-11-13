# app-mono-skaffold

A production-ready TypeScript monorepo built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack). This project demonstrates modern full-stack development with shared code, type safety across all layers, and Docker support for easy deployment.

## Why This Stack?

This monorepo architecture provides:

- **End-to-end Type Safety** - Share types between frontend, backend, and mobile with oRPC
- **Code Reuse** - Shared packages eliminate duplication across applications
- **Fast Builds** - Turborepo caches and parallelizes builds intelligently
- **Developer Experience** - Hot reload, TypeScript, and modern tooling throughout
- **Production Ready** - Includes Docker support, authentication, and database setup

## Tech Stack

### Frontend & Mobile
- **Next.js** - Full-stack React framework with App Router
- **React Native + Expo** - Cross-platform mobile development
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - High-quality, accessible UI components

### Backend
- **Hono** - Ultra-fast, lightweight web framework
- **oRPC** - Type-safe RPC with automatic OpenAPI generation
- **Drizzle ORM** - TypeScript-first database toolkit
- **PostgreSQL** - Robust relational database
- **Better-Auth** - Modern authentication solution

### Infrastructure
- **Turborepo** - High-performance monorepo build system
- **pnpm** - Fast, disk-efficient package manager
- **Docker** - Containerization for consistent deployments

## Getting Started

First, install the dependencies:

```bash
pnpm install
```
## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:
```bash
pnpm db:push
```


Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
The API is running at [http://localhost:3000](http://localhost:3000).





## Project Structure

```
app-mono-skaffold/
├── apps/
│   ├── web/              # Next.js web application
│   │   ├── app/          # App Router pages and layouts
│   │   ├── components/   # React components
│   │   └── Dockerfile    # Production Docker image
│   ├── native/           # React Native mobile app (Expo)
│   │   ├── app/          # Expo Router screens
│   │   └── components/   # Mobile components
│   └── server/           # Hono backend API
│       ├── src/          # Server source code
│       ├── dist/         # Build output
│       └── Dockerfile    # Production Docker image
├── packages/
│   └── shared/           # Shared code (types, utilities, etc.)
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── package.json          # Root package.json
```

## Available Scripts

### Development
- `pnpm dev` - Start all applications in development mode
- `pnpm dev:web` - Start only the Next.js web application
- `pnpm dev:server` - Start only the Hono backend server
- `pnpm dev:native` - Start the React Native/Expo development server

### Building
- `pnpm build` - Build all applications for production
- `pnpm check-types` - Run TypeScript type checking across all apps

### Database
- `pnpm db:push` - Push Drizzle schema changes to the database
- `pnpm db:studio` - Open Drizzle Studio (database UI)

## Docker Deployment

Both the web and server applications include production-ready Dockerfiles with multi-stage builds for optimized image sizes.

### Building Docker Images

**Build from the repository root:**

```bash
# Web application
docker build -t your-registry/web:latest -f apps/web/Dockerfile .

# Server application
docker build -t your-registry/server:latest -f apps/server/Dockerfile .
```

### Docker Image Features

**Web (Next.js):**
- Multi-stage build for minimal image size
- Uses Next.js standalone output
- Runs as non-root user for security
- Includes health checks
- Exposes port 3000

**Server (Hono):**
- Builds shared package dependencies
- Production-only dependencies in final image
- Supports monorepo workspace structure
- Exposes port 3000

### Running Docker Containers

```bash
# Run web application
docker run -p 3000:3000 your-registry/web:latest

# Run server application with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="your-secret" \
  your-registry/server:latest
```

### Docker Compose (Optional)

Create a `docker-compose.yml` for running multiple services:

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

## Deployment

This monorepo supports multiple deployment strategies:

- **Docker**: Use the provided Dockerfiles to deploy to any container platform (AWS ECS, Google Cloud Run, Azure Container Apps, etc.)
- **Vercel**: Deploy the Next.js app directly from the `apps/web` directory
- **Traditional Hosting**: Build and deploy individual apps to VPS or traditional hosting
- **Kubernetes**: Use the Docker images with Kubernetes/Skaffold for orchestration

## Environment Variables

### Web Application (`apps/web/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Server Application (`apps/server/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/database
AUTH_SECRET=your-secret-key
PORT=3000
```

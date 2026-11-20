# 🔷 API GraphQL de Usuarios

API **GraphQL** para gestionar la comunidad de una universidad (estudiantes, docentes y
administrativos), con **Apollo Server 5**, **Express 5**, **TypeScript** y **MongoDB Atlas**,
desplegada en **Vercel**.

> **Pruébala en vivo:** al abrir la URL de la API se carga el **Apollo Sandbox**, donde puedes
> escribir consultas y mutaciones con autocompletado. Los datos se restauran cada día.

## Funcionalidades

- **Consultas** paginadas (máximo 50 por página) con búsqueda por nombre o email, filtro por rol y orden.
- **Estadísticas** agregadas: total, edad promedio y conteo por rol.
- **Mutaciones** para crear, actualizar y eliminar, con validación y errores tipados
  (`VALIDATION_ERROR`, `USER_NOT_FOUND`, `USER_ALREADY_EXISTS`).
- **Explorador interactivo** (Apollo Sandbox) en `/graphql`.

```graphql
query {
  usuarios(page: 1, limit: 5, role: DOCENTE, orderBy: EDAD) {
    total
    items { name email age role }
  }
  estadisticas { total edadPromedio porRol { role total } }
}
```

Más ejemplos en [`examples/`](examples).

## Arquitectura

```
src/
├── app.ts                 # Express + Apollo (entrada en Vercel)
├── server.ts              # Arranque local
├── config/env.ts          # Variables de entorno
├── graphql/               # typeDefs y resolvers
├── services/              # Lógica de negocio y validación (Zod)
├── repositories/          # Acceso a datos (Mongoose)
├── models/                # Esquemas de MongoDB
├── database/              # Conexión cacheada y datos de ejemplo
└── errors/                # Errores GraphQL tipados
```

## Seguridad

- Validación de toda la entrada con **Zod** (tipos, rangos, formato de email e IDs).
- Protección contra **inyección NoSQL** (`sanitizeFilter`) y de **regex** en la búsqueda.
- Paginación con límite máximo, consultas de 50 KB como máximo y **rate limit** por IP.
- Protección **CSRF** de Apollo activada y **Helmet** con una CSP que solo permite el CDN del Sandbox.
- Los errores internos nunca exponen detalles.

## Pruebas

**17 pruebas** con Vitest, Supertest y una base MongoDB en memoria. Se ejecutan en cada push con
GitHub Actions.

```bash
npm test
```

## Ejecución local

```bash
cp .env.example .env      # completa DATABASE_URL
npm install
npm run seed              # datos de ejemplo
npm run dev               # http://localhost:4000/graphql
```

## Despliegue en Vercel

Importa el repositorio en Vercel: detecta Express automáticamente (`src/app.ts`).
Variables: `DATABASE_URL`, `CRON_SECRET` y `NODE_ENV=production`. El cron de `vercel.json` restaura
los datos cada día a las 05:00 UTC.

## Licencia

MIT

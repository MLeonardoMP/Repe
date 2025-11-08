# Plan de Migración a Neon Postgres en Vercel (Next.js App Router)

Estado: Propuesto

Alcance: Migrar de persistencia en archivos JSON a Postgres (Neon), manteniendo la app en Next.js (App Router) y siguiendo buenas prácticas 2025.

## Objetivos

- Reemplazar almacenamiento en `data/*.json` y utilidades de `src/lib/storage*.ts` por Postgres.
- Mantener la UX actual y la API pública interna (tipos en `src/types/*`).
- Preparar infra para Vercel + Neon con variables de entorno seguras.
- Diseñar fases para migración progresiva, backfill y rollback seguro.

## Principios de Simplicidad y Performance

- Un solo camino técnico: Drizzle ORM + `@neondatabase/serverless` en runtime `nodejs` (Edge solo si es necesario y soportado).
- Server Actions para mutaciones y Route Handlers para APIs; todo acceso a DB desde el servidor.
- Consultas minimalistas: seleccionar solo columnas necesarias, paginar listados y usar índices adecuados.
- Caching del App Router: `revalidate` y `revalidateTag` para lecturas; invalidar tras mutaciones.
- Evitar N+1: preferir joins o queries agregadas; mover lógica de agregación al servidor.

## Variables de Entorno (Vercel/Local)

- `DATABASE_URL` (producción): cadena Neon `postgresql://user:pass@<host>.neon.tech:port/db?sslmode=require&channel_binding=require`.
- `LOCAL_POSTGRES_URL` (dev opcional): Postgres local (p.ej. Docker) `postgres://postgres:postgres@localhost:5432/postgres`.
- Añadir a `.env.local` (local) y a Project Settings en Vercel (Production/Preview). Nunca commitear secretos.

## Esquema de Datos (propuesto)

Tomando como base `src/types/*` y `specs/**/data-model.md`.

- `exercises` (id, name, category, equipment, notes, created_at)
- `workouts` (id, name, created_at, user_id nullable si hay multiusuario futuro)
- `workout_exercises` (id, workout_id FK, exercise_id FK, order_index)
- `sets` (id, workout_exercise_id FK, reps, weight, rpe, rest_seconds, notes, created_at)
- `history` (id, workout_id FK, performed_at, duration_seconds, notes)
- `user_settings` (id, units, preferences_json, created_at)

Claves/Índices: PK en cada tabla; índices por `workout_id`, `exercise_id`, `performed_at`. Compuestos sugeridos: `workout_exercises(workout_id, order_index)`, `sets(workout_exercise_id, created_at)`.

### Diagrama ER

```mermaid
erDiagram
    exercises {
      uuid id PK
      text name
      text category
      text equipment
      text notes
      timestamptz created_at
    }
    workouts {
      uuid id PK
      text name
      uuid user_id
      timestamptz created_at
    }
    workout_exercises {
      uuid id PK
      uuid workout_id FK
      uuid exercise_id FK
      int order_index
    }
    sets {
      uuid id PK
      uuid workout_exercise_id FK
      int reps
      numeric weight
      numeric rpe
      int rest_seconds
      text notes
      timestamptz created_at
    }
    history {
      uuid id PK
      uuid workout_id FK
      timestamptz performed_at
      int duration_seconds
      text notes
    }
    user_settings {
      uuid id PK
      text units
      jsonb preferences_json
      timestamptz created_at
    }

    workouts ||--o{ workout_exercises : contains
    exercises ||--o{ workout_exercises : used_in
    workout_exercises ||--o{ sets : has
    workouts ||--o{ history : logged_as
    workouts }o--o{ user_settings : optional_for
```

Notas:

- Usar `uuid` como PK con `gen_random_uuid()`; `timestamptz` para tiempos. `weight`/`rpe` en `numeric` o enteros escalados si se requiere precisión.

## Implementación con Drizzle (recomendada)

1) Dependencias

   - `pnpm add drizzle-orm @neondatabase/serverless ws postgres`
   - `pnpm add -D drizzle-kit @types/ws`

2) Conexión (server-only)

   - Crear `src/lib/db/drizzle.server.ts`.
   - Configurar `neonConfig` y `Pool` de `@neondatabase/serverless`; exportar `drizzle(pool)`.
   - Asegurar uso solo en server (no importar en Client Components).

3) Esquema y migraciones

   - Definir `src/lib/db/schema.ts` con tablas e índices.
   - `drizzle-kit generate` y `drizzle-kit migrate` (local/CI).

4) Acceso desde Next.js

   - Lecturas: Server Components/Route Handlers.
   - Mutaciones: Server Actions (`"use server"`) o Route Handlers.

5) Caching e invalidación

   - Listas con `revalidate`/`force-static` según necesidad.
   - Invalidar con `revalidateTag('workouts')` tras mutaciones.

Ejemplo mínimo (Server Action):

```ts
"use server";
import db from "@/lib/db/drizzle.server";
import { exercises } from "@/lib/db/schema";

export async function createExercise(data: { name: string; category?: string }) {
  await db.insert(exercises).values({ name: data.name, category: data.category ?? null });
}
```

## Estrategia de Migración (fases simplificadas)

Fase 0 – Preparación

- Crear `src/lib/db/` (conexión + schema) y migración inicial.
- Configurar `DATABASE_URL` en Vercel y `.env.local`.

Fase 1 – Lectura en espejo (read shadow)

- Implementar repos de lectura desde DB en paralelo a `src/lib/storage.ts`.
- Feature flag `USE_DB` para activar lecturas desde DB en entornos de prueba.
- Validar con tests existentes (`tests/**`).

Fase 2 – Escritura dual (dual-write)

- Mutaciones escriben en archivos y DB temporalmente.
- Métricas/logs para comparar resultados.

Fase 3 – Backfill

- Script `scripts/backfill-from-json.ts` (idempotente; `ON CONFLICT DO NOTHING`).
- Validar conteos por tabla.

Fase 4 – Cutover

- Activar lecturas desde DB (`USE_DB=true`) y mantener escritura dual breve.
- Desactivar escrituras a archivos; conservar backup `data/*.json`.

Fase 5 – Limpieza

- Retirar `src/lib/storage*.ts` y dependencias.
- Ajustar índices según patrones reales; documentar.

## Observabilidad y Seguridad

- Logs en mutaciones/backfill; tracing opcional.
- No exponer `DATABASE_URL` al cliente; usar solo en server.
- Usuarios Neon con privilegios mínimos por entorno.

## Rendimiento y Coste (prácticas clave)

- Driver serverless de Neon para evitar problemas de pooling.
- Índices: `workout_exercises(workout_id, order_index)`, `sets(workout_exercise_id, created_at DESC)`, `history(performed_at DESC)`.
- Paginación y `LIMIT`/`OFFSET` o cursores en listados grandes (historial).
- Selección de columnas mínimas; evitar JSON innecesario.

## Entrega Continua

- Previews en Vercel con branches de Neon para pruebas aisladas.
- Migraciones automáticas en CI para Preview/Prod tras aprobación.

## Alternativa (anotación): Prisma + Accelerate

- Si se prefiere Prisma, usar Prisma 5 + Accelerate para serverless y equivalentes de esquema/migración. Mantener los mismos principios de acceso (server-only) y caching.

## Plan de Trabajo (Sprints)

Semana 1

- Setup DB + schema + migración inicial. Repos de lectura. Flag `USE_DB`.

Semana 2

- Escritura dual. Backfill idempotente. Tests de integración.

Semana 3

- Cutover de lectura. Seguimiento de métricas. Correcciones.

Semana 4

- Cutover de escritura. Limpieza de código viejo. Documentación final.

## Referencias Clave

- Next.js App Router (Server Actions, Route Handlers, env vars, runtime `nodejs`).
- Neon + Next.js: `@neondatabase/serverless`, conexión con `sslmode=require`.
- Drizzle ORM: `drizzle-orm/neon-serverless` + `drizzle-kit` para migraciones.

# Research: Neon Postgres Migration

## Neon + Next.js Integration

### Decision: Driver serverless `@neondatabase/serverless` con Drizzle ORM
**Rationale**: El driver oficial de Neon está optimizado para entornos serverless (fetch/WebSocket) y elimina problemas de pooling en Vercel; Drizzle es ligero y complementa el patrón minimalista del proyecto.
**Implementation Approach**:
- Configurar `neonConfig` para producción (WebSocket + `poolQueryViaFetch`) y local (proxy WS `wsProxy`, `useSecureWebSocket=false`).
- Exponer conexión en `src/lib/db/drizzle.server.ts` usando `drizzle-orm/neon-serverless` y `Pool` de `@neondatabase/serverless`.
- Consumir la conexión únicamente en Server Components, Route Handlers o Server Actions (`"use server"`).
- Definir variables `DATABASE_URL` (prod) y `LOCAL_POSTGRES_URL` (dev) con `sslmode=require&channel_binding=require`.
**Alternatives Considered**:
- `@vercel/postgres`: integración sencilla pero introduce pooling compartido y dependencia adicional.
- Driver `pg`: requiere gestionar pooling manual (pg-pool) y aumenta cold start en serverless.

### Decision: Soporte para Edge opcional mediante `@neondatabase/serverless` fetch
**Rationale**: La mayor parte de la lógica seguirá en runtime Node.js; sin embargo, algunas lecturas ligeras podrían moverse al Edge si las latencias lo justifican.
**Implementation Approach**:
- Mantener runtime `nodejs` por defecto.
- Para endpoints Edge, usar `neon(fetch)` y limitar operaciones a lecturas idempotentes.
- Asegurar que no existan dependencias de Node-only dentro de esos handlers.
**Alternatives Considered**:
- Ejecutar toda la app en Edge: descartado por dependencias actuales (Server Actions y Drizzle pooling).

## ORM & Schema Management

### Decision: Adoptar Drizzle ORM + `drizzle-kit` para migraciones
**Rationale**: Drizzle genera SQL explícito, tiene cero dependencias y produce bundles pequeños, ideal para serverless.
**Implementation Approach**:
- Crear `src/lib/db/schema.ts` con definiciones de tablas, índices y relaciones.
- Configurar `drizzle.config.ts` con rutas a migraciones y URL de conexión.
- Agregar scripts `drizzle-kit generate` y `drizzle-kit migrate` (local/CI) en `package.json`.
- Usar migraciones versionadas en `drizzle/migrations` controladas por Git.
**Alternatives Considered**:
- Prisma 5 + Accelerate: gran DX pero implica engines binarios pesados y costos adicionales.
- SQL puro con `postgres.js`: más control pero menos tipado y repetición de lógica.

### Decision: Identificadores UUID y auditoría básica
**Rationale**: Los datos actuales en JSON usan UUID; mantenerlos evita backfill complejo y preserva compatibilidad.
**Implementation Approach**:
- Definir `uuid` como PK con `DEFAULT gen_random_uuid()`.
- Campos `created_at`/`updated_at` con `DEFAULT now()`.
- Registros de auditoría mínima via columnas `updated_at` y triggers opcionales futuros.
**Alternatives Considered**:
- IDs secuenciales: implican reasignar datos y potenciales colisiones durante backfill.

## Migración y Backfill

### Decision: Enfoque escalonado (shadow read → dual-write → backfill → cutover → limpieza)
**Rationale**: Minimiza riesgo y permite monitorear consistencia en cada etapa.
**Implementation Approach**:
- Feature flag `USE_DB` (env) para alternar fuentes.
- Implementar repositorios DB en paralelo y compararlos con storage JSON durante shadow read.
- Dual-write con logging para monitorear divergencias.
- Backfill idempotente (`ON CONFLICT DO NOTHING`) procesando `data/*.json`.
- Cutover tras verificación; retirar JSON tras ventana de observación.
**Alternatives Considered**:
- Big bang migration: mayor riesgo de pérdida de datos si falla el primer despliegue.
- Replicar JSON → DB en background sin dual-write: difícil garantizar consistencia durante transición.

### Decision: Scripts dedicados (`scripts/backfill-from-json.ts`, `scripts/verify-parity.ts`)
**Rationale**: Mantener procesos repetibles y observables.
**Implementation Approach**:
- Scripts en TypeScript con acceso a repositorios Drizzle y lector JSON actual.
- Logging resumido (conteos, checksums) y salida detallada opcional.
- Ejecutar en local y previews antes del despliegue final.
**Alternatives Considered**:
- Uso de herramientas externas (ETL) -> innecesario para dataset reducido.

## Testing & Observability

### Decision: Base de pruebas transaccional para Jest
**Rationale**: Asegura aislamiento y reproducibilidad al correr suites simultáneas.
**Implementation Approach**:
- Utilizar `pg` CLI o `@neondatabase/serverless` con schema temporal (`test_${random}`).
- Hooks Jest (`beforeAll`/`afterAll`) para crear/dropear schema o envolver pruebas en transacciones.
- Restablecer seeds mínimos (ejercicios esenciales) para escenarios.
**Alternatives Considered**:
- Mocking de repositorios: no verifica migraciones ni SQL real.

### Decision: Observabilidad de migración
**Rationale**: Detectar divergencias entre JSON y Postgres durante dual-write.
**Implementation Approach**:
- Añadir métricas/logs (por ejemplo, `console.info` estructurado y dashboards Vercel/Logflare) con conteos de inserciones/errores.
- Alarmas simples (Slack/email) basadas en métricas de error rate.
**Alternatives Considered**:
- Integrar plataforma completa APM: excesivo para alcance actual.

## Error Handling & Rollback

### Decision: Flujos de recuperación
**Rationale**: Evitar pérdida de datos y ofrecer feedback inmediato al usuario.
**Implementation Approach**:
- En Server Actions, capturar errores y mostrar mensajes amigables + fallback a reintento.
- Mantener JSON como backup hasta confirmar cutover.
- Documentar proceso de rollback (desactivar `USE_DB`, restaurar JSON backups, revertir migraciones si es necesario).
**Alternatives Considered**:
- Retirar almacenamiento legacy antes de validar: incrementa riesgo de downtimes permanentes.

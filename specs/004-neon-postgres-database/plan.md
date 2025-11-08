# Implementation Plan: Migración a Neon Postgres

**Branch**: `004-neon-postgres-database` | **Date**: 2025-11-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `C:\Users\USUARIO\OD\Documents\Repos\fit\Repe\specs\004-neon-postgres-database\spec.md`

## Summary
Migrar la persistencia de la aplicación Repe desde archivos JSON hacia una base Neon Postgres administrada, garantizando consistencia multi-dispositivo y continuidad del historial. La solución se apoya en Drizzle ORM con el driver serverless de Neon, dual-write temporal controlado por bandera, backfill idempotente y mecanismos de recuperación para mantener la experiencia actual sin interrupciones.

## Technical Context
**Language/Version**: TypeScript (Next.js 15.5.3, React 19, Node.js 18 LTS en Vercel)
**Primary Dependencies**: Next.js App Router, Drizzle ORM, `@neondatabase/serverless`, `ws`, `postgres`, Zod, shadcn/ui stack existente
**Storage**: Neon Postgres (producción) + Postgres local vía Docker/Neon branch para desarrollo y pruebas
**Testing**: Jest 30.x, React Testing Library, suites de integración sobre DB temporal (transacciones o esquemas desechables)
**Target Platform**: Vercel (serverless Node.js runtime) y entorno local Desktop (Windows/macOS/Linux)
**Project Type**: web (Next.js full stack con App Router)
**Performance Goals**: Consultas CRUD p95 < 200 ms; cold start < 500 ms; sincronización visible < 1 s tras operaciones de escritura
**Constraints**: Mantener App Router con Server Components, usar drivers serverless, minimizar nuevas dependencias, permitir rollback rápido con feature flag
**Scale/Scope**: Catálogo ~200 ejercicios, historial personal indefinido, decenas de sesiones concurrentes, uso de branches Neon para entornos Preview

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Modularidad ✅
- Nueva capa `src/lib/db/` con conexión y repositorios por entidad, aislando la infraestructura de los componentes UI.
- Feature flag `USE_DB` controla el cambio de origen de datos sin reescribir componentes.
- Scripts (migraciones, backfill) y documentación viven junto a la especificación para facilitar mantenimiento.

### Minimalismo ✅
- Se elige Drizzle ORM + driver oficial de Neon (sin orquestadores extra).
- Dual-write limitado a la ventana de migración y planificado para retirarse al cerrar el cutover.
- No se introduce autenticación ni servicios externos nuevos.

### Rendimiento ✅
- Driver serverless evita problemas de pooling y reduce latencia en serverless.
- Índices dirigidos a los patrones de acceso (`workout_id`, `performed_at`, orden de ejercicios).
- Uso de `revalidateTag` y caché selectiva para lecturas frecuentes.

### Simplicidad ✅
- Plan secuencial (Preparación → Shadow reads → Dual-write → Backfill → Cutover → Limpieza) fácil de seguir y revertir.
- Scripts idempotentes y naming explícito reducen ambigüedad.
- Server Actions se conectan directamente a repositorios Drizzle sin capas adicionales.

### Experiencia de Usuario ✅
- Garantiza que las rutinas e historial se mantengan sincronizados entre dispositivos.
- Mecanismos de rollback y verificación previenen pérdida de datos durante la migración.
- Mensajería de error definida para informar al usuario cuando una operación falle por problemas de base de datos.

## Project Structure

### Documentation (this feature)
```
specs/004-neon-postgres-database/
├── plan.md              # Este archivo (plan)
├── research.md          # Decisiones técnicas (Phase 0)
├── data-model.md        # Esquema y relaciones (Phase 1)
├── quickstart.md        # Flujo de validación (Phase 1)
├── contracts/           # Interfaces API/servicios/componentes (Phase 1)
└── tasks.md             # Se genera con /tasks (Phase 2)
```

### Source Code (repository root)
```
src/
├── app/                 # App Router de Next.js
├── components/          # UI shadcn/ui y componentes de workout
├── hooks/
├── lib/
│   ├── db/              # Nueva capa: conexión Drizzle, schema, repositorios
│   └── storage/         # Adaptadores legacy (se retirarán tras cutover)
└── types/

tests/
├── integration/
├── unit/
└── components/
```

**Structure Decision**: Opción 1 (single project). Se mantiene la arquitectura actual de Next.js con `src/app`; se añade `src/lib/db/` para la nueva infraestructura y utilidades compatibles con Jest.

## Phase 0: Outline & Research
1. **Unknowns identificados**
   - Driver y ORM más ligeros para Neon en Vercel (`@neondatabase/serverless` + Drizzle).
   - Estrategia de migración progresiva (shadow reads, dual-write, backfill) sin downtime.
   - Setup local vs producción (Docker Postgres + proxy WS, branches Neon).
   - Estrategia de pruebas y limpieza (transacciones, schemas temporales, fixtures).
2. **Investigación realizada**
   - Guías oficiales de Neon para Next.js 15, Drizzle y manejo de WebSocket proxy.
   - Comparativa interna Drizzle vs Prisma vs `@vercel/postgres` (performance, cold start, DX).
   - Mejores prácticas de caching en App Router y control de revalidación.
3. **Decisiones registradas**
   - `research.md` documenta decisiones, racionales y alternativas descartadas.
   - Todas las dudas del contexto quedaron resueltas antes de avanzar.

## Phase 1: Design & Contracts
*Prerequisite: research.md complete*

1. **Modelo de datos**: `data-model.md` define tablas (`exercises`, `workouts`, `workout_exercises`, `sets`, `history`, `user_settings`) con claves, índices, validaciones y estrategias de backfill.
2. **Contratos**: `contracts/` describe rutas `/api/exercises`, `/api/workouts`, `/api/history`, junto con servicios (`ExerciseRepository`, `WorkoutService`) y contratos de componentes/Server Actions.
3. **Quickstart**: `quickstart.md` orquesta verificación end-to-end (configurar env vars, ejecutar migraciones Drizzle, backfill, suites Jest sobre DB temporal).
4. **Agente**: `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` actualiza `.github/copilot-instructions.md` con tecnologías y convenciones nuevas.
5. **Post-design check**: Se revalida la constitución; no surgen violaciones adicionales.

## Phase 2: Task Planning Approach
*No se ejecuta en /plan; describe cómo /tasks generará tasks.md*

**Task Generation Strategy**:
- Preparación: instalar dependencias (`drizzle-orm`, `@neondatabase/serverless`, `ws`, `postgres`) y añadir scripts Drizzle.
- Infraestructura: crear `src/lib/db/` (configuración Neon, schema, migraciones) y scripts de backfill.
- Adaptadores: repositorios por entidad + feature flag `USE_DB` con dual-write temporal.
- API y Server Actions: implementar handlers que consumen repositorios Drizzle.
- Pruebas: suites Jest (contract, integración) y utilidades de base temporal.
- Limpieza: retirar storage basado en archivos y validar quickstart.

**Ordering Strategy**:
1. Dependencias y configuración Drizzle/Neon.
2. Schema y migraciones.
3. Repositorios + pruebas unitarias.
4. Backfill & scripts de mantenimiento.
5. Integración con Server Actions/APIs → pruebas de integración.
6. Retiro de almacenamiento legacy y validaciones finales.

**Estimated Output**: 24-28 tareas numeradas, con marcaje [P] para repositorios independientes y pruebas paralelizables.

## Phase 3+: Future Implementation
- **Phase 3**: /tasks generará tasks.md basándose en los artefactos anteriores.
- **Phase 4**: Ejecución de tareas (implementación + migraciones + backfill).
- **Phase 5**: Validación (Jest, quickstart, revisión de performance, monitoreo post-cutover).

## Complexity Tracking
No se detectan desviaciones constitucionales; todas las decisiones cumplen modularidad, minimalismo, rendimiento, simplicidad y UX.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.1.0 - See `.specify/memory/constitution.md`*
